import { mockCashierService } from './mockService'
import type { CashierCommand, CashierData, CashierStaff, CommandResult } from './types'

/**
 * The seam between the cashier UI and its data source.
 *
 * The Spring Boot backend currently exposes only /api/v1/auth/* (roles
 * ADMIN/MANAGER/STAFF): there are no table, order, bill, payment, shift or
 * approval endpoints and no CASHIER role yet. Until they exist the module runs
 * on `mockCashierService`, which is a simulation and never moves real money.
 *
 * When the backend is ready, add an HTTP implementation of this interface
 * (using `apiRequest` from ../client) that follows the backend's real
 * contract, and export it here instead. The backend must recompute bill totals
 * and re-check permissions on every command; totals computed in the browser
 * are previews only.
 */
export interface CashierService {
  /** Current billing state. Called on start and by polling. */
  load(): Promise<CashierData>
  /** Applies one command; rejects with CashierError (CONFLICT when the bill changed meanwhile). */
  execute(actor: CashierStaff, command: CashierCommand): Promise<CommandResult>
  /** Notifies when data changed elsewhere (another tab, push channel…). */
  subscribe(listener: () => void): () => void
}

export const cashierService: CashierService = mockCashierService
