import { useEffect, useState } from 'react'
import { reservationService } from '../../../../api/reservations/service'
import type { Reservation } from '../../../../api/reservations/types'
import type { Language } from '../siteData'
import { formatMoney } from './bookingCopy'

const POLL_MS = 5000

const COPY = {
  vi: {
    title: 'Chuyển khoản tiền cọc để giữ lịch',
    intro: (amount: string) =>
      `Lịch có đặt món trước nên cần cọc ${amount} (50% tạm tính món). Quét mã QR bằng ứng dụng ngân hàng, trang sẽ tự chuyển khi nhà hàng nhận được tiền.`,
    amount: 'Số tiền',
    reference: 'Nội dung chuyển khoản',
    account: 'Tài khoản nhận',
    remaining: 'Thời gian còn lại',
    noBank: 'Nhà hàng chưa cấu hình tài khoản nhận cọc. Vui lòng gọi hotline để được hướng dẫn.',
    expired: 'Đã quá hạn chuyển cọc, lịch sẽ tự hủy. Bạn có thể đặt lại.',
    waiting: 'Đang chờ nhà hàng xác nhận đã nhận tiền…',
  },
  en: {
    title: 'Transfer the deposit to hold your booking',
    intro: (amount: string) =>
      `Your booking includes pre-ordered dishes, so a ${amount} deposit (50% of the dishes) is required. Scan the QR code with your banking app; this page updates once the restaurant receives it.`,
    amount: 'Amount',
    reference: 'Transfer note',
    account: 'Receiving account',
    remaining: 'Time left',
    noBank: 'The restaurant has not set up a deposit account yet. Please call our hotline.',
    expired: 'The deposit window has passed and the booking will be cancelled. Please book again.',
    waiting: 'Waiting for the restaurant to confirm the transfer…',
  },
} satisfies Record<Language, unknown>

function qrUrl(r: Reservation) {
  const d = r.deposit!
  const bank = d.bank!
  const params = new URLSearchParams({
    amount: String(d.amount),
    addInfo: d.reference,
    accountName: bank.accountName ?? '',
  })
  // VietQR quick-link renders a standard banking QR as an image; bank id accepts name or BIN.
  return `https://img.vietqr.io/image/${encodeURIComponent(bank.bankName ?? '')}-${encodeURIComponent(bank.accountNumber)}-compact2.png?${params}`
}

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
  const [now, setNow] = useState(() => Date.now())
  const left = Math.max(0, new Date(deposit.dueAt).getTime() - now)
  const expired = left === 0

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(tick)
  }, [])

  useEffect(() => {
    if (expired) return
    const poll = setInterval(async () => {
      const latest = await reservationService
        .lookup(reservation.code, reservation.phone)
        .catch(() => null)
      if (latest?.deposit?.paidAt || (latest && latest.status !== 'PENDING')) onPaid(latest)
    }, POLL_MS)
    return () => clearInterval(poll)
  }, [expired, reservation.code, reservation.phone, onPaid])

  const minutes = String(Math.floor(left / 60000)).padStart(2, '0')
  const seconds = String(Math.floor((left % 60000) / 1000)).padStart(2, '0')

  return (
    <div className="bk-done bk-ticket bk-deposit" role="status">
      <h3>{t.title}</h3>
      <p>{t.intro(formatMoney(deposit.amount, language))}</p>
      {deposit.bank ? (
        <div className="bk-deposit-body">
          <img className="bk-deposit-qr" src={qrUrl(reservation)} alt="VietQR" />
          <dl className="bk-done-details">
            <div>
              <dt>{t.amount}</dt>
              <dd>{formatMoney(deposit.amount, language)}</dd>
            </div>
            <div>
              <dt>{t.reference}</dt>
              <dd>
                <strong>{deposit.reference}</strong>
              </dd>
            </div>
            <div>
              <dt>{t.account}</dt>
              <dd>
                {deposit.bank.accountNumber}
                {deposit.bank.bankName && ` · ${deposit.bank.bankName}`}
                {deposit.bank.accountName && ` · ${deposit.bank.accountName}`}
              </dd>
            </div>
            <div>
              <dt>{t.remaining}</dt>
              <dd>
                {minutes}:{seconds}
              </dd>
            </div>
          </dl>
        </div>
      ) : (
        <p className="bk-error">{t.noBank}</p>
      )}
      <p className={expired ? 'bk-error' : 'bk-demo-note'}>{expired ? t.expired : t.waiting}</p>
    </div>
  )
}
