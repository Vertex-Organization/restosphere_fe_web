import { dashboard, orderStatus } from '../../api/manager/selectors'
import { useManagerData } from '../../hooks/manager/ManagerDataProvider'
import { useNow } from '../../hooks/kitchen/useNow'
import { managerPath } from '../../routes/managerRouter'
import { Icon, Link, Metrics, PageHeading, Panel } from '../../components/manager/ui'

export default function OperationsPage() {
  const { data: d } = useManagerData(); const now = useNow()
  if (!d) return null
  const s = dashboard(d, now)
  const groups = [
    { title: 'Bàn & khu vực', path: managerPath('tables'), icon: 'users' as const, rows: [['Tổng số bàn', d.tables.length], ['Sẵn sàng', d.tables.filter(t => t.status === 'AVAILABLE').length], ['Có khách', s.occupied], ['Đang dọn', s.cleaning], ['Tạm ngưng', d.tables.filter(t => t.status === 'INACTIVE').length]] },
    { title: 'Lịch đặt bàn', path: managerPath('reservations'), icon: 'clipboard' as const, rows: [['Chờ xác nhận', d.reservations.filter(r => r.status === 'PENDING').length], ['Đã xác nhận', d.reservations.filter(r => r.status === 'CONFIRMED').length], ['Khách đã đến', d.reservations.filter(r => r.status === 'ARRIVED').length], ['Khách đến trễ', d.reservations.filter(r => r.status === 'LATE').length], ['Khách không đến', d.reservations.filter(r => r.status === 'NO_SHOW').length]] },
    { title: 'Đơn hàng & bếp', path: managerPath('orders'), icon: 'utensils' as const, rows: [['Đơn có món mới', d.orders.filter(o => o.items.some(i => i.status === 'NEW')).length], ['Đang chế biến', d.orders.filter(o => orderStatus(o) === 'PREPARING').length], ['Đơn chờ phục vụ', d.orders.filter(o => orderStatus(o) === 'READY').length], ['Đã phục vụ', d.orders.filter(o => orderStatus(o) === 'SERVED').length], ['Đơn quá 25 phút', s.lateOrders.length]] },
    { title: 'Thanh toán', path: managerPath('reports'), icon: 'cash' as const, rows: [['Bàn yêu cầu thanh toán', d.sessions.filter(t => t.paymentRequested).length], ['Giao dịch chờ xử lý', d.payments.filter(p => p.status === 'PENDING').length], ['Giao dịch hoàn tất', d.payments.filter(p => p.status === 'COMPLETED').length], ['Giao dịch thất bại', d.payments.filter(p => p.status === 'FAILED').length]] },
  ]
  return <><PageHeading title="Giám sát vận hành" description="Trạng thái bàn, đặt bàn, đơn hàng và thanh toán tại một nơi." /><Metrics items={[{ label: 'Bàn có khách', value: s.occupied, icon: 'users' }, { label: 'Món chờ phục vụ', value: s.ready, icon: 'utensils' }, { label: 'Đơn chậm', value: s.lateOrders.length, icon: 'clock' }, { label: 'Sự cố đang mở', value: s.incidents.length, icon: 'flag' }]} /><div className="m-grid-two">{groups.map(g => <Panel key={g.title} title={g.title} aside={<Icon name={g.icon} />}><div className="m-monitor-rows">{g.rows.map(([label, count]) => <Link to={g.path} key={label}><span>{label}</span><strong>{count}</strong><Icon name="chevronRight" size={14} /></Link>)}</div><div className="m-panel-bottom"><Link className="m-text-link" to={g.path}>Xem {g.title.toLowerCase()}<Icon name="arrowRight" size={14} /></Link></div></Panel>)}</div><p className="m-footnote">Giám sát chỉ đọc. Các thao tác phục vụ, bếp và thu tiền được thực hiện tại không gian nghiệp vụ tương ứng.</p></>
}
