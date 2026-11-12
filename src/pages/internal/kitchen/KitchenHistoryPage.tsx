import { useState } from 'react'
import { ITEM_STATUS_LABEL } from '../../../api/kitchen/labels'
import { shortName, staffName } from '../../../api/kitchen/rules'
import type { KitchenOrder, KitchenOrderItem, SentItemStatus } from '../../../api/kitchen/types'
import { DishPhoto } from '../../../components/kitchen/DishPhoto'
import { formatDate, formatTime, localDayKey, searchable } from '../../../components/kitchen/format'
import { Icon } from '../../../components/kitchen/Icon'
import { KitchenLink } from '../../../components/kitchen/KitchenLink'
import { KitchenStatusBadge } from '../../../components/kitchen/KitchenStatusBadge'
import { useKitchenSnapshot } from '../../../hooks/kitchen/kitchenDataContext'
import { useNow } from '../../../hooks/kitchen/useNow'
import { kitchenPaths } from '../../../routes/kitchenRouter'

type StatusFilter = 'ALL' | SentItemStatus
const STATUS_OPTIONS: StatusFilter[] = ['ALL', 'SUBMITTED', 'PREPARING', 'READY', 'SERVED', 'CANCELLED']

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

  const orders = new Map(data.orders.map((o) => [o.id, o]))
  const menus = new Map(data.menuItems.map((m) => [m.id, m]))
  const needle = searchable(query.trim())
  const rows: Row[] = data.items
    .map((item) => ({ item, order: orders.get(item.orderId)! }))
    .filter(({ item, order }) => {
      if (day && localDayKey(item.submittedAt) !== day) return false
      if (status !== 'ALL' && item.status !== status) return false
      if (!needle) return true
      return searchable(`${order.code} ${order.tableCode} ${item.name} ${item.note}`).includes(needle)
    })
    .sort((a, b) => b.item.submittedAt.localeCompare(a.item.submittedAt) || a.item.id.localeCompare(b.item.id, undefined, { numeric: true }))

  const filtered = query || day !== today || status !== 'ALL'
  const time = (iso?: string) => (iso ? (day ? formatTime(iso) : `${formatDate(iso).slice(0, 5)} ${formatTime(iso)}`) : '—')
  const cook = (id?: string) => (id ? shortName(staffName(data, id)) : '—')

  return (
    <div className="k-history">
      <div className="k-toolbar" role="search">
        <label className="k-search">
          <Icon name="search" size={15} />
          <span className="k-visually-hidden">Tìm kiếm</span>
          <input className="k-input" type="search" placeholder="Mã phiếu, bàn, tên món…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <label className="k-inline-field">
          <span className="k-label">Ngày</span>
          <input className="k-input" type="date" value={day} max={today} onChange={(e) => setDay(e.target.value)} />
        </label>
        <label className="k-inline-field">
          <span className="k-label">Trạng thái</span>
          <select className="k-select" value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
            {STATUS_OPTIONS.map((value) => <option key={value} value={value}>{value === 'ALL' ? 'Tất cả' : ITEM_STATUS_LABEL[value]}</option>)}
          </select>
        </label>
        {filtered && (
          <button type="button" className="k-btn k-btn--ghost" onClick={() => { setQuery(''); setDay(today); setStatus('ALL') }}>
            Xóa bộ lọc
          </button>
        )}
        <span className="k-toolbar-count">{rows.length} món{day ? '' : ' · mọi ngày'}</span>
      </div>

      <div className="k-table-wrap k-table-wrap--fill">
        <table className="k-table">
          <thead>
            <tr>
              <th>Mã phiếu</th><th>Bàn</th><th>Món</th><th className="k-num">SL</th>
              <th>Gửi</th><th>Bắt đầu</th><th>Hoàn thành</th><th>Người làm</th><th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ item, order }) => (
              <tr key={item.id}>
                <td><KitchenLink className="k-link k-mono" to={kitchenPaths.ticket(order.id)}>#{order.code}</KitchenLink></td>
                <td className="k-strong">{order.tableCode}</td>
                <td>
                  <div className="k-cell-dish">
                    <DishPhoto menu={menus.get(item.menuItemId)} size="sm" />
                    <span>
                      <span className="k-history-name">{item.name}</span>
                      {item.note && <span className="k-history-note"> · {item.note}</span>}
                    </span>
                  </div>
                </td>
                <td className="k-num k-strong">{item.quantity}</td>
                <td className="k-mono">{time(item.submittedAt)}</td>
                <td className="k-mono">{time(item.startedAt)}</td>
                <td className="k-mono">{time(item.readyAt)}</td>
                <td>{cook(item.readyBy ?? item.startedBy)}</td>
                <td><KitchenStatusBadge status={item.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="k-empty">Không có món nào khớp bộ lọc.</p>}
      </div>
    </div>
  )
}
