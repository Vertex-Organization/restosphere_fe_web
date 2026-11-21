import { useSyncExternalStore } from 'react'
import type { AuthUser } from '../auth'
import { getStaffSession, leaveStaffArea, subscribeStaffAuth } from '../staff/auth'

// The admin workspace has no sign-in of its own: it reads the shared staff
// session (/staff/login). The backend must enforce the ADMIN role.

let cached: { id: string; user: AuthUser } | null = null

function getAdminUser(): AuthUser | null {
  const session = getStaffSession()
  if (!session || session.role !== 'ADMIN') return null
  if (cached?.id !== session.id) {
    cached = {
      id: session.id,
      user: { id: session.id, email: session.email ?? '', fullName: session.name, role: 'ADMIN' },
    }
  }
  return cached.user
}

export function useAdminUser() {
  return useSyncExternalStore(subscribeStaffAuth, getAdminUser)
}

export function adminSignOut() {
  leaveStaffArea()
}
