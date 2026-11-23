import { useRef, useState, type KeyboardEvent } from 'react'
import {
  buildActiveDishQueue,
  buildReadyDishQueue,
  filterActiveDishes,
  prioritizeActiveDishes,
} from '../../../api/kitchen/selectors'
import type { KitchenOrderItem } from '../../../api/kitchen/types'
import {
  filterByStation,
  parseStationId,
  STATIONS,
  stationLabel,
  stationOf,
} from '../../../api/kitchen/stations'
import { localDayKey } from '../../../components/kitchen/format'
import { KitchenBoardColumn } from '../../../components/kitchen/KitchenBoardColumn'
import { RejectItemDialog } from '../../../components/kitchen/KitchenOrderItem'
import { KitchenDishRow, KitchenReadyDishRow } from '../../../components/kitchen/KitchenTicketCard'
import { useKitchenSnapshot } from '../../../hooks/kitchen/kitchenDataContext'
import { useNow } from '../../../hooks/kitchen/useNow'

const refs = (items: KitchenOrderItem[]) => items.map((i) => ({ id: i.id, version: i.version }))

type BoardTab = 'new' | 'preparing' | 'ready'

const TABS: { id: BoardTab; label: string }[] = [
  { id: 'new', label: 'Mới nhận' },
  { id: 'preparing', label: 'Đang chế biến' },
  { id: 'ready', label: 'Đã xong' },
]

