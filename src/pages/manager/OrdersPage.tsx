import { useState } from 'react'
import { minutes, time } from '../../api/manager/dates'
import { employeeName, isLateOrder, orderStatus, tableForOrder } from '../../api/manager/selectors'
import { useManagerData } from '../../hooks/manager/ManagerDataProvider'
import { useNow } from '../../hooks/kitchen/useNow'
import { managerPath } from '../../routes/managerRouter'
import { Icon, Link, PageHeading, Panel, Search, Status } from '../../components/manager/ui'
import { matchesSearch } from '../../api/manager/labels'
import { OrderDetail } from '../../components/manager/OrderDetail'

export default function OrdersPage({ selectedId }: { selectedId: string }) {
  const { data: d } = useManagerData()
  const now = useNow()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [lateOnly, setLateOnly] = useState(false)
  const [selected, setSelected] = useState(selectedId)
  if (!d) return null

  const counts = {
    all: d.orders.length,
    late: d.orders.filter(order => isLateOrder(order, now)).length,
    PREPARING: d.orders.filter(order => orderStatus(order) === 'PREPARING').length,
    READY: d.orders.filter(order => orderStatus(order) === 'READY').length,
    SERVED: d.orders.filter(order => orderStatus(order) === 'SERVED').length,
  }
  const filters = [
    { id: 'all', label: 'Tất cả đơn', count: counts.all, icon: 'receipt' as const },
    { id: 'late', label: 'Cần kiểm tra', count: counts.late, icon: 'clock' as const, tone: 'danger' },
    { id: 'PREPARING', label: 'Đang chế biến', count: counts.PREPARING, icon: 'utensils' as const, tone: 'warning' },
    { id: 'READY', label: 'Chờ phục vụ', count: counts.READY, icon: 'checkCircle' as const, tone: 'success' },
    { id: 'SERVED', label: 'Đã phục vụ', count: counts.SERVED, icon: 'check' as const },
  ]
  const activeFilter = lateOnly ? 'late' : status || 'all'
  const chooseFilter = (id: string) => {
    setLateOnly(id === 'late')
    setStatus(['PREPARING', 'READY', 'SERVED'].includes(id) ? id : '')
  }
  const rows = d.orders
    .filter(order => matchesSearch(query, order.id, tableForOrder(d, order), employeeName(d, order.employeeId)) && (!status || orderStatus(order) === status) && (!lateOnly || isLateOrder(order, now)))
    .sort((a, b) => {
      const rank = (order: typeof a) => isLateOrder(order, now) ? 0 : orderStatus(order) === 'READY' ? 1 : orderStatus(order) === 'PREPARING' ? 2 : 3
      return rank(a) - rank(b) || a.at.localeCompare(b.at)
    })
  const selectedOrder = d.orders.find(o => o.id === selected)
  return <div className="m-orders-page">
    <PageHeading title="Giám sát đơn hàng" description="Theo dõi tiến độ món theo từng bàn và ưu tiên đơn chờ lâu." actions={<Link className="k-btn" to={managerPath('kitchen')}>Mở màn hình bếp</Link>} />

    <div className="m-orders-filters" aria-label="Lọc nhanh danh sách đơn hàng">{filters.map(filter => <button
      key={filter.id}
      type="button"
      className={`m-orders-filter ${filter.tone ? `is-${filter.tone}` : ''}`}
      aria-pressed={activeFilter === filter.id}
      onClick={() => chooseFilter(filter.id)}
    >
      <span><Icon name={filter.icon} size={16} />{filter.label}</span>
      <strong>{filter.count}</strong>
    </button>)}</div>

    <Panel className="m-orders-panel" title="Danh sách đơn hàng" aside={<span className="m-muted">{rows.length} đơn phù hợp</span>}>
      <div className="m-orders-toolbar"><Search value={query} onChange={setQuery} placeholder="Tìm mã đơn, bàn, nhân viên…" /><p>Đơn quá 25 phút được xếp lên đầu.</p></div>
      {rows.length ? <div className="m-orders-list">
        <div className="m-orders-list-head" aria-hidden="true"><span>Đơn · bàn</span><span>Tiến độ món</span><span>Nhân viên</span><span>Thời gian</span><span /></div>
        {rows.map(order => {
          const late = isLateOrder(order, now)
          const state = orderStatus(order)
          const table = tableForOrder(d, order)
          const total = order.items.reduce((sum, item) => sum + item.quantity, 0)
          const stages = [
            { status: 'SUBMITTED', label: 'Mới nhận', tone: 'info', icon: 'receipt' as const },
            { status: 'PREPARING', label: 'Đang nấu', tone: 'warning', icon: 'cookingPot' as const },
            { status: 'READY', label: 'Chờ phục vụ', tone: 'success', icon: 'checkCircle' as const },
            { status: 'SERVED', label: 'Đã phục vụ', tone: 'neutral', icon: 'check' as const },
          ].map(stage => ({ ...stage, count: order.items.filter(item => item.status === stage.status).reduce((sum, item) => sum + item.quantity, 0) }))
          return <button type="button" className={`m-order-pulse ${late ? 'is-late' : `is-${state.toLowerCase()}`}`} key={order.id} onClick={() => setSelected(order.id)}>
            <span className="m-order-identity">
              <b>{table}</b>
              <span><strong>{order.id}</strong><small>Lượt {order.round} · gửi {time(order.at)}</small></span>
            </span>
            <span className="m-order-progress-cell">
              <span className="m-order-progress-top"><Status value={state} /><small>{total} món</small></span>
              <span className="m-order-states" role="group" aria-label={`Tiến độ món ${order.id}`}>{stages.filter(stage => stage.count > 0).map(stage => <span key={stage.status} className={`m-order-state is-${stage.tone}`}>
                <span className="m-order-state-icon"><Icon name={stage.icon} size={14} /></span>
                <span className="m-order-state-detail"><b>{stage.count}</b><span>{stage.label}</span></span>
              </span>)}</span>
            </span>
            <span className="m-order-owner"><Icon name="user" size={15} /><span><strong>{employeeName(d, order.employeeId)}</strong><small>Nhân viên gọi món</small></span></span>
            <span className={`m-order-wait ${late ? 'is-late' : ''}`}><strong>{state === 'SERVED' ? 'Xong' : `${minutes(order.at, now)} phút`}</strong><small>{late ? 'Cần kiểm tra' : state === 'SERVED' ? 'Đã phục vụ' : 'Thời gian chờ'}</small></span>
            <Icon name="chevronRight" size={15} />
          </button>
        })}
      </div> : <div className="m-empty"><Icon name="inbox" size={24} /><p>Không có đơn hàng phù hợp với bộ lọc.</p></div>}
      <div className="m-table-footer">Hiển thị {rows.length} kết quả</div>
    </Panel>
    {selectedOrder && <OrderDetail order={selectedOrder} data={d} onClose={() => setSelected('')} />}
  </div>
}
