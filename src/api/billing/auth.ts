import { mockFindStaff, mockSignIn } from './mockService'
import type { CashierStaff } from './types'

// Cashier session (per browser tab, so two tabs can act as two cashiers).
// Route guards here only shape the UI; the backend must enforce roles.

const SESSION_KEY = 'restosphere.cashier.session.v1'
const listeners = new Set<() => void>()

function restore(): CashierStaff | null {
  try {
    const id = sessionStorage.getItem(SESSION_KEY)
    return id ? mockFindStaff(id) : null
  } catch {
    return null
  }
}

let user: CashierStaff | null = restore()

function publish(next: CashierStaff | null) {
  user = next
  try {
    if (next) sessionStorage.setItem(SESSION_KEY, next.id)
    else sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // Without storage the session lasts until the tab reloads.
  }
  listeners.forEach((listener) => listener())
}

export function subscribeCashierAuth(listener: () => void) {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

export function getCashierUser() {
  return user
}

export async function cashierSignIn(username: string, password: string) {
  const staff = await mockSignIn(username, password)
  publish(staff)
  return staff
}

export function cashierSignOut() {
  publish(null)
}
