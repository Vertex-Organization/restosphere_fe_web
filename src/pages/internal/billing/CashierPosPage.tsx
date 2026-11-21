import { useDeferredValue, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { formatVnd } from '../../../api/billing/money'
import {
  billView,
  discountBlock,
  hasPermission,
  matchesFilter,
  paymentBlock,
  posRows,
  type BillView,
  type PosFilter,
  type PosRow,
} from '../../../api/billing/selectors'
import { minutesBetween } from '../../../api/kitchen/selectors'
import { DiscountDialog } from '../../../components/billing/BillDialogs'
import { BillLines, BillTotals } from '../../../components/billing/BillParts'
import { shortDuration } from '../../../components/billing/format'
import { Icon, type IconName } from '../../../components/billing/Icon'
import { Alert, BillStatusBadge, Dialog } from '../../../components/billing/ui'
import { formatTime, searchable } from '../../../components/kitchen/format'
import { ReasonHint } from '../../../components/kitchen/ReasonHint'
import { KitchenLink as Link } from '../../../components/kitchen/KitchenLink'
import { useCashierSnapshot } from '../../../hooks/billing/cashierDataContext'
import { useNow } from '../../../hooks/kitchen/useNow'
import { cashierPaths, navigate } from '../../../routes/cashierRouter'

// The search box looks across every status, so "Tất cả" is not needed as a tab.
const TABS: { id: PosFilter; label: string }[] = [
  { id: 'due', label: 'Chờ thanh toán' },
  { id: 'serving', label: 'Đang phục vụ' },
  { id: 'paid', label: 'Đã thanh toán' },
]

/** Minutes a payment request may wait before its tile turns red. */
const WAIT_LATE = 10

type Tone = 'warning' | 'danger' | 'info' | 'success' | 'muted'

interface TileLook {
  tone: Tone
  icon: IconName
  text: string
  time: string
  timeTone: Tone
}

function tileLook(row: PosRow, now: number): TileLook {
  if (row.status === 'PAID') {
    return row.guestLeft
      ? {
          tone: 'muted',
          icon: 'check',
          text: 'Khách đã rời',
          time: row.paidAt ? formatTime(row.paidAt) : '',
          timeTone: 'muted',
        }
      : {
          tone: 'success',
          icon: 'checkCircle',
          text: 'Đã thanh toán',
          time: row.paidAt ? formatTime(row.paidAt) : '',
          timeTone: 'muted',
        }
  }
  if (row.status === 'UNPAID') {
    const open = shortDuration(minutesBetween(row.openedAt, now))
    return row.unserved
      ? {
          tone: 'info',
          icon: 'clock',
          text: `${row.unserved} món chưa ra`,
          time: open,
          timeTone: 'muted',
        }
      : { tone: 'info', icon: 'utensils', text: 'Đang phục vụ', time: open, timeTone: 'muted' }
  }
  const waited = minutesBetween(row.requestedAt, now)
  const time = shortDuration(waited)
  const timeTone: Tone = waited >= WAIT_LATE ? 'danger' : 'warning'
  if (row.transferFailed)
    return { tone: 'danger', icon: 'xCircle', text: 'Chuyển khoản lỗi', time, timeTone }
  if (row.requestPending)
    return { tone: 'warning', icon: 'hourglass', text: 'Chờ QL duyệt', time, timeTone }
  if (row.transferPending)
    return { tone: 'info', icon: 'bank', text: 'Chờ tiền CK', time, timeTone }
  return { tone: 'warning', icon: 'receipt', text: 'Chờ thanh toán', time, timeTone }
}

export default function CashierPosPage({ selectedId }: { selectedId: string }) {
  const { data } = useCashierSnapshot()
  const now = useNow()
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<PosFilter>('due')
  const search = useRef<HTMLInputElement>(null)
  const grid = useRef<HTMLDivElement>(null)
  // Typing stays responsive; the tiles filter on the deferred value.
  const needle = searchable(useDeferredValue(query).trim())

  const rows = posRows(data, now)
  const counts = Object.fromEntries(
    TABS.map((t) => [t.id, rows.filter((r) => matchesFilter(r, t.id)).length]),
  ) as Record<PosFilter, number>
  const visible = rows.filter((r) =>
    needle ? searchable(r.search).includes(needle) : matchesFilter(r, tab),
  )
  const shownId =
    selectedId && data.bills.some((b) => b.id === selectedId)
      ? selectedId
      : (visible[0]?.billId ?? '')

  const select = (billId: string) => navigate(cashierPaths.posBill(billId), { replace: true })

  // "/" jumps to the search box from anywhere on the counter screen.
  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return
      if (
        (event.target as HTMLElement).closest(
          'input, textarea, select, [contenteditable="true"], dialog',
        )
      )
        return
      event.preventDefault()
      search.current?.focus()
      search.current?.select()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const onGridKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
    if (!step) return
    event.preventDefault()
    const index = visible.findIndex((r) => r.billId === shownId)
    const next = visible[Math.min(visible.length - 1, Math.max(0, index + step))]
    if (!next) return
    select(next.billId)
    grid.current?.querySelector<HTMLButtonElement>(`[data-bill="${next.billId}"]`)?.focus()
  }

  return (
    <div className="c-pos" data-view={selectedId ? 'detail' : 'list'}>
      <section className="c-pos-list" aria-label="Bàn và hóa đơn">
        <div className="c-pos-tools">
          <label className="k-search c-pos-search">
            <Icon name="search" size={15} />
            <span className="k-visually-hidden">Tìm bàn hoặc mã hóa đơn</span>
            <input
              ref={search}
              className="k-input"
              type="search"
              placeholder="Tìm bàn hoặc mã hóa đơn"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && visible[0]) select(visible[0].billId)
                if (e.key === 'Escape') setQuery('')
              }}
            />
            <kbd className="c-kbd" aria-hidden="true">
              /
            </kbd>
          </label>
          <div className="c-tabs" role="tablist" aria-label="Trạng thái">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                className="c-tab"
                aria-selected={!needle && tab === t.id}
                onClick={() => {
                  setTab(t.id)
                  setQuery('')
                }}
              >
                {t.label}
                <span className="c-tab-count">{counts[t.id]}</span>
              </button>
            ))}
          </div>
        </div>

        {visible.length ? (
          <div ref={grid} className="c-tiles" onKeyDown={onGridKey}>
            {visible.map((row) => {
              const look = tileLook(row, now)
              const amount = row.status === 'PAID' ? row.total : row.remaining
              return (
                <button
                  key={row.billId}
                  type="button"
                  data-bill={row.billId}
                  className={`c-tile c-tile--${look.tone}`}
                  aria-current={row.billId === shownId ? 'true' : undefined}
                  onClick={() => select(row.billId)}
                  aria-label={`Bàn ${row.tableCode}, ${look.text}, ${formatVnd(amount)}`}
                >
                  <span className="c-tile-top">
                    <span className="c-tile-table">{row.tableCode}</span>
                    {look.time && (
                      <span className={`c-tile-time c-tile-time--${look.timeTone}`}>
                        {look.time}
                      </span>
                    )}
                  </span>
                  <span className="c-tile-amount">{formatVnd(amount)}</span>
                  <span className="c-tile-state">
                    <Icon name={look.icon} size={13} />
                    {look.text}
                  </span>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="c-empty">
            <Icon name={needle ? 'search' : 'checkCircle'} size={22} />
            {needle ? (
              <p>Không có bàn hoặc hóa đơn khớp “{query.trim()}”.</p>
            ) : tab === 'due' ? (
              <>
                <p>Không có bàn chờ thanh toán.</p>
                {counts.serving > 0 && (
                  <button
                    type="button"
                    className="k-btn k-btn--ghost"
                    onClick={() => setTab('serving')}
                  >
                    Xem {counts.serving} bàn đang phục vụ
                  </button>
                )}
              </>
            ) : (
              <p>Không có bàn nào.</p>
            )}
          </div>
        )}
      </section>

      {shownId ? (
        <BillPanel key={shownId} billId={shownId} />
      ) : (
        <section className="c-bill c-bill--empty">
          <div className="c-empty">
            <Icon name="receipt" size={22} />
            <p>Chọn một bàn để xem hóa đơn.</p>
          </div>
        </section>
      )}
    </div>
  )
}

function BillPanel({ billId }: { billId: string }) {
  const { data, user, run, isPending } = useCashierSnapshot()
  const now = useNow()
  const [discountOpen, setDiscountOpen] = useState(false)
  const [returnReason, setReturnReason] = useState('')
  const [returnOpen, setReturnOpen] = useState(false)
  const view = billView(data, billId)
  if (!view) {
    return (
      <section className="c-bill c-bill--empty">
        <div className="c-empty">
          <p>Không tìm thấy hóa đơn.</p>
        </div>
      </section>
    )
  }

  const { bill, table, session } = view
  const block = paymentBlock(data, view, user)
  const discountReason = discountBlock(view, user)
  const paid = bill.status === 'PAID'
  const busy = isPending(`bill:${bill.id}`)
  const canRemoveDiscount =
    !!bill.discount && !discountReason && hasPermission(user, 'bills.prepare')
  const canPrint = hasPermission(user, paid ? 'receipts.print' : 'bills.prepare')
  const elapsed = session.closedAt ? null : shortDuration(minutesBetween(session.openedAt, now))

  let primary
  if (paid) {
    primary = canPrint ? (
      <Link to={cashierPaths.receipt(bill.id)} className="k-btn k-btn--primary c-pay-btn">
        <Icon name="printer" />
        In hóa đơn
      </Link>
    ) : null
  } else if (!block || block.code === 'TRANSFER_PENDING') {
    primary = (
      <Link to={cashierPaths.payment(bill.id)} className="k-btn k-btn--primary c-pay-btn">
        {block ? (
          <>
            <Icon name="hourglass" />
            Theo dõi chuyển khoản
          </>
        ) : (
          <>
            Thanh toán
            <Icon name="arrowRight" />
          </>
        )}
      </Link>
    )
  } else {
    primary = (
      <button
        type="button"
        className="k-btn k-btn--primary c-pay-btn"
        disabled
        aria-describedby="pay-block"
      >
        Thanh toán
      </button>
    )
  }

  return (
    <section className="c-bill" aria-labelledby="bill-title">
      <header className="c-bill-head">
        <Link to={cashierPaths.pos} className="k-back c-pos-back">
          <Icon name="chevronLeft" />
          Danh sách bàn
        </Link>
        <div className="c-bill-titlebar">
          <h2 id="bill-title" className="c-bill-title">
            Bàn {table.code}
          </h2>
          <BillStatusBadge status={bill.status} />
          <span className="c-bill-facts">
            <span>
              <Icon name="users" size={13} />
              {session.guests} khách
            </span>
            {elapsed && (
              <span>
                <Icon name="clock" size={13} />
                {elapsed}
              </span>
            )}
            <span className="c-bill-code">{bill.code}</span>
          </span>
          <Link to={cashierPaths.bill(bill.id)} className="k-btn k-btn--ghost c-bill-more">
            Chi tiết
            <Icon name="chevronRight" size={14} />
          </Link>
        </div>
      </header>

      <div className="c-bill-grid">
        <div className="c-bill-items">
          <Notices view={view} />
          <div className="c-bill-scroll">
            <BillLines view={view} menu={data.menu} />
          </div>
        </div>

        <aside className="c-bill-side" aria-label="Thanh toán">
          <div className="c-due">
            <span className="c-due-label">
              {paid ? 'Đã thanh toán' : view.paid ? 'Còn phải thu' : 'Cần thanh toán'}
            </span>
            <span className={paid ? 'c-due-amount c-due-amount--paid' : 'c-due-amount'}>
              {formatVnd(paid ? bill.totals.total : view.remaining)}
            </span>
            <span className="c-due-sub">{view.dishCount} món</span>
          </div>
          <BillTotals
            bill={bill}
            config={data.config}
            paid={paid ? 0 : view.paid}
            discountAction={
              canRemoveDiscount ? (
                <button
                  type="button"
                  className="c-link-btn"
                  onClick={() => {
                    void run(
                      { type: 'remove-discount', billId: bill.id, billVersion: bill.version },
                      [`bill:${bill.id}`],
                    )
                  }}
                  disabled={busy}
                >
                  Gỡ
                </button>
              ) : null
            }
          />
          {/* The main action sits right under the amount it settles; secondary tools follow. */}
          <div className="c-side-action">
            {block && !paid && block.code !== 'TRANSFER_PENDING' && (
              <p id="pay-block" className="c-block">
                {block.text}
              </p>
            )}
            {primary}
          </div>
          {!paid && (
            <div className="c-side-tools">
              {bill.status === 'PAYMENT_REQUESTED' &&
                hasPermission(user, 'bills.prepare') &&
                !view.payments.some((p) => p.status === 'PENDING' || p.status === 'SUCCEEDED') && (
                  <button
                    type="button"
                    className="k-btn k-btn--danger"
                    onClick={() => setReturnOpen(true)}
                    disabled={busy}
                  >
                    Trả lại cho phục vụ
                  </button>
                )}
              <button
                type="button"
                className="k-btn"
                onClick={() => setDiscountOpen(true)}
                disabled={!!discountReason}
                title={discountReason || undefined}
              >
                <Icon name="percent" />
                Giảm giá
              </button>
              {canPrint && (
                <Link to={cashierPaths.receipt(bill.id)} className="k-btn">
                  <Icon name="printer" />
                  In tạm tính
                </Link>
              )}
            </div>
          )}
        </aside>
      </div>

      {discountOpen && (
        <DiscountDialog
          view={view}
          user={user}
          config={data.config}
          onClose={() => setDiscountOpen(false)}
        />
      )}
      {returnOpen && (
        <Dialog
          title="Trả lại yêu cầu thanh toán"
          subtitle={`Bàn ${table.code} · ${bill.code}`}
          onClose={() => {
            setReturnOpen(false)
            setReturnReason('')
          }}
          footer={
            <>
              <button
                type="button"
                className="k-btn"
                onClick={() => {
                  setReturnOpen(false)
                  setReturnReason('')
                }}
              >
                Quay lại
              </button>
              <button
                type="submit"
                className="k-btn k-btn--danger"
                disabled={returnReason.trim().length < 5}
              >
                Trả lại
              </button>
            </>
          }
          onSubmit={() => {
            void run(
              {
                type: 'return-payment-request',
                billId: bill.id,
                billVersion: bill.version,
                reason: returnReason,
              },
              [`bill:${bill.id}`],
            ).then((ok) => {
              if (ok) {
                setReturnOpen(false)
                setReturnReason('')
              }
            })
          }}
        >
          <label className="k-field">
            <span className="k-label">Lý do trả lại cho phục vụ</span>
            <textarea
              className="k-input"
              required
              minLength={5}
              maxLength={200}
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="Ví dụ: Bàn muốn gọi thêm món, cần kiểm tra lại món..."
              aria-describedby="return-reason-hint"
            />
            <ReasonHint id="return-reason-hint" value={returnReason} />
          </label>
        </Dialog>
      )}
    </section>
  )
}

/** At most a couple of one-line notices; details live on the bill and payment pages. */
function Notices({ view }: { view: BillView }) {
  const { bill, session } = view
  const out = []
  if (view.failed && !view.pending && bill.status !== 'PAID') {
    out.push(
      <Alert key="failed" tone="danger" icon="xCircle">
        <b>Chuyển khoản {view.failed.code} lỗi.</b>{' '}
        <span title={view.failed.failureReason}>{view.failed.failureReason}</span>
      </Alert>,
    )
  }
  if (view.pending) {
    out.push(
      <Alert key="pending" tone="info" icon="bank">
        Đang chờ tiền chuyển khoản {formatVnd(view.pending.amount)}
      </Alert>,
    )
  }
  if (view.blockingRequest) {
    const r = view.blockingRequest
    out.push(
      <Alert
        key="request"
        tone="warning"
        icon="hourglass"
        action={
          <Link to={cashierPaths.request(r.id)} className="c-alert-link">
            Xem
          </Link>
        }
      >
        {r.code}
        {r.discount ? ` giảm ${formatVnd(r.discount.amount)}` : ''} đang chờ Quản lý duyệt
      </Alert>,
    )
  }
  if (view.unserved.length && bill.status !== 'PAID') {
    out.push(
      <Alert key="unserved" tone="warning" icon="clock">
        Còn {view.unserved.length} món chưa phục vụ
      </Alert>,
    )
  }
  if (bill.status === 'PAID') {
    const where = session.closedAt
      ? 'bàn đã dọn'
      : session.guestLeftAt
        ? 'khách đã rời, bàn đang dọn'
        : 'khách vẫn tại bàn'
    out.push(
      <Alert key="paid" tone="success" icon="checkCircle">
        Thanh toán lúc {bill.paidAt ? formatTime(bill.paidAt) : '—'} · {where}
      </Alert>,
    )
  }
  return out.length ? <div className="c-notices">{out}</div> : null
}
