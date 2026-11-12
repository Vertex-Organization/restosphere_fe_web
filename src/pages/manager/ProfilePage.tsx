import { managerSignOut, useManagerUser } from '../../api/manager/auth'
import { businessDay, money } from '../../api/manager/dates'
import { useManagerData } from '../../hooks/manager/ManagerDataProvider'
import { navigate } from '../../routes/managerRouter'
import { Button, Facts, PageHeading, Panel } from '../../components/manager/ui'

export default function ProfilePage() {
  const user = useManagerUser()!; const { data: d } = useManagerData()
  if (!d) return null
  const shifts = d.shifts.filter(s => s.date === businessDay() && s.employeeIds.includes(user.id))
  return <><PageHeading title="Cá nhân" description="Thông tin hồ sơ và phạm vi nghiệp vụ được giao." /><div className="m-profile-grid"><Panel title="Hồ sơ quản lý"><div className="m-profile-card"><span className="m-avatar">MA</span><div><h3>{user.name}</h3><p>{user.position}</p></div></div><div className="m-detail"><Facts items={[["Mã nhân viên", user.id], ['Vai trò', 'Quản lý nhà hàng'], ['Ca hôm nay', shifts.map(s => `${s.name} · ${s.start}–${s.end}`).join(', ') || 'Chưa phân ca'], ['Hạn mức phê duyệt', money(user.approvalLimit)], ['Liên hệ', 'Chưa có thông tin liên hệ được cấp']]} /></div><div className="m-panel-bottom"><Button icon="logout" onClick={() => { managerSignOut(); navigate('/manager/login', { replace: true }) }}>Đăng xuất tài khoản</Button></div></Panel><Panel title="Phạm vi công việc"><div className="m-definition"><p>Giám sát bàn, đặt bàn, đơn hàng và tiến độ bếp.</p><p>Phân công nhân viên, quản lý ca làm và thực đơn.</p><p>Phê duyệt yêu cầu, xử lý sự cố và xem báo cáo nhà hàng.</p><p className="m-note">Phiên này dùng tài khoản mô phỏng. Quyền nghiệp vụ thực tế cần được Backend xác thực trước khi sử dụng dữ liệu thật.</p></div></Panel></div></>
}
