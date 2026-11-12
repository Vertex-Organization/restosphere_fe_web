import { useSyncExternalStore } from 'react'
import { MOCK_USERS } from './mockData'
import { ManagerError } from './rules'
import type { ManagerUser } from './types'

// Isolated mock session, following Kitchen/Cashier. Replace this adapter together with the data adapter.
const KEY = 'restosphere.manager.session.v1'
const listeners = new Set<() => void>()
function restore() { try { return MOCK_USERS.find(u => u.id === sessionStorage.getItem(KEY)) ?? null } catch { return null } }
let user: ManagerUser | null = restore()
const publish = () => listeners.forEach(fn => fn())
export const getManagerUser = () => user
export function useManagerUser() { return useSyncExternalStore(fn => { listeners.add(fn); return () => { listeners.delete(fn) } }, getManagerUser) }
export async function managerSignIn(username: string, password: string) {
  const index = username.trim() === 'manager' ? 0 : username.trim() === 'cashier' ? 1 : -1
  if (index < 0 || password !== 'Manager@123') throw new ManagerError('Tên đăng nhập hoặc mật khẩu không đúng.')
  const next = MOCK_USERS[index]
  try { sessionStorage.setItem(KEY, next.id) } catch { throw new ManagerError('Trình duyệt không cho phép lưu phiên đăng nhập.') }
  user = next; publish()
  return next
}
export function managerSignOut() { sessionStorage.removeItem(KEY); user = null; publish() }
