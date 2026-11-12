/** Where in the restaurant the guests would like to sit. */
export type SeatingArea = 'main' | 'outdoor' | 'private'

export type Occasion = 'none' | 'birthday' | 'family' | 'company' | 'other'

export interface PreorderLine {
  dishId: string
  /** Portions, or kilograms for seafood priced per kg. */
  quantity: number
}

export interface ReservationRequest {
  /** yyyy-mm-dd */
  date: string
  /** HH:mm */
  time: string
  guests: number
  area: SeatingArea
  occasion: Occasion
  name: string
  phone: string
  email?: string
  note?: string
  items: PreorderLine[]
}

export interface Reservation extends ReservationRequest {
  /** Short code the guest can quote on the phone, e.g. "SC-4821". */
  code: string
  /** The restaurant still has to confirm by phone. */
  status: 'PENDING'
  createdAt: string
}

export class ReservationError extends Error {
  readonly code: 'INVALID' | 'NETWORK'

  constructor(code: ReservationError['code'], message: string) {
    super(message)
    this.name = 'ReservationError'
    this.code = code
  }
}
