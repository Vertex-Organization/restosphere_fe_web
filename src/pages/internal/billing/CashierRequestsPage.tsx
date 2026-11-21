import { useState } from 'react'
import { METHOD_LABEL, REQUEST_TYPE_LABEL } from '../../../api/billing/labels'
import { formatVnd } from '../../../api/billing/money'
import { billView, staffName } from '../../../api/billing/selectors'
import type { CashierData, CashierRequest, RequestType } from '../../../api/billing/types'
import { minutesBetween } from '../../../api/kitchen/selectors'
import { ago } from '../../../components/billing/format'
import { Icon, type IconName } from '../../../components/billing/Icon'
import { RequestStatusBadge } from '../../../components/billing/ui'
import { formatDate, formatTime, shortCode } from '../../../components/kitchen/format'
import { KitchenLink as Link } from '../../../components/kitchen/KitchenLink'
import { useCashierSnapshot } from '../../../hooks/billing/cashierDataContext'
import { useNow } from '../../../hooks/kitchen/useNow'
import { cashierPaths, navigate } from '../../../routes/cashierRouter'

type Tab = 'pending' | 'done' | 'all'
const TABS: { id: Tab; label: string }[] = [
  { id: 'pending', label: 'Chờ duyệt' },
  { id: 'done', label: 'Đã xử lý' },
  { id: 'all', label: 'Tất cả' },
]

const TYPE_LOOK: Record<RequestType, { icon: IconName; tone: string }> = {
  DISCOUNT: { icon: 'percent', tone: 'primary' },
  BILL_ADJUSTMENT: { icon: 'edit', tone: 'info' },
  PAYMENT_VOID: { icon: 'undo', tone: 'danger' },
}

const inTab = (r: CashierRequest, tab: Tab) =>
  tab === 'all' ? true : tab === 'pending' ? r.status === 'PENDING' : r.status !== 'PENDING'

/** One-line summary of what is asked, e.g. "Giảm 15% · 151.050đ". */
function headline(data: CashierData, r: CashierRequest) {
  if (r.type === 'DISCOUNT' && r.discount) {
    return `Giảm ${r.discount.mode === 'PERCENT' ? `${r.discount.value}% · ` : ''}${formatVnd(r.discount.amount)}`
  }
  if (r.type === 'BILL_ADJUSTMENT') {
    const item = data.items.find((i) => i.id === r.itemId)
    return item ? `Bỏ ${item.quantity}× ${item.name}` : 'Bỏ một món khỏi hóa đơn'
  }
  const payment = data.payments.find((p) => p.id === r.paymentId)
  return payment
    ? `Hủy ${METHOD_LABEL[payment.method].toLowerCase()} ${formatVnd(payment.amount)}`
    : 'Hủy thanh toán'
}

