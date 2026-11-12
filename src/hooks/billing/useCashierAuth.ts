import { useSyncExternalStore } from 'react'
import { cashierSignOut, getCashierUser, subscribeCashierAuth } from '../../api/billing/auth'
import { cashierPaths, navigate } from '../../routes/cashierRouter'

export function useCashierUser() {
  return useSyncExternalStore(subscribeCashierAuth, getCashierUser)
}

/** Signs out and lands on the login page (without a "next" redirect). */
export function leaveCashier() {
  navigate(cashierPaths.login, { replace: true })
  cashierSignOut()
}
