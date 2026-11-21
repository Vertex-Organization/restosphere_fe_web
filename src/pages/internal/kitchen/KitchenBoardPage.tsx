import { useRef, useState, type KeyboardEvent } from 'react'
import {
  buildActiveDishQueue,
  buildBoard,
  buildReadyDishQueue,
  filterActiveDishes,
  type KitchenFilter,
} from '../../../api/kitchen/selectors'
import type { KitchenOrderItem } from '../../../api/kitchen/types'
import {
  KitchenActionConfirmDialog,
  RejectItemDialog,
  type KitchenItemAction,
} from '../../../components/kitchen/KitchenOrderItem'
import { Icon } from '../../../components/kitchen/Icon'
import { KitchenBoardColumn } from '../../../components/kitchen/KitchenBoardColumn'
import { KitchenFilters, type FilterOption } from '../../../components/kitchen/KitchenFilters'
import {
  KitchenDishDetail,
  KitchenDishListItem,
  KitchenReadyDishRow,
} from '../../../components/kitchen/KitchenTicketCard'
import { useKitchenSnapshot } from '../../../hooks/kitchen/kitchenDataContext'
import { useNow } from '../../../hooks/kitchen/useNow'

const refs = (items: KitchenOrderItem[]) => items.map((i) => ({ id: i.id, version: i.version }))

export default function KitchenBoardPage() {
  const { data, run, isPending } = useKitchenSnapshot()
  const now = useNow()
  const [rejectItem, setRejectItem] = useState<KitchenOrderItem | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    action: KitchenItemAction
    item: KitchenOrderItem
    tableCode: string
  } | null>(null)
  const [filter, setFilter] = useState<KitchenFilter>('all')
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [tab, setTab] = useState<'active' | 'ready'>('active')
  const tabRefs = useRef<Record<'active' | 'ready', HTMLButtonElement | null>>({
    active: null,
    ready: null,
  })
  const board = buildBoard(data, now)
  const queue = buildActiveDishQueue(data, now)
  const readyQueue = buildReadyDishQueue(data, now)
  const visible = filterActiveDishes(queue, filter)
  const selectedDish = visible.find((dish) => dish.item.id === selectedItemId) ?? visible[0]
  const { counts } = board

  const start = (item: KitchenOrderItem) => {
    void run({ type: 'start', items: refs([item]) }, [item.id])
  }
  const complete = (item: KitchenOrderItem) => {
    void run({ type: 'complete', items: refs([item]) }, [item.id])
  }

  const filters: FilterOption<KitchenFilter>[] = [
    { value: 'all', label: 'Tất cả', count: queue.length },
    { value: 'new', label: 'Mới nhận', count: filterActiveDishes(queue, 'new').length },
    {
      value: 'preparing',
      label: 'Đang chế biến',
      count: filterActiveDishes(queue, 'preparing').length,
    },
    { value: 'late', label: 'Quá giờ', count: filterActiveDishes(queue, 'late').length },
  ]

  const selectTab = (next: 'active' | 'ready', focus = false) => {
    setTab(next)
    if (focus) requestAnimationFrame(() => tabRefs.current[next]?.focus())
  }

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const next = event.key === 'Home' || event.key === 'ArrowLeft' ? 'active' : 'ready'
    selectTab(next, true)
  }

  return (
    <div className="k-board" data-tab={tab}>
      {rejectItem && <RejectItemDialog item={rejectItem} onClose={() => setRejectItem(null)} />}
      {confirmAction && (
        <KitchenActionConfirmDialog
          action={confirmAction.action}
          items={[confirmAction.item]}
          tableCode={confirmAction.tableCode}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => {
            const current = confirmAction
            setConfirmAction(null)
            if (current.action === 'start') start(current.item)
            else complete(current.item)
          }}
        />
      )}
      <div className="k-board-bar">
        <div className="k-board-tabs" role="tablist" aria-label="Trạng thái món bếp">
          <button
            ref={(node) => {
              tabRefs.current.active = node
            }}
            id="kitchen-tab-active"
            type="button"
            role="tab"
            className="k-board-tab"
            aria-label={`Chưa xong, ${queue.length} món${filterActiveDishes(queue, 'late').length ? `, ${filterActiveDishes(queue, 'late').length} quá giờ` : ''}`}
            aria-selected={tab === 'active'}
            aria-controls="kitchen-active"
            tabIndex={tab === 'active' ? 0 : -1}
            onClick={() => selectTab('active')}
            onKeyDown={onTabKeyDown}
          >
            <span className="k-board-tab-label">Chưa xong</span>
            <span className="k-board-tab-count">{queue.length}</span>
            {filterActiveDishes(queue, 'late').length > 0 && (
              <span className="k-board-tab-alert">
                {filterActiveDishes(queue, 'late').length} quá giờ
              </span>
            )}
          </button>
          <button
            ref={(node) => {
              tabRefs.current.ready = node
            }}
            id="kitchen-tab-ready"
            type="button"
            role="tab"
            className="k-board-tab"
            aria-label={`Đã xong, ${counts.readyItems} món`}
            aria-selected={tab === 'ready'}
            aria-controls="kitchen-ready"
            tabIndex={tab === 'ready' ? 0 : -1}
            onClick={() => selectTab('ready')}
            onKeyDown={onTabKeyDown}
          >
            <span className="k-board-tab-label">Đã xong</span>
            <span className="k-board-tab-count">{counts.readyItems}</span>
          </button>
        </div>
        <div className="k-board-bar-tools">
          {tab === 'active' ? (
            <KitchenFilters
              label="Lọc món chưa xong"
              options={filters}
              value={filter}
              onChange={setFilter}
            />
          ) : (
            <span className="k-board-ready-note">
              <Icon name="clock" size={14} />
              Chờ lâu nhất ở trên
            </span>
          )}
        </div>
      </div>

      <KitchenBoardColumn
        id="kitchen-active"
        labelledBy="kitchen-tab-active"
        hidden={tab !== 'active'}
        tone="active"
        title="Hàng chờ món"
        layout="workbench"
        hideHeader
        isEmpty={!visible.length}
        empty={filter === 'all' ? 'Chưa có món cần chế biến.' : 'Không có phiếu nào khớp bộ lọc.'}
      >
        <div className="k-order-list" aria-label="Danh sách món theo thứ tự gọi">
          {visible.map((dish, index) => (
            <KitchenDishListItem
              key={dish.item.id}
              dish={dish}
              queuePosition={index + 1}
              data={data}
              selected={dish.item.id === selectedDish?.item.id}
              onSelect={() => setSelectedItemId(dish.item.id)}
            />
          ))}
        </div>
        {selectedDish && (
          <KitchenDishDetail
            dish={selectedDish}
            data={data}
            isPending={isPending}
            onStart={(item) =>
              setConfirmAction({ action: 'start', item, tableCode: selectedDish.order.tableCode })
            }
            onComplete={(item) =>
              setConfirmAction({
                action: 'complete',
                item,
                tableCode: selectedDish.order.tableCode,
              })
            }
            onReject={setRejectItem}
          />
        )}
      </KitchenBoardColumn>

      <KitchenBoardColumn
        id="kitchen-ready"
        labelledBy="kitchen-tab-ready"
        hidden={tab !== 'ready'}
        tone="ready"
        title="Món đã xong"
        layout="full"
        hideHeader
        isEmpty={!readyQueue.length}
        empty="Không có món nào đang chờ mang ra."
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
          {readyQueue.map((dish) => (
            <KitchenReadyDishRow key={dish.item.id} dish={dish} data={data} />
          ))}
        </div>
      </KitchenBoardColumn>
    </div>
  )
}
