export const ADMIN_ROLES = ['CUSTOMER', 'RECEPTIONIST', 'WAITER', 'KITCHEN', 'CASHIER', 'MANAGER', 'ADMIN'] as const

export type AdminRole = typeof ADMIN_ROLES[number]
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
  billing: { serviceChargePercent: number; vatPercent: number; bankAccount: string; bankName?: string; bankAccountName?: string }
  timezone: string
  currency: string
  emailNotifications: boolean
}

export interface AuditLog {
  id: string
  at: string
  actor: string
  action: 'ROLE_CHANGED' | 'ACCOUNT_LOCKED' | 'ACCOUNT_UNLOCKED' | 'RESTAURANT_UPDATED'
  target: string
  result: 'SUCCESS' | 'FAILED'
}

export interface AdminData {
  users: AdminUser[]
  restaurant: RestaurantProfile
  settings: AdminSettings
  auditLogs: AuditLog[]
}

export interface AdminService {
  load(signal?: AbortSignal): Promise<AdminData>
  execute(command: AdminCommand): Promise<AdminData>
}

export type AdminCommand =
  | { type: 'user.role'; id: string; role: AdminRole }
  | { type: 'user.status'; id: string; status: AccountStatus }
  | { type: 'restaurant.update'; restaurant: RestaurantProfile }
  | { type: 'settings.update'; settings: AdminSettings }
