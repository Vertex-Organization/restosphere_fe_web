import { ApiError, apiRequest } from '../client'
import type { Reservation, ReservationRequest } from './types'

export interface ReservationSettings {
  onlineReservations: boolean
  timezone: string
  tableHoldMinutes: number
  bufferMinutes: number
  noShowMinutes: number
  areas: { id: string; name: string }[]
}

export const reservationService = {
  settings: () => apiRequest<ReservationSettings>('reservations/settings'),
  create: (request: ReservationRequest) => apiRequest<Reservation>('reservations', {
    method: 'POST', body: JSON.stringify(request),
  }),
  async lookup(code: string, phone: string): Promise<Reservation | null> {
    try {
      return await apiRequest<Reservation>('reservations/lookup', {
        method: 'POST', body: JSON.stringify({ code: code.trim(), phone: phone.trim() }),
      })
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null
      throw error
    }
  },
  cancel: (code: string, phone: string, reason: string) => apiRequest<Reservation>('reservations/cancel', {
    method: 'POST', body: JSON.stringify({ code: code.trim(), phone: phone.trim(), reason: reason.trim() }),
  }),
}
