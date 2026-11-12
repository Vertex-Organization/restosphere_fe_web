// Routes of the /cashier module. Navigation reuses the kitchen module's
// history store (pushState + popstate, no routing library), so both staff
// modules move between pages the same way.
export { navigate, useKitchenUrl as useCashierUrl } from './kitchenRouter'

export const CASHIER_BASE = '/cashier'

export type CashierRoute =
  | { name: 'pos' }
  | { name: 'bill'; id: string }
  | { name: 'payment'; billId: string }
  | { name: 'transactions' }
  | { name: 'transaction'; id: string }
  | { name: 'receipt'; id: string }
  | { name: 'requests' }
  | { name: 'shift' }
  | { name: 'notifications' }
  | { name: 'profile' }
  | { name: 'login' }
  | { name: 'dev' }
  | { name: 'not-found' }

export const isCashierPath = (pathname: string) => pathname === CASHIER_BASE || pathname.startsWith(`${CASHIER_BASE}/`)

const withId = /^(bills|payments|transactions|receipts)\/([\w-]+)$/

export function matchCashierRoute(pathname: string): CashierRoute {
  const path = pathname.replace(/\/+$/, '')
  if (path === CASHIER_BASE) return { name: 'pos' }
  const rest = path.slice(CASHIER_BASE.length + 1)
  const match = withId.exec(rest)
  if (match) {
    const id = decodeURIComponent(match[2])
    switch (match[1]) {
      case 'bills': return { name: 'bill', id }
      case 'payments': return { name: 'payment', billId: id }
      case 'transactions': return { name: 'transaction', id }
      default: return { name: 'receipt', id }
    }
  }
  switch (rest) {
    case 'transactions': return { name: 'transactions' }
    case 'requests': return { name: 'requests' }
    case 'shift': return { name: 'shift' }
    case 'notifications': return { name: 'notifications' }
    case 'profile': return { name: 'profile' }
    case 'login': return { name: 'login' }
    case 'dev': return import.meta.env.DEV ? { name: 'dev' } : { name: 'not-found' }
    default: return { name: 'not-found' }
  }
}

const enc = encodeURIComponent

export const cashierPaths = {
  pos: CASHIER_BASE,
  /** Counter with a bill selected (kept in the URL so reload and phone "back" work). */
  posBill: (billId: string) => `${CASHIER_BASE}?bill=${enc(billId)}`,
  bill: (id: string) => `${CASHIER_BASE}/bills/${enc(id)}`,
  payment: (billId: string) => `${CASHIER_BASE}/payments/${enc(billId)}`,
  transactions: `${CASHIER_BASE}/transactions`,
  transaction: (id: string) => `${CASHIER_BASE}/transactions/${enc(id)}`,
  receipt: (billId: string) => `${CASHIER_BASE}/receipts/${enc(billId)}`,
  requests: `${CASHIER_BASE}/requests`,
  request: (id: string) => `${CASHIER_BASE}/requests?id=${enc(id)}`,
  shift: `${CASHIER_BASE}/shift`,
  notifications: `${CASHIER_BASE}/notifications`,
  profile: `${CASHIER_BASE}/profile`,
  login: `${CASHIER_BASE}/login`,
  dev: `${CASHIER_BASE}/dev`,
}
