import { useState } from 'react'
import { formatVnd } from '../../../api/billing/money'
import { billView } from '../../../api/billing/selectors'
import type { CashierNotification, CashierNotificationKind } from '../../../api/billing/types'
import {
  buildDayView,
  filterByRange,
  NOTIFICATION_PAGE_SIZE,
  type NotifyRange,
} from '../../../api/kitchen/dayGroups'
import { notificationTitle } from '../../../api/kitchen/labels'
import { notificationLine } from '../../../api/kitchen/notifications'
import { minutesBetween } from '../../../api/kitchen/selectors'
import { ago } from '../../../components/billing/format'
import { Icon } from '../../../components/billing/Icon'
import { cashierNotificationPresentation } from '../../../components/billing/notificationPresentation'
import { BillStatusBadge } from '../../../components/billing/ui'
import { formatTime } from '../../../components/kitchen/format'
import { KitchenFilters } from '../../../components/kitchen/KitchenFilters'
import { KitchenLink as Link } from '../../../components/kitchen/KitchenLink'
import { useCashierSnapshot } from '../../../hooks/billing/cashierDataContext'
import { useNow } from '../../../hooks/kitchen/useNow'
import { cashierPaths, navigate } from '../../../routes/cashierRouter'

type Filter = 'all' | 'unread' | 'payment' | 'error' | 'request'
const FILTERS: { id: Filter; label: string; kinds?: CashierNotificationKind[] }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'unread', label: 'Chưa đọc' },
  {
    id: 'payment',
    label: 'Thanh toán',
    kinds: ['PAYMENT_REQUEST', 'PAYMENT_REQUEST_WITHDRAWN', 'TRANSFER_RECEIVED'],
  },
  { id: 'error', label: 'Lỗi', kinds: ['TRANSFER_FAILED'] },
  { id: 'request', label: 'Yêu cầu', kinds: ['REQUEST_DECIDED'] },
]

/** The one thing a cashier usually does next with this notification. */
function quickAction(n: CashierNotification): { label: string; to: string } | null {
  if (n.kind === 'REQUEST_DECIDED' && n.requestId)
    return { label: 'Xem yêu cầu', to: cashierPaths.request(n.requestId) }
  if (n.kind === 'TRANSFER_FAILED' && n.billId)
    return { label: 'Thu lại', to: cashierPaths.payment(n.billId) }
  if (n.billId) return { label: 'Mở hóa đơn', to: cashierPaths.posBill(n.billId) }
  return null
}

