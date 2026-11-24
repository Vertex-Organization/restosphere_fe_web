import { useEffect } from 'react'
import { METHOD_LABEL } from '../../../api/billing/labels'
import { formatVnd } from '../../../api/billing/money'
import { staffName } from '../../../api/billing/selectors'
import { Icon } from '../../../components/billing/Icon'
import { formatDate, formatTime } from '../../../components/kitchen/format'
import { KitchenLink as Link } from '../../../components/kitchen/KitchenLink'
import { useCashierSnapshot } from '../../../hooks/billing/cashierDataContext'
import { cashierPaths } from '../../../routes/cashierRouter'

/** Deposit receipt for 80mm paper. States plainly that the deposit is never refunded. */
export default function CashierDepositReceiptPage({ paymentId }: { paymentId: string }) {
  const { data } = useCashierSnapshot()
  const payment = data.payments.find((p) => p.id === paymentId && p.reservationId)

  useEffect(() => {
    document.documentElement.classList.add('c-printing-receipt')
    return () => document.documentElement.classList.remove('c-printing-receipt')
  }, [])

  if (!payment) {
    return (
      <div className="k-state">
        <p className="k-state-title">Không tìm thấy khoản cọc</p>
        <Link to={cashierPaths.deposits} className="k-btn k-btn--primary">
          Về Cọc chờ thu
        </Link>
      </div>
    )
  }

  const { config } = data
  const at = payment.completedAt ?? payment.createdAt

  return (
    <div className="c-receipt-page">
      <div className="k-page-head c-no-print">
        <Link to={cashierPaths.deposits} className="k-back">
          <Icon name="chevronLeft" />
          Cọc chờ thu
        </Link>
        <div className="k-page-heading">
          <h2 className="k-h2">Biên nhận cọc · {payment.code}</h2>
        </div>
        <div className="k-page-actions">
          <button type="button" className="k-btn k-btn--primary" onClick={() => window.print()}>
            <Icon name="printer" />
            In
          </button>
        </div>
      </div>

      <article className="c-receipt" aria-label="Biên nhận tiền cọc">
        <header className="c-r-head">
          <p className="c-r-brand">{config.restaurantName}</p>
          {config.address && <p>{config.address}</p>}
          <p className="c-r-kind">BIÊN NHẬN TIỀN CỌC</p>
        </header>

        <dl className="c-r-meta">
          <div>
            <dt>Mã GD</dt>
            <dd>{payment.code}</dd>
          </div>
          <div>
            <dt>Thời gian</dt>
            <dd>
              {formatTime(at)} {formatDate(at)}
            </dd>
          </div>
          <div>
            <dt>Hình thức</dt>
            <dd>{METHOD_LABEL[payment.method]}</dd>
          </div>
          <div>
            <dt>Thu ngân</dt>
            <dd>{staffName(data, payment.createdBy)}</dd>
          </div>
          {payment.bankReference && (
            <div>
              <dt>Mã ngân hàng</dt>
              <dd>{payment.bankReference}</dd>
            </div>
          )}
        </dl>

        <dl className="c-r-totals">
          <div className="c-r-grand">
            <dt>TIỀN CỌC ĐÃ NHẬN</dt>
            <dd>{formatVnd(payment.amount)}</dd>
          </div>
          {payment.method === 'CASH' && payment.tendered != null && (
            <>
              <div>
                <dt>Khách đưa</dt>
                <dd>{formatVnd(payment.tendered)}</dd>
              </div>
              <div>
                <dt>Tiền thừa</dt>
                <dd>{formatVnd(payment.change ?? 0)}</dd>
              </div>
            </>
          )}
        </dl>

        <footer className="c-r-foot">
          <p>
            <b>Tiền cọc không được hoàn lại</b> trong mọi trường hợp (hủy hoặc không đến). Khoản cọc
            được trừ vào hóa đơn khi quý khách dùng bữa.
          </p>
          <p className="c-r-small">Cảm ơn quý khách!</p>
        </footer>
      </article>
    </div>
  )
}
