import { ticketCode } from './mockData'
import { cloneData, describeLines, makeId } from './rules'
import { KitchenError, type CommandResult, type KitchenData, type KitchenOrderItem } from './types'

// Events that other roles (Waiter, Manager) would send through the backend.
// They exist only so the kitchen UI can be exercised before those APIs exist,
// and are reachable only from the development simulator (/kitchen/dev).

export interface SubmitLine {
  menuItemId: string
  quantity: number
  note: string
}

export type DevEvent =
  | { type: 'waiter-submit'; sessionId?: string; tableCode: string; guests: number; waiterId: string; lines: SubmitLine[] }
  | { type: 'waiter-serve'; itemId: string }
  | { type: 'cancel-item'; itemId: string; reason: string }
  | { type: 'priority'; orderId: string; reason: string }
  | { type: 'incident-reply'; incidentId: string; text: string; resolve: boolean }
  | { type: 'menu-request-decision'; requestId: string; approve: boolean }

const AREA: Record<string, string> = { A: 'Tầng 1', B: 'Tầng 2', G: 'Sân vườn' }

function managerId(data: KitchenData) {
  return data.staff.find((s) => s.role === 'MANAGER')?.id ?? 'NV001'
}

function findItem(data: KitchenData, id: string) {
  const item = data.items.find((i) => i.id === id)
  const order = data.orders.find((o) => o.id === item?.orderId)
  if (!item || !order) throw new KitchenError('NOT_FOUND', 'Không tìm thấy món.')
  return { item, order }
}

function bump(item: KitchenOrderItem) {
  item.version += 1
}

/** Active sessions: tables that still have at least one unfinished item. */
export function activeSessions(data: KitchenData) {
  const sessions = new Map<string, { sessionId: string; tableCode: string; waiterId: string; lastSequence: number }>()
  for (const order of data.orders) {
    const open = data.items.some((i) => i.orderId === order.id && i.status !== 'SERVED' && i.status !== 'CANCELLED')
    const existing = sessions.get(order.sessionId)
    if (existing) existing.lastSequence = Math.max(existing.lastSequence, order.sequence)
    else if (open) sessions.set(order.sessionId, { sessionId: order.sessionId, tableCode: order.tableCode, waiterId: order.waiterId, lastSequence: order.sequence })
  }
  return [...sessions.values()].sort((a, b) => a.tableCode.localeCompare(b.tableCode))
}