export default function CashierRequestsPage({ selectedId }: { selectedId: string }) {
  const { data } = useCashierSnapshot()
  const now = useNow()
  const [tab, setTab] = useState<Tab>(() =>
    selectedId || !data.requests.some((r) => r.status === 'PENDING') ? 'all' : 'pending',
  )

  const tableOf = (billId: string) => billView(data, billId)?.table.code ?? '—'
  const counts = Object.fromEntries(
    TABS.map((t) => [t.id, data.requests.filter((r) => inTab(r, t.id)).length]),
  ) as Record<Tab, number>
  const rows = data.requests
    .filter((r) => inTab(r, tab))
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))
  const selected = data.requests.find((r) => r.id === selectedId) ?? rows[0]
  const select = (id: string) => navigate(cashierPaths.request(id), { replace: true })

  return (
    <div className="c-split" data-view={selectedId ? 'detail' : 'list'}>
      <section className="c-card c-split-list" aria-label="Danh sách yêu cầu">
        <div className="c-split-tools">
          <div className="c-tabs" role="tablist" aria-label="Lọc yêu cầu">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                className="c-tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
              >
                {t.label}
                <span className="c-tab-count">{counts[t.id]}</span>
              </button>
            ))}
          </div>
        </div>
        {rows.length ? (
          <ul className="c-cards">
            {rows.map((r) => {
              const look = TYPE_LOOK[r.type]
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    className={
                      r.status === 'PENDING' ? 'c-item-card c-item-card--attention' : 'c-item-card'
                    }
                    aria-current={r.id === selected?.id ? 'true' : undefined}
                    onClick={() => select(r.id)}
                  >
                    <span className={`c-icon-box c-icon-box--${look.tone}`}>
                      <Icon name={look.icon} size={16} />
                    </span>
                    <span className="c-item-card-main">
                      <span className="c-item-card-title">{headline(data, r)}</span>
                      <span className="c-item-card-sub">
                        Bàn {tableOf(r.billId)} · {REQUEST_TYPE_LABEL[r.type]} ·{' '}
                        {ago(minutesBetween(r.requestedAt, now))}
                      </span>
                    </span>
                    <RequestStatusBadge status={r.status} />
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="c-empty">
            <Icon name="checkCircle" size={22} />
            <p>{tab === 'pending' ? 'Không có yêu cầu nào đang chờ duyệt.' : 'Chưa có yêu cầu.'}</p>
          </div>
        )}
      </section>

      <section className="c-card c-split-detail" aria-label="Chi tiết yêu cầu">
        {selected ? (
          <RequestDetail key={selected.id} request={selected} />
        ) : (
          <div className="c-empty">
            <Icon name="clipboard" size={22} />
            <p>Chọn một yêu cầu để xem chi tiết.</p>
          </div>
        )}
      </section>
    </div>
  )
}

function RequestDetail({ request: r }: { request: CashierRequest }) {
  const { data, user, run, isPending } = useCashierSnapshot()
  const view = billView(data, r.billId)
  const look = TYPE_LOOK[r.type]
  const decided = r.status === 'APPROVED' || r.status === 'REJECTED'

  return (
    <div className="c-detail-pane">
      <Link to={cashierPaths.requests} className="k-back c-split-back">
        <Icon name="chevronLeft" />
        Danh sách
      </Link>
      <header className="c-detail-head">
        <span className={`c-icon-box c-icon-box--lg c-icon-box--${look.tone}`}>
          <Icon name={look.icon} size={20} />
        </span>
        <div className="c-detail-heading">
          <span className="c-detail-kicker">
            {REQUEST_TYPE_LABEL[r.type]} · {shortCode(r.code)}
          </span>
          <h2 className="c-detail-title">{headline(data, r)}</h2>
        </div>
        <RequestStatusBadge status={r.status} />
      </header>

      {view && (
        <div className="c-facts">
          <div>
            <span>Bàn</span>
            <b>{view.table.code}</b>
          </div>
          <div>
            <span>Hóa đơn</span>
            <b>
              <Link to={cashierPaths.posBill(view.bill.id)} className="k-link">
                {view.bill.code}
              </Link>
            </b>
          </div>
          {r.discount ? (
            <>
              <div>
                <span>Tạm tính</span>
                <b>{formatVnd(view.bill.totals.subtotal)}</b>
              </div>
              <div>
                <span>Sau giảm</span>
                <b>{formatVnd(view.bill.totals.subtotal - r.discount.amount)}</b>
              </div>
            </>
          ) : (
            <div>
              <span>Tổng hóa đơn</span>
              <b>{formatVnd(view.bill.totals.total)}</b>
            </div>
          )}
        </div>
      )}

      <blockquote className="c-quote">
        <span>Lý do</span>
        {r.reason}
      </blockquote>

      <ol className="c-timeline">
        <li className="c-tl c-tl--done">
          <b>Gửi yêu cầu</b>
          <span>
            {staffName(data, r.requestedBy)} · {formatTime(r.requestedAt)}{' '}
            {formatDate(r.requestedAt).slice(0, 5)}
          </span>
        </li>
        {r.status === 'PENDING' && (
          <li className="c-tl c-tl--current">
            <b>Chờ Quản lý duyệt</b>
            <span>Thu ngân không tự duyệt yêu cầu của mình.</span>
          </li>
        )}
        {decided && (
          <li className={r.status === 'APPROVED' ? 'c-tl c-tl--done' : 'c-tl c-tl--rejected'}>
            <b>{r.status === 'APPROVED' ? 'Quản lý đã duyệt' : 'Quản lý từ chối'}</b>
            <span>
              {staffName(data, r.decidedBy)} · {r.decidedAt ? formatTime(r.decidedAt) : ''}
            </span>
            {r.decisionNote && <q>{r.decisionNote}</q>}
          </li>
        )}
        {r.status === 'WITHDRAWN' && (
          <li className="c-tl c-tl--muted">
            <b>Đã rút yêu cầu</b>
            <span>
              {staffName(data, r.decidedBy)} · {r.decidedAt ? formatTime(r.decidedAt) : ''}
            </span>
          </li>
        )}
      </ol>

      <div className="c-detail-actions">
        {view && (
          <Link to={cashierPaths.posBill(view.bill.id)} className="k-btn">
            <Icon name="receipt" />
            Mở hóa đơn
          </Link>
        )}
        {r.status === 'PENDING' && r.requestedBy === user.id && (
          <button
            type="button"
            className="k-btn k-btn--danger"
            disabled={isPending(`request:${r.id}`)}
            onClick={() => {
              void run({ type: 'withdraw-request', requestId: r.id }, [`request:${r.id}`])
            }}
          >
            <Icon name="undo" />
            Rút yêu cầu
          </button>
        )}
      </div>
    </div>
  )
}
