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
  /** Empty means no preference; reception seats the guests in any zone with room. */
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
  /** The payOS link the guest pays; present only while the deposit is unpaid. */
  payos?: { paymentId: string; orderCode: number; checkoutUrl: string; qrCode?: string }
}

export interface PaymentStatus {
  status: string
  paid: boolean
  reservationStatus?: ReservationStatus
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
