import type {
  IncidentSeverity, IncidentStatus, IncidentType, MenuAvailability, NotificationKind, OrderItemStatus, StaffRole,
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
export const NOTIFICATION_KIND_LABEL: Record<NotificationKind, string> = new Proxy(KNOWN_NOTIFICATION_LABELS, {
  get: (labels, kind) => (typeof kind === 'string' && kind in labels ? labels[kind as NotificationKind] : 'Thông báo'),
})
