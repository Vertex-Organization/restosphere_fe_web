import { businessDay, dayAt, minutes, time } from '../../api/manager/dates'
import { DEPARTMENT, incidentTitle } from '../../api/manager/labels'
import { dashboard, tableCode, tableForOrder } from '../../api/manager/selectors'
import { useManagerData } from '../../hooks/manager/ManagerDataProvider'
import { useNow } from '../../hooks/kitchen/useNow'
import { managerPath } from '../../routes/managerRouter'
import { Icon, Link, PageHeading, Panel } from '../../components/manager/ui'
import type { IconName } from '../../components/billing/Icon'

type QueueItem = {
  id: string
  title: string
  meta: string
  path: string
  icon: IconName
  tone: 'danger' | 'warning' | 'info'
}

export default function OperationsPage() {
  const { data: d } = useManagerData()
  const now = useNow()
  if (!d) return null

  const s = dashboard(d, now)
  const today = businessDay(now)
  const activeItems = d.orders.flatMap(order => order.items
    .filter(item => ['SUBMITTED', 'PREPARING', 'READY'].includes(item.status))
    .map(item => ({ order, item })))
  const paymentRequests = d.sessions.filter(session => session.paymentRequested)
  const failedPayments = d.payments.filter(payment => payment.status === 'FAILED' && businessDay(payment.at) === today)
  const upcoming = d.reservations
    .filter(reservation => ['PENDING', 'CONFIRMED'].includes(reservation.status))
    .filter(reservation => {
      const wait = new Date(reservation.at).getTime() - now
      return wait >= -15 * 60000 && wait <= 90 * 60000
    })
    .sort((a, b) => a.at.localeCompare(b.at))

  const queue: QueueItem[] = [
    ...s.lateOrders.map(order => ({
      id: order.id,
      title: `Bàn ${tableForOrder(d, order)} chờ món ${minutes(order.at, now)} phút`,
      meta: `${order.id} · Vượt ngưỡng 25 phút`,
      path: managerPath('orders', order.id),
      icon: 'clock' as const,
      tone: 'danger' as const,
    })),
    ...s.incidents.map(incident => ({
      id: incident.id,
      title: incidentTitle(incident),
      meta: `${incident.code} · ${incident.status === 'OPEN' ? 'Chưa tiếp nhận' : 'Đang xử lý'}`,
      path: managerPath('incidents', incident.id),
      icon: 'alert' as const,
      tone: incident.severity === 'HIGH' ? 'danger' as const : 'warning' as const,
    })),
    ...paymentRequests.map(session => ({
      id: session.id,
      title: `Bàn ${tableCode(d, session.tableId)} yêu cầu thanh toán`,
      meta: `${session.guests} khách · Phục vụ ${minutes(session.startedAt, now)} phút`,
      path: managerPath('tables', session.tableId),
      icon: 'cash' as const,
      tone: 'warning' as const,
    })),
    ...upcoming.filter(reservation => reservation.status === 'PENDING').map(reservation => ({
      id: reservation.id,
      title: `Xác nhận lịch ${time(reservation.at)} · ${reservation.customer}`,
      meta: `${reservation.guests} khách · Bàn ${tableCode(d, reservation.tableId)}`,
      path: managerPath('reservations', reservation.id),
      icon: 'clipboard' as const,
      tone: 'info' as const,
    })),
  ]

  const immediateCount = s.lateOrders.length + s.incidents.filter(incident => incident.severity === 'HIGH').length + failedPayments.length
  const todayPayments = d.payments.filter(payment => businessDay(payment.at) === today)
  const currentShift = d.shifts.find(shift => shift.date === today && now >= new Date(dayAt(today, shift.start)).getTime() && now < new Date(dayAt(today, shift.end)).getTime())
  const shiftEmployees = currentShift ? d.employees.filter(employee => currentShift.employeeIds.includes(employee.id)) : []
  const departments = ['SERVICE', 'KITCHEN', 'RECEPTION', 'CASHIER'] as const
  const submittedCount = activeItems.filter(({ item }) => item.status === 'SUBMITTED').reduce((sum, { item }) => sum + item.quantity, 0)
  const preparingCount = activeItems.filter(({ item }) => item.status === 'PREPARING').reduce((sum, { item }) => sum + item.quantity, 0)
  const readyCount = activeItems.filter(({ item }) => item.status === 'READY').reduce((sum, { item }) => sum + item.quantity, 0)
  const tablesWithReadyItems = new Set(activeItems.filter(({ item }) => item.status === 'READY').map(({ order }) => d.sessions.find(session => session.id === order.sessionId)?.tableId).filter(Boolean)).size
  const workflow = [
    { label: 'Đón khách', value: upcoming.length, detail: `${upcoming.filter(reservation => reservation.status === 'PENDING').length} lịch chờ xác nhận`, icon: 'clipboard' as const, path: managerPath('reservations'), tone: 'info' },
    { label: 'Đang phục vụ', value: d.sessions.length, detail: `${d.sessions.reduce((sum, session) => sum + session.guests, 0)} khách tại bàn`, icon: 'users' as const, path: managerPath('tables'), tone: 'primary' },
    { label: 'Trong bếp', value: submittedCount + preparingCount, detail: `${submittedCount} mới · ${preparingCount} đang làm`, icon: 'utensils' as const, path: managerPath('kitchen'), tone: 'warning' },
    { label: 'Chờ ra món', value: readyCount, detail: `${tablesWithReadyItems} bàn đang chờ`, icon: 'checkCircle' as const, path: managerPath('kitchen'), tone: 'success' },
    { label: 'Thu tiền', value: paymentRequests.length, detail: `${todayPayments.filter(payment => payment.status === 'PENDING').length} giao dịch chờ`, icon: 'cash' as const, path: managerPath('reports'), tone: 'neutral' },
  ]
  const serviceRows = d.sessions.map(session => {
    const table = d.tables.find(item => item.id === session.tableId)
    const orders = d.orders.filter(order => order.sessionId === session.id)
    const items = orders.flatMap(order => order.items)
    const hasLateOrder = orders.some(order => s.lateOrders.some(late => late.id === order.id))
    const ready = items.filter(item => item.status === 'READY').reduce((sum, item) => sum + item.quantity, 0)
    const kitchen = items.filter(item => ['SUBMITTED', 'PREPARING'].includes(item.status)).reduce((sum, item) => sum + item.quantity, 0)
    const state = session.paymentRequested ? 'Chờ thanh toán' : ready ? 'Có món chờ ra' : kitchen ? 'Bếp đang làm' : 'Đang phục vụ'
    const tone = hasLateOrder ? 'danger' : session.paymentRequested || ready ? 'warning' : kitchen ? 'info' : 'success'
    return { session, table, area: d.areas.find(area => area.id === table?.areaId), hasLateOrder, ready, kitchen, state, tone }
  }).sort((a, b) => Number(b.hasLateOrder) - Number(a.hasLateOrder) || Number(b.session.paymentRequested) - Number(a.session.paymentRequested) || a.session.startedAt.localeCompare(b.session.startedAt))

  return <div className="m-operations">
    <PageHeading
      title="Giám sát vận hành"
      description="Theo dõi điểm nghẽn từ bàn, bếp đến thanh toán trong một màn hình."
      actions={<span className="m-ops-live"><i />Đang theo dõi trực tiếp</span>}
    />

    <section className={`m-ops-notice ${immediateCount ? 'is-attention' : 'is-clear'}`} aria-label="Trạng thái ưu tiên">
      <span><Icon name={immediateCount ? 'alert' : 'checkCircle'} size={18} /></span>
      <div><strong>{immediateCount ? `${immediateCount} điểm cần xử lý ngay` : 'Không có điểm nghẽn nghiêm trọng'}</strong><p>{immediateCount ? 'Đơn chậm, sự cố mức cao hoặc giao dịch thất bại đang được đưa lên đầu hàng đợi.' : 'Luồng phục vụ hiện không có đơn chậm, sự cố mức cao hay giao dịch thất bại.'}</p></div>
      <a href="#priority-queue">Xem hàng đợi<Icon name="arrowRight" size={14} /></a>
    </section>

    <Panel className="m-ops-workflow" title="Luồng vận hành hiện tại" aside={<span className="m-muted">Đón khách → thu tiền</span>}>
      <div className="m-ops-workflow-track">{workflow.map((stage, index) => <Link to={stage.path} className={`m-ops-workflow-stage is-${stage.tone}`} key={stage.label}>
        <span className="m-ops-workflow-icon"><Icon name={stage.icon} size={17} /></span>
        <div><small>{stage.label}</small><strong>{stage.value}</strong><p>{stage.detail}</p></div>
        {index < workflow.length - 1 && <Icon name="chevronRight" size={16} className="m-ops-workflow-arrow" />}
      </Link>)}</div>
    </Panel>

    <div className="m-ops-layout">
      <div className="m-ops-main">
        <Panel className="m-ops-service" title="Bàn đang phục vụ" aside={<Link className="m-text-link" to={managerPath('tables')}>Xem toàn bộ bàn<Icon name="arrowRight" size={14} /></Link>}>
          <div className="m-ops-service-head"><span>Bàn · khu vực</span><span>Thời gian</span><span>Tiến độ hiện tại</span><span>Tải bếp</span><span /></div>
          <div className="m-ops-service-list">{serviceRows.map(row => <Link to={managerPath('tables', row.session.tableId)} className={`m-ops-service-row is-${row.tone}`} key={row.session.id}>
            <div className="m-ops-service-table"><strong>{row.table?.code ?? '—'}</strong><span>{row.area?.name ?? 'Chưa gán khu vực'}</span></div>
            <div className="m-ops-service-time"><strong>{minutes(row.session.startedAt, now)} phút</strong><span>{row.session.guests} khách</span></div>
            <div className="m-ops-service-state"><i /><span><strong>{row.hasLateOrder ? 'Đơn đang chậm' : row.state}</strong><small>{row.session.paymentRequested ? 'Thu ngân cần tiếp nhận' : row.ready ? `${row.ready} món cần mang ra` : row.kitchen ? `${row.kitchen} món đang trong bếp` : 'Không có món chờ'}</small></span></div>
            <div className={`m-ops-service-load ${row.kitchen + row.ready === 0 ? 'is-empty' : ''}`}><span className="m-ops-load-icon"><Icon name="cookingPot" size={16} /></span><div><strong>{row.kitchen + row.ready}</strong><small>món mở</small></div></div>
            <Icon name="chevronRight" size={14} />
          </Link>)}</div>
        </Panel>
      </div>

      <aside className="m-ops-side" aria-label="Điểm cần theo dõi">
        <Panel className="m-ops-queue" title="Hàng đợi ưu tiên" aside={<span className={`m-count ${queue.some(item => item.tone === 'danger') ? 'm-count--danger' : ''}`}>{queue.length}</span>}>
          <span id="priority-queue" className="m-ops-anchor" />
          {queue.length ? <div className="m-ops-queue-list">{queue.slice(0, 7).map(item => <Link key={`${item.id}-${item.title}`} className={`m-ops-queue-item is-${item.tone}`} to={item.path}>
            <span className="m-ops-queue-icon"><Icon name={item.icon} size={16} /></span>
            <div><strong>{item.title}</strong><small>{item.meta}</small></div>
            <Icon name="chevronRight" size={14} />
          </Link>)}</div> : <div className="m-ops-clear"><Icon name="checkCircle" size={24} /><strong>Không có hàng đợi</strong><p>Các điểm vận hành đang trong ngưỡng theo dõi.</p></div>}
        </Panel>

        <Panel className="m-ops-shift" title="Năng lực ca hiện tại" aside={<Icon name="users" size={17} />}>
          {currentShift ? <><div className="m-ops-shift-summary"><div><strong>{currentShift.name}</strong><span>{currentShift.start}–{currentShift.end}</span></div><b className={currentShift.employeeIds.length < currentShift.minimum ? 'm-warning' : ''}>{currentShift.employeeIds.length}/{currentShift.minimum}<small>nhân sự</small></b></div>
            <dl>{departments.map(department => <div key={department}><dt>{DEPARTMENT[department]}</dt><dd>{shiftEmployees.filter(employee => employee.department === department).length}</dd></div>)}</dl>
            <div className="m-panel-bottom"><Link className="m-text-link" to={managerPath('shifts')}>Xem phân công ca<Icon name="arrowRight" size={14} /></Link></div></> : <p className="m-inline-empty">Không có ca làm đang diễn ra trong dữ liệu hiện tại.</p>}
        </Panel>
      </aside>
    </div>

    <p className="m-footnote">Màn hình này chỉ dùng để giám sát. Thao tác phục vụ, chế biến và thu tiền được thực hiện tại không gian nghiệp vụ tương ứng.</p>
  </div>
}
