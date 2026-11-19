export const STATUS: Record<string, [string, 'success' | 'warning' | 'danger' | 'info' | 'neutral']> = {
  AVAILABLE: ['Sẵn sàng', 'success'], OCCUPIED: ['Có khách', 'info'], CLEANING: ['Đang dọn', 'warning'], OUT_OF_SERVICE: ['Tạm ngưng', 'neutral'],
  PENDING: ['Chờ duyệt', 'warning'], CONFIRMED: ['Đã xác nhận', 'success'], ARRIVED: ['Khách đã đến', 'info'], SEATED: ['Đang phục vụ', 'info'], CANCELLED: ['Đã hủy', 'neutral'], NO_SHOW: ['Không đến', 'neutral'],
  SUBMITTED: ['Món mới', 'info'], VOIDED: ['Đã bỏ khỏi hóa đơn', 'neutral'], PREPARING: ['Đang chế biến', 'warning'], READY: ['Chờ phục vụ', 'success'], SERVED: ['Đã phục vụ', 'neutral'],
  ACTIVE: ['Đang làm việc', 'success'], LEAVE: ['Nghỉ phép', 'warning'], SOLD_OUT: ['Tạm hết', 'warning'], DISCONTINUED: ['Ngừng bán', 'neutral'],
  APPROVED: ['Đã duyệt', 'success'], REJECTED: ['Từ chối', 'danger'], OPEN: ['Chưa xử lý', 'danger'], ACKNOWLEDGED: ['Đã tiếp nhận', 'warning'], RESOLVED: ['Đã đóng', 'success'], WITHDRAWN: ['Đã rút', 'neutral'],
  HIGH: ['Cao', 'danger'], MEDIUM: ['Trung bình', 'warning'], LOW: ['Thấp', 'info'], COMPLETED: ['Hoàn tất', 'success'], FAILED: ['Thất bại', 'danger'],
}
export const INCIDENT_TYPE_LABEL: Record<string, string> = {
  OUT_OF_STOCK: 'Hết nguyên liệu',
  EQUIPMENT: 'Thiết bị hỏng',
  CANNOT_PREPARE: 'Không thể chế biến',
  NOTE_CLARIFICATION: 'Cần xác nhận ghi chú',
  OTHER: 'Sự cố khác',
}
// Kitchen-created incidents store the type code itself as the title.
export const incidentTitle = (i: { title: string; type: string }) =>
  i.title === i.type ? INCIDENT_TYPE_LABEL[i.type] ?? i.title : i.title
export const DEPARTMENT: Record<string, string> = { SERVICE: 'Phục vụ', KITCHEN: 'Bếp', RECEPTION: 'Lễ tân', CASHIER: 'Thu ngân', MANAGEMENT: 'Quản lý' }
export const APPROVAL_TYPE: Record<string, string> = { DISCOUNT: 'Giảm giá', CANCEL_ITEM: 'Hủy món', BILL_ADJUSTMENT: 'Điều chỉnh hóa đơn', PAYMENT_VOID: 'Hủy thanh toán', RESERVATION: 'Đặt bàn đặc biệt', MENU_STATUS: 'Trạng thái món' }
export const optionsOf = (items: { id: string; name: string }[]) => items.map(i => ({ value: i.id, label: i.name }))
export const statusOptions = (values: string[], all = 'Tất cả trạng thái') => [{ value: '', label: all }, ...values.map(value => ({ value, label: STATUS[value]?.[0] ?? value }))]
export const matchesSearch = (query: string, ...values: string[]) => { const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase(); return normalize(values.join(' ')).includes(normalize(query.trim())) }
