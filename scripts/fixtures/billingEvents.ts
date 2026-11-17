import { REQUEST_TYPE_LABEL } from '../../src/api/billing/labels'
import { formatVnd, isBillable } from '../../src/api/billing/money'
import {
  cleanText, cloneData, makeId, nextCode, pad, recompute, settleIfPaid, tableCodeOf, touch,
} from '../../src/api/billing/rules'
import { billView } from '../../src/api/billing/selectors'
import { CashierError, type CashierData, type CommandResult, type OrderItem } from '../../src/api/billing/types'

// Events that other roles (Waiter, Kitchen, Manager) or the bank would send
// through the backend. They exist only so the cashier screens can be tested
// end to end before those APIs exist, and are reachable only from the
// development simulator (/cashier/dev). None of them is a cashier command.

export interface RoundLine {
  menuItemId: string
  quantity: number
}

export type DevEvent =
  | { type: 'walk-in'; tableId: string; guests: number; waiterId: string; lines: RoundLine[] }
  | { type: 'add-round'; sessionId: string; lines: RoundLine[] }
  | { type: 'serve-remaining'; sessionId: string }
  | { type: 'waiter-request-payment'; sessionId: string }
  | { type: 'waiter-withdraw-payment'; sessionId: string }
  | { type: 'bank-confirm'; paymentId: string }
  | { type: 'bank-fail'; paymentId: string; reason: string }
  | { type: 'manager-decide'; requestId: string; approve: boolean; note: string }
  | { type: 'guest-left'; sessionId: string }
  | { type: 'table-cleaned'; sessionId: string }

const MANAGER = (data: CashierData) => data.staff.find((s) => s.role === 'MANAGER')?.id ?? 'NV001'

function notifyCashiers(data: CashierData, at: string, n: Omit<CashierData['notifications'][number], 'id' | 'at' | 'readBy'>) {
  data.notifications.unshift({ id: makeId(data, 'n'), at, readBy: [], ...n })
}

function activeSession(data: CashierData, sessionId: string) {
  const session = data.sessions.find((s) => s.id === sessionId)
  const bill = data.bills.find((b) => b.sessionId === sessionId)
  const table = data.tables.find((t) => t.id === session?.tableId)
  if (!session || !bill || !table) throw new CashierError('NOT_FOUND', 'Không tìm thấy lượt phục vụ.')
  if (session.closedAt) throw new CashierError('INVALID', 'Lượt phục vụ đã đóng.')
  return { session, bill, table }
}

function addOrder(data: CashierData, sessionId: string, waiterId: string, lines: RoundLine[], at: string) {
  const valid = lines.filter((l) => l.menuItemId)
  if (!valid.length) throw new CashierError('INVALID', 'Chọn ít nhất một món.')
  const sequence = data.orders.filter((o) => o.sessionId === sessionId).reduce((max, o) => Math.max(max, o.sequence), 0) + 1
  const order = { id: makeId(data, 'o'), code: nextCode(data, 'order'), sessionId, waiterId, sequence, submittedAt: at }
  data.orders.push(order)
  for (const line of valid) {
    const menu = data.menu.find((m) => m.id === line.menuItemId)
    if (!menu) throw new CashierError('NOT_FOUND', 'Không tìm thấy món.')
    if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 99) throw new CashierError('INVALID', 'Số lượng từ 1 đến 99.')
    data.items.push({
      id: makeId(data, 'i'), orderId: order.id, menuItemId: menu.id, name: menu.name, unitPrice: menu.price,
      quantity: line.quantity, note: '', status: 'SUBMITTED',
    })
  }
  return order
}