export default function CashierNotificationsPage({ selectedId }: { selectedId: string }) {
  const { data, user, run } = useCashierSnapshot()
  const now = useNow()
  const [filter, setFilter] = useState<Filter>('all')
  const [range, setRange] = useState<NotifyRange>('today')
  const [limit, setLimit] = useState(NOTIFICATION_PAGE_SIZE)
  const isUnread = (n: CashierNotification) => !n.readBy.includes(user.id)

  const all = [...data.notifications].sort((a, b) => b.at.localeCompare(a.at))
  const inRange = filterByRange(all, now, range)
  const unread = inRange.filter(isUnread).length
  const pass = (n: CashierNotification, f: Filter) => {
    const def = FILTERS.find((x) => x.id === f)!
    return f === 'all' ? true : f === 'unread' ? isUnread(n) : def.kinds!.includes(n.kind)
  }
  const list = inRange.filter((n) => pass(n, filter))
  const selected = all.find((n) => n.id === selectedId) ?? list[0]
  const { groups, total, shown } = buildDayView(list, now, range, limit)
  const changeRange = (next: NotifyRange) => {
    setRange(next)
    setLimit(NOTIFICATION_PAGE_SIZE)
  }
  const changeFilter = (next: Filter) => {
    setFilter(next)
    setLimit(NOTIFICATION_PAGE_SIZE)
  }

  const markRead = (n: CashierNotification) => {
    if (isUnread(n))
      void run({ type: 'read-notifications', ids: [n.id] }, [`notif:${n.id}`], { quiet: true })
  }
  const select = (n: CashierNotification) => {
    markRead(n)
    navigate(`${cashierPaths.notifications}?id=${encodeURIComponent(n.id)}`, { replace: true })
  }

  return (
    <div className="c-split c-split--notes" data-view={selectedId ? 'detail' : 'list'}>
      <section className="c-card c-split-list" aria-label="Danh sách thông báo">
        <div className="c-split-tools c-split-tools--row">
          <div className="c-tabs c-tabs--scroll" role="tablist" aria-label="Lọc thông báo">
            {FILTERS.map((f) => {
              const count = f.id === 'unread' ? unread : 0
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  className="c-tab"
                  aria-selected={filter === f.id}
                  onClick={() => changeFilter(f.id)}
                >
                  {f.label}
                  {count > 0 && <span className="c-tab-count">{count}</span>}
                </button>
              )
            })}
          </div>
          <button
            type="button"
            className="k-btn k-btn--ghost k-icon-btn"
            title="Đánh dấu tất cả đã đọc"
            aria-label="Đánh dấu tất cả đã đọc"
            disabled={!unread}
            onClick={() => {
              void run({ type: 'read-notifications' }, ['notif:all'])
            }}
          >
            <Icon name="check" />
          </button>
        </div>
        <div className="c-notes-range">
          <KitchenFilters
            label="Khoảng thời gian"
            value={range}
            onChange={changeRange}
            options={[
              { value: 'today', label: 'Hôm nay' },
              { value: '3days', label: '3 ngày' },
            ]}
          />
        </div>

        {groups.length > 0 ? (
          <div className="c-notes">
            {groups.map((g) => (
              <section key={g.id}>
                {range === '3days' && <h4 className="c-notes-group">{g.label}</h4>}
                <ul>
                  {g.items.map((n) => {
                    const unreadNow = isUnread(n)
                    return (
                      <li
                        key={n.id}
                        className={[
                          'c-note',
                          unreadNow ? 'c-note--unread' : 'c-note--read',
                          n.id === selected?.id ? 'c-note--current' : '',
                        ]
                          .join(' ')
                          .trim()}
                      >
                        <button
                          type="button"
                          className="c-note-main"
                          onClick={() => select(n)}
                          aria-current={n.id === selected?.id ? 'true' : undefined}
                        >
                          <span className="c-note-dot" aria-hidden="true" />
                          <span className="c-note-line">
                            {unreadNow && <span className="k-visually-hidden">Chưa đọc: </span>}
                            {notificationLine(notificationTitle(n.kind, n.title), n.body)}
                          </span>
                          <time className="c-note-time" dateTime={n.at}>
                            {formatTime(n.at)}
                          </time>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))}
            {shown < total && (
              <button
                type="button"
                className="k-btn k-btn--ghost c-notes-more"
                onClick={() => setLimit((value) => value + NOTIFICATION_PAGE_SIZE)}
              >
                Xem thêm ({total - shown})
              </button>
            )}
          </div>
        ) : (
          <div className="c-empty">
            <Icon name="inbox" size={22} />
            <p>{filter === 'unread' ? 'Đã đọc hết thông báo.' : 'Không có thông báo.'}</p>
          </div>
        )}
      </section>

      <section className="c-card c-split-detail" aria-label="Chi tiết thông báo">
        {selected ? (
          <NoteDetail note={selected} now={now} />
        ) : (
          <div className="c-empty">
            <Icon name="bell" size={22} />
            <p>Chọn một thông báo để xem chi tiết.</p>
          </div>
        )}
      </section>
    </div>
  )
}

function NoteDetail({ note: n, now }: { note: CashierNotification; now: number }) {
  const { data } = useCashierSnapshot()
  const look = cashierNotificationPresentation(n.kind)
  const view = n.billId ? billView(data, n.billId) : null
  const payment = n.paymentId ? data.payments.find((p) => p.id === n.paymentId) : undefined
  const action = quickAction(n)

  return (
    <div className="c-detail-pane">
      <Link to={cashierPaths.notifications} className="k-back c-split-back">
        <Icon name="chevronLeft" />
        Danh sách
      </Link>
      <header className="c-detail-head">
        <span className={`c-icon-box c-icon-box--lg c-icon-box--${look.tone}`}>
          <Icon name={look.icon} size={20} />
        </span>
        <div className="c-detail-heading">
          <span className="c-detail-kicker">
            {look.label} · {formatTime(n.at)} ({ago(minutesBetween(n.at, now))})
          </span>
          <h2 className="c-detail-title">{notificationTitle(n.kind, n.title)}</h2>
        </div>
      </header>
      <p className="c-detail-body">{n.body}</p>

      {view && (
        <div className="c-context">
          <div className="c-context-head">
            <b>Bàn {view.table.code}</b>
            <span className="k-muted">{view.bill.code}</span>
            <BillStatusBadge status={view.bill.status} />
          </div>
          <div className="c-facts c-facts--flat">
            <div>
              <span>Tổng hóa đơn</span>
              <b>{formatVnd(view.bill.totals.total)}</b>
            </div>
            <div>
              <span>{view.bill.status === 'PAID' ? 'Đã thu' : 'Còn phải thu'}</span>
              <b>{formatVnd(view.bill.status === 'PAID' ? view.paid : view.remaining)}</b>
            </div>
            {payment && (
              <div>
                <span>Giao dịch</span>
                <b>
                  <Link to={cashierPaths.transaction(payment.id)} className="k-link">
                    {payment.code}
                  </Link>
                </b>
              </div>
            )}
          </div>
        </div>
      )}

      {action && (
        <div className="c-detail-actions">
          <Link to={action.to} className="k-btn k-btn--primary">
            {action.label}
            <Icon name="arrowRight" />
          </Link>
        </div>
      )}
    </div>
  )
}
