import { useSyncExternalStore } from 'react'
import type { AuthUser } from '../auth'

const SESSION_KEY = 'restosphere.admin.demo-session.v1'
const DEMO_EMAIL = 'admin@restosphere.test'
const DEMO_PASSWORD = 'Admin@123'

const DEMO_ADMIN: AuthUser = {
  id: 'admin-demo-01',
  email: DEMO_EMAIL,
  fullName: 'Nguyễn Minh Anh',
  role: 'ADMIN',
}

const listeners = new Set<() => void>()

function restore(): AuthUser | null {
  try { return sessionStorage.getItem(SESSION_KEY) === DEMO_ADMIN.id ? DEMO_ADMIN : null }
  catch { return null }
}

let currentUser = restore()
const emit = () => listeners.forEach((listener) => listener())

export function useAdminUser() {
  return useSyncExternalStore((listener) => { listeners.add(listener); return () => { listeners.delete(listener) } }, () => currentUser)
}

export async function adminSignIn(email: string, password: string) {
  await new Promise((resolve) => window.setTimeout(resolve, 300))
  if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) throw new Error('Email hoặc mật khẩu demo không đúng.')
  try { sessionStorage.setItem(SESSION_KEY, DEMO_ADMIN.id) }
  catch { throw new Error('Trình duyệt không cho phép lưu phiên demo.') }
  currentUser = DEMO_ADMIN
  emit()
  return DEMO_ADMIN
}

export function adminSignOut() {
  try { sessionStorage.removeItem(SESSION_KEY) } catch { /* Session memory still clears below. */ }
  currentUser = null
  emit()
}

export const ADMIN_DEMO_CREDENTIALS = { email: DEMO_EMAIL, password: DEMO_PASSWORD }
