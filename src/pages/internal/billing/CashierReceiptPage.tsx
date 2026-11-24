import { useEffect } from 'react'
import { METHOD_LABEL } from '../../../api/billing/labels'
import { formatAmount, formatVnd, isBillable } from '../../../api/billing/money'
import { billView, hasPermission, staffName } from '../../../api/billing/selectors'
import { Icon } from '../../../components/billing/Icon'
import { QrCode } from '../../../components/billing/QrCode'
import { formatDate, formatTime, quantityLabel } from '../../../components/kitchen/format'
import { KitchenLink as Link } from '../../../components/kitchen/KitchenLink'
import { useCashierSnapshot } from '../../../hooks/billing/cashierDataContext'
import { useNow } from '../../../hooks/kitchen/useNow'
import { cashierPaths } from '../../../routes/cashierRouter'

/**
 * Browser-printed receipt laid out for 80mm thermal paper (72mm printable).
 * Printing goes through the browser's print dialog and the installed printer
 * driver; no printer SDK is integrated.
 */
export default function CashierReceiptPage({ billId }: { billId: string }) {
  const { data, user } = useCashierSnapshot()
  const now = useNow()
  const view = billView(data, billId)

  useEffect(() => {
    document.documentElement.classList.add('c-printing-receipt')
    return () => document.documentElement.classList.remove('c-printing-receipt')
  }, [])

  if (!view) {
    return (
      <div className="k-state">
        <p className="k-state-title">Không tìm thấy hóa đơn</p>
        <Link to={cashierPaths.pos} className="k-btn k-btn--primary">
          Về quầy thu ngân
        </Link>
      </div>
    )
  }

  const { bill, table, session } = view
  const paid = bill.status === 'PAID'
  if (!hasPermission(user, paid ? 'receipts.print' : 'bills.prepare')) {
    return (
      <div className="k-state">
        <p className="k-state-title">
          Bạn không có quyền in {paid ? 'hóa đơn' : 'phiếu tạm tính'}.
        </p>
      </div>
    )
  }

  // Same dish at the same price from several rounds prints as one line.
  const lines = new Map<
    string,
    { name: string; quantity: number; unit?: string; unitPrice: number }
  >()
  for (const item of view.items) {
    if (!isBillable(item)) continue
    const key = `${item.menuItemId}:${item.unitPrice}`
    const line = lines.get(key)
    if (line) line.quantity += item.quantity
    else
      lines.set(key, {
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
      })
  }
  const succeeded = view.payments.filter((p) => p.status === 'SUCCEEDED')
  const livePayos = view.payments.find((p) => p.method === 'PAYOS' && p.status === 'PENDING')
  const cashierId = succeeded.at(-1)?.createdBy ?? user.id
  const at = paid && bill.paidAt ? bill.paidAt : new Date(now).toISOString()
  const { config } = data
  const t = bill.totals

  return (
    <div className="c-receipt-page">
      <div className="k-page-head c-no-print">
        <Link to={cashierPaths.posBill(bill.id)} className="k-back">
          <Icon name="chevronLeft" />
          Quầy thu ngân
        </Link>
        <div className="k-page-heading">
          <h2 className="k-h2">
            {paid ? 'Hóa đơn thanh toán' : 'Phiếu tạm tính'} · {bill.code}
          </h2>
        </div>
        <div className="k-page-actions">
          <Link to={cashierPaths.bill(bill.id)} className="k-btn k-btn--ghost">
            Chi tiết hóa đơn
          </Link>
          {!paid && !livePayos && data.config.methods.PAYOS && (
            <Link to={cashierPaths.payment(bill.id)} className="k-btn k-btn--outline">
              Tạo QR payOS để in
            </Link>
          )}
          <button type="button" className="k-btn k-btn--primary" onClick={() => window.print()}>
            <Icon name="printer" />
            In
          </button>
        </div>
      </div>
      <p className="k-hint c-no-print">
        Bố cục cho giấy in nhiệt 80mm. Bấm In để mở hộp thoại in của trình duyệt và chọn máy in hóa
        đơn đã cài driver.
        {!paid && ' Phiếu tạm tính không thay cho hóa đơn thanh toán.'}
      </p>

      <article className="c-receipt" aria-label={paid ? 'Hóa đơn thanh toán' : 'Phiếu tạm tính'}>
        <header className="c-r-head">
          <p className="c-r-brand">{config.restaurantName}</p>
          {config.address && <p>{config.address}</p>}
          <p className="c-r-kind">{paid ? 'HÓA ĐƠN THANH TOÁN' : 'PHIẾU TẠM TÍNH'}</p>
          {!paid && <p className="c-r-flag">Chưa thanh toán</p>}
        </header>

        <dl className="c-r-meta">
          <div>
            <dt>Số HĐ</dt>
            <dd>{bill.code}</dd>
          </div>
          <div>
            <dt>Bàn</dt>
            <dd>
              {table.code} · {session.guests} khách
            </dd>
          </div>
          <div>
            <dt>{paid ? 'Thanh toán' : 'Giờ in'}</dt>
            <dd>
              {formatTime(at)} {formatDate(at)}
            </dd>
          </div>
          <div>
            <dt>Thu ngân</dt>
            <dd>{staffName(data, cashierId)}</dd>
          </div>
          <div>
            <dt>Phục vụ</dt>
            <dd>{view.waiterName}</dd>
          </div>
        </dl>

        <ul className="c-r-items">
          {[...lines.values()].map((line) => (
            <li key={`${line.name}:${line.unitPrice}`}>
              <span className="c-r-item">{line.name}</span>
              <span className="c-r-calc">
                {quantityLabel(line.quantity, line.unit)} × {formatAmount(line.unitPrice)}
              </span>
              <span className="c-r-amt">{formatAmount(line.quantity * line.unitPrice)}</span>
            </li>
          ))}
        </ul>

        <dl className="c-r-totals">
          <div>
            <dt>Tạm tính</dt>
            <dd>{formatAmount(t.subtotal)}</dd>
          </div>
          {t.discount > 0 && (
            <div>
              <dt>Giảm giá{bill.discount?.mode === 'PERCENT' ? ` ${bill.discount.value}%` : ''}</dt>
              <dd>-{formatAmount(t.discount)}</dd>
            </div>
          )}
          {config.serviceChargeRate ? (
            <div>
              <dt>Phí dịch vụ {config.serviceChargeRate / 100}%</dt>
              <dd>{formatAmount(t.serviceCharge)}</dd>
            </div>
          ) : null}
          {config.taxRate ? (
            <div>
              <dt>Thuế {config.taxRate / 100}%</dt>
              <dd>{formatAmount(t.tax)}</dd>
            </div>
          ) : null}
          <div className="c-r-grand">
            <dt>{paid ? 'TỔNG THANH TOÁN' : 'TỔNG CỘNG'}</dt>
            <dd>{formatVnd(t.total)}</dd>
          </div>
        </dl>

        {paid ? (
          <dl className="c-r-pay">
            {succeeded.map((p) => (
              <div key={p.id} className="c-r-paygroup">
                <div>
                  <dt>{METHOD_LABEL[p.method]}</dt>
                  <dd>{formatAmount(p.amount)}</dd>
                </div>
                {p.method === 'CASH' && (
                  <>
                    <div className="c-r-sub">
                      <dt>Khách đưa</dt>
                      <dd>{formatAmount(p.tendered ?? p.amount)}</dd>
                    </div>
                    <div className="c-r-sub">
                      <dt>Tiền thừa</dt>
                      <dd>{formatAmount(p.change ?? 0)}</dd>
                    </div>
                  </>
                )}
                {p.method !== 'CASH' && p.bankReference && (
                  <div className="c-r-sub">
                    <dt>Mã GD</dt>
                    <dd>{p.bankReference}</dd>
                  </div>
                )}
              </div>
            ))}
          </dl>
        ) : view.paid > 0 ? (
          <dl className="c-r-pay">
            <div>
              <dt>Đã thanh toán</dt>
              <dd>{formatAmount(view.paid)}</dd>
            </div>
            <div>
              <dt>Còn phải thu</dt>
              <dd>{formatAmount(view.remaining)}</dd>
            </div>
          </dl>
        ) : null}

        {!paid && livePayos?.qrCode && (
          <div className="c-r-qr">
            <QrCode value={livePayos.qrCode} label="Mã QR thanh toán payOS" size={160} />
            <p className="c-r-small">Quét mã bằng ứng dụng ngân hàng để thanh toán</p>
          </div>
        )}

        <footer className="c-r-foot">
          <p>Cảm ơn quý khách! Hẹn gặp lại.</p>
          <p className="c-r-small">
            {bill.code} · in lúc {formatTime(now)} {formatDate(now)}
          </p>
        </footer>
      </article>
    </div>
  )
}
