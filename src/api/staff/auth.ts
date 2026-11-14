import { useSyncExternalStore } from 'react'
import { hasWorkspace, staffPaths } from '../../routes/staffRouter'
import { findDemoAccount, findDemoAccountById, type StaffAccount } from './mockAccounts'

export type { StaffAccount } from './mockAccounts'

// One staff session for every web workspace (Admin, Manager, Cashier, Kitchen).
// Kept per browser tab, so two tabs can act as two employees.
// Route guards only shape the UI; the backend must enforce roles.

const SESSION_KEY = 'restosphere.staff.session.v1'
const listeners = new Set<() => void>()

export class StaffAuthError extends Error {}

function restore(): StaffAccount | null {
  try {
    const id = sessionStorage.getItem(SESSION_KEY)
    return id ? findDemoAccountById(id) : null
  } catch {
    return null
  }
}

let session: StaffAccount | null = restore()

function publish(next: StaffAccount | null) {
  session = next
  listeners.forEach((listener) => listener())
}

export function subscribeStaffAuth(listener: () => void) {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

export function getStaffSession() {
  return session
}

export function useStaffSession() {
  return useSyncExternalStore(subscribeStaffAuth, getStaffSession)
}

export async function staffSignIn(login: string, password: string): Promise<StaffAccount> {
  await new Promise((resolve) => setTimeout(resolve, 250))
  const account = findDemoAccount(login, password)
  if (!account) throw new StaffAuthError('Tên đăng nhập hoặc mật khẩu không đúng.')
  if (!hasWorkspace(account.role)) {
    throw new StaffAuthError('Tài khoản Phục vụ dùng ứng dụng RestoSphere Staff trên điện thoại, không có khu làm việc trên web.')
  }
  try {
    sessionStorage.setItem(SESSION_KEY, account.id)
  } catch {
    throw new StaffAuthError('Trình duyệt không cho phép lưu phiên đăng nhập.')
  }
  publish(account)
  return account
}

function forget() {
  try { sessionStorage.removeItem(SESSION_KEY) } catch { /* Memory is cleared by the caller. */ }
}

export function staffSignOut() {
  forget()
  publish(null)
}

/** Signs out and opens the sign-in page. Workspaces are separate apps, so this is a
 * full page load; listeners are not told first, so no guard redirects in between. */
export function leaveStaffArea(next?: string) {
  forget()
  session = null
  window.location.replace(next ? `${staffPaths.login}?next=${encodeURIComponent(next)}` : staffPaths.login)
}
