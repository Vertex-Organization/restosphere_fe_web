import { authenticatedRequest } from '../auth'
import type { AdminData, AdminService } from './types'

export const adminService: AdminService = {
  load: (signal) => authenticatedRequest<AdminData>('workspaces/admin', { signal }),
  async execute(command) {
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