export default function KitchenBoardPage() {
  const { data, run, isPending, flashNew, station, setStation } = useKitchenSnapshot()
  const now = useNow()
  const [rejectItem, setRejectItem] = useState<KitchenOrderItem | null>(null)
  const [lateOnly, setLateOnly] = useState(false)
  const [tab, setTab] = useState<BoardTab>(() =>
    filterActiveDishes(
      filterByStation(prioritizeActiveDishes(buildActiveDishQueue(data, now)), data, station),
      'new',
    ).length
      ? 'new'
      : 'preparing',
  )
  const tabRefs = useRef<Record<BoardTab, HTMLButtonElement | null>>({
    new: null,
    preparing: null,
    ready: null,
  })
  const queue = filterByStation(
    prioritizeActiveDishes(buildActiveDishQueue(data, now)),
    data,
    station,
  )
  const readyToday = filterByStation(buildReadyDishQueue(data, now), data, station).filter(
    (dish) => !!dish.item.readyAt && localDayKey(dish.item.readyAt) === localDayKey(now),
  )
  const tabDishes = {
    new: filterActiveDishes(queue, 'new'),
    preparing: filterActiveDishes(queue, 'preparing'),
  }
  const tabCounts: Record<BoardTab, { total: number; late: number }> = {
    new: { total: tabDishes.new.length, late: filterActiveDishes(tabDishes.new, 'late').length },
    preparing: {
      total: tabDishes.preparing.length,
      late: filterActiveDishes(tabDishes.preparing, 'late').length,
    },
    ready: {
      total: readyToday.length,
      late: readyToday.filter((dish) => dish.tone === 'late').length,
    },
  }
  const activeTab = tab === 'ready' ? null : tab
  const visible = activeTab
    ? lateOnly
      ? filterActiveDishes(tabDishes[activeTab], 'late')
      : tabDishes[activeTab]
    : []
  const readyVisible = lateOnly ? readyToday.filter((dish) => dish.tone === 'late') : readyToday

  const start = (item: KitchenOrderItem) => {
    void run({ type: 'start', items: refs([item]) }, [item.id])
  }
  const complete = (item: KitchenOrderItem) => {
    void run({ type: 'complete', items: refs([item]) }, [item.id])
  }

  const selectTab = (next: BoardTab, focus = false) => {
    setTab(next)
    if (focus) requestAnimationFrame(() => tabRefs.current[next]?.focus())
  }

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const index = TABS.findIndex((t) => t.id === tab)
    const last = TABS.length - 1
    const target =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? last
          : Math.min(last, Math.max(0, index + (event.key === 'ArrowRight' ? 1 : -1)))
    selectTab(TABS[target].id, true)
  }

  return (
    <div className="k-board" data-tab={tab}>
      {rejectItem && <RejectItemDialog item={rejectItem} onClose={() => setRejectItem(null)} />}
      <div className="k-board-bar">
        <label className="k-station-field">
          <span className="k-label">Trạm</span>
          <select
            className="k-select"
            value={station}
            aria-label="Lọc theo trạm bếp"
            onChange={(event) => setStation(parseStationId(event.target.value))}
          >
            {STATIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="k-board-tabs" role="tablist" aria-label="Trạng thái món bếp">
          {TABS.map((t) => {
            const { total, late } = tabCounts[t.id]
            return (
              <button
                key={t.id}
                ref={(node) => {
                  tabRefs.current[t.id] = node
                }}
                id={`kitchen-tab-${t.id}`}
                type="button"
                role="tab"
                className={`k-board-tab${flashNew && t.id === 'new' ? ' k-board-tab--flash' : ''}`}
                aria-label={`${t.label}, ${total} món${late && t.id !== 'ready' ? `, ${late} trễ` : ''}`}
                aria-selected={tab === t.id}
                aria-controls={t.id === 'ready' ? 'kitchen-ready' : 'kitchen-active'}
                tabIndex={tab === t.id ? 0 : -1}
                onClick={() => selectTab(t.id)}
                onKeyDown={onTabKeyDown}
              >
                <span className="k-board-tab-label">{t.label}</span>
                <span className="k-board-tab-count">{total}</span>
                {late > 0 && t.id !== 'ready' && (
                  <span className="k-board-tab-alert">{late} trễ</span>
                )}
              </button>
            )
          })}
        </div>
        <div className="k-board-bar-tools">
          <button
            type="button"
            className="k-chip"
            aria-pressed={lateOnly}
            onClick={() => setLateOnly((value) => !value)}
          >
            Chỉ món quá giờ
          </button>
        </div>
      </div>

      <KitchenBoardColumn
        id="kitchen-active"
        labelledBy={`kitchen-tab-${activeTab ?? 'new'}`}
        hidden={tab === 'ready'}
        tone="active"
        title="Hàng chờ món"
        layout="full"
        hideHeader
        isEmpty={!visible.length}
        empty={lateOnly ? 'Không có món quá giờ.' : 'Không có món nào trong mục này.'}
      >
        <div className="k-dish-list" role="list" aria-label="Danh sách món theo thứ tự gọi">
          <div className="k-dish-list-head" aria-hidden="true">
            <span>Món</span>
            <span>Bàn</span>
            <span>Giờ gọi</span>
            <span>Trạng thái</span>
            <span>Thao tác</span>
          </div>
          {visible.map((dish) => (
            <KitchenDishRow
              key={dish.item.id}
              dish={dish}
              data={data}
              stationName={
                station === 'all' ? stationLabel(stationOf(data, dish.item.menuItemId)) : undefined
              }
              isPending={isPending}
              onStart={start}
              onComplete={complete}
              onReject={setRejectItem}
            />
          ))}
        </div>
      </KitchenBoardColumn>

      <KitchenBoardColumn
        id="kitchen-ready"
        labelledBy="kitchen-tab-ready"
        hidden={tab !== 'ready'}
        tone="ready"
        title="Món đã xong"
        layout="full"
        hideHeader
        isEmpty={!readyVisible.length}
        empty={lateOnly ? 'Không có món quá giờ.' : 'Không có món nào đang chờ mang ra.'}
      >
        <div
          className="k-ready-list"
          role="list"
          aria-label="Món đã xong theo thời gian chờ phục vụ"
        >
          <div className="k-ready-list-head" aria-hidden="true">
            <span>Món</span>
            <span>Bàn</span>
            <span>Hoàn thành</span>
            <span>Chờ phục vụ</span>
            <span>Phục vụ bàn</span>
          </div>
          {readyVisible.map((dish) => (
            <KitchenReadyDishRow
              key={dish.item.id}
              dish={dish}
              data={data}
              stationName={
                station === 'all' ? stationLabel(stationOf(data, dish.item.menuItemId)) : undefined
              }
            />
          ))}
        </div>
      </KitchenBoardColumn>
    </div>
  )
}
