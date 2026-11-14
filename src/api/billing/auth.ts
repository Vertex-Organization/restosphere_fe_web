import { getStaffSession, leaveStaffArea, subscribeStaffAuth } from '../staff/auth'
import { mockFindStaff } from './mockService'
import type { CashierStaff } from './types'

// The cashier has no sign-in of its own: it reads the shared staff session
// (/staff/login) and looks the employee up in cashier data.
// Route guards here only shape the UI; the backend must enforce roles.

let cached: { id: string; user: CashierStaff | null } | null = null

export function getCashierUser(): CashierStaff | null {
  const session = getStaffSession()
  if (!session || session.role !== 'CASHIER') return null
  if (cached?.id !== session.id) cached = { id: session.id, user: mockFindStaff(session.id) }
  return cached.user
}

export const subscribeCashierAuth = subscribeStaffAuth

export function cashierSignOut() {
  leaveStaffArea()
}
