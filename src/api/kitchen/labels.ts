import type {
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
  MenuAvailability,
  NotificationKind,
  OrderItemStatus,
  StaffRole,
} from './types'

export const ITEM_STATUS_LABEL: Record<OrderItemStatus, string> = {
  DRAFT: 'Chưa gửi',
  SUBMITTED: 'Mới nhận',
  PREPARING: 'Đang chế biến',
  READY: 'Đã xong',
  SERVED: 'Đã phục vụ',
  REJECTED: 'Bếp từ chối',
  CANCELLED: 'Đã hủy',
  VOIDED: 'Đã bỏ khỏi hóa đơn',
}

export const ROLE_LABEL: Record<StaffRole, string> = {
  KITCHEN: 'Bếp',
  WAITER: 'Phục vụ',
  RECEPTIONIST: 'Lễ tân',
  CASHIER: 'Thu ngân',
  MANAGER: 'Quản lý',
}

export const INCIDENT_TYPE_LABEL: Record<IncidentType, string> = {
  OUT_OF_STOCK: 'Hết nguyên liệu',
  EQUIPMENT: 'Thiết bị hỏng',
  CANNOT_PREPARE: 'Không thể chế biến',
  NOTE_CLARIFICATION: 'Cần xác nhận ghi chú',
  OTHER: 'Sự cố khác',
}

export const SEVERITY_LABEL: Record<IncidentSeverity, string> = {
  LOW: 'Thấp',
  MEDIUM: 'Trung bình',
  HIGH: 'Cao',
}

export const INCIDENT_STATUS_LABEL: Record<IncidentStatus, string> = {
  OPEN: 'Chờ xử lý',
  ACKNOWLEDGED: 'Đã tiếp nhận',
  RESOLVED: 'Đã xử lý',
}

export const MENU_STATUS_LABEL: Record<MenuAvailability, string> = {
  AVAILABLE: 'Còn bán',
  SOLD_OUT: 'Tạm hết',
  DISCONTINUED: 'Ngừng bán',
}

const KNOWN_NOTIFICATION_LABELS: Record<NotificationKind, string> = {
  NEW_ORDER: 'Đơn mới',
  ADD_ON: 'Gọi thêm món',
  CANCELLED: 'Món bị hủy',
  INCIDENT_REPLY: 'Phản hồi sự cố',
  PRIORITY: 'Yêu cầu ưu tiên',
  MENU_REQUEST: 'Yêu cầu thực đơn',
}

/** Kinds the backend adds later still get a label instead of `undefined`. */
export const NOTIFICATION_KIND_LABEL: Record<NotificationKind, string> = new Proxy(
  KNOWN_NOTIFICATION_LABELS,
  {
    get: (labels, kind) =>
      typeof kind === 'string' && kind in labels ? labels[kind as NotificationKind] : 'Thông báo',
  },
)

const NOTIFICATION_TITLES: Record<string, string> = {
  NEW_ORDER: 'Đơn mới',
  ADD_ON: 'Gọi thêm món',
  CANCELLED: 'Món bị hủy',
  PRIORITY: 'Yêu cầu ưu tiên',
  INCIDENT_REPLY: 'Sự cố đã được phản hồi',
  MENU_REQUEST: 'Kết quả yêu cầu thực đơn',
  READY: 'Món đã xong',
  ITEM_REJECTED: 'Bếp từ chối món',
  PAYMENT_REQUEST: 'Yêu cầu thanh toán',
  PAYMENT_REQUEST_WITHDRAWN: 'Phục vụ rút yêu cầu thanh toán',
  TRANSFER_RECEIVED: 'Đã nhận chuyển khoản',
  TRANSFER_FAILED: 'Chuyển khoản lỗi',
  REQUEST_DECIDED: 'Kết quả yêu cầu',
}

/** Vietnamese title for a backend notification kind; unknown kinds keep the original title. */
export function notificationTitle(kind: string, title: string) {
  return NOTIFICATION_TITLES[kind] ?? title
}

const API_DETAIL_MESSAGES: Record<string, string> = {
  'outside scheduled shift window': 'Ca đã chọn chưa tới giờ hoặc đã hết giờ',
  'a shift is already open': 'Bạn đang có ca mở',
  'resolve pending transfers first': 'Còn chuyển khoản chờ xác nhận, xử lý trước khi đóng ca',
  'item changed; refresh': 'Món vừa thay đổi, tải lại trang',
}

/** Readable reason for a 400/409 rejection: translated when known, otherwise the server detail. */
export function describeRejection(detail: string | undefined, fallback: string) {
  if (!detail) return fallback
  const key = detail.trim().replace(/\.$/, '').toLowerCase()
  return API_DETAIL_MESSAGES[key] ?? detail
}
