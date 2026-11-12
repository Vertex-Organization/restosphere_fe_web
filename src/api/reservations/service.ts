import { ReservationError, type Reservation, type ReservationRequest } from './types'

/**
 * The seam between the booking form and its data source.
 *
 * The backend has no reservation endpoint yet, so the site runs on
 * `mockReservationService`, which keeps bookings in this browser only. When an
 * endpoint exists, add an HTTP implementation (using `apiRequest` from
 * ../client) and export it here instead; the booking form does not change.
 */
export interface ReservationService {
  create(request: ReservationRequest): Promise<Reservation>
}

const STORAGE_KEY = 'restosphere.reservations.demo.v1'

function readAll(): Reservation[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(stored) ? stored as Reservation[] : []
  } catch {
    return []
  }
}

function validate(request: ReservationRequest) {
  if (!request.name.trim() || !request.phone.trim()) throw new ReservationError('INVALID', 'Missing contact details')
  if (!Number.isInteger(request.guests) || request.guests < 1 || request.guests > 60) throw new ReservationError('INVALID', 'Invalid guest count')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(request.date) || !/^\d{2}:\d{2}$/.test(request.time)) throw new ReservationError('INVALID', 'Invalid date or time')
  if (request.items.some((line) => !(line.quantity > 0))) throw new ReservationError('INVALID', 'Invalid dish quantity')
}

export const mockReservationService: ReservationService = {
  async create(request) {
    await new Promise((resolve) => setTimeout(resolve, 600))
    validate(request)
    const reservation: Reservation = {
      ...request,
      code: `SC-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...readAll(), reservation]))
    } catch {
      // Storage unavailable (private mode): the confirmation still shows.
    }
    return reservation
  },
}

export const reservationService: ReservationService = mockReservationService
