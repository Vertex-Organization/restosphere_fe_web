import { businessDay } from '../../api/manager/dates'
import { useManagerData } from '../../hooks/manager/ManagerDataProvider'
import { useNow } from '../../hooks/kitchen/useNow'
import { useManagerUser } from '../../api/manager/auth'
import { Icon } from './ui'
import type { IconName } from '../billing/Icon'

type SummaryPage =
  | 'reservations'
  | 'tables'
  | 'employees'
  | 'shifts'
  | 'menu'
  | 'categories'
  | 'approvals'
  | 'incidents'
  | 'notifications'
type Stat = {
  label: string
  value: number
  icon: IconName
  tone?: 'warning' | 'danger' | 'success'
}

export function WorkspaceSummary({ page }: { page: SummaryPage }) {
  const { data: d } = useManagerData()
  const user = useManagerUser()
  const now = useNow()
  if (!d || !user) return null
  const today = businessDay(now)
  const reservations = d.reservations.filter((r) => businessDay(r.at) === today)
  const openIncidents = d.incidents.filter((i) => i.status !== 'RESOLVED')
  const shifts = d.shifts.filter((s) => s.date === today)
  const stats: Record<SummaryPage, Stat[]> = {
    reservations: [
      { label: 'Lịch đặt hôm nay', value: reservations.length, icon: 'clipboard' },
      {
        label: 'Chờ xác nhận',
        value: reservations.filter((r) => r.status === 'PENDING').length,
        icon: 'clock',
        tone: 'warning',
      },
      {
        label: 'Đã xác nhận',
        value: reservations.filter((r) => r.status === 'CONFIRMED').length,
        icon: 'checkCircle',
        tone: 'success',
      },
      {
        label: 'Đã đến / nhận bàn',
        value: reservations.filter((r) => ['ARRIVED', 'SEATED'].includes(r.status)).length,
        icon: 'users',
      },
    ],
    tables: [
      { label: 'Tổng số bàn', value: d.tables.length, icon: 'board' },
      {
        label: 'Đang phục vụ',
        value: d.tables.filter((t) => t.status === 'OCCUPIED').length,
        icon: 'users',
      },
      {
        label: 'Sẵn sàng đón khách',
        value: d.tables.filter((t) => t.status === 'AVAILABLE').length,
        icon: 'checkCircle',
        tone: 'success',
      },
      {
        label: 'Chờ dọn / tạm ngưng',
        value: d.tables.filter((t) => ['CLEANING', 'OUT_OF_SERVICE'].includes(t.status)).length,
        icon: 'clock',
        tone: 'warning',
      },
    ],
    employees: [
      { label: 'Tổng nhân viên', value: d.employees.length, icon: 'users' },
      {
        label: 'Đang làm việc',
        value: d.employees.filter((e) => e.status === 'ACTIVE').length,
        icon: 'checkCircle',
        tone: 'success',
      },
      {
        label: 'Được phân ca hôm nay',
        value: new Set(shifts.flatMap((s) => s.employeeIds)).size,
        icon: 'clipboard',
      },
      {
        label: 'Nghỉ phép',
        value: d.employees.filter((e) => e.status === 'LEAVE').length,
        icon: 'clock',
        tone: 'warning',
      },
    ],
    shifts: [
      { label: 'Ca làm hôm nay', value: shifts.length, icon: 'clipboard' },
      {
        label: 'Nhân sự được phân ca',
        value: new Set(shifts.flatMap((s) => s.employeeIds)).size,
        icon: 'users',
      },
      {
        label: 'Ca đủ định biên',
        value: shifts.filter((s) => s.employeeIds.length >= s.minimum).length,
        icon: 'checkCircle',
        tone: 'success',
      },
      {
        label: 'Ca thiếu nhân sự',
        value: shifts.filter((s) => s.employeeIds.length < s.minimum).length,
        icon: 'alert',
        tone: 'warning',
      },
    ],
    menu: [
      { label: 'Tổng món ăn', value: d.menu.length, icon: 'utensils' },
      {
        label: 'Đang kinh doanh',
        value: d.menu.filter((m) => m.status === 'AVAILABLE').length,
        icon: 'checkCircle',
        tone: 'success',
      },
      {
        label: 'Tạm hết món',
        value: d.menu.filter((m) => m.status === 'SOLD_OUT').length,
        icon: 'clock',
        tone: 'warning',
      },
      {
        label: 'Ngừng bán',
        value: d.menu.filter((m) => m.status === 'DISCONTINUED').length,
        icon: 'xCircle',
      },
    ],
    categories: [
      { label: 'Danh mục', value: d.categories.length, icon: 'list' },
      {
        label: 'Đang hiển thị',
        value: d.categories.filter((c) => c.visible).length,
        icon: 'checkCircle',
        tone: 'success',
      },
      { label: 'Đã ẩn', value: d.categories.filter((c) => !c.visible).length, icon: 'xCircle' },
      { label: 'Tổng món ăn', value: d.menu.length, icon: 'utensils' },
    ],
    approvals: [
      {
        label: 'Chờ phê duyệt',
        value: d.approvals.filter((a) => a.status === 'PENDING').length,
        icon: 'clock',
        tone: 'warning',
      },
      {
        label: 'Đã phê duyệt',
        value: d.approvals.filter((a) => a.status === 'APPROVED').length,
        icon: 'checkCircle',
        tone: 'success',
      },
      {
        label: 'Đã từ chối',
        value: d.approvals.filter((a) => a.status === 'REJECTED').length,
        icon: 'xCircle',
      },
      {
        label: 'Đã rút yêu cầu',
        value: d.approvals.filter((a) => a.status === 'WITHDRAWN').length,
        icon: 'history',
      },
    ],
    incidents: [
      { label: 'Sự cố đang mở', value: openIncidents.length, icon: 'flag' },
      {
        label: 'Mức độ cao',
        value: openIncidents.filter((i) => i.severity === 'HIGH').length,
        icon: 'alert',
        tone: 'danger',
      },
      {
        label: 'Đang xử lý',
        value: d.incidents.filter((i) => i.status === 'ACKNOWLEDGED').length,
        icon: 'clock',
        tone: 'warning',
      },
      {
        label: 'Đã giải quyết',
        value: d.incidents.filter((i) => i.status === 'RESOLVED').length,
        icon: 'checkCircle',
        tone: 'success',
      },
    ],
    notifications: [
      { label: 'Tổng thông báo', value: d.notifications.length, icon: 'bell' },
      {
        label: 'Chưa đọc',
        value: d.notifications.filter((n) => !n.readBy.includes(user.id)).length,
        icon: 'clock',
        tone: 'warning',
      },
      {
        label: 'Đã đọc',
        value: d.notifications.filter((n) => n.readBy.includes(user.id)).length,
        icon: 'checkCircle',
        tone: 'success',
      },
      {
        label: 'Thông báo sự cố',
        value: d.notifications.filter((n) => n.kind === 'INCIDENT').length,
        icon: 'alert',
      },
    ],
  }
  return (
    <section className="m-workspace-summary" aria-label="Số liệu tóm tắt">
      <dl>
        {stats[page].map((stat) => (
          <div key={stat.label} className={`m-summary-stat ${stat.tone ? `is-${stat.tone}` : ''}`}>
            <span className="m-summary-icon">
              <Icon name={stat.icon} size={18} />
            </span>
            <dt>{stat.label}</dt>
            <dd>{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
