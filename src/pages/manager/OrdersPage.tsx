import { useState } from 'react'
import { minutes, time } from '../../api/manager/dates'
import { employeeName, isLateOrder, orderStatus, tableForOrder } from '../../api/manager/selectors'
import { useManagerData } from '../../hooks/manager/ManagerDataProvider'
import { useNow } from '../../hooks/kitchen/useNow'
import { managerPath } from '../../routes/managerRouter'
import { DataTable, Filter, Link, PageHeading, Panel, RowAction, Search, Status } from '../../components/manager/ui'
import { matchesSearch, statusOptions } from '../../api/manager/labels'
import { OrderDetail } from '../../components/manager/OrderDetail'

export default function OrdersPage({ selectedId }: { selectedId: string }) {
  const { data: d } = useManagerData(); const now = useNow()
  const [query, setQuery] = useState(''); const [status, setStatus] = useState(''); const [lateOnly, setLateOnly] = useState(false); const [selected, setSelected] = useState(selectedId)
  if (!d) return null
  const rows = d.orders.filter(o => matchesSearch(query, o.id, tableForOrder(d, o), employeeName(d, o.employeeId)) && (!status || orderStatus(o) === status) && (!lateOnly || isLateOrder(o, now)))
  const selectedOrder = d.orders.find(o => o.id === selected)
  return <><PageHeading title="Giám sát đơn hàng" description="Theo dõi lượt gọi món, trạng thái chế biến và các đơn cần kiểm tra." actions={<Link className="k-btn" to={managerPath('kitchen')}>Xem giám sát bếp</Link>} /><Panel title="Danh sách đơn hàng" aside={<span className="m-muted">{rows.length} đơn</span>}><div className="m-toolbar"><Search value={query} onChange={setQuery} placeholder="Tìm mã đơn, bàn, nhân viên…" /><Filter label="Trạng thái đơn" value={status} onChange={setStatus} options={statusOptions(['PREPARING', 'READY', 'SERVED'])} /><label className="m-checkbox"><input type="checkbox" checked={lateOnly} onChange={e => setLateOnly(e.target.checked)} />Chỉ đơn quá 25 phút</label></div><DataTable headers={['Mã đơn', 'Bàn', 'Nhân viên', 'Giờ gửi', 'Số món', 'Trạng thái', 'Thời gian chờ', '']} empty={!rows.length} count={rows.length}>{rows.map(o => <tr key={o.id} className={isLateOrder(o, now) ? 'm-row-warning' : ''}><td className="m-code">{o.id}<small>Lượt gọi {o.round}</small></td><td><span className="m-table-code">{tableForOrder(d, o)}</span></td><td>{employeeName(d, o.employeeId)}</td><td className="m-num">{time(o.at)}</td><td>{o.items.reduce((n, i) => n + i.quantity, 0)} món</td><td><Status value={orderStatus(o)} /></td><td>{orderStatus(o) === 'SERVED' ? '—' : <span className={isLateOrder(o, now) ? 'm-danger' : 'm-muted'}>{minutes(o.at, now)} phút{isLateOrder(o, now) && ' · Cần kiểm tra'}</span>}</td><td><RowAction onClick={() => setSelected(o.id)} /></td></tr>)}</DataTable></Panel>{selectedOrder && <OrderDetail order={selectedOrder} data={d} onClose={() => setSelected('')} />}</>
}
