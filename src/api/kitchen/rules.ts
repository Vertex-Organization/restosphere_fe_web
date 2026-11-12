import { INCIDENT_TYPE_LABEL, ITEM_STATUS_LABEL, MENU_STATUS_LABEL, SEVERITY_LABEL } from './labels'
import {
  KitchenError,
  type CommandResult, type IncidentType, type ItemRef, type KitchenCommand, type KitchenData, type KitchenOrderItem,
  type KitchenPermission, type SentItemStatus, type StaffMember,
} from './types'

// Pure business rules. The mock service runs them locally; once the backend
// exposes kitchen endpoints it becomes the authority and these rules only
// decide which buttons the UI offers.

export function cloneData(data: KitchenData): KitchenData {
  return JSON.parse(JSON.stringify(data)) as KitchenData
}

export function hasPermission(user: StaffMember | undefined | null, permission: KitchenPermission) {
  return !!user && user.role === 'KITCHEN' && user.permissions.includes(permission)
}

export const canStart = (item: KitchenOrderItem) => item.status === 'SUBMITTED'
export const canComplete = (item: KitchenOrderItem) => item.status === 'PREPARING'

export function shortName(name: string) {
  return name.trim().split(/\s+/).at(-1) ?? name
}

export function staffName(data: KitchenData, id?: string) {
  if (!id) return ''
  return data.staff.find((s) => s.id === id)?.name ?? id
}

export function makeId(data: KitchenData, prefix: string) {
  data.nextId += 1
  return `${prefix}${data.nextId}`
}

export function describeLines(items: { quantity: number; name: string }[]) {
  return items.map((i) => `${i.quantity} × ${i.name}`).join(', ')
}

function describeItems(items: KitchenOrderItem[]) {
  return items.length === 1 ? `${items[0].quantity} × ${items[0].name}` : `${items.length} món`
}

function tablesOf(data: KitchenData, items: KitchenOrderItem[]) {
  const codes = new Set(items.map((i) => data.orders.find((o) => o.id === i.orderId)?.tableCode).filter(Boolean))
  return [...codes].map((c) => `Bàn ${c}`).join(', ')
}

function requirePermission(actor: StaffMember, permission: KitchenPermission) {
  if (!hasPermission(actor, permission)) throw new KitchenError('FORBIDDEN', 'Bạn không có quyền thực hiện thao tác này.')
}

/** Resolves the referenced items and checks that nobody changed them since the
 * client loaded them. All items are validated before any is changed. */
function lockItems(data: KitchenData, refs: ItemRef[], expected: SentItemStatus) {
  if (!refs.length) throw new KitchenError('INVALID', 'Chưa chọn món.')
  if (new Set(refs.map((r) => r.id)).size !== refs.length) throw new KitchenError('INVALID', 'Danh sách món bị trùng.')
  return refs.map((ref) => {
    const item = data.items.find((i) => i.id === ref.id)
    if (!item || !data.orders.some((o) => o.id === item.orderId)) {
      throw new KitchenError('NOT_FOUND', 'Không tìm thấy món. Bảng bếp đã được làm mới.')
    }
    if (item.status === 'CANCELLED') throw new KitchenError('CONFLICT', `${item.name} đã bị hủy. Bảng bếp đã được làm mới.`)
    if (item.status !== expected || item.version !== ref.version) {
      throw new KitchenError('CONFLICT', `${item.name} vừa được cập nhật (${ITEM_STATUS_LABEL[item.status]}). Bảng bếp đã được làm mới.`)
    }
    return item
  })
}

function finish(data: KitchenData, summary: string): CommandResult {
  data.revision += 1
  return { data, summary }
}

const WAITER_INCIDENTS: IncidentType[] = ['OUT_OF_STOCK', 'CANNOT_PREPARE', 'NOTE_CLARIFICATION']

