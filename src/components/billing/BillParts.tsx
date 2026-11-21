import type { ReactNode } from 'react'
import { ITEM_STATUS_LABEL } from '../../api/billing/labels'
import { formatAmount, formatVnd, isBillable, lineTotal } from '../../api/billing/money'
import type { BillView } from '../../api/billing/selectors'
import type { Bill, BillingConfig, MenuEntry } from '../../api/billing/types'
import { formatTime } from '../kitchen/format'
import { DishThumb } from './ui'

/**
 * Dishes of a bill. Ordering rounds are only labelled when there is more than
 * one; cancelled lines stay visible (struck through) but are not billed.
 */
export function BillLines({
  view,
  menu,
  compact,
  action,
}: {
  view: BillView
  menu: MenuEntry[]
  /** Payment summary: no photos, one line per dish. */
  compact?: boolean
  /** Optional trailing control per billable line (e.g. "request removal"). */
  action?: (itemId: string) => ReactNode
}) {
  const photos = new Map(menu.map((m) => [m.id, m.imageUrl]))
  const labelRounds = view.rounds.length > 1
  return (
    <div className={compact ? 'c-lines c-lines--compact' : 'c-lines'}>
      {view.rounds.map(({ order, items }) => (
        <section key={order.id} aria-label={`Lượt ${order.sequence}`}>
          {labelRounds && (
            <h4 className="c-lines-round">
              Lượt {order.sequence} · {formatTime(order.submittedAt)}
            </h4>
          )}
          <ul>
            {items.map((item) => {
              const cancelled = !isBillable(item)
              const pending = !cancelled && item.status !== 'SERVED'
              return (
                <li key={item.id} className={cancelled ? 'c-line c-line--off' : 'c-line'}>
                  {!compact && <DishThumb url={photos.get(item.menuItemId)} />}
                  <div className="c-line-main">
                    <span className="c-line-name">
                      <b className="c-line-qty">{item.quantity}×</b>
                      {item.name}
                      {pending && (
                        <span
                          className={`c-line-flag c-line-flag--${item.status === 'PREPARING' || item.status === 'READY' ? 'warning' : 'info'}`}
                        >
                          {ITEM_STATUS_LABEL[item.status]}
                        </span>
                      )}
                    </span>
                    {!compact && (
                      <span className="c-line-sub">
                        {formatAmount(item.unitPrice)}
                        {item.note && <span className="c-line-note"> · {item.note}</span>}
                        {cancelled && (
                          <span className="c-line-cancel">
                            {' '}
                            · {item.cancellationReason ?? ITEM_STATUS_LABEL[item.status]}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                  <span className="c-line-total">
                    {cancelled ? ITEM_STATUS_LABEL[item.status] : formatAmount(lineTotal(item))}
                  </span>
                  {action && (
                    <span className="c-line-action">{cancelled ? null : action(item.id)}</span>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}

const rate = (basisPoints: number) => `${basisPoints / 100}%`

/** Subtotal and adjustments. Charges the restaurant has not configured are not shown. */
export function BillTotals({
  bill,
  config,
  paid = 0,
  discountAction,
}: {
  bill: Bill
  config: BillingConfig
  paid?: number
  discountAction?: ReactNode
}) {
  const t = bill.totals
  const d = bill.discount
  return (
    <dl className="c-totals">
      <div>
        <dt>Tạm tính</dt>
        <dd>{formatVnd(t.subtotal)}</dd>
      </div>
      <div className={d ? 'c-totals-discount' : 'c-totals-muted'}>
        <dt title={d ? `${d.reason}${d.requestId ? ' · Quản lý đã duyệt' : ''}` : undefined}>
          Giảm giá{d?.mode === 'PERCENT' ? ` ${d.value}%` : ''}
          {discountAction}
        </dt>
        <dd>{t.discount ? `−${formatVnd(t.discount)}` : '0đ'}</dd>
      </div>
      {config.serviceChargeRate ? (
        <div>
          <dt>Phí dịch vụ {rate(config.serviceChargeRate)}</dt>
          <dd>{formatVnd(t.serviceCharge)}</dd>
        </div>
      ) : null}
      {config.taxRate ? (
        <div>
          <dt>Thuế {rate(config.taxRate)}</dt>
          <dd>{formatVnd(t.tax)}</dd>
        </div>
      ) : null}
      {paid > 0 && (
        <>
          <div className="c-totals-sum">
            <dt>Tổng hóa đơn</dt>
            <dd>{formatVnd(t.total)}</dd>
          </div>
          <div className="c-totals-paid">
            <dt>Đã thu</dt>
            <dd>−{formatVnd(paid)}</dd>
          </div>
        </>
      )}
    </dl>
  )
}
