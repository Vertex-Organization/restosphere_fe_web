const KEY = 'restosphere.pendingPayment'

export interface RememberedPayment {
  orderCode: number
  code: string
  phone: string
}

/**
 * Kept only so /payment/result can ask the server about the right payment after payOS sends the
 * guest back; the page never trusts what payOS put in the address.
 */
export function rememberPayment(payment: RememberedPayment) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(payment))
  } catch {
    // Storage may be blocked; the result page then asks for the booking code and phone.
  }
}

export function recalledPayment(): RememberedPayment | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const value = JSON.parse(raw) as Partial<RememberedPayment>
    return typeof value.orderCode === 'number' && value.code && value.phone
      ? { orderCode: value.orderCode, code: value.code, phone: value.phone }
      : null
  } catch {
    return null
  }
}
