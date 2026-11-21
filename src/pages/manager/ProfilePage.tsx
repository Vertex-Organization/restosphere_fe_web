import { managerSignOut, useManagerUser } from '../../api/manager/auth'
import { businessDay, money } from '../../api/manager/dates'
import { useManagerData } from '../../hooks/manager/ManagerDataProvider'
import { Button, Facts, Icon, PageHeading, Panel } from '../../components/manager/ui'

export default function ProfilePage() {
  const user = useManagerUser()!
  const { data: d } = useManagerData()
  if (!d) return null
  const shifts = d.shifts.filter((s) => s.date === businessDay() && s.employeeIds.includes(user.id))
  return (
    <>
      <PageHeading title="Cá nhân" description="Thông tin hồ sơ và phạm vi nghiệp vụ được giao." />
      <div className="m-profile-grid">
        <Panel title="Hồ sơ quản lý">
          <div className="m-profile-card">
            <span className="m-avatar">
              {user.name
                .split(' ')
                .slice(-2)
                .map((part) => part[0])
                .join('')}
            </span>
            <div>
              <h3>{user.name}</h3>
              <p>{user.position}</p>
            </div>
          </div>
          <div className="m-detail">
            <Facts
              items={[
                ['Mã nhân viên', user.id],
                ['Vai trò', 'Quản lý nhà hàng'],
                [
                  'Ca hôm nay',
                  shifts.map((s) => `${s.name} · ${s.start}–${s.end}`).join(', ') || 'Chưa phân ca',
                ],
                ['Hạn mức phê duyệt', money(user.approvalLimit)],
                ['Liên hệ', user.email || 'Chưa có thông tin liên hệ được cấp'],
              ]}
            />
          </div>
          <div className="m-panel-bottom">
            <Button icon="logout" onClick={managerSignOut}>
              Đăng xuất tài khoản
            </Button>
          </div>
        </Panel>
        <Panel title="Phạm vi công việc">
          <div className="m-definition m-profile-scope">
            <div>
              <span>
                <Icon name="board" size={18} />
              </span>
              <div>
                <h3>Điều hành nhà hàng</h3>
                <p>Giám sát bàn, đặt bàn, đơn hàng và tiến độ bếp.</p>
              </div>
            </div>
            <div>
              <span>
                <Icon name="users" size={18} />
              </span>
              <div>
                <h3>Nhân sự & thực đơn</h3>
                <p>Phân công nhân viên, quản lý ca làm và thực đơn.</p>
              </div>
            </div>
            <div>
              <span>
                <Icon name="checkCircle" size={18} />
              </span>
              <div>
                <h3>Kiểm soát nghiệp vụ</h3>
                <p>Phê duyệt yêu cầu, xử lý sự cố và xem báo cáo nhà hàng.</p>
              </div>
            </div>
            <p className="m-note">
              Phiên này dùng tài khoản mô phỏng. Quyền nghiệp vụ thực tế cần được Backend xác thực
              trước khi sử dụng dữ liệu thật.
            </p>
          </div>
        </Panel>
      </div>
    </>
  )
}
