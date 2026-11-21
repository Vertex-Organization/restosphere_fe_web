import { AccountStats } from '../../components/admin/AccountStats'
import { AUDIT_ACTION_LABELS } from '../../components/admin/constants'
import { useAdminData } from '../../hooks/admin/AdminDataProvider'
import { adminPath } from '../../routes/adminRouter'
import {
  AdminLink,
  DataTable,
  DemoNotice,
  EmptyState,
  Icon,
  PageHeader,
  RoleBadge,
  StatusBadge,
} from '../../components/admin/ui'

const date = (value: string) =>
  new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(value),
  )

export default function AdminDashboardPage() {
  const { data } = useAdminData()
  if (!data) return null
  const recent = [...data.users].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5)

  return (
    <>
      <PageHeader
        title="Tổng quan hệ thống"
        description="Quản lý tài khoản và theo dõi hoạt động RestoSphere."
      />
      <DemoNotice />
      <AccountStats />
      <div className="a-dashboard-grid">
        <section className="a-panel a-panel--wide">
          <header>
            <div className="a-panel-heading">
              <span className="a-section-icon">
                <Icon name="users" size={18} />
              </span>
              <div>
                <h2>Tài khoản gần đây</h2>
                <p>5 tài khoản mới nhất trong bộ dữ liệu hiện tại.</p>
              </div>
            </div>
            <AdminLink className="a-text-link" to={adminPath('users')}>
              Xem tất cả <Icon name="arrowRight" size={14} />
            </AdminLink>
          </header>
          <DataTable labels={['Tài khoản', 'Vai trò', 'Trạng thái', 'Ngày tạo']}>
            <>
              {recent.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="a-person">
                      <span className="a-avatar a-avatar--soft">{user.initials}</span>
                      <div>
                        <strong>{user.fullName}</strong>
                        <small>{user.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <RoleBadge role={user.role} />
                  </td>
                  <td>
                    <StatusBadge status={user.status} />
                  </td>
                  <td>{date(user.createdAt)}</td>
                </tr>
              ))}
            </>
          </DataTable>
        </section>
        <section className="a-panel">
          <header>
            <div className="a-panel-heading">
              <span className="a-section-icon">
                <Icon name="board" size={18} />
              </span>
              <div>
                <h2>Thao tác nhanh</h2>
                <p>Đi thẳng đến công việc quản trị.</p>
              </div>
            </div>
          </header>
          <div className="a-quick-links">
            <AdminLink to={adminPath('users')}>
              <span>
                <Icon name="users" size={18} />
              </span>
              <div>
                <strong>Quản lý tài khoản</strong>
                <small>Tìm, lọc và xem chi tiết</small>
              </div>
              <Icon name="chevronRight" size={15} />
            </AdminLink>
            <AdminLink to={adminPath('roles')}>
              <span>
                <Icon name="checkCircle" size={18} />
              </span>
              <div>
                <strong>Phân quyền</strong>
                <small>Xem vai trò hệ thống</small>
              </div>
              <Icon name="chevronRight" size={15} />
            </AdminLink>
            <AdminLink to={adminPath('restaurant')}>
              <span>
                <Icon name="utensils" size={18} />
              </span>
              <div>
                <strong>Thông tin nhà hàng</strong>
                <small>Cập nhật hồ sơ hiển thị</small>
              </div>
              <Icon name="chevronRight" size={15} />
            </AdminLink>
          </div>
        </section>
        <section className="a-panel a-panel--wide">
          <header>
            <div className="a-panel-heading">
              <span className="a-section-icon">
                <Icon name="history" size={18} />
              </span>
              <div>
                <h2>Hoạt động quản trị gần đây</h2>
                <p>Thay đổi role, trạng thái tài khoản, thông tin nhà hàng và cài đặt.</p>
              </div>
            </div>
            <AdminLink className="a-text-link" to={adminPath('audit-logs')}>
              Mở nhật ký <Icon name="arrowRight" size={14} />
            </AdminLink>
          </header>
          {data.auditLogs.length ? (
            <ol className="a-admin-activity">
              {[...data.auditLogs]
                .sort((a, b) => b.at.localeCompare(a.at))
                .slice(0, 5)
                .map((log) => (
                  <li key={log.id}>
                    <span className="a-section-icon">
                      <Icon name="history" size={16} />
                    </span>
                    <div>
                      <p>
                        {AUDIT_ACTION_LABELS[log.action]} · {log.target}
                      </p>
                      <small>
                        {log.actor} ·{' '}
                        {new Intl.DateTimeFormat('vi-VN', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        }).format(new Date(log.at))}
                      </small>
                    </div>
                    <span
                      className={`a-badge a-badge--${log.result === 'SUCCESS' ? 'success' : 'danger'}`}
                    >
                      {log.result === 'SUCCESS' ? 'Thành công' : 'Thất bại'}
                    </span>
                  </li>
                ))}
            </ol>
          ) : (
            <EmptyState
              title="Chưa có dữ liệu nhật ký"
              description="Chưa có hoạt động quản trị nào."
            />
          )}
        </section>
      </div>
    </>
  )
}
