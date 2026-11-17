import { useSyncExternalStore } from 'react'
import { cashierSignOut, getCashierUser, subscribeCashierAuth } from '../../api/billing/auth'

export function useCashierUser() {
  return useSyncExternalStore(subscribeCashierAuth, getCashierUser)
}

/** Signs out and opens the shared staff sign-in page (without a "next" redirect). */
export function leaveCashier() {
  cashierSignOut()
}
