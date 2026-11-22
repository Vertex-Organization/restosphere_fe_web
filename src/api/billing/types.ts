// Cashier / billing domain model.
//
// Entity names and the Bill status enum follow the RestoSphere staff app
// (restosphere-fe-mobile/src/features/{orders,billing,tables}/types.ts) so the
// Waiter → Cashier hand-off uses one vocabulary:
//   TableSession  one seating of guests at a table ("lượt sử dụng bàn")
//   Order         one ordering round of that session ("lượt gọi món")
//   OrderItem     one dish line inside an order
//   Bill          the single invoice of a session, covering every order
//   Payment       one money movement against a bill (a bill may have several)

import type { SentItemStatus, StaffRole } from '../kitchen/types'

export type { SentItemStatus, StaffRole }

export type CashierPermission =
  | 'bills.view'
  | 'bills.prepare'
  | 'payments.create'
  | 'payments.view'
  | 'payments.confirm_transfer'
  | 'receipts.print'
  | 'transactions.view'
  | 'discounts.apply'
  | 'discounts.request'
  | 'requests.create'
  | 'shifts.view'
  | 'shifts.manage'

export interface CashierStaff {
  id: string
  name: string
  username: string
  role: StaffRole
  position: string
  permissions: CashierPermission[]
  /** Largest discount, in percent of the subtotal, this person may apply without approval. */
  discountLimitPercent: number
}

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'OUT_OF_SERVICE'

export interface RestaurantTable {
  id: string
  code: string
  area: string
  capacity: number
  /** Changed only by the waiter/reception flow (guest left, cleaned), never by payment. */
  status: TableStatus
}

export interface TableSession {
  id: string
  tableId: string
  guests: number
  waiterId: string
  openedAt: string
  guestLeftAt?: string
  closedAt?: string
}

export interface Order {
  id: string
  code: string
  sessionId: string
  waiterId: string
  sequence: number
  submittedAt: string
}

export interface OrderItem {
  id: string
  orderId: string
  menuItemId: string
  name: string
  /** Whole đồng, as priced when ordered. */
  unitPrice: number
  quantity: number
  unit?: string
  note: string
  status: SentItemStatus
  servedAt?: string
  cancelledAt?: string
  cancellationReason?: string
}

/** Same values as the staff app's PaymentStatus for a bill. */
export type BillStatus = 'UNPAID' | 'PAYMENT_REQUESTED' | 'PAID'

export type DiscountMode = 'PERCENT' | 'AMOUNT'

export interface BillDiscount {
  mode: DiscountMode
  /** Percent (1–100) or amount in đồng, as entered. */
  value: number
  reason: string
  appliedBy: string
  appliedAt: string
  /** Set when the discount came from an approved request. */
  requestId?: string
  approvedBy?: string
}

export interface BillTotals {
  subtotal: number
  discount: number
  serviceCharge: number
  tax: number
  total: number
}

export interface BillEvent {
  at: string
  by: string
  text: string
}

export interface Bill {
  id: string
  code: string
  sessionId: string
  status: BillStatus
  /** Incremented on every change; money commands must send the version they saw. */
  version: number
  createdAt: string
  requestedAt?: string
  requestedBy?: string
  paidAt?: string
  discount?: BillDiscount
  /** Server-computed snapshot, refreshed whenever items or adjustments change. */
  totals: BillTotals
  history: BillEvent[]
}

export type PaymentMethod = 'CASH' | 'TRANSFER' | 'CARD'

/**
 * PENDING   transfer requested, money not verified yet
 * SUCCEEDED money received (cash counted, or transfer verified)
 * FAILED    bank reported a problem (wrong amount, expired…)
 * CANCELLED pending transfer withdrawn before money arrived
 * VOIDED    a succeeded payment reversed through an approved request
 */
export type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED' | 'VOIDED'

export interface Payment {
  id: string
  code: string
  billId: string
  shiftId: string
  method: PaymentMethod
  status: PaymentStatus
  amount: number
  /** Cash only: what the guest handed over and the change given back. */
  tendered?: number
  change?: number
  /** Transfer only: the unique text the guest types as the transfer description. */
  transferContent?: string
  /** Bank transaction reference, once verified. */
  bankReference?: string
  /** 'BANK' when confirmed by the bank notification, otherwise the staff id who checked it. */
  verifiedBy?: string
  createdBy: string
  createdAt: string
  completedAt?: string
  failureReason?: string
  cancelledBy?: string
  voidedAt?: string
  voidedBy?: string
  voidRequestId?: string
}

export type RequestType = 'DISCOUNT' | 'BILL_ADJUSTMENT' | 'PAYMENT_VOID'
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN'

export interface CashierRequest {
  id: string
  code: string
  type: RequestType
  status: RequestStatus
  billId: string
  /** What the request acts on; same shape as the manager's Approval. */
  targetType: 'BILL' | 'PAYMENT' | 'ORDER_ITEM'
  targetId: string
  /** Amount in đồng the request affects (the manager's limit is compared against it). */
  amount: number
  /** PAYMENT_VOID */
  paymentId?: string
  /** BILL_ADJUSTMENT: the line to remove from the bill. */
  itemId?: string
  /** DISCOUNT */
  discount?: { mode: DiscountMode; value: number; amount: number }
  reason: string
  requestedBy: string
  requestedAt: string
  decidedBy?: string
  decidedAt?: string
  decisionNote?: string
}

