import { authenticatedRequest } from '../auth'
import { ApiError } from '../client'
import { CashierError } from './types'
import type {
  Bill,
  BillDiscount,
  BillingConfig,
  BillStatus,
  CashierCommand,
  CashierData,
  CashierNotification,
  CashierNotificationKind,
  CashierPermission,
  CashierRequest,
  CashierShift,
  CashierStaff,
  CommandResult,
  DiscountMode,
  Payment,
  PaymentMethod,
  PaymentStatus,
  RequestStatus,
  RequestType,
  ScheduledShift,
} from './types'

export interface CashierService {
  /** Current billing state. Called on start and by polling. */
  load(): Promise<CashierData>
  /** Applies one command; rejects with CashierError (CONFLICT when the bill changed meanwhile). */
  execute(actor: CashierStaff, command: CashierCommand): Promise<CommandResult>
  /** Notifies when data changed elsewhere (another tab, push channel…). */
  subscribe(listener: () => void): () => void
}

const STATUS_CODES: Record<number, 'FORBIDDEN' | 'CONFLICT' | 'INVALID' | 'NOT_FOUND'> = {
  403: 'FORBIDDEN',
  409: 'CONFLICT',
  400: 'INVALID',
  404: 'NOT_FOUND',
}

/** Maps HTTP failures to CashierError; other errors (e.g. 401, 5xx) pass through unchanged. */
async function call<T>(request: Promise<T>): Promise<T> {
  try {
    return await request
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 0) throw new CashierError('NETWORK', error.message)
      const code = STATUS_CODES[error.status]
      if (code) throw new CashierError(code, error.message)
    }
    throw error
  }
}

const get = <T>(path: string) => call(authenticatedRequest<T>(path))
const send = <T>(method: 'POST' | 'PUT', path: string, body?: unknown) =>
  call(
    authenticatedRequest<T>(path, {
      method,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    }),
  )
const post = <T>(path: string, body?: unknown) => send<T>('POST', path, body)
const put = <T>(path: string, body: unknown) => send<T>('PUT', path, body)
const del = <T>(path: string) => call(authenticatedRequest<T>(path, { method: 'DELETE' }))
const id = encodeURIComponent

// --- Backend DTOs (Cashier*Response.java) -> types.ts -------------------------
// The backend serialises absent values as null; types.ts uses optional fields.

interface BillDto {
  id: string
  code: string
  sessionId: string
  status: string
  version: number
  createdAt: string
  requestedAt?: string | null
  paidAt?: string | null
  discount?: {
    mode: string
    value: number
    reason?: string | null
    appliedBy?: string | null
    appliedAt?: string | null
  } | null
  totals: Bill['totals']
  history?: Bill['history'] | null
}
interface PaymentDto {
  id: string
  code: string
  billId: string
  shiftId: string
  method: string
  status: string
  amount: number
  tendered?: number | null
  change?: number | null
  transferContent?: string | null
  bankReference?: string | null
  verifiedBy?: string | null
  createdBy: string
  createdAt: string
  completedAt?: string | null
}
interface RequestDto {
  id: string
  code: string
  type: string
  status: string
  billId?: string | null
  targetType: string
  targetId: string
  amount?: number | null
  paymentId?: string | null
  itemId?: string | null
  discount?: { mode: string; value: number; amount: number } | null
  reason?: string | null
  requestedBy: string
  requestedAt: string
  decidedBy?: string | null
  decidedAt?: string | null
  decisionNote?: string | null
}
interface ShiftDto {
  id: string
  code: string
  cashierId: string
  status: string
  openedAt: string
  openingFloat: number
  scheduledShiftId?: string | null
  closedAt?: string | null
  expectedCash?: number | null
  countedCash?: number | null
  closingNote?: string | null
}
interface NotificationDto {
  id: string
  kind: string
  title: string
  body: string
  at: string
  billId?: string | null
  requestId?: string | null
  readBy?: string[] | null
}
interface ConfigDto {
  restaurantName: string
  address?: string | null
  serviceChargeRate?: number | null
  taxRate?: number | null
  methods?: Record<string, boolean> | null
  bank?: BillingConfig['bank']
}
interface MeDto {
  id: string
  name: string
  username: string
  role: CashierStaff['role']
  position?: string | null
  permissions?: string[] | null
  discountLimitPercent: number
}

