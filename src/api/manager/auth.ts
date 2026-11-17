import { useSyncExternalStore } from 'react'
import { getStaffSession, leaveStaffArea, subscribeStaffAuth } from '../staff/auth'
import { MOCK_USERS } from './mockData'
import type { ManagerUser } from './types'

// The manager workspace has no sign-in of its own: it reads the shared staff
// session (/staff/login). Replace this adapter together with the data adapter.

let cached: { id: string; user: ManagerUser | null } | null = null

export function getManagerUser(): ManagerUser | null {
  const session = getStaffSession()
  if (!session || session.role !== 'MANAGER') return null
  if (cached?.id !== session.id) cached = { id: session.id, user: MOCK_USERS.find((u) => u.id === session.id) ?? null }
  return cached.user
}

export function useManagerUser() {
  return useSyncExternalStore(subscribeStaffAuth, getManagerUser)
}

export function managerSignOut() {
  leaveStaffArea()
}
