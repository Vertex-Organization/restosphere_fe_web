import { useAdminData } from '../../hooks/admin/AdminDataProvider'
import { adminPath } from '../../routes/adminRouter'
import { AdminLink, DataTable, DemoNotice, EmptyState, Icon, PageHeader, RoleBadge, StatusBadge } from '../../components/admin/ui'

const date = (value: string) => new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))

export default function AdminDashboardPage() {
  const { data } = useAdminData()
  if (!data) return null
  const staff = data.users.filter((user) => user.role !== 'CUSTOMER')
  const active = data.users.filter((user) => user.status === 'ACTIVE')
  const locked = data.users.filter((user) => user.status === 'LOCKED')
  const recent = [...data.users].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5)

  const metrics = [
    { label: 'Tổng tài khoản', value: data.users.length, detail: 'Tất cả vai trò', icon: 'users' as const },
    { label: 'Tài khoản nhân viên', value: staff.length, detail: 'Không gồm khách hàng', icon: 'user' as const },
    { label: 'Đang hoạt động', value: active.length, detail: 'Có thể đăng nhập', icon: 'checkCircle' as const },
    { label: 'Đã khóa', value: locked.length, detail: 'Cần quản trị viên xử lý', icon: 'alert' as const },
  ]

  return <>
    <PageHeader title="Tổng quan hệ thống" description="Quản lý tài khoản và theo dõi hoạt động RestoSphere." />
    <DemoNotice />
    <div className="a-stat-grid">{metrics.map((metric) => <article className="a-stat" key={metric.label}><div><span>{metric.label}</span><span className="a-stat-icon"><Icon name={metric.icon} size={18} /></span></div><strong>{metric.value.toString().padStart(2, '0')}</strong><p>{metric.detail}</p></article>)}</div>
    <div className="a-dashboard-grid">
      <section className="a-panel a-panel--wide"><header><div><h2>Tài khoản gần đây</h2><p>5 tài khoản mới nhất trong bộ dữ liệu hiện tại.</p></div><AdminLink className="a-text-link" to={adminPath('users')}>Xem tất cả <Icon name="arrowRight" size={14} /></AdminLink></header><DataTable labels={['Tài khoản', 'Vai trò', 'Trạng thái', 'Ngày tạo']}><>{recent.map((user) => <tr key={user.id}><td><div className="a-person"><span className="a-avatar a-avatar--soft">{user.initials}</span><div><strong>{user.fullName}</strong><small>{user.email}</small></div></div></td><td><RoleBadge role={user.role} /></td><td><StatusBadge status={user.status} /></td><td>{date(user.createdAt)}</td></tr>)}</></DataTable></section>
      <section className="a-panel"><header><div><h2>Thao tác nhanh</h2><p>Đi thẳng đến công việc quản trị.</p></div></header><div className="a-quick-links"><AdminLink to={adminPath('users')}><span><Icon name="users" size={18} /></span><div><strong>Quản lý tài khoản</strong><small>Tìm, lọc và xem chi tiết</small></div><Icon name="chevronRight" size={15} /></AdminLink><AdminLink to={adminPath('roles')}><span><Icon name="checkCircle" size={18} /></span><div><strong>Phân quyền</strong><small>Xem vai trò hệ thống</small></div><Icon name="chevronRight" size={15} /></AdminLink><AdminLink to={adminPath('restaurant')}><span><Icon name="utensils" size={18} /></span><div><strong>Thông tin nhà hàng</strong><small>Cập nhật hồ sơ hiển thị</small></div><Icon name="chevronRight" size={15} /></AdminLink></div></section>
      <section className="a-panel a-panel--wide"><header><div><h2>Hoạt động quản trị gần đây</h2><p>Thay đổi role, trạng thái tài khoản và thông tin nhà hàng.</p></div><AdminLink className="a-text-link" to={adminPath('audit-logs')}>Mở nhật ký <Icon name="arrowRight" size={14} /></AdminLink></header>{data.auditLogs.length ? null : <EmptyState title="Chưa có dữ liệu nhật ký" description="Backend hiện chưa cung cấp audit API. Không có hoạt động nào được giả lập thành dữ liệu thật." />}</section>
    </div>
  </>
}
