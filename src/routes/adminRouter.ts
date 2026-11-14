import { WORKSPACES } from './staffRouter'

export const ADMIN_BASE = WORKSPACES.ADMIN.base
export const adminPages = ['dashboard', 'users', 'roles', 'restaurant', 'settings', 'audit-logs'] as const
export type AdminPage = typeof adminPages[number]

export const isAdminPath = (pathname: string) => pathname === ADMIN_BASE || pathname.startsWith(`${ADMIN_BASE}/`)
export { navigate, useKitchenUrl as useAdminUrl } from './kitchenRouter'

export const adminPath = (page: AdminPage) => page === 'dashboard' ? ADMIN_BASE : `${ADMIN_BASE}/${page}`

export function matchAdminRoute(pathname: string): AdminPage | 'not-found' {
  const path = pathname.replace(/\/+$/, '') || ADMIN_BASE
  if (path === ADMIN_BASE) return 'dashboard'
  const rest = path.slice(`${ADMIN_BASE}/`.length)
  return adminPages.includes(rest as AdminPage) && rest !== 'dashboard' ? rest as AdminPage : 'not-found'
}
