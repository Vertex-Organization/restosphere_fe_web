import { authenticatedRequest } from '../auth'
import type { AdminData, AdminService, AdminSettings, AdminUser, RestaurantProfile } from './types'

export const adminService: AdminService = {
  async load(signal) {
    const [users, snapshot, restaurant, settings] = await Promise.all([
      authenticatedRequest<AdminUser[]>('admin/users', { signal }),
      authenticatedRequest<AdminData>('workspaces/admin', { signal }),
      authenticatedRequest<RestaurantProfile>('admin/restaurant', { signal }),
      authenticatedRequest<AdminSettings>('admin/settings', { signal }),
    ])
    return { ...snapshot, users, restaurant, settings }
  },
  async execute(command) {
    if (command.type === 'restaurant.update') {
      await authenticatedRequest<RestaurantProfile>('admin/restaurant', {
        method: 'PUT', body: JSON.stringify(command.restaurant),
      })
      return adminService.load()
    }
    if (command.type === 'user.status') {
      await authenticatedRequest<AdminUser>(`admin/users/${encodeURIComponent(command.id)}/status`, {
        method: 'PATCH', body: JSON.stringify({ status: command.status }),
      })
      return adminService.load()
    }
    if (command.type === 'user.role') {
      await authenticatedRequest<AdminUser>(`admin/users/${encodeURIComponent(command.id)}/role`, {
        method: 'PATCH', body: JSON.stringify({ role: command.role }),
      })
      return adminService.load()
    }
    if (command.type === 'settings.update') {
      await authenticatedRequest<AdminSettings>('admin/settings', {
        method: 'PUT', body: JSON.stringify(command.settings),
      })
      return adminService.load()
    }
    return authenticatedRequest<AdminData>('workspaces/admin/commands', {
      method: 'POST', body: JSON.stringify(command),
    })
  },
}
