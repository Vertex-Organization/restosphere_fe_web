export const ADMIN_ROLES = [
  'RECEPTIONIST',
  'WAITER',
  'KITCHEN',
  'CASHIER',
  'MANAGER',
  'ADMIN',
] as const

export type AdminRole = (typeof ADMIN_ROLES)[number]
export type AccountStatus = 'ACTIVE' | 'LOCKED'

export interface AdminUser {
  id: string
  fullName: string
  email: string
  role: AdminRole
  status: AccountStatus
  createdAt: string
  initials: string
}

export interface RestaurantProfile {
  name: string
  description: string
  address: string
  hotline: string
  email: string
  openingHours: string
  facebook: string
  instagram: string
  tiktok: string
  logoUrl: string
  coverUrl: string
}

export interface AdminSettings {
  onlineReservations: boolean
  tableHoldMinutes: number
  noShowMinutes: number
  bufferMinutes: number
  billing: {
    serviceChargePercent: number
    vatPercent: number
    bankAccount: string
    bankName?: string
    bankAccountName?: string
  }
  timezone: string
  currency: string
  emailNotifications: boolean
}

export interface DiscountLimits {
  cashierDiscountPercent: number
  managerApprovalLimit: number
}

export interface AuditLog {
  id: string
  at: string
  actor: string
  action:
    | 'ROLE_CHANGED'
    | 'ACCOUNT_LOCKED'
    | 'ACCOUNT_UNLOCKED'
    | 'RESTAURANT_UPDATED'
    | 'SETTINGS_UPDATED'
    | 'USER_CREATED'
  target: string
  result: 'SUCCESS' | 'FAILED'
}

export interface AdminData {
  users: AdminUser[]
  restaurant: RestaurantProfile
  settings: AdminSettings
  discountLimits: DiscountLimits
  auditLogs: AuditLog[]
}

export interface AuditLogFilters {
  action?: AuditLog['action']
  actor?: string
  from?: string
  to?: string
  limit?: number
}

export interface AdminService {
  load(signal?: AbortSignal): Promise<AdminData>
  execute(command: AdminCommand): Promise<AdminData>
  auditLogs(filters: AuditLogFilters, signal?: AbortSignal): Promise<AuditLog[]>
}

export type AdminCommand =
  | { type: 'user.role'; id: string; role: AdminRole }
  | { type: 'user.status'; id: string; status: AccountStatus }
  | { type: 'user.create'; user: { fullName: string; email: string; role: AdminRole } }
  | { type: 'restaurant.image.upload'; kind: 'logo' | 'cover'; contentType: string; data: string }
  | { type: 'restaurant.image.remove'; kind: 'logo' | 'cover' }
  | { type: 'restaurant.update'; restaurant: RestaurantProfile }
  | { type: 'settings.update'; settings: AdminSettings }
  | { type: 'discountLimits.update'; limits: DiscountLimits }
