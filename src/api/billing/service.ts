import { authenticatedRequest } from '../auth'
import type { CashierCommand, CashierData, CashierStaff, CommandResult } from './types'

export interface CashierService {
  /** Current billing state. Called on start and by polling. */
  load(): Promise<CashierData>
  /** Applies one command; rejects with CashierError (CONFLICT when the bill changed meanwhile). */
  execute(actor: CashierStaff, command: CashierCommand): Promise<CommandResult>
  /** Notifies when data changed elsewhere (another tab, push channel…). */
  subscribe(listener: () => void): () => void
}

export const cashierService: CashierService = {
  load: () => authenticatedRequest<CashierData>('workspaces/cashier'),
  execute: (_actor, command) => authenticatedRequest<CommandResult>('workspaces/cashier/commands', {
    method: 'POST', body: JSON.stringify(command),
  }),
  subscribe: () => () => {},
}
