import { useAdminData } from '../../hooks/admin/AdminDataProvider'
import { Icon } from './ui'

export function AccountStats() {
  const { data } = useAdminData()
  if (!data) return null
  const stats = [
    {
      label: 'Tổng tài khoản',
      value: data.users.length,
      detail: 'Tất cả vai trò',
      icon: 'users' as const,
      tone: 'primary',
    },
    {
      label: 'Tài khoản nhân viên',
      value: data.users.filter((user) => user.role !== 'CUSTOMER').length,
      detail: 'Nhân sự nhà hàng',
      icon: 'user' as const,
      tone: 'info',
    },
    {
      label: 'Đang hoạt động',
      value: data.users.filter((user) => user.status === 'ACTIVE').length,
      detail: 'Có thể đăng nhập',
      icon: 'checkCircle' as const,
      tone: 'success',
    },
    {
      label: 'Đã khóa',
      value: data.users.filter((user) => user.status === 'LOCKED').length,
      detail: 'Đang hạn chế truy cập',
      icon: 'alert' as const,
      tone: 'danger',
    },
  ]
  return (
    <div className="a-stat-grid" aria-label="Thống kê tài khoản">
      {stats.map((stat) => (
        <article className={`a-stat is-${stat.tone}`} key={stat.label}>
          <div>
            <span>{stat.label}</span>
            <span className="a-stat-icon">
              <Icon name={stat.icon} size={18} />
            </span>
          </div>
          <strong>{stat.value.toString().padStart(2, '0')}</strong>
          <p>{stat.detail}</p>
        </article>
      ))}
    </div>
  )
}
