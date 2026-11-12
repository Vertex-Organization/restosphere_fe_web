import { formatVnd } from '../../../api/billing/money'
import { hasPermission, openShiftOf, shiftSummary } from '../../../api/billing/selectors'
import type { CashierPermission, CashierStaff } from '../../../api/billing/types'
import { ROLE_LABEL } from '../../../api/kitchen/labels'
import { minutesBetween } from '../../../api/kitchen/selectors'
import { shortDuration } from '../../../components/billing/format'
import { Icon, type IconName } from '../../../components/billing/Icon'
import { formatTime, initials } from '../../../components/kitchen/format'
import { KitchenLink as Link } from '../../../components/kitchen/KitchenLink'
import { useCashierSnapshot } from '../../../hooks/billing/cashierDataContext'
import { leaveCashier } from '../../../hooks/billing/useCashierAuth'
import { useNow } from '../../../hooks/kitchen/useNow'
import { cashierPaths } from '../../../routes/cashierRouter'

interface Capability {
  icon: IconName
  title: string
  detail: (user: CashierStaff) => string
  needs: CashierPermission[]
}

// Permissions grouped into what the person can actually do at the counter.
const CAPABILITIES: Capability[] = [
  { icon: 'cash', title: 'Thu tiền', detail: () => 'Tiền mặt và chuyển khoản, chia nhiều phương thức', needs: ['payments.create'] },
  {
    icon: 'bank', title: 'Xác nhận chuyển khoản', needs: ['payments.confirm_transfer'],
    detail: () => 'Xác nhận thủ công khi tiền đã vào tài khoản',
  },
  { icon: 'receipt', title: 'Hóa đơn', detail: () => 'Xem, in tạm tính và in hóa đơn', needs: ['bills.view', 'receipts.print'] },
  {
    icon: 'percent', title: 'Giảm giá', needs: ['discounts.request'],
    detail: (u) => (hasPermission(u, 'discounts.apply') ? `Tự áp dụng đến ${u.discountLimitPercent}%, cao hơn gửi Quản lý duyệt` : 'Mọi mức giảm gửi Quản lý duyệt'),
  },
  { icon: 'clock', title: 'Ca thu ngân', detail: () => 'Mở ca, đối soát két và đóng ca', needs: ['shifts.manage'] },
  { icon: 'list', title: 'Tra cứu giao dịch', detail: () => 'Lịch sử thanh toán và yêu cầu hủy', needs: ['transactions.view', 'requests.create'] },
]

const MANAGER_ONLY = ['Duyệt giảm giá vượt hạn mức', 'Hủy thanh toán đã hoàn tất', 'Điều chỉnh món trên hóa đơn']

export default function CashierProfilePage() {
  const { data, user } = useCashierSnapshot()
  const now = useNow()
  const shift = openShiftOf(data, user.id)
  const s = shift ? shiftSummary(data, shift) : null

  return (
    <div className="c-profile">
      <section className="c-card c-profile-head">
        <span className="k-avatar k-avatar--lg" aria-hidden="true">{initials(user.name)}</span>
        <div className="c-profile-id">
          <h2 className="c-detail-title">{user.name}</h2>
          <span className="k-profile-role">{ROLE_LABEL[user.role]} · {user.position}</span>
          <span className="k-muted c-small">{user.id} · đăng nhập bằng {user.username}</span>
        </div>
        <button type="button" className="k-btn" onClick={leaveCashier}><Icon name="logout" />Đăng xuất</button>
      </section>

      <div className="c-stats c-stats--3">
        {shift && s ? (
          <>
            <div className="c-stat c-stat--success">
              <span className="c-stat-label"><Icon name="clock" size={14} />Ca hiện tại</span>
              <b className="c-stat-value">{shift.code}</b>
              <span className="c-stat-sub">Từ {formatTime(shift.openedAt)} · {shortDuration(minutesBetween(shift.openedAt, now))}</span>
            </div>
            <div className="c-stat">
              <span className="c-stat-label"><Icon name="list" size={14} />Giao dịch trong ca</span>
              <b className="c-stat-value">{s.count}</b>
              <span className="c-stat-sub">{s.cashCount} tiền mặt · {s.transferCount} chuyển khoản</span>
            </div>
            <div className="c-stat">
              <span className="c-stat-label"><Icon name="receipt" size={14} />Doanh thu ca</span>
              <b className="c-stat-value">{formatVnd(s.revenue)}</b>
              <span className="c-stat-sub"><Link to={cashierPaths.shift} className="k-link">Xem ca</Link></span>
            </div>
          </>
        ) : (
          <div className="c-stat c-stat--warning c-stat--wide">
            <span className="c-stat-label"><Icon name="clock" size={14} />Ca hiện tại</span>
            <b className="c-stat-value">Chưa mở ca</b>
            <span className="c-stat-sub"><Link to={cashierPaths.shift} className="k-link">Mở ca để bắt đầu thu tiền</Link></span>
          </div>
        )}
      </div>

      <section className="c-card">
        <h3 className="c-card-title">Bạn có thể</h3>
        <ul className="c-caps">
          {CAPABILITIES.map((c) => {
            const granted = c.needs.every((p) => hasPermission(user, p))
            return (
              <li key={c.title} className={granted ? 'c-cap' : 'c-cap c-cap--off'}>
                <span className={`c-icon-box c-icon-box--${granted ? 'primary' : 'muted'}`}><Icon name={c.icon} size={16} /></span>
                <span className="c-cap-text">
                  <b>{c.title}</b>
                  <span>{granted ? c.detail(user) : 'Chưa được cấp cho tài khoản này'}</span>
                </span>
                <Icon name={granted ? 'checkCircle' : 'xCircle'} size={16} className={granted ? 'c-text-success' : 'k-muted'} />
              </li>
            )
          })}
        </ul>
        <p className="c-manager-only">
          <Icon name="info" size={14} />
          <span><b>Cần Quản lý duyệt:</b> {MANAGER_ONLY.join(' · ')}.</span>
        </p>
      </section>
    </div>
  )
}
