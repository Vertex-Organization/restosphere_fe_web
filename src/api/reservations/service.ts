import { AREA_ID_BY_SEATING, ReservationError, type Reservation, type ReservationRequest } from './types'

export interface ReservationService {
  create(request: ReservationRequest): Promise<Reservation>
  lookup(code: string, phone: string): Promise<Reservation | null>
  isOnlineReservationsEnabled(): boolean
}

export const reservationSettings = { onlineReservations: true, timezone: 'Asia/Ho_Chi_Minh', durationMinutes: 120 }
const STORAGE_KEY = 'restosphere.reservations.demo.v2'
const statuses = ['PENDING', 'CONFIRMED', 'ARRIVED', 'SEATED', 'COMPLETED', 'REJECTED', 'CANCELLED', 'NO_SHOW']
const phoneKey = (phone: string) => phone.replace(/[\s.-]/g, '').replace(/^\+84/, '0')

function validate(request: ReservationRequest) {
  if (!request || typeof request.name !== 'string' || !request.name.trim() || typeof request.phone !== 'string' || !/^0\d{9,10}$/.test(phoneKey(request.phone))) throw new ReservationError('INVALID', 'Thông tin liên hệ không hợp lệ.')
  if (!Number.isInteger(request.guests) || request.guests < 1 || request.guests > 60) throw new ReservationError('INVALID', 'Số khách không hợp lệ.')
  const local = `${request.date}T${request.time}:00+07:00`
  const at = new Date(local)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(request.date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(request.time) || !Number.isFinite(at.getTime()) || new Date(at.getTime() + 7 * 3600000).toISOString().slice(0, 16) !== `${request.date}T${request.time}`) throw new ReservationError('INVALID', 'Ngày hoặc giờ không hợp lệ.')
  if (request.startsAt !== undefined && new Date(request.startsAt).getTime() !== at.getTime()) throw new ReservationError('INVALID', 'Giờ đặt bàn không khớp.')
  if (!(request.area in AREA_ID_BY_SEATING) || (request.areaId !== undefined && request.areaId !== AREA_ID_BY_SEATING[request.area])) throw new ReservationError('INVALID', 'Khu vực không hợp lệ.')
  const duration = request.durationMinutes ?? reservationSettings.durationMinutes
  if (!Number.isInteger(duration) || duration < 15 || duration > 480) throw new ReservationError('INVALID', 'Thời lượng không hợp lệ.')
  if (!Array.isArray(request.items) || request.items.some(line => !line || typeof line.dishId !== 'string' || !line.dishId.trim() || !Number.isFinite(line.quantity) || line.quantity <= 0 || line.quantity > 99)) throw new ReservationError('INVALID', 'Món đặt trước không hợp lệ.')
}

function readAll(): Reservation[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    if (!Array.isArray(stored)) throw new Error()
    for (const r of stored) {
      validate(r)
      if (typeof r.code !== 'string' || !/^RS\d+$/.test(r.code) || !statuses.includes(r.status) || !Number.isFinite(new Date(r.createdAt).getTime())) throw new Error()
    }
    return stored
  } catch {
    throw new ReservationError('NETWORK', 'Không thể đọc dữ liệu đặt bàn. Vui lòng thử lại.')
  }
}

export const mockReservationService: ReservationService = {
  isOnlineReservationsEnabled: () => reservationSettings.onlineReservations,
  async lookup(code, phone) {
    if (!code.trim() || !phone.trim()) return null
    return readAll().find(r => r.code === code.trim().toUpperCase() && phoneKey(r.phone) === phoneKey(phone)) ?? null
  },
  async create(request) {
    if (!reservationSettings.onlineReservations) throw new ReservationError('INVALID', 'Hệ thống đang tạm ngừng nhận đặt bàn trực tuyến.')
    validate(request)
    const bookings = readAll()
    const startsAt = new Date(`${request.date}T${request.time}:00+07:00`).toISOString()
    if (new Date(startsAt).getTime() <= Date.now()) throw new ReservationError('INVALID', 'Giờ đặt bàn phải ở tương lai.')
    const sequence = bookings.reduce((max, r) => Math.max(max, Number(r.code.slice(2))), 0) + 1
    const reservation: Reservation = {
      ...request, code: `RS${String(sequence).padStart(4, '0')}`, status: 'PENDING', startsAt,
      durationMinutes: request.durationMinutes ?? reservationSettings.durationMinutes,
      areaId: AREA_ID_BY_SEATING[request.area], createdAt: new Date().toISOString(),
    }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...bookings, reservation])) }
    catch { throw new ReservationError('NETWORK', 'Không thể lưu đặt bàn. Vui lòng thử lại.') }
    return reservation
  },
}

export const reservationService: ReservationService = mockReservationService
