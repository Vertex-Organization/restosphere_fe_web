import { useEffect, useState } from 'react'
import { reservationService } from '../../../api/reservations/service'
import type { PaymentStatus } from '../../../api/reservations/types'
import { recalledPayment } from './paymentMemory'
import type { Language } from './siteData'

type View = 'loading' | 'paid' | 'pending' | 'closed' | 'unknown' | 'error'

const COPY = {
  vi: {
    title: 'Kết quả thanh toán cọc',
    loading: 'Đang kiểm tra thanh toán với nhà hàng…',
    paid: 'Đã nhận cọc. Lịch đặt bàn của bạn đã được xác nhận.',
    pending: 'Chưa nhận được tiền. Nếu bạn vừa thanh toán, vui lòng đợi ít phút rồi kiểm tra lại.',
    closed: 'Thanh toán đã bị hủy hoặc hết hạn. Lịch đặt bàn có thể đã bị hủy, bạn có thể đặt lại.',
    unknown:
      'Không tìm thấy thanh toán trên thiết bị này. Hãy tra cứu bằng mã đặt bàn và số điện thoại.',
    error: 'Không kiểm tra được lúc này. Vui lòng thử lại.',
    note: 'Kết quả lấy từ nhà hàng, không phụ thuộc thông tin trên đường dẫn.',
    recheck: 'Kiểm tra lại',
    lookup: 'Tra cứu đặt bàn',
    book: 'Đặt bàn mới',
  },
  en: {
    title: 'Deposit payment result',
    loading: 'Checking the payment with the restaurant…',
    paid: 'Deposit received. Your booking is confirmed.',
    pending:
      'We have not received the payment yet. If you just paid, wait a few minutes and check again.',
    closed:
      'The payment was cancelled or expired. The booking may have been cancelled; you can book again.',
    unknown:
      'We cannot find a payment on this device. Look up your booking with its code and phone.',
    error: 'We could not check right now. Please try again.',
    note: 'This result comes from the restaurant, not from the address you opened.',
    recheck: 'Check again',
    lookup: 'Look up booking',
    book: 'New booking',
  },
} satisfies Record<Language, unknown>

const CLOSED = new Set(['CANCELLED', 'EXPIRED', 'FAILED'])

function viewOf(status: PaymentStatus | null): View {
  if (!status) return 'unknown'
  if (status.paid) return 'paid'
  return CLOSED.has(status.status) ? 'closed' : 'pending'
}

export default function PaymentResultPage({ language }: { language: Language }) {
  const t = COPY[language]
  const [view, setView] = useState<View>('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    const remembered = recalledPayment()
    if (!remembered) {
      queueMicrotask(() => active && setView('unknown'))
      return () => {
        active = false
      }
    }
    reservationService
      .paymentStatus(remembered.orderCode, remembered.code, remembered.phone)
      .then((status) => active && setView(viewOf(status)))
      .catch(() => active && setView('error'))
    return () => {
      active = false
    }
  }, [attempt])

  return (
    <main id="main-content" className="bk-result">
      <h1>{t.title}</h1>
      <p role="status" className={view === 'paid' ? 'bk-demo-note' : undefined}>
        {t[view]}
      </p>
      <p className="bk-summary-note">{t.note}</p>
      <div className="bk-submit-row">
        {(view === 'pending' || view === 'error') && (
          <button
            type="button"
            className="sb-catering-submit"
            onClick={() => {
              setView('loading')
              setAttempt((n) => n + 1)
            }}
          >
            {t.recheck}
          </button>
        )}
        <a className="sb-pill" href={`/${language}/reservation-status`}>
          {t.lookup}
        </a>
        <a className="sb-pill" href={`/${language}/catering`}>
          {t.book}
        </a>
      </div>
    </main>
  )
}
