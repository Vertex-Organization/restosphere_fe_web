import { BILL_STATUS_LABEL, REQUEST_TYPE_LABEL } from './labels'
import { formatVnd, isBillable } from './money'
import type {
  Bill,
  BillStatus,
  CashierData,
  CashierPermission,
  CashierRequest,
  CashierShift,
  CashierStaff,
  Order,
  OrderItem,
  Payment,
  RestaurantTable,
  ScheduledShift,
  TableSession,
} from './types'

export function hasPermission(
  user: CashierStaff | null | undefined,
  permission: CashierPermission,
) {
  return !!user && user.role === 'CASHIER' && user.permissions.includes(permission)
}

export function staffName(data: CashierData, id?: string) {
  if (!id) return ''
  if (id === 'BANK') return 'Ngân hàng'
  return data.staff.find((s) => s.id === id)?.name ?? id
}

export function openShiftOf(data: CashierData, staffId: string): CashierShift | undefined {
  return data.shifts.find((s) => s.cashierId === staffId && s.status === 'OPEN')
}

const SHIFT_EARLY_OPEN_MS = 30 * 60_000
const DAY_MS = 24 * 3_600_000

function parseShiftBound(value: string, now: Date) {
  const clock = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(value)
  if (clock) {
    const date = new Date(now)
    date.setHours(Number(clock[1]), Number(clock[2]), 0, 0)
    return date.getTime()
  }
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? null : parsed
}

export function scheduledShiftWindow(shift: ScheduledShift, now: Date) {
  const start = parseShiftBound(shift.start, now)
  const end = parseShiftBound(shift.end, now)
  if (start === null || end === null) return null
  return { start: new Date(start), end: new Date(end <= start ? end + DAY_MS : end) }
}

/** Shifts assigned to the cashier that can be opened right now: from 30 minutes before start until end. */
export function openableScheduledShifts(data: CashierData, cashierId: string, now: Date) {
  return data.scheduledShifts.flatMap((shift) => {
    if (shift.cashierId !== cashierId) return []
    const window = scheduledShiftWindow(shift, now)
    if (!window) return []
    const time = now.getTime()
    const open =
      time >= window.start.getTime() - SHIFT_EARLY_OPEN_MS && time <= window.end.getTime()
    return open ? [{ shift, ...window }] : []
  })
}

export const sessionItems = (data: CashierData, sessionId: string) => {
  const orderIds = new Set(data.orders.filter((o) => o.sessionId === sessionId).map((o) => o.id))
  return data.items.filter((i) => orderIds.has(i.orderId))
}

export const billPayments = (data: CashierData, billId: string) =>
  data.payments
    .filter((p) => p.billId === billId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

export const succeededTotal = (payments: Payment[]) =>
  payments.reduce((sum, p) => (p.status === 'SUCCEEDED' ? sum + p.amount : sum), 0)

/** Requests that freeze the bill's amount until a manager decides. */
export const BLOCKING_REQUESTS: CashierRequest['type'][] = ['DISCOUNT', 'BILL_ADJUSTMENT']

export interface OrderRound {
  order: Order
  items: OrderItem[]
}

export interface BillView {
  bill: Bill
  session: TableSession
  table: RestaurantTable
  waiterName: string
  rounds: OrderRound[]
  items: OrderItem[]
  payments: Payment[]
  /** Sum of succeeded payments. */
  paid: number
  remaining: number
  pending?: Payment
  /** Latest payment was a failed transfer that has not been replaced yet. */
  failed?: Payment
  requests: CashierRequest[]
  blockingRequest?: CashierRequest
  /** Billable dishes the guests have not received yet. */
  unserved: OrderItem[]
  /** Number of dishes (quantities of billable lines). */
  dishCount: number
}

export function billView(data: CashierData, billId: string): BillView | null {
  const bill = data.bills.find((b) => b.id === billId)
  const session = bill && data.sessions.find((s) => s.id === bill.sessionId)
  const table = session && data.tables.find((t) => t.id === session.tableId)
  if (!bill || !session || !table) return null

  // Every round of the session belongs to the one bill, not just the latest order.
  const orders = data.orders
    .filter((o) => o.sessionId === session.id)
    .sort((a, b) => a.sequence - b.sequence)
  const rounds = orders.map((order) => ({
    order,
    items: data.items.filter((i) => i.orderId === order.id),
  }))
  const items = rounds.flatMap((r) => r.items)
  const payments = billPayments(data, bill.id)
  const paid = succeededTotal(payments)
  const last = payments.at(-1)
  const requests = data.requests
    .filter((r) => r.billId === bill.id)
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))
  return {
    bill,
    session,
    table,
    waiterName: staffName(data, session.waiterId),
    rounds,
    items,
    payments,
    paid,
    remaining: Math.max(0, bill.totals.total - paid),
    pending: payments.find((p) => p.status === 'PENDING'),
    failed: last?.status === 'FAILED' ? last : undefined,
    requests,
    blockingRequest: requests.find(
      (r) => r.status === 'PENDING' && BLOCKING_REQUESTS.includes(r.type),
    ),
    unserved: items.filter((i) => isBillable(i) && i.status !== 'SERVED'),
    dishCount: items.filter(isBillable).length,
  }
}

