/** Where in the restaurant the guests would like to sit. */
export type SeatingArea = 'main' | 'outdoor' | 'private'
export const AREA_ID_BY_SEATING: Record<SeatingArea, string> = {
  main: 'floor-1',
  outdoor: 'outside',
  private: 'vip',
}

export type Occasion = 'none' | 'birthday' | 'family' | 'company' | 'other'

export interface PreorderLine {
  dishId: string
  /** Portions, or kilograms for seafood priced per kg. */
  quantity: number
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
  area: SeatingArea
  areaId?: string
  startsAt?: string
  durationMinutes?: number
  occasion: Occasion
  name: string
  phone: string
  email?: string
  note?: string
  items: PreorderLine[]
}

export interface Reservation extends ReservationRequest {
  code: string
  status: ReservationStatus
  createdAt: string
  startsAt: string
  durationMinutes: number
  areaId: string
}

export class ReservationError extends Error {
  readonly code: 'INVALID' | 'NETWORK'

  constructor(code: ReservationError['code'], message: string) {
    super(message)
    this.name = 'ReservationError'
    this.code = code
  }
}
