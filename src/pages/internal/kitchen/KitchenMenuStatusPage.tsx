import { useState } from 'react'
import { MENU_STATUS_LABEL } from '../../../api/kitchen/labels'
import {
  applyMenuStatusFilter,
  discontinuedLast,
  menuFilterCounts,
  type MenuStatusFilter,
} from '../../../api/kitchen/menuStatus'
import { hasPermission, staffName } from '../../../api/kitchen/rules'
import { inStation, STATIONS, type StationId } from '../../../api/kitchen/stations'
import type { MenuAvailability, MenuItem } from '../../../api/kitchen/types'
import { DishPhoto } from '../../../components/kitchen/DishPhoto'
import { formatTime, formatWhen, searchable } from '../../../components/kitchen/format'
import { Icon } from '../../../components/kitchen/Icon'
import { SegmentedFilter } from '../../../components/kitchen/SegmentedFilter'
import { SelectMenu } from '../../../components/kitchen/SelectMenu'
import { Badge, type BadgeTone } from '../../../components/kitchen/KitchenStatusBadge'
import { useKitchenSnapshot } from '../../../hooks/kitchen/kitchenDataContext'
import { useNow } from '../../../hooks/kitchen/useNow'

const TONE: Record<MenuAvailability, BadgeTone> = {
  AVAILABLE: 'success',
  SOLD_OUT: 'danger',
  DISCONTINUED: 'neutral',
}

export default function KitchenMenuStatusPage() {
  const { data, run, isPending, user } = useKitchenSnapshot()
  const me = data.staff.find((s) => s.id === user.id) ?? user
  const canEdit = hasPermission(me, 'kitchen.menu.availability')
  const now = useNow()
  const [station, setStation] = useState<StationId>('all')
  const [statusFilter, setStatusFilter] = useState<MenuStatusFilter>('all')
  const [query, setQuery] = useState('')
  const [confirming, setConfirming] = useState<string | null>(null)

  const needle = searchable(query.trim())
  const base = data.menuItems
    .filter((m) => inStation(data, m.id, station))
    .filter((m) => !needle || searchable(m.name).includes(needle))
  const counts = menuFilterCounts(base)
  const rows = discontinuedLast(applyMenuStatusFilter(base, statusFilter))
  const categoryName = (id: string) => data.menuCategories.find((c) => c.id === id)?.name ?? '—'

  const setStatus = async (menu: MenuItem, status: 'AVAILABLE' | 'SOLD_OUT') => {
    setConfirming(null)
    await run({ type: 'set-menu-status', menuItemId: menu.id, status }, [`menu:${menu.id}`])
  }
  const request = (menu: MenuItem, status: 'AVAILABLE' | 'SOLD_OUT') => {
    void run({ type: 'request-menu-status', menuItemId: menu.id, status }, [`menu:${menu.id}`])
  }

  const action = (menu: MenuItem) => {
    const busy = isPending(`menu:${menu.id}`)
    if (menu.status === 'DISCONTINUED') return <span>Quản lý đã ngừng bán</span>
    if (canEdit) {
      if (menu.status === 'SOLD_OUT') {
        return (
          <button
            type="button"
            className="k-btn k-btn--outline"
            disabled={busy}
            onClick={() => {
              void setStatus(menu, 'AVAILABLE')
            }}
          >
            Mở bán lại
          </button>
        )
      }
      if (confirming === menu.id) {
        return (
          <span className="k-confirm">
            <span className="k-muted">Báo tạm hết?</span>
            <button
              type="button"
              className="k-btn k-btn--danger"
              disabled={busy}
              onClick={() => {
                void setStatus(menu, 'SOLD_OUT')
              }}
            >
              Xác nhận
            </button>
            <button
              type="button"
              className="k-btn k-btn--ghost"
              onClick={() => setConfirming(null)}
            >
              Hủy
            </button>
          </span>
        )
      }
      return (
        <button
          type="button"
          className="k-btn"
          disabled={busy}
          onClick={() => setConfirming(menu.id)}
        >
          Báo tạm hết
        </button>
      )
    }
    const pending = data.menuRequests.find(
      (r) => r.menuItemId === menu.id && r.status === 'PENDING',
    )
    if (pending)
      return <span className="k-muted">Đã gửi yêu cầu lúc {formatTime(pending.requestedAt)}</span>
    const target = menu.status === 'AVAILABLE' ? 'SOLD_OUT' : 'AVAILABLE'
    return (
      <button type="button" className="k-btn" disabled={busy} onClick={() => request(menu, target)}>
        {target === 'SOLD_OUT' ? 'Yêu cầu báo tạm hết' : 'Yêu cầu mở bán lại'}
      </button>
    )
  }

  return (
    <div className="k-page">
      <p className="k-callout">
        <Icon name="info" size={14} />
        {canEdit
          ? 'Bếp báo tạm hết hoặc mở bán lại. Giá và thực đơn do Quản lý quản lý.'
          : 'Bạn chỉ xem được tình trạng món. Gửi yêu cầu để Bếp trưởng hoặc Quản lý ca cập nhật.'}
      </p>
      <div className="k-toolbar">
        <label className="k-search">
          <Icon name="search" size={15} />
          <span className="k-visually-hidden">Tìm món</span>
          <input
            className="k-input"
            type="search"
            placeholder="Tìm món…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <SelectMenu
          value={station}
          onChange={setStation}
          buttonLabel="Lọc theo trạm bếp"
          listLabel="Trạm bếp"
          options={STATIONS.map((option) => ({
            value: option.id,
            label: option.label,
          }))}
        />
        <div className="k-toolbar-group">
          <SegmentedFilter
            label="Lọc theo tình trạng"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'Tất cả', count: counts.all },
              { value: 'available', label: 'Còn bán', count: counts.available },
              { value: 'soldout', label: 'Tạm hết', count: counts.soldout },
            ]}
          />
        </div>
      </div>
      <div className="k-table-wrap">
        <table className="k-table k-table--roomy k-menu-table">
          <thead>
            <tr>
              <th>Món</th>
              <th>Danh mục</th>
              <th className="k-center">Tình trạng</th>
              <th>Cập nhật</th>
              <th className="k-cell-actions">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((menu) => (
              <tr
                key={menu.id}
                className={menu.status === 'DISCONTINUED' ? 'k-row-muted' : undefined}
              >
                <td>
                  <span className="k-cell-dish">
                    <DishPhoto menu={menu} />
                    <span className="k-strong">{menu.name}</span>
                  </span>
                </td>
                <td className="k-muted">{categoryName(menu.categoryId)}</td>
                <td className="k-center">
                  <Badge tone={TONE[menu.status]}>{MENU_STATUS_LABEL[menu.status]}</Badge>
                </td>
                <td className="k-mono">
                  {formatWhen(menu.updatedAt, now)}
                  {menu.updatedBy && (
                    <span className="k-muted"> · {staffName(data, menu.updatedBy)}</span>
                  )}
                </td>
                <td className="k-cell-actions">{action(menu)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="k-empty">Không có món nào khớp bộ lọc.</p>}
      </div>
    </div>
  )
}