export function applyDevEvent(current: CashierData, event: DevEvent, now: Date): CommandResult {
  const data = cloneData(current)
  const at = now.toISOString()
  let summary: string

  switch (event.type) {
    case 'walk-in': {
      const table = data.tables.find((t) => t.id === event.tableId)
      if (!table) throw new CashierError('NOT_FOUND', 'Không tìm thấy bàn.')
      if (table.status !== 'AVAILABLE') throw new CashierError('INVALID', `Bàn ${table.code} không trống.`)
      if (!Number.isInteger(event.guests) || event.guests < 1 || event.guests > table.capacity) {
        throw new CashierError('INVALID', `Số khách từ 1 đến ${table.capacity}.`)
      }
      const session = { id: makeId(data, 's'), tableId: table.id, guests: event.guests, waiterId: event.waiterId, openedAt: at }
      data.sessions.push(session)
      const order = addOrder(data, session.id, event.waiterId, event.lines, at)
      const bill = {
        id: makeId(data, 'b'), code: nextCode(data, 'bill'), sessionId: session.id, status: 'UNPAID' as const, version: 1,
        createdAt: at, totals: { subtotal: 0, discount: 0, serviceCharge: 0, tax: 0, total: 0 },
        history: [{ at, by: event.waiterId, text: 'Mở bàn, tạo hóa đơn' }],
      }
      data.bills.push(bill)
      recompute(data, bill, at)
      table.status = 'OCCUPIED'
      summary = `Phục vụ mở Bàn ${table.code} · ${bill.code} · gửi #${order.code}`
      break
    }

    case 'add-round': {
      const { session, bill, table } = activeSession(data, event.sessionId)
      if (bill.status !== 'UNPAID') throw new CashierError('INVALID', 'Bàn đã yêu cầu thanh toán, không nhận thêm món.')
      const order = addOrder(data, session.id, session.waiterId, event.lines, at)
      recompute(data, bill, at)
      touch(bill, at, session.waiterId, `Gọi thêm lượt ${order.sequence} (#${order.code})`)
      summary = `Bàn ${table.code} gọi thêm · lượt ${order.sequence} · #${order.code}`
      break
    }

    case 'serve-remaining': {
      const { session, bill, table } = activeSession(data, event.sessionId)
      const orderIds = new Set(data.orders.filter((o) => o.sessionId === session.id).map((o) => o.id))
      const open = data.items.filter((i): i is OrderItem => orderIds.has(i.orderId) && isBillable(i) && i.status !== 'SERVED')
      if (!open.length) throw new CashierError('INVALID', 'Không còn món chờ phục vụ.')
      for (const item of open) {
        item.status = 'SERVED'
        item.servedAt = at
      }
      bill.version += 1
      summary = `Bếp & phục vụ đã ra ${open.length} món cho Bàn ${table.code}`
      break
    }

    case 'waiter-request-payment': {
      const { session, bill, table } = activeSession(data, event.sessionId)
      if (bill.status !== 'UNPAID') throw new CashierError('INVALID', 'Bàn đã yêu cầu thanh toán.')
      const view = billView(data, bill.id)!
      if (!view.dishCount) throw new CashierError('INVALID', 'Chưa có món hợp lệ để thanh toán.')
      // Same rule as the staff app: everything must be served before asking.
      if (view.unserved.length) throw new CashierError('INVALID', 'Cần phục vụ hết món trước khi yêu cầu thanh toán.')
      bill.status = 'PAYMENT_REQUESTED'
      bill.requestedAt = at
      bill.requestedBy = session.waiterId
      recompute(data, bill, at)
      touch(bill, at, session.waiterId, 'Phục vụ gửi yêu cầu thanh toán')
      notifyCashiers(data, at, {
        kind: 'PAYMENT_REQUEST', billId: bill.id,
        title: `Bàn ${table.code} yêu cầu thanh toán`, body: `${bill.code} · ${view.dishCount} món · ${formatVnd(bill.totals.total)}`,
      })
      summary = `Phục vụ gửi yêu cầu thanh toán Bàn ${table.code}`
      break
    }

    case 'waiter-withdraw-payment': {
      const { session, bill, table } = activeSession(data, event.sessionId)
      if (bill.status !== 'PAYMENT_REQUESTED') throw new CashierError('INVALID', 'Bàn chưa có yêu cầu thanh toán để rút.')
      if (data.payments.some((p) => p.billId === bill.id && (p.status === 'PENDING' || p.status === 'SUCCEEDED'))) {
        throw new CashierError('CONFLICT', 'Hóa đơn có giao dịch đang xử lý hoặc đã thu tiền.')
      }
      bill.status = 'UNPAID'
      delete bill.requestedAt
      delete bill.requestedBy
      touch(bill, at, session.waiterId, 'Phục vụ rút yêu cầu thanh toán')
      notifyCashiers(data, at, {
        kind: 'PAYMENT_REQUEST_WITHDRAWN', billId: bill.id,
        title: `Bàn ${table.code} rút yêu cầu thanh toán`, body: `${bill.code} · phục vụ tiếp tục gọi món`,
      })
      summary = `Phục vụ rút yêu cầu thanh toán Bàn ${table.code}`
      break
    }

    case 'bank-confirm':
    case 'bank-fail': {
      const payment = data.payments.find((p) => p.id === event.paymentId)
      const bill = data.bills.find((b) => b.id === payment?.billId)
      if (!payment || !bill) throw new CashierError('NOT_FOUND', 'Không tìm thấy giao dịch.')
      if (payment.method !== 'TRANSFER' || payment.status !== 'PENDING') throw new CashierError('CONFLICT', 'Giao dịch không còn chờ xác nhận.')
      const table = tableCodeOf(data, bill)
      payment.completedAt = at
      if (event.type === 'bank-confirm') {
        payment.status = 'SUCCEEDED'
        payment.verifiedBy = 'BANK'
        payment.bankReference = `FT${at.slice(2, 10).replace(/-/g, '')}${pad(data.nextId, 6)}`
        touch(bill, at, 'BANK', `Ngân hàng xác nhận ${formatVnd(payment.amount)} (${payment.code})`)
        const settled = settleIfPaid(data, bill, at, 'BANK')
        notifyCashiers(data, at, {
          kind: 'TRANSFER_RECEIVED', billId: bill.id, paymentId: payment.id,
          title: `Đã nhận ${formatVnd(payment.amount)} · Bàn ${table}`,
          body: `${payment.code} · ${payment.transferContent ?? ''}${settled ? ' · Hóa đơn đã thanh toán đủ' : ''}`,
        })
        summary = `Ngân hàng xác nhận ${payment.code}`
      } else {
        payment.status = 'FAILED'
        payment.failureReason = cleanText(event.reason, 'Lý do', 3)
        touch(bill, at, 'BANK', `Chuyển khoản ${payment.code} thất bại: ${payment.failureReason}`)
        notifyCashiers(data, at, {
          kind: 'TRANSFER_FAILED', billId: bill.id, paymentId: payment.id,
          title: `Chuyển khoản lỗi · Bàn ${table}`, body: `${payment.code} · ${payment.failureReason}`,
        })
        summary = `Ngân hàng báo ${payment.code} thất bại`
      }
      break
    }

    case 'manager-decide': {
      const request = data.requests.find((r) => r.id === event.requestId)
      const bill = data.bills.find((b) => b.id === request?.billId)
      if (!request || !bill) throw new CashierError('NOT_FOUND', 'Không tìm thấy yêu cầu.')
      if (request.status !== 'PENDING') throw new CashierError('CONFLICT', 'Yêu cầu đã được xử lý.')
      const manager = MANAGER(data)
      if (event.approve) {
        const view = billView(data, bill.id)!
        const started = view.payments.some((p) => p.status === 'SUCCEEDED' || p.status === 'PENDING')
        if (request.type === 'DISCOUNT' && request.discount) {
          if (bill.status === 'PAID' || started || bill.discount) throw new CashierError('CONFLICT', 'Hóa đơn đã thay đổi, không thể áp dụng giảm giá.')
          bill.discount = {
            mode: request.discount.mode, value: request.discount.value, reason: request.reason,
            appliedBy: request.requestedBy, appliedAt: at, requestId: request.id, approvedBy: manager,
          }
          recompute(data, bill, at)
        } else if (request.type === 'BILL_ADJUSTMENT') {
          const item = data.items.find((i) => i.id === request.itemId)
          if (!item || !isBillable(item) || bill.status === 'PAID' || started) {
            throw new CashierError('CONFLICT', 'Hóa đơn đã thay đổi, không thể điều chỉnh.')
          }
          item.status = 'VOIDED'
          item.cancelledAt = at
          item.cancellationReason = `Điều chỉnh ${request.code}: ${request.reason}`
          recompute(data, bill, at)
        } else if (request.type === 'PAYMENT_VOID') {
          const payment = data.payments.find((p) => p.id === request.paymentId)
          if (!payment || payment.status !== 'SUCCEEDED') throw new CashierError('CONFLICT', 'Giao dịch không còn ở trạng thái thành công.')
          payment.status = 'VOIDED'
          payment.voidedAt = at
          payment.voidedBy = manager
          payment.voidRequestId = request.id
          if (bill.status === 'PAID') {
            bill.status = 'PAYMENT_REQUESTED'
            delete bill.paidAt
          }
          const session = data.sessions.find((s) => s.id === bill.sessionId)
          data.outbox.unshift({
            id: makeId(data, 'out'),
            at,
            kind: 'PAYMENT_VOIDED',
            audience: 'WAITER',
            staffId: session?.waiterId,
            title: `Hủy thanh toán ${payment.code} · Bàn ${tableCodeOf(data, bill)}`,
            body: `${bill.code} · ${formatVnd(payment.amount)}`,
          })
        }
      }
      request.status = event.approve ? 'APPROVED' : 'REJECTED'
      request.decidedAt = at
      request.decidedBy = manager
      const note = event.note.trim()
      if (note) request.decisionNote = note
      touch(bill, at, manager, `${request.code} ${event.approve ? 'được duyệt' : 'bị từ chối'}${note ? `: ${note}` : ''}`)
      if (event.approve) settleIfPaid(data, bill, at, manager)
      notifyCashiers(data, at, {
        kind: 'REQUEST_DECIDED', billId: bill.id, requestId: request.id,
        title: `${request.code} ${event.approve ? 'đã được duyệt' : 'bị từ chối'}`,
        body: `${REQUEST_TYPE_LABEL[request.type]} · ${bill.code} · Bàn ${tableCodeOf(data, bill)}${note ? ` — ${note}` : ''}`,
      })
      summary = `Quản lý đã ${event.approve ? 'duyệt' : 'từ chối'} ${request.code}`
      break
    }

    case 'guest-left': {
      const { session, bill, table } = activeSession(data, event.sessionId)
      if (bill.status !== 'PAID' || session.guestLeftAt || table.status !== 'OCCUPIED') {
        throw new CashierError('INVALID', 'Chỉ xác nhận khách rời sau khi đã thanh toán và bàn còn khách.')
      }
      session.guestLeftAt = at
      table.status = 'CLEANING'
      summary = `Phục vụ xác nhận khách rời Bàn ${table.code} · bàn chuyển sang Đang dọn`
      break
    }

    case 'table-cleaned': {
      const { session, table } = activeSession(data, event.sessionId)
      if (!session.guestLeftAt || table.status !== 'CLEANING') throw new CashierError('INVALID', 'Chỉ dọn xong khi khách đã rời và bàn đang dọn.')
      session.closedAt = at
      table.status = 'AVAILABLE'
      summary = `Bàn ${table.code} đã dọn xong · Sẵn sàng`
      break
    }

    default:
      throw new CashierError('INVALID', 'Sự kiện không hợp lệ.')
  }
  data.revision += 1
  return { data, summary }
}

/** Sessions still at the restaurant (for the simulator's pickers). */
export function openSessions(data: CashierData) {
  return data.sessions
    .filter((s) => !s.closedAt)
    .map((s) => ({ session: s, table: data.tables.find((t) => t.id === s.tableId)!, bill: data.bills.find((b) => b.sessionId === s.id)! }))
    .filter((x) => x.table && x.bill)
    .sort((a, b) => a.table.code.localeCompare(b.table.code))
}
