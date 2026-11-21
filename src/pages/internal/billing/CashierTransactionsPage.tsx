import { useDeferredValue, useState } from 'react'
import { METHOD_LABEL, PAYMENT_STATUS_LABEL } from '../../../api/billing/labels'
import { formatVnd } from '../../../api/billing/money'
import { hasPermission, staffName } from '../../../api/billing/selectors'
import type { PaymentMethod, PaymentStatus } from '../../../api/billing/types'
import { Icon } from '../../../components/billing/Icon'
import { PaymentStatusBadge } from '../../../components/billing/ui'
import { formatDate, formatTime, localDayKey, searchable } from '../../../components/kitchen/format'
import { KitchenLink as Link } from '../../../components/kitchen/KitchenLink'
import { useCashierSnapshot } from '../../../hooks/billing/cashierDataContext'
import { useNow } from '../../../hooks/kitchen/useNow'
import { cashierPaths, navigate } from '../../../routes/cashierRouter'

const PAGE_SIZE = 20
const METHODS: ('ALL' | PaymentMethod)[] = ['ALL', 'CASH', 'TRANSFER', 'CARD']
const STATUSES: ('ALL' | PaymentStatus)[] = [
  'ALL',
  'SUCCEEDED',
  'PENDING',
  'FAILED',
  'CANCELLED',
  'VOIDED',
]

export default function CashierTransactionsPage() {
  const { data, user } = useCashierSnapshot()
  const now = useNow()
  const today = localDayKey(now)
  const [query, setQuery] = useState('')
  const [day, setDay] = useState(today)
  const [method, setMethod] = useState<'ALL' | PaymentMethod>('ALL')
  const [status, setStatus] = useState<'ALL' | PaymentStatus>('ALL')
  const [page, setPage] = useState(0)
  const needle = searchable(useDeferredValue(query).trim())

  if (!hasPermission(user, 'transactions.view')) {
    return (
      <div className="k-state">
        <p className="k-state-title">Bạn không có quyền xem lịch sử giao dịch.</p>
      </div>
    )
  }

  const bills = new Map(data.bills.map((b) => [b.id, b]))
  const tableOf = (billId: string) => {
    const session = data.sessions.find((s) => s.id === bills.get(billId)?.sessionId)
    return data.tables.find((t) => t.id === session?.tableId)?.code ?? '—'
  }
  const rows = data.payments
    .map((payment) => ({
      payment,
      bill: bills.get(payment.billId)!,
      table: tableOf(payment.billId),
    }))
    .filter(({ payment, bill, table }) => {
      if (day && localDayKey(payment.createdAt) !== day) return false
      if (method !== 'ALL' && payment.method !== method) return false
      if (status !== 'ALL' && payment.status !== status) return false
      return (
        !needle ||
        searchable(
          `${payment.code} ${bill?.code} ${table} ${payment.transferContent ?? ''} ${payment.bankReference ?? ''}`,
        ).includes(needle)
      )
    })
    .sort((a, b) => b.payment.createdAt.localeCompare(a.payment.createdAt))

  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const current = Math.min(page, pages - 1)
  const shown = rows.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE)
  const succeeded = rows.filter((r) => r.payment.status === 'SUCCEEDED')
  const total = succeeded.reduce((sum, r) => sum + r.payment.amount, 0)
  const filtered = query || day !== today || method !== 'ALL' || status !== 'ALL'
  const reset = (fn: () => void) => {
    fn()
    setPage(0)
  }

  return (
    <div className="k-history">
      <div className="k-toolbar" role="search">
        <label className="k-search">
          <Icon name="search" size={15} />
          <span className="k-visually-hidden">Tìm kiếm</span>
          <input
            className="k-input"
            type="search"
            placeholder="Mã GD, mã HĐ, bàn, mã ngân hàng…"
            value={query}
            onChange={(e) => reset(() => setQuery(e.target.value))}
          />
        </label>
        <label className="k-inline-field">
          <span className="k-label">Ngày</span>
          <input
            className="k-input"
            type="date"
            value={day}
            max={today}
            onChange={(e) => reset(() => setDay(e.target.value))}
          />
        </label>
        <label className="k-inline-field">
          <span className="k-label">Phương thức</span>
          <select
            className="k-select"
            value={method}
            onChange={(e) => reset(() => setMethod(e.target.value as typeof method))}
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {m === 'ALL' ? 'Tất cả' : METHOD_LABEL[m]}
              </option>
            ))}
          </select>
        </label>
        <label className="k-inline-field">
          <span className="k-label">Trạng thái</span>
          <select
            className="k-select"
            value={status}
            onChange={(e) => reset(() => setStatus(e.target.value as typeof status))}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'Tất cả' : PAYMENT_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        {filtered && (
          <button
            type="button"
            className="k-btn k-btn--ghost"
            onClick={() =>
              reset(() => {
                setQuery('')
                setDay(today)
                setMethod('ALL')
                setStatus('ALL')
              })
            }
          >
            Xóa bộ lọc
          </button>
        )}
        <span className="k-toolbar-count">
          {rows.length} giao dịch{day ? '' : ' · mọi ngày'} · thành công{' '}
          <b className="c-strong">{formatVnd(total)}</b>
        </span>
      </div>

      <div className="k-table-wrap k-table-wrap--fill">
        <table className="k-table c-tx-table">
          <thead>
            <tr>
              <th>Mã GD</th>
              <th>Mã HĐ</th>
              <th>Bàn</th>
              <th>Thời gian</th>
              <th className="k-num">Số tiền</th>
              <th>Phương thức</th>
              <th>Thu ngân</th>
              <th>Trạng thái</th>
              <th className="k-cell-actions">
                <span className="k-visually-hidden">Xem</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.map(({ payment, bill, table }) => (
              <tr
                key={payment.id}
                className="c-clickable"
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('a, button')) return
                  navigate(cashierPaths.transaction(payment.id))
                }}
              >
                <td>
                  <Link to={cashierPaths.transaction(payment.id)} className="k-link k-mono">
                    {payment.code}
                  </Link>
                </td>
                <td>
                  <Link to={cashierPaths.bill(payment.billId)} className="k-link k-mono">
                    {bill?.code}
                  </Link>
                </td>
                <td className="k-strong">{table}</td>
                <td className="k-mono">
                  {day
                    ? formatTime(payment.createdAt)
                    : `${formatDate(payment.createdAt).slice(0, 5)} ${formatTime(payment.createdAt)}`}
                </td>
                <td
                  className={
                    payment.status === 'SUCCEEDED' ? 'k-num k-strong' : 'k-num c-muted-num'
                  }
                >
                  {formatVnd(payment.amount)}
                </td>
                <td>{METHOD_LABEL[payment.method]}</td>
                <td>{staffName(data, payment.createdBy)}</td>
                <td>
                  <PaymentStatusBadge status={payment.status} />
                </td>
                <td className="k-cell-actions">
                  <Icon name="chevronRight" size={14} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="k-empty">Không có giao dịch khớp bộ lọc.</p>}
      </div>

      {pages > 1 && (
        <nav className="c-pager" aria-label="Phân trang">
          <span className="k-muted">
            Trang {current + 1}/{pages}
          </span>
          <button
            type="button"
            className="k-btn k-icon-btn"
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
            aria-label="Trang trước"
          >
            <Icon name="chevronLeft" />
          </button>
          <button
            type="button"
            className="k-btn k-icon-btn"
            disabled={current >= pages - 1}
            onClick={() => setPage(current + 1)}
            aria-label="Trang sau"
          >
            <Icon name="chevronRight" />
          </button>
        </nav>
      )}
    </div>
  )
}
