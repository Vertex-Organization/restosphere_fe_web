export const STATUS: Record<string, [string, 'success' | 'warning' | 'danger' | 'info' | 'neutral']> = {
  AVAILABLE: ['Sẵn sàng', 'success'], OCCUPIED: ['Có khách', 'info'], CLEANING: ['Đang dọn', 'warning'], INACTIVE: ['Tạm ngưng', 'neutral'],
  PENDING: ['Chờ duyệt', 'warning'], CONFIRMED: ['Đã xác nhận', 'success'], ARRIVED: ['Khách đã đến', 'info'], LATE: ['Khách đến trễ', 'danger'], CANCELLED: ['Đã hủy', 'neutral'], NO_SHOW: ['Không đến', 'neutral'],
  NEW: ['Món mới', 'info'], PREPARING: ['Đang chế biến', 'warning'], READY: ['Chờ phục vụ', 'success'], SERVED: ['Đã phục vụ', 'neutral'],
  ACTIVE: ['Đang làm việc', 'success'], LEAVE: ['Nghỉ phép', 'warning'], SOLD_OUT: ['Tạm hết', 'warning'], HIDDEN: ['Đã ẩn', 'neutral'],
  APPROVED: ['Đã duyệt', 'success'], REJECTED: ['Từ chối', 'danger'], OPEN: ['Chưa xử lý', 'danger'], IN_PROGRESS: ['Đang xử lý', 'warning'], RESOLVED: ['Đã đóng', 'success'],
  HIGH: ['Cao', 'danger'], MEDIUM: ['Trung bình', 'warning'], LOW: ['Thấp', 'info'], COMPLETED: ['Hoàn tất', 'success'], FAILED: ['Thất bại', 'danger'],
}
export const DEPARTMENT: Record<string, string> = { SERVICE: 'Phục vụ', KITCHEN: 'Bếp', RECEPTION: 'Lễ tân', CASHIER: 'Thu ngân', MANAGEMENT: 'Quản lý' }
export const APPROVAL_TYPE: Record<string, string> = { DISCOUNT: 'Giảm giá', CANCEL_ITEM: 'Hủy món', BILL_ADJUSTMENT: 'Điều chỉnh hóa đơn', RESERVATION: 'Đặt bàn đặc biệt' }
export const optionsOf = (items: { id: string; name: string }[]) => items.map(i => ({ value: i.id, label: i.name }))
export const statusOptions = (values: string[], all = 'Tất cả trạng thái') => [{ value: '', label: all }, ...values.map(value => ({ value, label: STATUS[value]?.[0] ?? value }))]
export const matchesSearch = (query: string, ...values: string[]) => { const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase(); return normalize(values.join(' ')).includes(normalize(query.trim())) }
