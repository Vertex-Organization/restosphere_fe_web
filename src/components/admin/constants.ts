import type { AdminRole } from '../../api/admin/types'

export const ROLE_LABELS: Record<AdminRole, string> = {
  CUSTOMER: 'Khách hàng',
  RECEPTIONIST: 'Lễ tân',
  WAITER: 'Phục vụ',
  KITCHEN: 'Bếp',
  CASHIER: 'Thu ngân',
  MANAGER: 'Quản lý',
  ADMIN: 'Quản trị',
}
export const AUDIT_ACTION_LABELS = {
  ROLE_CHANGED: 'Thay đổi vai trò',
  ACCOUNT_LOCKED: 'Khóa tài khoản',
  ACCOUNT_UNLOCKED: 'Mở khóa tài khoản',
  RESTAURANT_UPDATED: 'Cập nhật nhà hàng',
  SETTINGS_UPDATED: 'Cập nhật cài đặt',
} as const
