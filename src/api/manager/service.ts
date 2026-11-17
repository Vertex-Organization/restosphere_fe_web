import { authenticatedRequest } from '../auth'
import type { ManagerCommand, ManagerData } from './types'

export const managerService = {
  mode: 'api' as const,
  load: () => authenticatedRequest<ManagerData>('workspaces/manager'),
  execute: (command: ManagerCommand) => authenticatedRequest<ManagerData>('workspaces/manager/commands', {
    method: 'POST', body: JSON.stringify(command),
  }),
  subscribe(listener: () => void) {
    const timer = window.setInterval(() => { if (!document.hidden) listener() }, 5000)
    return () => window.clearInterval(timer)
  },
}
