// Staff area URLs. Every employee signs in once at /staff/login; each role then
// works in its own workspace under /staff. Pure functions only (no React), so
// the module routers, mock data and Node tests can all import it.

export type StaffRole = 'ADMIN' | 'MANAGER' | 'CASHIER' | 'KITCHEN' | 'WAITER' | 'RECEPTIONIST'

export const STAFF_BASE = '/staff'

export const staffPaths = {
  /** Entry point: sends a signed-in employee to their workspace, others to the sign-in page. */
  home: STAFF_BASE,
  login: `${STAFF_BASE}/login`,
}

/** Web workspaces. Waiters have none: they use the mobile staff app. */
export const WORKSPACES = {
  ADMIN: { base: `${STAFF_BASE}/admin`, label: 'Quản trị' },
  MANAGER: { base: `${STAFF_BASE}/manager`, label: 'Quản lý' },
  CASHIER: { base: `${STAFF_BASE}/cashier`, label: 'Thu ngân' },
  KITCHEN: { base: `${STAFF_BASE}/kitchen`, label: 'Bếp' },
} as const

export type WorkspaceRole = keyof typeof WORKSPACES

export const STAFF_ROLE_LABEL: Record<StaffRole, string> = {
  ADMIN: 'Quản trị viên',
  MANAGER: 'Quản lý',
  CASHIER: 'Thu ngân',
  KITCHEN: 'Bếp',
  WAITER: 'Phục vụ',
  RECEPTIONIST: 'Lễ tân',
}

const pathOf = (url: string) => url.split(/[?#]/, 1)[0].replace(/\/+$/, '') || '/'

/** Is `url` (path, optionally with ?query/#hash) inside `base`? */
export function isUnder(url: string, base: string) {
  const path = pathOf(url)
  return path === base || path.startsWith(`${base}/`)
}

export const isStaffPath = (pathname: string) => isUnder(pathname, STAFF_BASE)

export function hasWorkspace(role: StaffRole): role is WorkspaceRole {
  return role in WORKSPACES
}

export function homePathFor(role: StaffRole): string | null {
  return hasWorkspace(role) ? WORKSPACES[role].base : null
}

/** The workspace a staff URL belongs to, if any. */
export function workspaceOf(url: string): WorkspaceRole | null {
  return (Object.keys(WORKSPACES) as WorkspaceRole[]).find((role) => isUnder(url, WORKSPACES[role].base)) ?? null
}

/** Where to go after signing in: the requested page when it is in this role's
 * workspace, otherwise the role's home. Only same-site staff paths are accepted. */
export function landingPath(role: StaffRole, next?: string | null): string | null {
  const home = homePathFor(role)
  if (!home) return null
  const safe = !!next && next.startsWith('/') && !next.startsWith('//') && !next.includes('\\')
  return safe && isUnder(next, home) ? next : home
}

export const loginPath = (next?: string | null) =>
  next ? `${staffPaths.login}?next=${encodeURIComponent(next)}` : staffPaths.login

const LEGACY = /^\/(kitchen|cashier|manager|admin)(\/[^?#]*)?([?#].*)?$/

/** Module URLs from before the /staff restructure (/kitchen/…, /manager/login, …)
 * mapped to their new address, or null when `url` is not one of them.
 * Static files that still live under /kitchen (menu photos, logo) are left alone. */
export function legacyStaffUrl(url: string): string | null {
  const match = LEGACY.exec(url)
  if (!match) return null
  const [, module, rest = '', tail = ''] = match
  if (/\.[a-z0-9]+$/i.test(rest)) return null
  const query = tail.startsWith('?') ? tail : ''
  const hash = tail.startsWith('#') ? tail : tail.includes('#') ? tail.slice(tail.indexOf('#')) : ''
  const search = new URLSearchParams(query.split('#', 1)[0])
  const next = search.get('next')
  if (next) search.set('next', legacyStaffUrl(next) ?? next)
  const qs = search.toString()
  const suffix = `${qs ? `?${qs}` : ''}${hash}`
  if (rest.replace(/\/+$/, '') === '/login') return `${staffPaths.login}${suffix}`
  return `${STAFF_BASE}/${module}${rest}${suffix}`
}
