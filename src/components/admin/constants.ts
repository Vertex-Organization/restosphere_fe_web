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