const REQUEST_TYPES: RequestType[] = ['DISCOUNT', 'BILL_ADJUSTMENT', 'PAYMENT_VOID']
const PAYMENT_STATUSES: PaymentStatus[] = ['PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'VOIDED']
const PAYMENT_METHODS: PaymentMethod[] = ['CASH', 'TRANSFER', 'CARD']
const REQUEST_STATUSES: RequestStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN']
const BILL_STATUSES: BillStatus[] = ['UNPAID', 'PAYMENT_REQUESTED', 'PAID']

const mode = (value: string): DiscountMode => (value === 'AMOUNT' ? 'AMOUNT' : 'PERCENT')

function toBill(dto: BillDto): Bill {
  const status = BILL_STATUSES.find((value) => value === dto.status) ?? 'UNPAID'
  const discount: BillDiscount | undefined = dto.discount
    ? {
        mode: mode(dto.discount.mode),
        value: dto.discount.value,
        reason: dto.discount.reason ?? '',
        appliedBy: dto.discount.appliedBy ?? '',
        appliedAt: dto.discount.appliedAt ?? dto.createdAt,
      }
    : undefined
  return {
    id: dto.id,
    code: dto.code,
    sessionId: dto.sessionId,
    status,
    version: dto.version,
    createdAt: dto.createdAt,
    ...(dto.requestedAt ? { requestedAt: dto.requestedAt } : {}),
    ...(dto.paidAt ? { paidAt: dto.paidAt } : {}),
    ...(discount ? { discount } : {}),
    totals: dto.totals,
    history: dto.history ?? [],
  }
}

function toPayment(dto: PaymentDto): Payment {
  return {
    id: dto.id,
    code: dto.code,
    billId: dto.billId,
    shiftId: dto.shiftId,
    method: PAYMENT_METHODS.find((value) => value === dto.method) ?? 'CASH',
    status: PAYMENT_STATUSES.find((value) => value === dto.status) ?? 'PENDING',
    amount: dto.amount,
    ...(dto.tendered != null ? { tendered: dto.tendered } : {}),
    ...(dto.change != null ? { change: dto.change } : {}),
    ...(dto.transferContent ? { transferContent: dto.transferContent } : {}),
    ...(dto.bankReference ? { bankReference: dto.bankReference } : {}),
    ...(dto.verifiedBy ? { verifiedBy: dto.verifiedBy } : {}),
    createdBy: dto.createdBy,
    createdAt: dto.createdAt,
    ...(dto.completedAt ? { completedAt: dto.completedAt } : {}),
  }
}

/** Request types without a cashier UI counterpart (CANCEL_ITEM, RESERVATION, MENU_STATUS) are dropped. */
function toRequest(dto: RequestDto): CashierRequest | null {
  const type = REQUEST_TYPES.find((value) => value === dto.type)
  const status = REQUEST_STATUSES.find((value) => value === dto.status)
  if (!type || !status || !dto.billId) return null
  return {
    id: dto.id,
    code: dto.code,
    type,
    status,
    billId: dto.billId,
    targetType:
      dto.targetType === 'PAYMENT' || dto.targetType === 'ORDER_ITEM' ? dto.targetType : 'BILL',
    targetId: dto.targetId,
    amount: dto.amount ?? 0,
    ...(dto.paymentId ? { paymentId: dto.paymentId } : {}),
    ...(dto.itemId ? { itemId: dto.itemId } : {}),
    ...(dto.discount ? { discount: { ...dto.discount, mode: mode(dto.discount.mode) } } : {}),
    reason: dto.reason ?? '',
    requestedBy: dto.requestedBy,
    requestedAt: dto.requestedAt,
    ...(dto.decidedBy ? { decidedBy: dto.decidedBy } : {}),
    ...(dto.decidedAt ? { decidedAt: dto.decidedAt } : {}),
    ...(dto.decisionNote ? { decisionNote: dto.decisionNote } : {}),
  }
}

function toShift(dto: ShiftDto): CashierShift {
  return {
    id: dto.id,
    code: dto.code,
    cashierId: dto.cashierId,
    status: dto.status === 'CLOSED' ? 'CLOSED' : 'OPEN',
    openedAt: dto.openedAt,
    openingFloat: dto.openingFloat,
    ...(dto.scheduledShiftId ? { scheduledShiftId: dto.scheduledShiftId } : {}),
    ...(dto.closedAt ? { closedAt: dto.closedAt } : {}),
    ...(dto.expectedCash != null ? { expectedCash: dto.expectedCash } : {}),
    ...(dto.countedCash != null ? { countedCash: dto.countedCash } : {}),
    ...(dto.closingNote ? { closingNote: dto.closingNote } : {}),
  }
}

function toNotification(dto: NotificationDto): CashierNotification {
  return {
    id: dto.id,
    kind: dto.kind as CashierNotificationKind,
    title: dto.title,
    body: dto.body,
    at: dto.at,
    ...(dto.billId ? { billId: dto.billId } : {}),
    ...(dto.requestId ? { requestId: dto.requestId } : {}),
    readBy: dto.readBy ?? [],
  }
}

function toConfig(dto: ConfigDto, base: BillingConfig): BillingConfig {
  return {
    ...base,
    restaurantName: dto.restaurantName,
    ...(dto.address ? { address: dto.address } : {}),
    serviceChargeRate: dto.serviceChargeRate ?? null,
    taxRate: dto.taxRate ?? null,
    methods: { ...base.methods, ...(dto.methods ?? {}) },
    bank: dto.bank ?? null,
  }
}

/** Overlays the signed-in user (GET me) on the snapshot staff list. */
function mergeStaff(staff: CashierStaff[], me: MeDto): CashierStaff[] {
  const current = staff.find((member) => member.id === me.id)
  const merged: CashierStaff = {
    id: me.id,
    name: me.name,
    username: me.username,
    role: me.role,
    position: me.position ?? current?.position ?? '',
    permissions: me.permissions
      ? (me.permissions as CashierPermission[])
      : (current?.permissions ?? []),
    discountLimitPercent: me.discountLimitPercent,
  }
  return current
    ? staff.map((member) => (member.id === me.id ? merged : member))
    : [...staff, merged]
}

async function load(): Promise<CashierData> {
  const [snapshot, bills, payments, shifts, scheduled, requests, notifications, config, me] =
    await Promise.all([
      get<CashierData>('workspaces/cashier'),
      get<BillDto[] | null>('cashier/bills'),
      get<PaymentDto[] | null>('cashier/payments'),
      get<ShiftDto[] | null>('cashier/shifts'),
      get<ScheduledShift[] | null>('cashier/scheduled-shifts'),
      get<RequestDto[] | null>('cashier/requests'),
      get<NotificationDto[] | null>('cashier/notifications'),
      get<ConfigDto>('cashier/config'),
      get<MeDto>('cashier/me'),
    ])
  return {
    ...snapshot,
    bills: (bills ?? []).map(toBill),
    payments: (payments ?? []).map(toPayment),
    shifts: (shifts ?? []).map(toShift),
    scheduledShifts: scheduled ?? [],
    requests: (requests ?? []).flatMap((dto) => toRequest(dto) ?? []),
    notifications: (notifications ?? []).map(toNotification),
    config: toConfig(config, snapshot.config),
    staff: mergeStaff(snapshot.staff, me),
  }
}

export const cashierService: CashierService = {
  load,
  async execute(_actor, command) {
    let summary: string
    let ref: string | undefined
    switch (command.type) {
      case 'apply-discount':
        await put(`cashier/bills/${id(command.billId)}/discount`, {
          billVersion: command.billVersion,
          discount: command.discount,
        })
        summary = 'Đã áp dụng giảm giá'
        break
      case 'remove-discount':
        await del(`cashier/bills/${id(command.billId)}/discount?billVersion=${command.billVersion}`)
        summary = 'Đã bỏ giảm giá'
        break
      case 'request-discount':
        ref = (
          await post<{ id: string }>(`cashier/bills/${id(command.billId)}/discount-requests`, {
            billVersion: command.billVersion,
            discount: command.discount,
          })
        ).id
        summary = 'Đã gửi yêu cầu giảm giá'
        break
      case 'request-adjustment':
        ref = (
          await post<{ id: string }>(`cashier/bills/${id(command.billId)}/adjustment-requests`, {
            itemId: command.itemId,
            reason: command.reason,
          })
        ).id
        summary = 'Đã gửi yêu cầu điều chỉnh hóa đơn'
        break
      case 'request-void':
        ref = (
          await post<{ id: string }>(`cashier/payments/${id(command.paymentId)}/void-requests`, {
            reason: command.reason,
          })
        ).id
        summary = 'Đã gửi yêu cầu hủy thanh toán'
        break
      case 'withdraw-request':
        await post(`cashier/requests/${id(command.requestId)}/withdraw`)
        ref = command.requestId
        summary = 'Đã rút yêu cầu'
        break
      case 'return-payment-request':
        await post(`cashier/bills/${id(command.billId)}/return-payment-request`, {
          billVersion: command.billVersion,
          reason: command.reason,
        })
        summary = 'Đã trả yêu cầu thanh toán về cho phục vụ'
        break
      case 'pay-cash':
        ref = (
          await post<{ id: string }>(`cashier/bills/${id(command.billId)}/payments/cash`, {
            billVersion: command.billVersion,
            amount: command.amount,
            tendered: command.tendered,
            idempotencyKey: command.idempotencyKey,
          })
        ).id
        summary = 'Đã ghi nhận thanh toán tiền mặt'
        break
      case 'create-transfer':
        ref = (
          await post<{ id: string }>(`cashier/bills/${id(command.billId)}/payments/transfer`, {
            billVersion: command.billVersion,
            amount: command.amount,
            idempotencyKey: command.idempotencyKey,
          })
        ).id
        summary = 'Đã tạo giao dịch chuyển khoản, chờ xác nhận'
        break
      case 'confirm-transfer':
        await post(`cashier/payments/${id(command.paymentId)}/confirm`, {
          bankReference: command.bankReference,
        })
        ref = command.paymentId
        summary = 'Đã xác nhận chuyển khoản'
        break
      case 'cancel-transfer':
        await post(`cashier/payments/${id(command.paymentId)}/cancel`)
        ref = command.paymentId
        summary = 'Đã hủy giao dịch chuyển khoản'
        break
      case 'open-shift':
        ref = (
          await post<{ id: string }>('cashier/shifts/open', {
            openingFloat: command.openingFloat,
            ...(command.scheduledShiftId ? { scheduledShiftId: command.scheduledShiftId } : {}),
          })
        ).id
        summary = 'Đã mở ca'
        break
      case 'close-shift':
        await post(`cashier/shifts/${id(command.shiftId)}/close`, {
          countedCash: command.countedCash,
          note: command.note,
        })
        ref = command.shiftId
        summary = 'Đã đóng ca'
        break
      default:
        await post('cashier/notifications/read', command.ids ? { ids: command.ids } : {})
        summary = 'Đã đánh dấu đã đọc'
    }
    return { data: await load(), summary, ...(ref ? { ref } : {}) }
  },
  subscribe: () => () => {},
}
