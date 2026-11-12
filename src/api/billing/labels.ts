import type {
  BillStatus, CashierNotificationKind, DiscountMode, PaymentMethod, PaymentStatus, RequestStatus,
  RequestType, SentItemStatus, TableStatus,
} from './types'

export type Tone = 'neutral' | 'info' | 'warning' | 'success' | 'danger' | 'primary'

/** Waiter-side wording (as in the staff app), which is what the cashier checks against. */
export const ITEM_STATUS_LABEL: Record<SentItemStatus, string> = {
  SUBMITTED: 'Đã gửi bếp',
  PREPARING: 'Đang chế biến',
  READY: 'Chờ mang ra',
  SERVED: 'Đã phục vụ',
  CANCELLED: 'Đã hủy',
}

export const ITEM_STATUS_TONE: Record<SentItemStatus, Tone> = {
  SUBMITTED: 'info',
  PREPARING: 'warning',
  READY: 'warning',
  SERVED: 'neutral',
  CANCELLED: 'danger',
}

export const BILL_STATUS_LABEL: Record<BillStatus, string> = {
  UNPAID: 'Đang phục vụ',
  PAYMENT_REQUESTED: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
}

export const BILL_STATUS_TONE: Record<BillStatus, Tone> = {
  UNPAID: 'info',
  PAYMENT_REQUESTED: 'warning',
  PAID: 'success',
}

export const TABLE_STATUS_LABEL: Record<TableStatus, string> = {
  AVAILABLE: 'Sẵn sàng',
  OCCUPIED: 'Đang có khách',
  CLEANING: 'Đang dọn',
  OUT_OF_SERVICE: 'Tạm ngưng',
}

export const METHOD_LABEL: Record<PaymentMethod, string> = {
  CASH: 'Tiền mặt',
  TRANSFER: 'Chuyển khoản',
  CARD: 'Thẻ',
}

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: 'Chờ xác nhận',
  SUCCEEDED: 'Thành công',
  FAILED: 'Thất bại',
  CANCELLED: 'Đã hủy yêu cầu',
  VOIDED: 'Đã hủy thanh toán',
}

export const PAYMENT_STATUS_TONE: Record<PaymentStatus, Tone> = {
  PENDING: 'info',
  SUCCEEDED: 'success',
  FAILED: 'danger',
  CANCELLED: 'neutral',
  VOIDED: 'neutral',
}

export const REQUEST_TYPE_LABEL: Record<RequestType, string> = {
  DISCOUNT: 'Giảm giá',
  BILL_ADJUSTMENT: 'Điều chỉnh hóa đơn',
  PAYMENT_VOID: 'Hủy thanh toán',
}

export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  CANCELLED: 'Đã rút',
}

export const REQUEST_STATUS_TONE: Record<RequestStatus, Tone> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'neutral',
}

export const DISCOUNT_MODE_LABEL: Record<DiscountMode, string> = {
  PERCENT: 'Theo %',
  AMOUNT: 'Theo số tiền',
}

export const NOTIFICATION_KIND_LABEL: Record<CashierNotificationKind, string> = {
  PAYMENT_REQUEST: 'Yêu cầu thanh toán',
  TRANSFER_RECEIVED: 'Đã nhận chuyển khoản',
  TRANSFER_FAILED: 'Chuyển khoản lỗi',
  REQUEST_DECIDED: 'Kết quả yêu cầu',
}
