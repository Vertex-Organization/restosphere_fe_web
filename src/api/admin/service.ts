import { authenticatedRequest } from '../auth'
import type { AdminData, AdminService, AdminUser, RestaurantProfile } from './types'

export const adminService: AdminService = {
  async load(signal) {
    const [users, snapshot, restaurant] = await Promise.all([
      authenticatedRequest<AdminUser[]>('admin/users', { signal }),
      authenticatedRequest<AdminData>('workspaces/admin', { signal }),
      authenticatedRequest<RestaurantProfile>('admin/restaurant', { signal }),
    ])
    return { ...snapshot, users, restaurant }
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
      // Admin snapshots omit bank names; preserve them from the cashier contract when saving.
      const { config } = await authenticatedRequest<{ config: { bank: { bankName: string; accountName: string } | null } }>('workspaces/cashier')
      command = { ...command, settings: { ...command.settings, billing: {
        ...command.settings.billing, bankName: config.bank?.bankName ?? '', bankAccountName: config.bank?.accountName ?? '',
      } } }
    }
    return authenticatedRequest<AdminData>('workspaces/admin/commands', {
      method: 'POST', body: JSON.stringify(command),
    })
  },
}
