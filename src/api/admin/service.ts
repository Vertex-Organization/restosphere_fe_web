import { authenticatedRequest } from '../auth'
import type {
  AdminService,
  AdminSettings,
  AdminUser,
  AuditLog,
  DiscountLimits,
  RestaurantProfile,
} from './types'

export const adminService: AdminService = {
  async load(signal) {
    const [users, restaurant, settings, discountLimits, auditLogs] = await Promise.all([
      authenticatedRequest<AdminUser[]>('admin/employees', { signal }),
      authenticatedRequest<RestaurantProfile>('admin/restaurant', { signal }),
      authenticatedRequest<AdminSettings>('admin/settings', { signal }),
      authenticatedRequest<DiscountLimits>('admin/settings/discount-limits', { signal }),
      adminService.auditLogs({ limit: 200 }, signal),
    ])
    return { users, restaurant, settings, discountLimits, auditLogs }
  },
  auditLogs(filters, signal) {
    const query = new URLSearchParams()
    for (const [key, value] of Object.entries(filters))
      if (value !== undefined && value !== '') query.set(key, String(value))
    return authenticatedRequest<AuditLog[]>(`admin/audit-logs?${query}`, { signal })
  },
  async execute(command) {
    if (command.type === 'restaurant.update') {
      await authenticatedRequest<RestaurantProfile>('admin/restaurant', {
        method: 'PUT',
        body: JSON.stringify(command.restaurant),
      })
      return adminService.load()
    }
    if (command.type === 'user.status') {
      await authenticatedRequest<AdminUser>(
        `admin/employees/${encodeURIComponent(command.id)}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: command.status }),
        },
      )
      return adminService.load()
    }
    if (command.type === 'user.role') {
      await authenticatedRequest<AdminUser>(`admin/employees/${encodeURIComponent(command.id)}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: command.role }),
      })
      return adminService.load()
    }
    if (command.type === 'settings.update') {
      await authenticatedRequest<AdminSettings>('admin/settings', {
        method: 'PUT',
        body: JSON.stringify(command.settings),
      })
      return adminService.load()
    }
    if (command.type === 'user.create') {
      await authenticatedRequest<AdminUser>('admin/employees', {
        method: 'POST',
        body: JSON.stringify(command.user),
      })
      return adminService.load()
    }
    if (command.type === 'restaurant.image.upload') {
      await authenticatedRequest<RestaurantProfile>(`admin/restaurant/images/${command.kind}`, {
        method: 'POST',
        body: JSON.stringify({ contentType: command.contentType, data: command.data }),
        signal: AbortSignal.timeout(60000),
      })
      return adminService.load()
    }
    if (command.type === 'restaurant.image.remove') {
      await authenticatedRequest<RestaurantProfile>(`admin/restaurant/images/${command.kind}`, {
        method: 'DELETE',
      })
      return adminService.load()
    }
    if (command.type === 'discountLimits.update') {
      await authenticatedRequest<DiscountLimits>('admin/settings/discount-limits', {
        method: 'PUT',
        body: JSON.stringify(command.limits),
      })
      return adminService.load()
    }
    // Compile error here means a new AdminCommand was added without a handler.
    const unreachable: never = command
    throw new Error(`Lệnh quản trị không được hỗ trợ: ${JSON.stringify(unreachable)}`)
  },
}
