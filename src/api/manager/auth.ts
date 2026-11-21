import { useSyncExternalStore } from 'react'
import { getStaffSession, leaveStaffArea, subscribeStaffAuth } from '../staff/auth'
import type { ManagerUser } from './types'

// The manager workspace has no sign-in of its own: it reads the shared staff
// session (/staff/login). Replace this adapter together with the data adapter.

let cached: { id: string; user: ManagerUser | null } | null = null
const listeners = new Set<() => void>()

export function updateManagerProfile(user: ManagerUser) {
  if (getStaffSession()?.id !== user.id) return
  cached = { id: user.id, user }
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const unsubscribe = subscribeStaffAuth(listener)
  return () => {
    listeners.delete(listener)
    unsubscribe()
  }
}

export function getManagerUser(): ManagerUser | null {
  const session = getStaffSession()
  if (!session || session.role !== 'MANAGER') return null
  if (cached?.id !== session.id)
    cached = {
      id: session.id,
      user: { ...session, role: 'MANAGER', permissions: [], approvalLimit: 0 },
    }
  return cached.user
}

export function useManagerUser() {
  return useSyncExternalStore(subscribe, getManagerUser)
}

export function managerSignOut() {
  leaveStaffArea()
}
