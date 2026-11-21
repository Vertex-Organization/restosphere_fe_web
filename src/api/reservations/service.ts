import { ApiError, apiRequest } from '../client'
import type { Reservation, ReservationRequest } from './types'

export interface ReservationSettings {
  onlineReservations: boolean
  timezone: string
  tableHoldMinutes: number
  bufferMinutes: number
  noShowMinutes: number
  /** Opening window in minutes from local midnight; close may exceed 1440 for overnight. Absent = no limit. */
  openMinutes?: number
  closeMinutes?: number
  areas: { id: string; name: string }[]
}

// Reservation endpoints return Vietnamese, customer-safe reasons; surface them instead of the generic message.
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    return await apiRequest<T>(path, options)
  } catch (error) {
    if (error instanceof ApiError && error.detail && error.status < 500)
      throw new ApiError(error.status, error.detail, error.detail)
    throw error
  }
}

export const reservationService = {
  settings: () => request<ReservationSettings>('reservations/settings'),
  create: (body: ReservationRequest) =>
    request<Reservation>('reservations', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  async lookup(code: string, phone: string): Promise<Reservation | null> {
    try {
      return await request<Reservation>('reservations/lookup', {
        method: 'POST',
        body: JSON.stringify({ code: code.trim(), phone: phone.trim() }),
      })
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null
      throw error
    }
  },
  cancel: (code: string, phone: string, reason: string) =>
    request<Reservation>('reservations/cancel', {
      method: 'POST',
      body: JSON.stringify({ code: code.trim(), phone: phone.trim(), reason: reason.trim() }),
    }),
}
