import { WORKSPACES } from './staffRouter'

export { navigate, useKitchenUrl as useManagerUrl } from './kitchenRouter'

export const MANAGER_BASE = WORKSPACES.MANAGER.base
export const isManagerPath = (path: string) => path === MANAGER_BASE || path.startsWith(`${MANAGER_BASE}/`)
export const managerPages = ['dashboard', 'operations', 'reservations', 'tables', 'orders', 'kitchen', 'employees', 'shifts', 'menu', 'categories', 'approvals', 'reports', 'incidents', 'notifications', 'profile'] as const
export type ManagerPage = typeof managerPages[number]
export const managerPath = (page: ManagerPage, id?: string) => `${MANAGER_BASE}${page === 'dashboard' ? '' : page === 'categories' ? '/menu/categories' : `/${page}`}${id ? `?id=${encodeURIComponent(id)}` : ''}`
export function matchManagerRoute(path: string): ManagerPage | 'not-found' {
  if (path === MANAGER_BASE) return 'dashboard'
  if (path === `${MANAGER_BASE}/menu/categories`) return 'categories'
  const rest = path.slice(`${MANAGER_BASE}/`.length)
  return managerPages.includes(rest as ManagerPage) && rest !== 'dashboard' && rest !== 'categories' ? rest as ManagerPage : 'not-found'
}