export type PaymentBlockCode =
  | 'NO_PERMISSION'
  | 'PAID'
  | 'NOT_REQUESTED'
  | 'UNSERVED'
  | 'REQUEST_PENDING'
  | 'TRANSFER_PENDING'
  | 'NO_SHIFT'
  | 'NOTHING_DUE'

export interface Block {
  code: PaymentBlockCode
  text: string
}

/** Why a new payment cannot be taken right now (null when it can). The mock
 * backend enforces the same rules; the UI uses them to explain disabled actions. */
export function paymentBlock(data: CashierData, view: BillView, actor: CashierStaff): Block | null {
  const { bill } = view
  if (!hasPermission(actor, 'payments.create'))
    return { code: 'NO_PERMISSION', text: 'Tài khoản không có quyền thu tiền.' }
  if (bill.status === 'PAID') return { code: 'PAID', text: 'Hóa đơn đã thanh toán đủ.' }
  if (bill.status === 'UNPAID')
    return { code: 'NOT_REQUESTED', text: 'Phục vụ chưa gửi yêu cầu thanh toán cho bàn này.' }
  if (view.unserved.length) {
    return {
      code: 'UNSERVED',
      text: `Còn ${view.unserved.length} món chưa phục vụ. Đối soát với phục vụ trước khi thu.`,
    }
  }
  if (view.blockingRequest) {
    const r = view.blockingRequest
    return {
      code: 'REQUEST_PENDING',
      text: `Đang chờ Quản lý duyệt ${r.code} (${REQUEST_TYPE_LABEL[r.type].toLowerCase()}).`,
    }
  }
  if (view.pending)
    return {
      code: 'TRANSFER_PENDING',
      text: `Đang chờ xác nhận chuyển khoản ${formatVnd(view.pending.amount)}.`,
    }
  if (!openShiftOf(data, actor.id))
    return { code: 'NO_SHIFT', text: 'Mở ca thu ngân trước khi thu tiền.' }
  if (view.remaining <= 0) return { code: 'NOTHING_DUE', text: 'Không còn số tiền phải thu.' }
  return null
}

/** Why the discount on this bill cannot be changed (empty when it can). */
export function discountBlock(view: BillView, actor: CashierStaff) {
  if (!hasPermission(actor, 'discounts.apply') && !hasPermission(actor, 'discounts.request'))
    return 'Tài khoản không có quyền giảm giá.'
  if (view.bill.status === 'PAID') return 'Hóa đơn đã thanh toán.'
  if (view.bill.status === 'UNPAID') return 'Chỉ giảm giá khi bàn đã yêu cầu thanh toán.'
  if (view.payments.some((p) => p.status === 'SUCCEEDED' || p.status === 'PENDING'))
    return 'Hóa đơn đã có giao dịch, không thể đổi giảm giá.'
  if (view.blockingRequest) return `Đang có yêu cầu ${view.blockingRequest.code} chờ duyệt.`
  if (view.bill.totals.subtotal <= 0) return 'Chưa có món để giảm giá.'
  return ''
}

/** Why a line cannot be submitted for removal (empty when it can). */
export function adjustmentBlock(view: BillView, actor: CashierStaff) {
  if (!hasPermission(actor, 'requests.create'))
    return 'Tài khoản không có quyền gửi yêu cầu điều chỉnh.'
  if (view.bill.status === 'PAID') return 'Hóa đơn đã thanh toán.'
  if (view.payments.some((p) => p.status === 'SUCCEEDED' || p.status === 'PENDING'))
    return 'Hóa đơn đã có giao dịch.'
  if (view.blockingRequest) return `Đang có yêu cầu ${view.blockingRequest.code} chờ duyệt.`
  return ''
}

// ── Counter list ──────────────────────────────────────────────────────────

export type PosFilter = 'due' | 'serving' | 'paid' | 'all'

export interface PosRow {
  billId: string
  billCode: string
  tableCode: string
  area: string
  guests: number
  status: BillStatus
  openedAt: string
  requestedAt?: string
  paidAt?: string
  dishCount: number
  total: number
  remaining: number
  transferPending: boolean
  transferFailed: boolean
  requestPending: boolean
  unserved: number
  guestLeft: boolean
  search: string
}

