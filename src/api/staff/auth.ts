import { useEffect, useSyncExternalStore } from 'react'
import { getAuthState, login, logout, restoreAuth, subscribeAuth, type AuthUser } from '../auth'
import { ApiError } from '../client'
import { navigate } from '../../routes/kitchenRouter'
import { hasWorkspace, STAFF_ROLE_LABEL, staffPaths } from '../../routes/staffRouter'
import type { StaffAccount } from './types'

export type { StaffAccount } from './types'
export { ApiError as StaffAuthError }
export const subscribeStaffAuth = subscribeAuth
let cachedUser: AuthUser | null = null
let cachedAccount: StaffAccount | null = null

export function getStaffSession(): StaffAccount | null {
  const { user } = getAuthState()
  if (user !== cachedUser) {
    cachedUser = user
    cachedAccount = user
      ? {
          id: user.id,
          username: user.email,
          email: user.email,
          name: user.fullName,
          role: user.role,
          position: STAFF_ROLE_LABEL[user.role],
        }
      : null
  }
  return cachedAccount
}

export function useStaffSession() {
  useEffect(() => {
    void restoreAuth()
  }, [])
  return useSyncExternalStore(subscribeStaffAuth, getStaffSession)
}

export function useStaffLoading() {
  return useSyncExternalStore(subscribeAuth, getAuthState).loading
}

export async function staffSignIn(email: string, password: string): Promise<StaffAccount> {
  await login(email, password)
  const account = getStaffSession()
  if (!account || !hasWorkspace(account.role)) {
    await logout().catch(() => {})
    throw new ApiError(
      403,
      'Tài khoản này dùng ứng dụng RestoSphere Staff trên điện thoại, không có khu làm việc trên web.',
    )
  }
  return account
}

export const staffSignOut = logout

export async function leaveStaffArea(next?: string) {
  try {
    await staffSignOut()
  } catch {
    // Local credentials are already cleared when server revocation fails.
  } finally {
    navigate(next ? `${staffPaths.login}?next=${encodeURIComponent(next)}` : staffPaths.login, {
      replace: true,
    })
  }
}
