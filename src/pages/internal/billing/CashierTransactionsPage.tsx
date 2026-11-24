import { useDeferredValue, useState } from 'react'
import { METHOD_LABEL, PAYMENT_STATUS_LABEL } from '../../../api/billing/labels'
import { formatVnd } from '../../../api/billing/money'
import { hasPermission, staffName } from '../../../api/billing/selectors'
import { HISTORY_PAGE_SIZE, takePage } from '../../../api/kitchen/paging'
import type { PaymentMethod, PaymentStatus } from '../../../api/billing/types'
import { Icon } from '../../../components/billing/Icon'
import { DayField } from '../../../components/kitchen/DayField'
import { SelectMenu } from '../../../components/kitchen/SelectMenu'
import { PaymentStatusBadge } from '../../../components/billing/ui'
import {
  formatDate,
  formatTime,
  localDayKey,
  searchable,
  shortCode,
} from '../../../components/kitchen/format'
import { KitchenLink as Link } from '../../../components/kitchen/KitchenLink'
import { useCashierSnapshot } from '../../../hooks/billing/cashierDataContext'
import { useNow } from '../../../hooks/kitchen/useNow'
import { cashierPaths, navigate } from '../../../routes/cashierRouter'

const METHODS: ('ALL' | PaymentMethod)[] = ['ALL', 'CASH', 'PAYOS', 'MANUAL_TRANSFER']
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
  const [limit, setLimit] = useState(HISTORY_PAGE_SIZE)
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

  const page = takePage(rows, limit)
  const succeeded = rows.filter((r) => r.payment.status === 'SUCCEEDED')
  const total = succeeded.reduce((sum, r) => sum + r.payment.amount, 0)
  const filtered = query || day !== today || method !== 'ALL' || status !== 'ALL'
  const reset = (fn: () => void) => {
    fn()
    setLimit(HISTORY_PAGE_SIZE)
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
        <DayField value={day} now={now} onChange={(value) => reset(() => setDay(value))} />
        <div className="k-inline-field">
          <span className="k-label">Phương thức</span>
          <SelectMenu
            value={method}
            onChange={(value) => reset(() => setMethod(value))}
            buttonLabel="Phương thức"
            listLabel="Phương thức"
            options={METHODS.map((m) => ({
              value: m,
              label: m === 'ALL' ? 'Tất cả' : METHOD_LABEL[m],
            }))}
          />
        </div>
        <div className="k-inline-field">
          <span className="k-label">Trạng thái</span>
          <SelectMenu
            value={status}
            onChange={(value) => reset(() => setStatus(value))}
            buttonLabel="Trạng thái"
            listLabel="Trạng thái"
            options={STATUSES.map((st) => ({
              value: st,
              label: st === 'ALL' ? 'Tất cả' : PAYMENT_STATUS_LABEL[st],
            }))}
          />
        </div>
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
              <th className="k-center">Trạng thái</th>
              <th className="k-cell-actions">
                <span className="k-visually-hidden">Xem</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {page.items.map(({ payment, bill, table }) => (
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
                    {shortCode(payment.code)}
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
                <td className="k-center">
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

      {rows.length > 0 && (
        <div className="k-history-foot">
          <span className="k-muted">
            Đang hiện {page.shown} / {page.total} giao dịch
          </span>
          {page.hasMore && (
            <button
              type="button"
              className="k-btn"
              onClick={() => setLimit((value) => value + HISTORY_PAGE_SIZE)}
            >
              Xem thêm
            </button>
          )}
        </div>
      )}
    </div>
  )
}
