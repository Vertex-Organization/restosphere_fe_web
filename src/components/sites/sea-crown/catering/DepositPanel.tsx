import { useEffect, useState } from 'react'
import { reservationService } from '../../../../api/reservations/service'
import type { Reservation } from '../../../../api/reservations/types'
import type { Language } from '../siteData'
import { formatMoney } from './bookingCopy'
import { rememberPayment } from '../paymentMemory'

const POLL_MS = 5000

const COPY = {
  vi: {
    title: 'Thanh toán tiền cọc để giữ lịch',
    intro: (amount: string) =>
      `Lịch có đặt món trước nên cần cọc ${amount} (50% tạm tính món). Thanh toán qua payOS bằng ứng dụng ngân hàng; trang sẽ tự chuyển khi nhà hàng nhận được tiền.`,
    policy: 'Tiền cọc không được hoàn lại dù hủy hoặc không đến.',
    pay: 'Thanh toán cọc qua payOS',
    amount: 'Số tiền',
    remaining: 'Thời gian còn lại',
    noLink: 'Chưa tạo được link thanh toán. Vui lòng gọi hotline để được hướng dẫn.',
    expired: 'Đã quá hạn thanh toán cọc, lịch sẽ tự hủy. Bạn có thể đặt lại.',
    waiting: 'Đang chờ xác nhận thanh toán.',
  },
  en: {
    title: 'Pay the deposit to hold your booking',
    intro: (amount: string) =>
      `Your booking includes pre-ordered dishes, so a ${amount} deposit (50% of the dishes) is required. Pay through payOS with your banking app; this page updates once the restaurant receives it.`,
    policy: 'The deposit is non-refundable, whether you cancel or do not show up.',
    pay: 'Pay the deposit with payOS',
    amount: 'Amount',
    remaining: 'Time left',
    noLink: 'We could not create a payment link. Please call our hotline.',
    expired: 'The deposit window has passed and the booking will be cancelled. Please book again.',
    waiting: 'Waiting for the payment to be confirmed.',
  },
} satisfies Record<Language, unknown>

export default function DepositPanel({
  reservation,
  language,
  onPaid,
}: {
  reservation: Reservation
  language: Language
  onPaid: (next: Reservation) => void
}) {
  const t = COPY[language]
  const deposit = reservation.deposit!
  const link = deposit.payos
  const [now, setNow] = useState(() => Date.now())
  const left = Math.max(0, new Date(deposit.dueAt).getTime() - now)
  const expired = left === 0

  useEffect(() => {
    if (link) rememberPayment({ orderCode: link.orderCode, code: reservation.code, phone: reservation.phone })
  }, [link, reservation.code, reservation.phone])

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(tick)
  }, [])

  useEffect(() => {
    if (expired || !link) return
    const poll = setInterval(async () => {
      const status = await reservationService
        .paymentStatus(link.orderCode, reservation.code, reservation.phone)
        .catch(() => null)
      if (!status?.paid && status?.status !== 'CANCELLED') return
      const latest = await reservationService
        .lookup(reservation.code, reservation.phone)
        .catch(() => null)
      if (latest) onPaid(latest)
    }, POLL_MS)
    return () => clearInterval(poll)
  }, [expired, link, reservation.code, reservation.phone, onPaid])

  const minutes = String(Math.floor(left / 60000)).padStart(2, '0')
  const seconds = String(Math.floor((left % 60000) / 1000)).padStart(2, '0')

  return (
    <div className="bk-done bk-ticket bk-deposit" role="status">
      <h3>{t.title}</h3>
      <p>{t.intro(formatMoney(deposit.amount, language))}</p>
      <p className="bk-demo-note">{t.policy}</p>
      {link ? (
        <div className="bk-deposit-body">
          <dl className="bk-done-details">
            <div>
              <dt>{t.amount}</dt>
              <dd>{formatMoney(deposit.amount, language)}</dd>
            </div>
            <div>
              <dt>{t.remaining}</dt>
              <dd>
                {minutes}:{seconds}
              </dd>
            </div>
          </dl>
          {!expired && (
            <a className="sb-catering-submit" href={link.checkoutUrl}>
              {t.pay}
            </a>
          )}
        </div>
      ) : (
        <p className="bk-error">{t.noLink}</p>
      )}
      <p className={expired ? 'bk-error' : 'bk-demo-note'}>{expired ? t.expired : t.waiting}</p>
    </div>
  )
}
