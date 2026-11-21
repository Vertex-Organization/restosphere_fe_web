export interface PreorderLine {
  dishId: string
  /** Portions, or kilograms for seafood priced per kg. */
  quantity: number
  name?: string
}

export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'ARRIVED'
  | 'SEATED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'NO_SHOW'

export interface ReservationRequest {
  /** yyyy-mm-dd */
  date: string
  /** HH:mm */
  time: string
  guests: number
  areaId: string
  startsAt?: string
  durationMinutes?: number
  name: string
  phone: string
  email?: string
  note?: string
  items: PreorderLine[]
}

export interface Deposit {
  /** Whole VND. */
  amount: number
  dueAt: string
  paidAt?: string
  /** Transfer note the customer must use. */
  reference: string
  /** Present only while the deposit is unpaid and the restaurant set a bank account. */
  bank?: { bankName?: string; accountNumber: string; accountName?: string }
}

export interface Reservation extends ReservationRequest {
  code: string
  status: ReservationStatus
  createdAt: string
  startsAt: string
  durationMinutes: number
  areaName: string
  deposit?: Deposit
}