function sameDay(a: string, now: number) {
  const x = new Date(a)
  const y = new Date(now)
  return (
    x.getFullYear() === y.getFullYear() &&
    x.getMonth() === y.getMonth() &&
    x.getDate() === y.getDate()
  )
}

/** Bills worth showing at the counter: every open session, plus bills paid today.
 * Empty tables have no session and never appear here. */
export function posRows(data: CashierData, now: number): PosRow[] {
  const rows: PosRow[] = []
  for (const bill of data.bills) {
    const session = data.sessions.find((s) => s.id === bill.sessionId)
    if (!session) continue
    const visible =
      !session.closedAt || (bill.status === 'PAID' && !!bill.paidAt && sameDay(bill.paidAt, now))
    if (!visible) continue
    const view = billView(data, bill.id)
    if (!view) continue
    rows.push({
      billId: bill.id,
      billCode: bill.code,
      tableCode: view.table.code,
      area: view.table.area,
      guests: session.guests,
      status: bill.status,
      openedAt: session.openedAt,
      requestedAt: bill.requestedAt,
      paidAt: bill.paidAt,
      dishCount: view.dishCount,
      total: bill.totals.total,
      remaining: view.remaining,
      transferPending: !!view.pending,
      transferFailed: !!view.failed,
      requestPending: !!view.blockingRequest,
      unserved: view.unserved.length,
      guestLeft: !!session.guestLeftAt,
      search: `${view.table.code} ${bill.code} ${view.table.area} ${BILL_STATUS_LABEL[bill.status]}`,
    })
  }
  const rank: Record<BillStatus, number> = { PAYMENT_REQUESTED: 0, UNPAID: 1, PAID: 2 }
  return rows.sort(
    (a, b) =>
      rank[a.status] - rank[b.status] ||
      // Longest-waiting payment request first; newest payment last-in-first.
      (a.status === 'PAYMENT_REQUESTED'
        ? (a.requestedAt ?? '').localeCompare(b.requestedAt ?? '')
        : 0) ||
      (a.status === 'PAID' ? (b.paidAt ?? '').localeCompare(a.paidAt ?? '') : 0) ||
      a.openedAt.localeCompare(b.openedAt),
  )
}

export function matchesFilter(row: PosRow, filter: PosFilter) {
  switch (filter) {
    case 'due':
      return row.status === 'PAYMENT_REQUESTED'
    case 'serving':
      return row.status === 'UNPAID'
    case 'paid':
      return row.status === 'PAID'
    default:
      return true
  }
}

// ── Shift ─────────────────────────────────────────────────────────────────

export interface ShiftSummary {
  count: number
  cash: number
  cashCount: number
  transfer: number
  transferCount: number
  card: number
  cardCount: number
  /** All money received in the shift, whatever the method. */
  revenue: number
  pendingCount: number
  pendingAmount: number
  voidedCount: number
  failedCount: number
  /** Opening float + cash received. This is what the drawer should hold, not the revenue. */
  expectedCash: number
}

export function shiftSummary(data: CashierData, shift: CashierShift): ShiftSummary {
  const summary: ShiftSummary = {
    count: 0,
    cash: 0,
    cashCount: 0,
    transfer: 0,
    transferCount: 0,
    card: 0,
    cardCount: 0,
    revenue: 0,
    pendingCount: 0,
    pendingAmount: 0,
    voidedCount: 0,
    failedCount: 0,
    expectedCash: shift.openingFloat,
  }
  for (const p of data.payments) {
    if (p.shiftId !== shift.id) continue
    if (p.status === 'PENDING') {
      summary.pendingCount += 1
      summary.pendingAmount += p.amount
    }
    if (p.status === 'VOIDED') summary.voidedCount += 1
    if (p.status === 'FAILED') summary.failedCount += 1
    if (p.status !== 'SUCCEEDED') continue
    summary.count += 1
    summary.revenue += p.amount
    if (p.method === 'CASH') {
      summary.cash += p.amount
      summary.cashCount += 1
    } else if (p.method === 'TRANSFER') {
      summary.transfer += p.amount
      summary.transferCount += 1
    } else {
      summary.card += p.amount
      summary.cardCount += 1
    }
  }
  summary.expectedCash += summary.cash
  return summary
}

export function unreadCount(data: CashierData, userId: string) {
  return data.notifications.filter((n) => !n.readBy.includes(userId)).length
}

export function pendingRequestCount(data: CashierData) {
  return data.requests.filter((r) => r.status === 'PENDING').length
}
