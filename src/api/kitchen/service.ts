import { authenticatedRequest } from '../auth'
import type { CommandResult, KitchenCommand, KitchenData, StaffMember } from './types'

export interface KitchenService {
  /** Current kitchen state. Called on start and by polling. */
  load(): Promise<KitchenData>
  /** Applies one command; rejects with KitchenError (CONFLICT when the item changed meanwhile). */
  execute(actor: StaffMember, command: KitchenCommand): Promise<CommandResult>
  /** Notifies when data changed elsewhere (another tab, push channel…). */
  subscribe(listener: () => void): () => void
}

export const kitchenService: KitchenService = {
  load: () => authenticatedRequest<KitchenData>('workspaces/kitchen'),
  execute: (_actor, command) => authenticatedRequest<CommandResult>('workspaces/kitchen/commands', {
    method: 'POST', body: JSON.stringify(command),
  }),
  subscribe: () => () => {},
}
