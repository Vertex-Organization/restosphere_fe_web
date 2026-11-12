import { useMemo, useSyncExternalStore } from 'react'

// Minimal history router for the /kitchen module. The project has no routing
// library (the customer site also navigates with pushState), so the kitchen
// keeps the same approach instead of adding a dependency.

export const KITCHEN_BASE = '/kitchen'

export type KitchenRoute =
  | { name: 'board' }
  | { name: 'ticket'; id: string }
  | { name: 'history' }
  | { name: 'incidents' }
  | { name: 'menu-status' }
  | { name: 'notifications' }
  | { name: 'profile' }
  | { name: 'login' }
  | { name: 'dev' }
  | { name: 'not-found' }

export const isKitchenPath = (pathname: string) => pathname === KITCHEN_BASE || pathname.startsWith(`${KITCHEN_BASE}/`)

const listeners = new Set<() => void>()
const emit = () => listeners.forEach((listener) => listener())

function subscribe(listener: () => void) {
  if (!listeners.size) window.addEventListener('popstate', emit)
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
    if (!listeners.size) window.removeEventListener('popstate', emit)
  }
}

const currentUrl = () => window.location.pathname + window.location.search

export function navigate(to: string, options: { replace?: boolean } = {}) {
  if (to === currentUrl()) return
  if (options.replace) window.history.replaceState(null, '', to)
  else window.history.pushState(null, '', to)
  emit()
}

export function useKitchenUrl() {
  const url = useSyncExternalStore(subscribe, currentUrl)
  return useMemo(() => {
    const parsed = new URL(url, window.location.origin)
    return { url, pathname: parsed.pathname.replace(/\/+$/, '') || '/', params: parsed.searchParams }
  }, [url])
}

export function matchKitchenRoute(pathname: string): KitchenRoute {
  const path = pathname.replace(/\/+$/, '')
  if (path === KITCHEN_BASE) return { name: 'board' }
  const rest = path.slice(KITCHEN_BASE.length + 1)
  const ticket = /^tickets\/([\w-]+)$/.exec(rest)
  if (ticket) return { name: 'ticket', id: decodeURIComponent(ticket[1]) }
  switch (rest) {
    case 'history': return { name: 'history' }
    case 'incidents': return { name: 'incidents' }
    case 'menu-status': return { name: 'menu-status' }
    case 'notifications': return { name: 'notifications' }
    case 'profile': return { name: 'profile' }
    case 'login': return { name: 'login' }
    case 'dev': return import.meta.env.DEV ? { name: 'dev' } : { name: 'not-found' }
    default: return { name: 'not-found' }
  }
}

export const kitchenPaths = {
  board: KITCHEN_BASE,
  ticket: (id: string) => `${KITCHEN_BASE}/tickets/${encodeURIComponent(id)}`,
  history: `${KITCHEN_BASE}/history`,
  incidents: `${KITCHEN_BASE}/incidents`,
  reportIncident: (orderId: string, itemId?: string) =>
    `${KITCHEN_BASE}/incidents?order=${encodeURIComponent(orderId)}${itemId ? `&item=${encodeURIComponent(itemId)}` : ''}`,
  menuStatus: `${KITCHEN_BASE}/menu-status`,
  notifications: `${KITCHEN_BASE}/notifications`,
  profile: `${KITCHEN_BASE}/profile`,
  login: `${KITCHEN_BASE}/login`,
  dev: `${KITCHEN_BASE}/dev`,
}
