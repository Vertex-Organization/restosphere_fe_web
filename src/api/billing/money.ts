import type { BillDiscount, BillTotals, BillingConfig, DiscountMode, OrderItem } from './types'

// Money is always a whole number of đồng (VND has no minor unit), so every
// value here is a safe integer. Rates are basis points (1% = 100) and the only
// rounding happens once per derived line, to the nearest đồng.

/** Upper bound for any amount typed at the counter (1 tỷ đồng). */
export const MAX_AMOUNT = 1_000_000_000

export function isMoney(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= MAX_AMOUNT * 10
}

/** amount × basisPoints / 10000, rounded half up to the đồng. */
export function applyRate(amount: number, basisPoints: number) {
  return Math.round((amount * basisPoints) / 10000)
}

export const lineTotal = (item: Pick<OrderItem, 'unitPrice' | 'quantity'>) => item.unitPrice * item.quantity

/** Cancelled lines are never billed. */
export const isBillable = (item: Pick<OrderItem, 'status'>) => !['REJECTED', 'CANCELLED', 'VOIDED'].includes(item.status)

export function subtotalOf(items: Pick<OrderItem, 'unitPrice' | 'quantity' | 'status'>[]) {
  return items.reduce((sum, item) => (isBillable(item) ? sum + lineTotal(item) : sum), 0)
}

/** Discount in đồng for a given subtotal; never more than the subtotal. */
export function discountAmount(discount: Pick<BillDiscount, 'mode' | 'value'> | undefined, subtotal: number) {
  if (!discount || subtotal <= 0) return 0
  const raw = discount.mode === 'PERCENT' ? applyRate(subtotal, discount.value * 100) : discount.value
  return Math.min(Math.max(0, raw), subtotal)
}

/**
 * Bill totals. Service charge applies after the discount; tax applies to the
 * discounted amount plus service charge. Both are skipped when not configured.
 */
export function computeTotals(
  items: Pick<OrderItem, 'unitPrice' | 'quantity' | 'status'>[],
  discount: Pick<BillDiscount, 'mode' | 'value'> | undefined,
  config: Pick<BillingConfig, 'serviceChargeRate' | 'taxRate'>,
): BillTotals {
  const subtotal = subtotalOf(items)
  const discountValue = discountAmount(discount, subtotal)
  const base = subtotal - discountValue
  const serviceCharge = config.serviceChargeRate ? applyRate(base, config.serviceChargeRate) : 0
  const tax = config.taxRate ? applyRate(base + serviceCharge, config.taxRate) : 0
  return { subtotal, discount: discountValue, serviceCharge, tax, total: base + serviceCharge + tax }
}

/** True when `amount` is within `limitPercent` of `subtotal` (integer comparison, no floats). */
export function withinPercent(amount: number, subtotal: number, limitPercent: number) {
  return amount * 100 <= subtotal * limitPercent
}

/** Largest discount (đồng) a percent limit allows on a subtotal. */
export function limitAmount(subtotal: number, limitPercent: number) {
  return Math.floor((subtotal * limitPercent) / 100)
}

export function validateDiscount(mode: DiscountMode, value: number, subtotal: number): string {
  if (!Number.isSafeInteger(value) || value <= 0) return 'Nhập mức giảm lớn hơn 0.'
  if (mode === 'PERCENT' && value > 100) return 'Giảm theo phần trăm từ 1 đến 100.'
  if (mode === 'AMOUNT' && value > subtotal) return 'Số tiền giảm không được lớn hơn tạm tính.'
  return ''
}

const groupFormat = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 })

/** 355000 → "355.000đ" */
export function formatVnd(amount: number) {
  return `${groupFormat.format(amount)}đ`
}

/** 355000 → "355.000" (for inputs and compact columns). */
export function formatAmount(amount: number) {
  return groupFormat.format(amount)
}

export interface ParsedMoney {
  /** null when the field is empty. */
  value: number | null
  error: string
}

/**
 * Parses what a cashier typed. Group separators (".", ",", spaces) are allowed;
 * signs, decimals written as words, letters and other symbols are rejected
 * instead of being silently dropped.
 */
export function parseMoney(text: string): ParsedMoney {
  const trimmed = text.trim()
  if (!trimmed) return { value: null, error: '' }
  if (trimmed.includes('-')) return { value: null, error: 'Không nhập số âm.' }
  const digits = trimmed.replace(/[\s.,]/g, '')
  if (!/^\d+$/.test(digits)) return { value: null, error: 'Chỉ nhập chữ số.' }
  const value = Number(digits)
  if (!Number.isSafeInteger(value) || value > MAX_AMOUNT) return { value: null, error: 'Số tiền vượt giới hạn cho phép.' }
  return { value, error: '' }
}

/** Quick-tender buttons for a cash amount: exact, then round-ups and common notes. */
export function cashSuggestions(due: number) {
  if (due <= 0) return []
  const values = new Set<number>([due])
  for (const step of [10_000, 50_000, 100_000, 500_000]) values.add(Math.ceil(due / step) * step)
  for (const note of [200_000, 500_000, 1_000_000, 2_000_000]) if (note > due) values.add(note)
  return [...values].filter((v) => v >= due && v <= MAX_AMOUNT).sort((a, b) => a - b).slice(0, 6)
}
