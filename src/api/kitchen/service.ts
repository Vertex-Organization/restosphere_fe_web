import { mockKitchenService } from './mockService'
import type { CommandResult, KitchenCommand, KitchenData, StaffMember } from './types'

/**
 * The seam between the kitchen UI and its data source.
 *
 * The Spring Boot backend currently exposes only /api/v1/auth/*: there are no
 * order, kitchen, incident or menu endpoints and no KITCHEN role yet. Until
 * they exist the module runs on `mockKitchenService`. When they do, add an
 * HTTP implementation of this interface (using `apiRequest` from ../client)
 * that follows the backend's real contract, and export it here instead.
 */
export interface KitchenService {
  /** Current kitchen state. Called on start and by polling. */
  load(): Promise<KitchenData>
  /** Applies one command; rejects with KitchenError (CONFLICT when the item changed meanwhile). */
  execute(actor: StaffMember, command: KitchenCommand): Promise<CommandResult>
  /** Notifies when data changed elsewhere (another tab, push channel…). */
  subscribe(listener: () => void): () => void
}

export const kitchenService: KitchenService = mockKitchenService
