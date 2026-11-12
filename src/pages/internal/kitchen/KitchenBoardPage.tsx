import { useState } from 'react'
import { buildBoard, filterActive, type KitchenFilter } from '../../../api/kitchen/selectors'
import type { KitchenOrderItem } from '../../../api/kitchen/types'
import { Icon } from '../../../components/kitchen/Icon'
import { KitchenBoardColumn } from '../../../components/kitchen/KitchenBoardColumn'
import { KitchenFilters, type FilterOption } from '../../../components/kitchen/KitchenFilters'
import { KitchenTicketCard, ReadyTicketCard } from '../../../components/kitchen/KitchenTicketCard'
import { useKitchenSnapshot } from '../../../hooks/kitchen/kitchenDataContext'
import { useNow } from '../../../hooks/kitchen/useNow'

const refs = (items: KitchenOrderItem[]) => items.map((i) => ({ id: i.id, version: i.version }))

export default function KitchenBoardPage() {
  const { data, run, isPending } = useKitchenSnapshot()
  const now = useNow()
  const [filter, setFilter] = useState<KitchenFilter>('all')
  const [tab, setTab] = useState<'active' | 'ready'>('active')
  const board = buildBoard(data, now)
  const visible = filterActive(board.active, filter)
  const { counts } = board

  const start = (items: KitchenOrderItem[]) => { void run({ type: 'start', items: refs(items) }, items.map((i) => i.id)) }
  const complete = (items: KitchenOrderItem[]) => { void run({ type: 'complete', items: refs(items) }, items.map((i) => i.id)) }

  const filters: FilterOption<KitchenFilter>[] = [
    { value: 'all', label: 'Tất cả', count: board.active.length },
    { value: 'new', label: 'Mới nhận', count: counts.newTickets },
    { value: 'preparing', label: 'Đang chế biến', count: filterActive(board.active, 'preparing').length },
    { value: 'late', label: 'Quá giờ', count: counts.late },
  ]

  return (
    <div className="k-board" data-tab={tab}>
      <div className="k-board-tabs" role="tablist" aria-label="Cột của bảng bếp">
        <button type="button" role="tab" className="k-board-tab" aria-selected={tab === 'active'} aria-controls="kitchen-active" onClick={() => setTab('active')}>
          Nhận món · {board.active.length}
        </button>
        <button type="button" role="tab" className="k-board-tab" aria-selected={tab === 'ready'} aria-controls="kitchen-ready" onClick={() => setTab('ready')}>
          Đã làm xong · {counts.readyItems}
        </button>
      </div>

      <KitchenBoardColumn id="kitchen-active" tone="active" title="Nhận món / Đang chế biến"
        summary={<><b>{board.active.length}</b> phiếu · <b>{counts.newItems}</b> món mới · <b>{counts.preparingItems}</b> đang làm</>}
        toolbar={<KitchenFilters label="Lọc phiếu đang chế biến" options={filters} value={filter} onChange={setFilter} />}
        isEmpty={!visible.length}
        empty={filter === 'all' ? 'Chưa có món cần chế biến.' : 'Không có phiếu nào khớp bộ lọc.'}>
        {visible.map((ticket) => (
          <KitchenTicketCard key={ticket.order.id} ticket={ticket} data={data} now={now} isPending={isPending} onStart={start} onComplete={complete} />
        ))}
      </KitchenBoardColumn>

      <KitchenBoardColumn id="kitchen-ready" tone="ready" title="Đã làm xong / Chờ phục vụ"
        summary={<><b>{counts.readyItems}</b> món · <b>{board.ready.length}</b> phiếu</>}
        toolbar={<p className="k-col-note"><Icon name="info" size={14} />Món ở lại đây cho đến khi nhân viên phục vụ xác nhận đã mang ra.</p>}
        isEmpty={!board.ready.length}
        empty="Không có món nào đang chờ mang ra.">
        {board.ready.map((ticket) => <ReadyTicketCard key={ticket.order.id} ticket={ticket} data={data} now={now} />)}
      </KitchenBoardColumn>
    </div>
  )
}
