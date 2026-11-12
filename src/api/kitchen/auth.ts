import { mockFindStaff, mockSignIn } from './mockService'
import type { StaffMember } from './types'

// Kitchen session (per browser tab, so two tabs can act as two cooks).
// Route guards here only shape the UI; the backend must enforce roles.

const SESSION_KEY = 'restosphere.kitchen.session.v1'
const listeners = new Set<() => void>()

function restore(): StaffMember | null {
  try {
    const id = sessionStorage.getItem(SESSION_KEY)
    return id ? mockFindStaff(id) : null
  } catch {
    return null
  }
}

let user: StaffMember | null = restore()

function publish(next: StaffMember | null) {
  user = next
  try {
    if (next) sessionStorage.setItem(SESSION_KEY, next.id)
    else sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // Without storage the session lasts until the tab reloads.
  }
  listeners.forEach((listener) => listener())
}

export function subscribeKitchenAuth(listener: () => void) {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

export function getKitchenUser() {
  return user
}

export async function kitchenSignIn(username: string, password: string) {
  const staff = await mockSignIn(username, password)
  publish(staff)
  return staff
}

export function kitchenSignOut() {
  publish(null)
}
