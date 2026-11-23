import { useState } from 'react'
import { ITEM_STATUS_LABEL } from '../../../api/kitchen/labels'
import { HISTORY_PAGE_SIZE, takePage } from '../../../api/kitchen/paging'
import { staffName } from '../../../api/kitchen/rules'
import type { KitchenOrder, KitchenOrderItem, SentItemStatus } from '../../../api/kitchen/types'
import {
  formatDate,
  formatTime,
  localDayKey,
  quantityLabel,
  searchable,
  shortCode,
} from '../../../components/kitchen/format'
import { DayField } from '../../../components/kitchen/DayField'
import { Icon } from '../../../components/kitchen/Icon'
import { SelectMenu } from '../../../components/kitchen/SelectMenu'
import { KitchenLink } from '../../../components/kitchen/KitchenLink'
import { KitchenStatusBadge } from '../../../components/kitchen/KitchenStatusBadge'
import { useKitchenSnapshot } from '../../../hooks/kitchen/kitchenDataContext'
import { useNow } from '../../../hooks/kitchen/useNow'
import { kitchenPaths } from '../../../routes/kitchenRouter'

type StatusFilter = 'ALL' | SentItemStatus
const STATUS_OPTIONS: StatusFilter[] = [
  'ALL',
  'SUBMITTED',
  'PREPARING',
  'READY',
  'SERVED',
  'REJECTED',
  'CANCELLED',
  'VOIDED',
]

interface Row {
  item: KitchenOrderItem
  order: KitchenOrder
}

export default function KitchenHistoryPage() {
  const { data } = useKitchenSnapshot()
  const now = useNow()
  const today = localDayKey(now)
  const [query, setQuery] = useState('')
  const [day, setDay] = useState(today)
  const [status, setStatus] = useState<StatusFilter>('ALL')
  const [limit, setLimit] = useState(HISTORY_PAGE_SIZE)
  const reset = (fn: () => void) => {
    fn()
    setLimit(HISTORY_PAGE_SIZE)
  }

  const orders = new Map(data.orders.map((o) => [o.id, o]))
  const needle = searchable(query.trim())
  const rows: Row[] = data.items
    .map((item) => ({ item, order: orders.get(item.orderId)! }))
    .filter(({ item, order }) => {
      if (day && localDayKey(item.submittedAt) !== day) return false
      if (status !== 'ALL' && item.status !== status) return false
      if (!needle) return true
      return searchable(`${order.code} ${order.tableCode} ${item.name} ${item.note}`).includes(
        needle,
      )
    })
    .sort(
      (a, b) =>
        b.item.submittedAt.localeCompare(a.item.submittedAt) ||
        a.item.id.localeCompare(b.item.id, undefined, { numeric: true }),
    )

  const page = takePage(rows, limit)
  const filtered = query || day !== today || status !== 'ALL'
  const time = (iso?: string) =>
    iso ? (
      day ? (
        formatTime(iso)
      ) : (
        `${formatDate(iso).slice(0, 5)} ${formatTime(iso)}`
      )
    ) : (
      <span className="k-dash">—</span>
    )
  const cook = (id?: string) => (id ? staffName(data, id) : <span className="k-dash">—</span>)
  const finishedAt = (item: KitchenOrderItem) =>
    item.status === 'REJECTED' ? item.rejectedAt : item.readyAt
  const doneBy = (item: KitchenOrderItem) =>
    item.status === 'REJECTED' ? item.rejectedBy : (item.readyBy ?? item.startedBy)

  return (
    <div className="k-history k-history--sized">
      <div className="k-toolbar" role="search">
        <label className="k-search">
          <Icon name="search" size={15} />
          <span className="k-visually-hidden">Tìm kiếm</span>
          <input
            className="k-input"
            type="search"
            placeholder="Mã phiếu, bàn, tên món…"
            value={query}
            onChange={(e) => reset(() => setQuery(e.target.value))}
          />
        </label>
        <DayField value={day} now={now} onChange={(value) => reset(() => setDay(value))} />
        <div className="k-inline-field">
          <span className="k-label">Trạng thái</span>
          <SelectMenu
            value={status}
            onChange={(value) => reset(() => setStatus(value))}
            buttonLabel="Trạng thái"
            listLabel="Trạng thái"
            options={STATUS_OPTIONS.map((value) => ({
              value,
              label: value === 'ALL' ? 'Tất cả' : ITEM_STATUS_LABEL[value],
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
                setStatus('ALL')
              })
            }
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      <div className="k-table-wrap k-table-wrap--fill">
        <table className="k-table">
          <thead>
            <tr>
              <th>Mã phiếu</th>
              <th>Bàn</th>
              <th>Món</th>
              <th className="k-num">SL</th>
              <th className="k-center">Gửi</th>
              <th className="k-center">Bắt đầu</th>
              <th className="k-center">Hoàn thành</th>
              <th className="k-history-worker">Người làm</th>
              <th className="k-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {page.items.map(({ item, order }) => (
              <tr key={item.id}>
                <td>
                  <KitchenLink className="k-link k-mono" to={kitchenPaths.ticket(order.id)}>
                    #{shortCode(order.code)}
                  </KitchenLink>
                </td>
                <td className="k-strong">{order.tableCode}</td>
                <td>
                  <span
                    className="k-history-dish"
                    title={item.note ? `${item.name} · ${item.note}` : item.name}
                  >
                    <span className="k-history-name">{item.name}</span>
                    {item.note && <span className="k-history-note"> · {item.note}</span>}
                  </span>
                </td>
                <td className="k-num k-strong">{quantityLabel(item.quantity, item.unit)}</td>
                <td className="k-mono k-center">{time(item.submittedAt)}</td>
                <td className="k-mono k-center">{time(item.startedAt)}</td>
                <td className="k-mono k-center">{time(finishedAt(item))}</td>
                <td className="k-nowrap k-history-worker">{cook(doneBy(item))}</td>
                <td className="k-center">
                  <KitchenStatusBadge status={item.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="k-empty">Không có món nào khớp bộ lọc.</p>}
      </div>
      {rows.length > 0 && (
        <div className="k-history-foot">
          <span className="k-muted">
            Đang hiện {page.shown} / {page.total} món
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
