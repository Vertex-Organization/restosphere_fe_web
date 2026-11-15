import { businessDay, dateLabel, minutes, money, time } from '../../api/manager/dates'
import { dashboard, employeeName, tableForOrder } from '../../api/manager/selectors'
import { useManagerData } from '../../hooks/manager/ManagerDataProvider'
import { useNow } from '../../hooks/kitchen/useNow'
import { managerPath } from '../../routes/managerRouter'
import { Button, DataTable, Icon, Link, Metrics, PageHeading, Panel, Status } from '../../components/manager/ui'
import { APPROVAL_TYPE } from '../../api/manager/labels'

export default function ManagerDashboardPage() {
  const { data: d, refresh } = useManagerData()
  const now = useNow()
  if (!d) return null
  const s = dashboard(d, now)
  const isLate = (r: typeof d.reservations[number]) => (r.status === 'CONFIRMED' || r.status === 'PENDING') && minutes(r.at, now) > 15
  const waitingReservations = d.reservations.filter(r => ['CONFIRMED', 'PENDING'].includes(r.status) && businessDay(r.at) === businessDay(now)).sort((a, b) => a.at.localeCompare(b.at))
  const upcoming = waitingReservations.slice(0, 4)
  const alerts = [
    ...s.lateOrders.map(o => ({ id: o.id, title: `Bàn ${tableForOrder(d, o)} chờ món ${minutes(o.at, now)} phút`, description: `${o.id} · Cần kiểm tra với bếp`, path: managerPath('orders', o.id), icon: 'clock' as const, tone: 'danger' })),
    ...s.incidents.map(i => ({ id: i.id, title: i.title, description: `${i.id} · ${employeeName(d, i.reporterId)}`, path: managerPath('incidents', i.id), icon: 'alert' as const, tone: i.severity === 'HIGH' ? 'danger' : 'warning' })),
    ...d.reservations.filter(isLate).map(r => ({ id: r.id, title: `${r.customer} trễ giờ nhận bàn`, description: `${r.id} · Bàn ${r.tableId} · ${time(r.at)}`, path: managerPath('reservations', r.id), icon: 'users' as const, tone: 'warning' })),
  ]
  return <>
    <PageHeading title="Tổng quan" description={`${dateLabel(now)} · Tình hình hoạt động nhà hàng hôm nay`} actions={<><span className="m-live-label"><i />Theo dõi vận hành</span><Button icon="refresh" onClick={() => { void refresh() }}>Làm mới dữ liệu</Button></>} />
    <Metrics items={[
      { label: 'Doanh thu hôm nay', value: money(s.revenue), hint: 'Giao dịch đã thanh toán thành công', icon: 'cash', path: managerPath('reports') },
      { label: 'Bàn đang phục vụ', value: <>{s.occupied}<em>/ {d.tables.length}</em></>, hint: `${d.sessions.reduce((n, t) => n + t.guests, 0)} khách tại nhà hàng`, icon: 'users', path: managerPath('tables') },
      { label: 'Lịch đặt hôm nay', value: s.reservations, hint: `${waitingReservations.length} lịch đặt đang chờ khách`, icon: 'clipboard', path: managerPath('reservations') },
      { label: 'Đơn đang xử lý', value: s.activeOrders, hint: `${s.ready} món chờ phục vụ`, icon: 'receipt', path: managerPath('orders') },
    ]} />
    <div className="m-dashboard-grid">
      <div className="m-dashboard-column">
      <Panel title="Giám sát vận hành" aside={<Link className="m-text-link" to={managerPath('operations')}>Xem vận hành<Icon name="arrowRight" size={14} /></Link>}>
        <div className="m-operation-strip"><Link to={managerPath('tables')}><span className="m-status-dot info" /><strong>{s.occupied}</strong><span>Bàn có khách</span></Link><Link to={managerPath('tables')}><span className="m-status-dot warning" /><strong>{s.cleaning}</strong><span>Bàn chờ dọn</span></Link><Link to={managerPath('kitchen')}><span className="m-status-dot success" /><strong>{s.ready}</strong><span>Món chờ phục vụ</span></Link><Link to={managerPath('operations')}><span className="m-status-dot neutral" /><strong>{d.sessions.filter(t => t.paymentRequested).length}</strong><span>Chờ thanh toán</span></Link></div>
        <div className="m-floor-preview">{d.areas.map(area => <div key={area.id}><div className="m-floor-heading"><h3>{area.name}</h3><span>{d.tables.filter(t => t.areaId === area.id && t.status === 'OCCUPIED').length}/{d.tables.filter(t => t.areaId === area.id).length} bàn có khách</span></div><div className="m-floor-mini">{d.tables.filter(t => t.areaId === area.id).map(t => <Link key={t.id} className={`m-table-tile m-table-tile--${t.status.toLowerCase()}`} to={managerPath('tables', t.id)} aria-label={`Bàn ${t.id}, ${t.seats} ghế`}><Icon name="users" size={15} /><strong>{t.id}</strong><small>{t.seats} ghế</small></Link>)}</div></div>)}</div>
        <div className="m-legend">{['OCCUPIED', 'AVAILABLE', 'CLEANING', 'OUT_OF_SERVICE'].map(v => <span key={v}><i className={`m-status-dot ${v.toLowerCase()}`} />{v === 'OCCUPIED' ? 'Có khách' : v === 'AVAILABLE' ? 'Sẵn sàng' : v === 'CLEANING' ? 'Đang dọn' : 'Tạm ngưng'}</span>)}</div>
      </Panel>
      <Panel title="Đặt bàn sắp đến" aside={<Link className="m-text-link" to={managerPath('reservations')}>Xem đặt bàn<Icon name="arrowRight" size={14} /></Link>}>
        <DataTable headers={['Khách hàng', 'Giờ đến', 'Số khách', 'Bàn', 'Trạng thái']} empty={!upcoming.length}>{upcoming.map(r => <tr key={r.id}><td><Link className="m-cell-link" to={managerPath('reservations', r.id)}>{r.customer}<small>{r.id}</small></Link></td><td className="m-num">{time(r.at)}</td><td>{r.guests} khách</td><td><span className="m-table-code">{r.tableId}</span></td><td><Status value={r.status} label={r.status === 'PENDING' ? 'Chờ xác nhận' : undefined} /></td></tr>)}</DataTable>
      </Panel>
      </div>
      <div className="m-dashboard-column">
      <Panel title="Cần chú ý" aside={<span className="m-count m-count--danger">{alerts.length}</span>}>
        <div className="m-alert-list">{alerts.length ? alerts.slice(0, 4).map(a => <Link key={a.id} className={`m-alert-row ${a.tone}`} to={a.path}><span className="m-alert-icon"><Icon name={a.icon} size={16} /></span><div><strong>{a.title}</strong><small>{a.description}</small></div><Icon name="chevronRight" size={14} /></Link>) : <p className="m-inline-empty">Không có cảnh báo đang mở.</p>}</div>
        <div className="m-approval-peek"><div><Icon name="checkCircle" /><h3>Yêu cầu phê duyệt</h3><span className="m-count">{s.pending.length}</span></div>{s.pending.slice(0, 2).map(a => <Link to={managerPath('approvals', a.id)} key={a.id}><div><strong>{APPROVAL_TYPE[a.type]}</strong><small>{a.id} · {employeeName(d, a.requestedBy)}</small></div><span>{a.amount ? money(a.amount) : 'Đặt bàn'}<Icon name="chevronRight" size={13} /></span></Link>)}<Link className="m-text-link" to={managerPath('approvals')}>Xem yêu cầu phê duyệt<Icon name="arrowRight" size={14} /></Link></div>
      </Panel>
      <Panel title="Hoạt động gần đây" aside={<Icon name="history" size={16} />}><ul className="m-activity">{d.history.slice(0, 5).map(e => <li key={e.id}><span className="m-activity-mark"><Icon name="check" size={12} /></span><div><p>{e.text}</p><small>{employeeName(d, e.actorId)} · {time(e.at)}</small></div></li>)}</ul></Panel>
      </div>
    </div>
  </>
}