export function applyDevEvent(current: KitchenData, event: DevEvent, now: Date): CommandResult {
  const data = cloneData(current)
  const at = now.toISOString()
  let summary: string

  switch (event.type) {
    case 'waiter-submit': {
      const lines = event.lines.filter((l) => l.menuItemId)
      if (!lines.length) throw new KitchenError('INVALID', 'Chọn ít nhất một món.')
      const resolved = lines.map((line) => {
        const menu = data.menuItems.find((m) => m.id === line.menuItemId)
        if (!menu) throw new KitchenError('NOT_FOUND', 'Không tìm thấy món trong thực đơn.')
        if (menu.status !== 'AVAILABLE') throw new KitchenError('INVALID', `${menu.name} không còn bán.`)
        if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 99) throw new KitchenError('INVALID', 'Số lượng từ 1 đến 99.')
        return { menu, quantity: line.quantity, note: line.note.trim() }
      })
      const previous = event.sessionId ? data.orders.filter((o) => o.sessionId === event.sessionId) : []
      if (event.sessionId && !previous.length) throw new KitchenError('NOT_FOUND', 'Không tìm thấy lượt phục vụ.')
      const base = previous.at(-1)
      const tableCode = base?.tableCode ?? event.tableCode.trim().toUpperCase()
      if (!/^[A-Z]\d{2}$/.test(tableCode)) throw new KitchenError('INVALID', 'Mã bàn dạng A01, B04, G02…')
      if (!base && activeSessions(data).some((s) => s.tableCode === tableCode)) {
        throw new KitchenError('INVALID', `Bàn ${tableCode} đang phục vụ, hãy chọn gọi thêm cho bàn này.`)
      }
      const sequence = previous.reduce((max, o) => Math.max(max, o.sequence), 0) + 1
      const order = {
        id: makeId(data, 'o-'), code: ticketCode(data.nextTicket++), sessionId: base?.sessionId ?? makeId(data, 's-'),
        tableCode, area: base?.area ?? AREA[tableCode[0]] ?? 'Khu khác', guests: base?.guests ?? Math.max(1, event.guests),
        waiterId: base?.waiterId ?? event.waiterId, sequence, submittedAt: at,
      }
      data.orders.push(order)
      // Every line stays its own OrderItem so notes and statuses never merge.
      const items = resolved.map((line): KitchenOrderItem => ({
        id: makeId(data, 'i-'), orderId: order.id, menuItemId: line.menu.id, name: line.menu.name, quantity: line.quantity,
        note: line.note, status: 'SUBMITTED', version: 1, submittedAt: at, history: [{ at, status: 'SUBMITTED', by: order.waiterId }],
      }))
      data.items.push(...items)
      data.notifications.unshift({
        id: makeId(data, 'n-'), kind: sequence > 1 ? 'ADD_ON' : 'NEW_ORDER', at, orderId: order.id, readBy: [],
        title: sequence > 1 ? `Bàn ${tableCode} gọi thêm · lượt ${sequence}` : `Đơn mới · Bàn ${tableCode}`,
        body: `#${order.code} · ${describeLines(items)}`,
      })
      summary = `Phục vụ đã gửi #${order.code} · Bàn ${tableCode} · lượt ${sequence}`
      break
    }

    case 'waiter-serve': {
      const { item, order } = findItem(data, event.itemId)
      if (item.status !== 'READY') throw new KitchenError('CONFLICT', 'Phục vụ chỉ xác nhận món đã sẵn sàng.')
      item.status = 'SERVED'
      item.servedAt = at
      item.servedBy = order.waiterId
      item.history.push({ at, status: 'SERVED', by: order.waiterId })
      bump(item)
      summary = `Phục vụ đã mang ${item.quantity} × ${item.name} ra Bàn ${order.tableCode}`
      break
    }

    case 'cancel-item': {
      const { item, order } = findItem(data, event.itemId)
      const reason = event.reason.trim()
      if (item.status !== 'SUBMITTED' && item.status !== 'PREPARING') throw new KitchenError('CONFLICT', 'Chỉ hủy món chưa hoàn thành.')
      if (!reason) throw new KitchenError('INVALID', 'Nhập lý do hủy.')
      const by = managerId(data)
      item.status = 'CANCELLED'
      item.cancelledAt = at
      item.cancelledBy = by
      item.cancellationReason = reason
      item.history.push({ at, status: 'CANCELLED', by, note: reason })
      bump(item)
      data.notifications.unshift({
        id: makeId(data, 'n-'), kind: 'CANCELLED', at, orderId: order.id, readBy: [],
        title: `Hủy ${item.quantity} × ${item.name} · Bàn ${order.tableCode}`, body: `#${order.code} · ${reason}`,
      })
      summary = `Đã hủy ${item.name} (${reason})`
      break
    }

    case 'priority': {
      const order = data.orders.find((o) => o.id === event.orderId)
      if (!order) throw new KitchenError('NOT_FOUND', 'Không tìm thấy phiếu.')
      const reason = event.reason.trim() || 'Ưu tiên ra món'
      order.priority = { at, by: order.waiterId, reason }
      data.notifications.unshift({
        id: makeId(data, 'n-'), kind: 'PRIORITY', at, orderId: order.id, readBy: [],
        title: `Ưu tiên Bàn ${order.tableCode}`, body: `#${order.code} · ${reason}`,
      })
      summary = `Đã yêu cầu ưu tiên #${order.code}`
      break
    }

    case 'incident-reply': {
      const incident = data.incidents.find((i) => i.id === event.incidentId)
      if (!incident) throw new KitchenError('NOT_FOUND', 'Không tìm thấy sự cố.')
      const text = event.text.trim()
      if (!text) throw new KitchenError('INVALID', 'Nhập nội dung phản hồi.')
      incident.response = { by: managerId(data), at, text }
      incident.status = event.resolve ? 'RESOLVED' : 'ACKNOWLEDGED'
      data.notifications.unshift({
        id: makeId(data, 'n-'), kind: 'INCIDENT_REPLY', at, incidentId: incident.id, readBy: [],
        title: `Quản lý phản hồi sự cố ${incident.code}`, body: text,
      })
      summary = `Đã phản hồi ${incident.code}`
      break
    }

    case 'menu-request-decision': {
      const request = data.menuRequests.find((r) => r.id === event.requestId)
      const menu = data.menuItems.find((m) => m.id === request?.menuItemId)
      if (!request || !menu) throw new KitchenError('NOT_FOUND', 'Không tìm thấy yêu cầu.')
      if (request.status !== 'PENDING') throw new KitchenError('CONFLICT', 'Yêu cầu đã được xử lý.')
      const by = managerId(data)
      request.status = event.approve ? 'APPROVED' : 'REJECTED'
      request.decidedAt = at
      request.decidedBy = by
      if (event.approve && menu.status !== 'DISCONTINUED') {
        menu.status = request.requested
        menu.updatedAt = at
        menu.updatedBy = by
      }
      const verb = request.requested === 'SOLD_OUT' ? 'báo tạm hết' : 'mở bán lại'
      data.notifications.unshift({
        id: makeId(data, 'n-'), kind: 'MENU_REQUEST', at, readBy: [],
        title: `Yêu cầu ${verb} ${menu.name} ${event.approve ? 'đã được duyệt' : 'bị từ chối'}`, body: 'Quản lý ca đã xử lý yêu cầu.',
      })
      summary = `Đã ${event.approve ? 'duyệt' : 'từ chối'} yêu cầu ${menu.name}`
      break
    }

    default:
      throw new KitchenError('INVALID', 'Sự kiện không hợp lệ.')
  }
  data.revision += 1
  return { data, summary }
}
