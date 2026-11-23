import { useRef, useState, type KeyboardEvent } from 'react'
import {
  buildActiveDishQueue,
  buildReadyDishQueue,
  countLateActive,
  filterActiveDishes,
  prioritizeActiveDishes,
} from '../../../api/kitchen/selectors'
import type { KitchenOrderItem } from '../../../api/kitchen/types'
import { filterByStation, STATIONS, type StationId } from '../../../api/kitchen/stations'
import { formatCount, localDayKey } from '../../../components/kitchen/format'
import { KitchenBoardColumn } from '../../../components/kitchen/KitchenBoardColumn'
import { ReportManagerDialog } from '../../../components/kitchen/ReportManagerDialog'
import { StationMenu } from '../../../components/kitchen/StationMenu'
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
  const [reportItem, setReportItem] = useState<KitchenOrderItem | null>(null)
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
  const allActive = prioritizeActiveDishes(buildActiveDishQueue(data, now))
  const queue = filterByStation(allActive, data, station)
  const readyToday = filterByStation(buildReadyDishQueue(data, now), data, station).filter(
    (dish) => !!dish.item.readyAt && localDayKey(dish.item.readyAt) === localDayKey(now),
  )
  const tabDishes = {
    new: filterActiveDishes(queue, 'new'),
    preparing: filterActiveDishes(queue, 'preparing'),
  }
  const tabCounts: Record<BoardTab, { total: number }> = {
    new: { total: tabDishes.new.length },
    preparing: { total: tabDishes.preparing.length },
    ready: { total: readyToday.length },
  }
  const lateCount = countLateActive(queue)
  const stationCounts = Object.fromEntries(
    STATIONS.map((option) => [option.id, filterByStation(allActive, data, option.id).length]),
  ) as Record<StationId, number>
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
      {reportItem && <ReportManagerDialog item={reportItem} onClose={() => setReportItem(null)} />}
      <div className="k-board-bar">
        <StationMenu value={station} counts={stationCounts} onChange={setStation} />
        <div className="k-board-tabs" role="tablist" aria-label="Trạng thái món bếp">
          {TABS.map((t) => {
            const { total } = tabCounts[t.id]
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
                aria-label={`${t.label}, ${total} món`}
                aria-selected={tab === t.id}
                aria-controls={t.id === 'ready' ? 'kitchen-ready' : 'kitchen-active'}
                tabIndex={tab === t.id ? 0 : -1}
                onClick={() => selectTab(t.id)}
                onKeyDown={onTabKeyDown}
              >
                <span className="k-board-tab-label">{t.label}</span>
                <span className="k-board-tab-count">{formatCount(total)}</span>
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
            Chỉ món quá giờ <span className="k-count">{formatCount(lateCount)}</span>
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
            <span>Thao tác</span>
          </div>
          {visible.map((dish) => (
            <KitchenDishRow
              key={dish.item.id}
              dish={dish}
              data={data}
              isPending={isPending}
              onStart={start}
              onComplete={complete}
              onReject={setRejectItem}
              onReport={setReportItem}
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
            <KitchenReadyDishRow key={dish.item.id} dish={dish} data={data} />
          ))}
        </div>
      </KitchenBoardColumn>
    </div>
  )
}
