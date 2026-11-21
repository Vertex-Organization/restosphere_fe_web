import { useState } from 'react'
import { METHOD_LABEL, REQUEST_TYPE_LABEL, TABLE_STATUS_LABEL } from '../../../api/billing/labels'
import { formatAmount, formatVnd } from '../../../api/billing/money'
import {
  adjustmentBlock,
  billView,
  discountBlock,
  hasPermission,
  paymentBlock,
  staffName,
} from '../../../api/billing/selectors'
import { AdjustmentDialog, DiscountDialog } from '../../../components/billing/BillDialogs'
import { BillLines, BillTotals } from '../../../components/billing/BillParts'
import { Icon } from '../../../components/billing/Icon'
import {
  Alert,
  BillStatusBadge,
  PaymentStatusBadge,
  RequestStatusBadge,
} from '../../../components/billing/ui'
import { formatDate, formatTime } from '../../../components/kitchen/format'
import { KitchenLink as Link } from '../../../components/kitchen/KitchenLink'
import { useCashierSnapshot } from '../../../hooks/billing/cashierDataContext'
import { cashierPaths } from '../../../routes/cashierRouter'

const when = (iso?: string) => (iso ? `${formatTime(iso)} · ${formatDate(iso)}` : '—')

export default function CashierBillPage({ id }: { id: string }) {
  const { data, user } = useCashierSnapshot()
  const [dialog, setDialog] = useState<
    { kind: 'discount' } | { kind: 'adjust'; itemId: string } | null
  >(null)
  const view = billView(data, id)

  if (!view) {
    return (
      <div className="c-empty">
        <p>Không tìm thấy hóa đơn.</p>
        <Link to={cashierPaths.pos} className="k-btn k-btn--primary">
          Về quầy thu ngân
        </Link>
      </div>
    )
  }

  const { bill, table, session } = view
  const block = paymentBlock(data, view, user)
  const discountReason = discountBlock(view, user)
  const adjustReason = adjustmentBlock(view, user)
  const paid = bill.status === 'PAID'
  const canPay = !block || block.code === 'TRANSFER_PENDING'

  return (
    <div className="c-bill-page">
      <div className="c-page-bar">
        <Link to={cashierPaths.posBill(bill.id)} className="k-back">
          <Icon name="chevronLeft" />
          Quầy
        </Link>
        <h2 className="c-page-title">Bàn {table.code}</h2>
        <BillStatusBadge status={bill.status} />
        <span className="c-bill-code">{bill.code}</span>
        <div className="c-page-actions">
          {!paid && (
            <button
              type="button"
              className="k-btn"
              disabled={!!discountReason}
              title={discountReason || undefined}
              onClick={() => setDialog({ kind: 'discount' })}
            >
              <Icon name="percent" />
              Giảm giá
            </button>
          )}
          {hasPermission(user, paid ? 'receipts.print' : 'bills.prepare') && (
            <Link to={cashierPaths.receipt(bill.id)} className="k-btn">
              <Icon name="printer" />
              {paid ? 'In hóa đơn' : 'In tạm tính'}
            </Link>
          )}
          {!paid &&
            (canPay ? (
              <Link to={cashierPaths.payment(bill.id)} className="k-btn k-btn--primary">
                Thanh toán {formatVnd(view.remaining)}
              </Link>
            ) : (
              <button type="button" className="k-btn k-btn--primary" disabled title={block?.text}>
                Thanh toán
              </button>
            ))}
        </div>
      </div>
      {block && !paid && block.code !== 'TRANSFER_PENDING' && (
        <Alert tone="warning" icon="info">
          {block.text}
        </Alert>
      )}

      <div className="c-bill-layout">
        <section className="c-card c-card--flush">
          <div className="c-card-bar">
            <h3 className="c-card-title">Món đã gọi</h3>
            <span className="k-muted c-small">
              {view.rounds.length} lượt gọi · {view.dishCount} món
            </span>
          </div>
          <BillLines
            view={view}
            menu={data.menu}
            action={
              adjustReason
                ? undefined
                : (itemId) => (
                    <button
                      type="button"
                      className="c-link-btn"
                      onClick={() => setDialog({ kind: 'adjust', itemId })}
                    >
                      Điều chỉnh
                    </button>
                  )
            }
          />
          <div className="c-bill-page-total">
            <BillTotals bill={bill} config={data.config} paid={paid ? 0 : view.paid} />
            <div className="c-due">
              <span className="c-due-label">{paid ? 'Đã thanh toán' : 'Còn phải thu'}</span>
              <span className={paid ? 'c-due-amount c-due-amount--paid' : 'c-due-amount'}>
                {formatVnd(paid ? bill.totals.total : view.remaining)}
              </span>
            </div>
          </div>
        </section>

        <div className="c-bill-aside">
          <section className="c-card">
            <div className="c-facts c-facts--flat">
              <div>
                <span>Khách</span>
                <b>{session.guests}</b>
              </div>
              <div>
                <span>Phục vụ</span>
                <b>{view.waiterName}</b>
              </div>
              <div>
                <span>Mở bàn</span>
                <b>{formatTime(session.openedAt)}</b>
              </div>
              <div>
                <span>Bàn</span>
                <b>{TABLE_STATUS_LABEL[table.status]}</b>
              </div>
            </div>
          </section>

          <section className="c-card">
            <h3 className="c-card-title">Giao dịch</h3>
            {view.payments.length ? (
              <ul className="c-mini-list">
                {view.payments.map((p) => (
                  <li key={p.id}>
                    <Icon name={p.method === 'CASH' ? 'cash' : 'bank'} size={15} />
                    <Link to={cashierPaths.transaction(p.id)} className="k-link k-mono">
                      {p.code}
                    </Link>
                    <span className="k-muted">
                      {METHOD_LABEL[p.method]} · {formatTime(p.createdAt)}
                    </span>
                    <b>{formatAmount(p.amount)}</b>
                    <PaymentStatusBadge status={p.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="k-muted c-small">Chưa có giao dịch.</p>
            )}
          </section>

          {view.requests.length > 0 && (
            <section className="c-card">
              <h3 className="c-card-title">Yêu cầu</h3>
              <ul className="c-mini-list">
                {view.requests.map((r) => (
                  <li key={r.id}>
                    <Link to={cashierPaths.request(r.id)} className="k-link">
                      {r.code}
                    </Link>
                    <span className="k-muted">{REQUEST_TYPE_LABEL[r.type]}</span>
                    <RequestStatusBadge status={r.status} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          <details className="c-card c-disclosure">
            <summary>Lịch sử hóa đơn ({bill.history.length})</summary>
            <ol className="c-history">
              {[...bill.history].reverse().map((event, i) => (
                <li key={`${event.at}-${i}`}>
                  <span className="k-mono k-muted">{formatTime(event.at)}</span>
                  <span>
                    {event.text}
                    <span className="k-muted"> · {staffName(data, event.by)}</span>
                  </span>
                </li>
              ))}
            </ol>
          </details>

          <details className="c-card c-disclosure">
            <summary>Mã tham chiếu</summary>
            <dl className="k-dl c-dl-ids">
              <dt>Bill ID</dt>
              <dd className="k-mono">{bill.id}</dd>
              <dt>TableSession</dt>
              <dd className="k-mono">{session.id}</dd>
              <dt>Table ID</dt>
              <dd className="k-mono">{table.id}</dd>
              <dt>Order</dt>
              <dd className="k-mono">
                {view.rounds.map(({ order }) => `${order.id} (lượt ${order.sequence})`).join(', ')}
              </dd>
              <dt>Tạo hóa đơn</dt>
              <dd>{when(bill.createdAt)}</dd>
              <dt>Yêu cầu TT</dt>
              <dd>{when(bill.requestedAt)}</dd>
              <dt>Thanh toán đủ</dt>
              <dd>{when(bill.paidAt)}</dd>
            </dl>
          </details>
        </div>
      </div>

      {dialog?.kind === 'discount' && (
        <DiscountDialog
          view={view}
          user={user}
          config={data.config}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.kind === 'adjust' && (
        <AdjustmentDialog view={view} itemId={dialog.itemId} onClose={() => setDialog(null)} />
      )}
    </div>
  )
}
