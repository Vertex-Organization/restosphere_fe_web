import { posRows } from './selectors'
import type { CashierData } from './types'

/** Tables waiting to pay: the number that drives the "new payment request" sound. */
export function dueTableCount(data: CashierData, now: number) {
  return posRows(data, now).filter((row) => row.status === 'PAYMENT_REQUESTED').length
}

/** True only when the count grew; the first load (no previous count) never alerts. */
export function paymentRequestArrived(previous: number | null, current: number) {
  return previous !== null && current > previous
}
