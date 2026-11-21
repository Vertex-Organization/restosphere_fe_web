import { useState, type FormEvent } from 'react'
import { ApiError } from '../../../api/client'
import { reservationService } from '../../../api/reservations/service'
import type { PreorderLine, Reservation } from '../../../api/reservations/types'
import type { Language } from './siteData'

export default function ReservationStatusPage({ language }: { language: Language }) {
  const en = language === 'en'
  const [code, setCode] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [errorField, setErrorField] = useState('')
  const [result, setResult] = useState<Reservation | null | undefined>(undefined)

  const fail = (e: unknown, fallback: string) => {
    setError(e instanceof Error ? e.message : fallback)
    setErrorField(e instanceof ApiError ? (e.field ?? '') : '')
  }
  const fieldError = (field: string) =>
    errorField === field ? (
      <p role="alert" style={{ color: '#991b1b', margin: '6px 0 0', fontWeight: 600 }}>
        {error}
      </p>
    ) : null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(undefined)
    setError('')
    setErrorField('')
    try {
      const res = await reservationService.lookup(code, phone)
      setResult(res)
    } catch (e) {
      fail(e, 'Không thể tra cứu đặt bàn.')
    } finally {
      setLoading(false)
    }
  }

  const [reason, setReason] = useState('')
  const handleCancel = async () => {
    if (!result) return
    setLoading(true)
    setError('')
    setErrorField('')
    try {
      setResult(await reservationService.cancel(result.code, result.phone, reason))
    } catch (e) {
      fail(e, 'Không thể hủy đặt bàn.')
    } finally {
      setLoading(false)
    }
  }

  const statusLabel: Record<string, string> = {
    PENDING: en ? 'Pending Confirmation' : 'Chờ xác nhận',
    CONFIRMED: en ? 'Confirmed' : 'Đã xác nhận',
    ARRIVED: en ? 'Arrived' : 'Khách đã đến',
    SEATED: en ? 'Seated' : 'Đang phục vụ',
    COMPLETED: en ? 'Completed' : 'Hoàn tất',
    REJECTED: en ? 'Rejected' : 'Từ chối',
    CANCELLED: en ? 'Cancelled' : 'Đã hủy',
    NO_SHOW: en ? 'No Show' : 'Không đến',
  }

  return (
    <main id="main-content" className="sb-legal-page" lang={language}>
      <div className="sb-legal-content" style={{ maxWidth: '640px', margin: '0 auto' }}>
        <h1>{en ? 'Look Up Reservation' : 'Tra cứu trạng thái đặt bàn'}</h1>
        <p className="sb-legal-intro">
          {en
            ? 'Enter your reservation code (e.g. RS-251126-007) and phone number to check your status.'
            : 'Nhập mã đặt bàn (ví dụ: RS-251126-007) và số điện thoại đã đăng ký để kiểm tra tình trạng.'}
        </p>

        <form
          noValidate
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '24px 0' }}
        >
          <div>
            <label
              htmlFor="rs-code"
              style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}
            >
              {en ? 'Reservation Code' : 'Mã đặt bàn'} *
            </label>
            <input
              id="rs-code"
              type="text"
              placeholder="RS..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #ccc',
              }}
            />
            {fieldError('code')}
          </div>
          <div>
            <label
              htmlFor="rs-phone"
              style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}
            >
              {en ? 'Phone Number' : 'Số điện thoại'} *
            </label>
            <input
              id="rs-phone"
              type="tel"
              placeholder="09..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #ccc',
              }}
            />
            {fieldError('phone')}
          </div>
          <button
            type="submit"
            className="sb-catering-submit"
            disabled={loading}
            style={{ marginTop: '8px', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? (en ? 'Searching...' : 'Đang tra cứu...') : en ? 'Check Status' : 'Tra cứu'}
          </button>
        </form>

        {error && !['code', 'phone', 'reason'].includes(errorField) && <p role="alert">{error}</p>}
        {result === null && (
          <div
            role="status"
            style={{
              padding: '14px',
              background: '#fee2e2',
              borderRadius: '8px',
              color: '#991b1b',
              marginTop: '16px',
            }}
          >
            {en
              ? 'No reservation found matching this code and phone number.'
              : 'Không tìm thấy thông tin đặt bàn khớp với mã và số điện thoại trên.'}
          </div>
        )}

        {result && (
          <div
            role="status"
            style={{
              padding: '20px',
              background: '#f3f4f6',
              borderRadius: '8px',
              marginTop: '16px',
            }}
          >
            <h2 style={{ fontSize: '1.25rem', marginTop: 0 }}>
              {en ? 'Reservation Details' : 'Chi tiết đặt bàn'}
            </h2>
            <p>
              <strong>{en ? 'Code:' : 'Mã đặt bàn:'}</strong> {result.code}
            </p>
            <p>
              <strong>{en ? 'Guest Name:' : 'Tên khách:'}</strong> {result.name}
            </p>
            <p>
              <strong>{en ? 'Time:' : 'Thời gian:'}</strong> {result.date} · {result.time}
            </p>
            <p>
              <strong>{en ? 'Guests:' : 'Số khách:'}</strong> {result.guests}
            </p>
            <p>
              <strong>{en ? 'Area:' : 'Khu vực:'}</strong> {result.areaName}
            </p>
            <p>
              <strong>{en ? 'Status:' : 'Trạng thái:'}</strong>{' '}
              <span
                style={{
                  fontWeight: 600,
                  color:
                    result.status === 'CONFIRMED' || result.status === 'SEATED'
                      ? '#166534'
                      : result.status === 'REJECTED' || result.status === 'CANCELLED'
                        ? '#991b1b'
                        : '#854d0e',
                }}
              >
                {statusLabel[result.status] ?? result.status}
              </span>
            </p>
            {result.items?.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <strong>{en ? 'Preordered Dishes:' : 'Món đặt trước:'}</strong>
                <ul style={{ margin: '6px 0 0', paddingLeft: '20px' }}>
                  {result.items.map((line: PreorderLine, idx: number) => (
                    <li key={idx}>
                      {line.name ?? line.dishId} × {line.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(result.status === 'PENDING' || result.status === 'CONFIRMED') && (
              <div
                style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                <label htmlFor="rs-reason" style={{ fontWeight: 600 }}>
                  {en ? 'Cancellation reason' : 'Lý do hủy'} *
                </label>
                <textarea
                  id="rs-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #ccc',
                  }}
                />
                {fieldError('reason')}
                <button
                  type="button"
                  className="sb-catering-submit"
                  disabled={loading}
                  onClick={handleCancel}
                >
                  {en ? 'Cancel Reservation' : 'Hủy đặt bàn'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