export function applyKitchenCommand(current: KitchenData, actorId: string, command: KitchenCommand, now: Date): CommandResult {
  const data = cloneData(current)
  const actor = data.staff.find((s) => s.id === actorId)
  if (!actor || actor.role !== 'KITCHEN') {
    throw new KitchenError('FORBIDDEN', 'Tài khoản không có quyền thao tác ở khu vực Bếp.')
  }
  const at = now.toISOString()

  switch (command.type) {
    case 'start': {
      requirePermission(actor, 'kitchen.items.update')
      const items = lockItems(data, command.items, 'SUBMITTED')
      for (const item of items) {
        item.status = 'PREPARING'
        item.startedAt = at
        item.startedBy = actor.id
        item.version += 1
        item.history.push({ at, status: 'PREPARING', by: actor.id })
      }
      return finish(data, `Bắt đầu chế biến ${describeItems(items)} · ${tablesOf(data, items)}`)
    }

    case 'complete': {
      requirePermission(actor, 'kitchen.items.update')
      const items = lockItems(data, command.items, 'PREPARING')
      for (const item of items) {
        item.status = 'READY'
        item.readyAt = at
        item.readyBy = actor.id
        item.version += 1
        item.history.push({ at, status: 'READY', by: actor.id })
      }
      return finish(data, `Đã xong ${describeItems(items)} · ${tablesOf(data, items)} · chờ phục vụ mang ra`)
    }

    case 'report-incident': {
      requirePermission(actor, 'kitchen.incidents.create')
      const { input } = command
      if (!(input.type in INCIDENT_TYPE_LABEL)) throw new KitchenError('INVALID', 'Chọn loại sự cố.')
      if (!(input.severity in SEVERITY_LABEL)) throw new KitchenError('INVALID', 'Chọn mức độ.')
      const description = input.description.trim()
      if (description.length < 5) throw new KitchenError('INVALID', 'Mô tả cần ít nhất 5 ký tự.')
      if (description.length > 500) throw new KitchenError('INVALID', 'Mô tả tối đa 500 ký tự.')
      const order = input.orderId ? data.orders.find((o) => o.id === input.orderId) : undefined
      if (input.orderId && !order) throw new KitchenError('NOT_FOUND', 'Không tìm thấy phiếu liên quan.')
      const item = input.itemId ? data.items.find((i) => i.id === input.itemId && i.orderId === order?.id) : undefined
      if (input.itemId && !item) throw new KitchenError('INVALID', 'Món không thuộc phiếu đã chọn.')

      const recipients = data.staff.filter((s) => s.role === 'MANAGER')
      const waiter = order && WAITER_INCIDENTS.includes(input.type) ? data.staff.find((s) => s.id === order.waiterId) : undefined
      if (waiter) recipients.push(waiter)

      const number = data.incidents.reduce((max, i) => Math.max(max, Number(i.code.replace(/\D/g, '')) || 0), 0) + 1
      const code = `SC-${String(number).padStart(3, '0')}`
      data.incidents.unshift({
        id: makeId(data, 'inc'), code, type: input.type, severity: input.severity, description,
        orderId: order?.id, itemId: item?.id, reportedBy: actor.id, reportedAt: at, status: 'OPEN',
        notifiedStaffIds: recipients.map((r) => r.id),
      })
      const context = order ? `Bàn ${order.tableCode} · #${order.code}${item ? ` · ${item.name}` : ''} — ` : ''
      for (const recipient of recipients) {
        data.outbox.unshift({
          id: makeId(data, 'out'), audience: recipient.role, staffId: recipient.id, at,
          title: `Sự cố ${code}: ${INCIDENT_TYPE_LABEL[input.type]} (${SEVERITY_LABEL[input.severity]})`,
          body: `${context}${description}`,
        })
      }
      const told = recipients.map((r) => (r.role === 'MANAGER' ? 'Quản lý ca' : `phục vụ ${r.name}`))
      return finish(data, `Đã ghi nhận sự cố ${code}${told.length ? ` · đã báo ${told.join(', ')}` : ''}`)
    }

    case 'set-menu-status': {
      if (!hasPermission(actor, 'kitchen.menu.availability')) {
        throw new KitchenError('FORBIDDEN', 'Bạn chỉ có thể gửi yêu cầu cập nhật tình trạng món.')
      }
      const menu = data.menuItems.find((m) => m.id === command.menuItemId)
      if (!menu) throw new KitchenError('NOT_FOUND', 'Không tìm thấy món trong thực đơn.')
      if (menu.status === 'DISCONTINUED') throw new KitchenError('INVALID', 'Món đã ngừng bán. Thực đơn do Admin quản lý.')
      if (menu.status === command.status) {
        throw new KitchenError('CONFLICT', `${menu.name} đã ở trạng thái ${MENU_STATUS_LABEL[menu.status]}.`)
      }
      menu.status = command.status
      menu.updatedAt = at
      menu.updatedBy = actor.id
      for (const request of data.menuRequests) {
        if (request.menuItemId !== menu.id || request.status !== 'PENDING') continue
        request.status = request.requested === command.status ? 'APPROVED' : 'REJECTED'
        request.decidedAt = at
        request.decidedBy = actor.id
      }
      data.outbox.unshift({
        id: makeId(data, 'out'), audience: 'WAITER', at,
        title: command.status === 'SOLD_OUT' ? `${menu.name} tạm hết` : `${menu.name} đã mở bán lại`,
        body: `Cập nhật bởi ${actor.name}`,
      })
      return finish(data, `${menu.name}: ${MENU_STATUS_LABEL[command.status]}`)
    }

    case 'request-menu-status': {
      if (hasPermission(actor, 'kitchen.menu.availability')) {
        throw new KitchenError('INVALID', 'Bạn có quyền cập nhật trực tiếp tình trạng món.')
      }
      const menu = data.menuItems.find((m) => m.id === command.menuItemId)
      if (!menu) throw new KitchenError('NOT_FOUND', 'Không tìm thấy món trong thực đơn.')
      if (menu.status === 'DISCONTINUED') throw new KitchenError('INVALID', 'Món đã ngừng bán. Thực đơn do Admin quản lý.')
      if (menu.status === command.status) {
        throw new KitchenError('CONFLICT', `${menu.name} đã ở trạng thái ${MENU_STATUS_LABEL[menu.status]}.`)
      }
      if (data.menuRequests.some((r) => r.menuItemId === menu.id && r.status === 'PENDING')) {
        throw new KitchenError('CONFLICT', `Đã có yêu cầu cho ${menu.name} đang chờ duyệt.`)
      }
      data.menuRequests.unshift({
        id: makeId(data, 'req'), menuItemId: menu.id, requested: command.status,
        requestedBy: actor.id, requestedAt: at, status: 'PENDING',
      })
      const verb = command.status === 'SOLD_OUT' ? 'báo tạm hết' : 'mở bán lại'
      const approvers = data.staff.filter((s) => s.role === 'MANAGER' || hasPermission(s, 'kitchen.menu.availability'))
      for (const approver of approvers) {
        data.outbox.unshift({
          id: makeId(data, 'out'), audience: approver.role, staffId: approver.id, at,
          title: `Yêu cầu ${verb}: ${menu.name}`, body: `Gửi bởi ${actor.name}`,
        })
      }
      return finish(data, `Đã gửi yêu cầu ${verb} ${menu.name}`)
    }

    case 'read-notifications': {
      const ids = command.ids
      let changed = 0
      for (const notification of data.notifications) {
        if (ids && !ids.includes(notification.id)) continue
        if (notification.readBy.includes(actor.id)) continue
        notification.readBy.push(actor.id)
        changed += 1
      }
      return finish(data, !ids && changed ? `Đã đánh dấu ${changed} thông báo là đã đọc` : '')
    }

    default:
      // Anything else (e.g. marking an item SERVED) belongs to another role.
      throw new KitchenError('FORBIDDEN', 'Thao tác này không thuộc quyền của Bếp.')
  }
}
