import { getStaffSession, leaveStaffArea, subscribeStaffAuth } from '../staff/auth'
import type { StaffMember } from './types'

// The kitchen has no sign-in of its own: it reads the shared staff session
// (/staff/login) and looks the employee up in kitchen data.
// Route guards here only shape the UI; the backend must enforce roles.

let cached: { id: string; user: StaffMember | null } | null = null

export function getKitchenUser(): StaffMember | null {
  const session = getStaffSession()
  if (!session || session.role !== 'KITCHEN') return null
  if (cached?.id !== session.id)
    cached = {
      id: session.id,
      user: { ...session, role: 'KITCHEN', shift: 'Chưa phân ca', permissions: [] },
    }
  return cached.user
}

export const subscribeKitchenAuth = subscribeStaffAuth

export function kitchenSignOut() {
  leaveStaffArea()
}