export interface CashierShift {
  id: string
  code: string
  cashierId: string
  status: 'OPEN' | 'CLOSED'
  openedAt: string
  openingFloat: number
  scheduledShiftId?: string
  closedAt?: string
  /** Snapshot at closing: opening float + cash received. */
  expectedCash?: number
  countedCash?: number
  closingNote?: string
}

/** A shift the manager assigned to a cashier (the manager module owns the schedule). */
export interface ScheduledShift {
  id: string
  name: string
  start: string
  end: string
  cashierId: string
}

export type CashierNotificationKind =
  | 'PAYMENT_REQUEST'
  | 'PAYMENT_REQUEST_WITHDRAWN'
  | 'TRANSFER_RECEIVED'
  | 'TRANSFER_FAILED'
  | 'REQUEST_DECIDED'

export interface CashierNotification {
  id: string
  kind: CashierNotificationKind
  title: string
  body: string
  at: string
  billId?: string
  requestId?: string
  paymentId?: string
  /** Read state is per cashier. */
  readBy: string[]
}

/** Messages the cashier side sends to other roles (shown only in the dev simulator). */
export type OutboxKind =
  | 'BILL_UPDATED'
  | 'PAYMENT'
  | 'PAYMENT_RETURNED'
  | 'PAYMENT_VOIDED'
  | 'APPROVAL'
  | 'REQUEST_WITHDRAWN'
  | 'CASHIER_SHIFT_CLOSED'

export interface OutboxMessage {
  id: string
  kind: OutboxKind
  audience: StaffRole
  staffId?: string
  title: string
  body: string
  at: string
}

export interface BankAccount {
  bankName: string
  accountNumber: string
  accountName: string
}

/**
 * Restaurant billing settings. In production these come from the backend
 * (maintained by Admin). Nothing here assumes VAT or a service charge: a rate
 * of null means the line is not charged and not shown.
 */
export interface BillingConfig {
  restaurantName: string
  address?: string
  /** Basis points (1% = 100) or null when not charged. */
  serviceChargeRate: number | null
  taxRate: number | null
  /** Which payment methods the restaurant can actually record. */
  methods: Record<PaymentMethod, boolean>
  bank: BankAccount | null
  /** Static QR image of the receiving account, if the restaurant uploaded one. */
  qrImageUrl?: string
}

export interface MenuEntry {
  id: string
  name: string
  price: number
  /** Dish photo; drinks may have none. */
  imageUrl?: string
}

export interface CashierData {
  schema: 1
  seedDay: string
  /** Monotonic data revision; a slower response never replaces newer data. */
  revision: number
  nextId: number
  counters: { bill: number; payment: number; request: number; shift: number; order: number }
  config: BillingConfig
  staff: CashierStaff[]
  menu: MenuEntry[]
  tables: RestaurantTable[]
  sessions: TableSession[]
  orders: Order[]
  items: OrderItem[]
  bills: Bill[]
  payments: Payment[]
  requests: CashierRequest[]
  shifts: CashierShift[]
  scheduledShifts: ScheduledShift[]
  notifications: CashierNotification[]
  outbox: OutboxMessage[]
  /** Idempotency keys already processed → payment id, so a retried submit never charges twice. */
  processedKeys: Record<string, string>
}

export interface DiscountInput {
  mode: DiscountMode
  value: number
  reason: string
}

/** Everything a cashier can ask the system to do. There is deliberately no
 * command that approves a request, frees a table or marks a dish served. */
export type CashierCommand =
  | { type: 'apply-discount'; billId: string; billVersion: number; discount: DiscountInput }
  | { type: 'remove-discount'; billId: string; billVersion: number }
  | { type: 'request-discount'; billId: string; billVersion: number; discount: DiscountInput }
  | { type: 'request-adjustment'; billId: string; itemId: string; reason: string }
  | { type: 'request-void'; paymentId: string; reason: string }
  | { type: 'withdraw-request'; requestId: string }
  | { type: 'return-payment-request'; billId: string; billVersion: number; reason: string }
  | {
      type: 'pay-cash'
      billId: string
      billVersion: number
      amount: number
      tendered: number
      idempotencyKey: string
    }
  | {
      type: 'create-transfer'
      billId: string
      billVersion: number
      amount: number
      idempotencyKey: string
    }
  | { type: 'confirm-transfer'; paymentId: string; bankReference: string }
  | { type: 'cancel-transfer'; paymentId: string }
  | { type: 'open-shift'; openingFloat: number; scheduledShiftId?: string }
  | { type: 'close-shift'; shiftId: string; countedCash: number; note: string }
  | { type: 'read-notifications'; ids?: string[] }

export interface CommandResult {
  data: CashierData
  summary: string
  /** Id of the payment/request/shift the command created or changed. */
  ref?: string
}

export type CashierErrorCode = 'FORBIDDEN' | 'CONFLICT' | 'INVALID' | 'NOT_FOUND' | 'NETWORK'

export class CashierError extends Error {
  readonly code: CashierErrorCode

  constructor(code: CashierErrorCode, message: string) {
    super(message)
    this.name = 'CashierError'
    this.code = code
  }
}
