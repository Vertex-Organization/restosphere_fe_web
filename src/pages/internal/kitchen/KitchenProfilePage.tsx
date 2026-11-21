import { ROLE_LABEL } from '../../../api/kitchen/labels'
import { hasPermission } from '../../../api/kitchen/rules'
import { initials, localDayKey, shortCode } from '../../../components/kitchen/format'
import { Icon } from '../../../components/kitchen/Icon'
import { KitchenLink } from '../../../components/kitchen/KitchenLink'
import { useKitchenSnapshot } from '../../../hooks/kitchen/kitchenDataContext'
import { leaveKitchen } from '../../../hooks/kitchen/leaveKitchen'
import { useNow } from '../../../hooks/kitchen/useNow'
import { kitchenPaths } from '../../../routes/kitchenRouter'

export default function KitchenProfilePage() {
  const { data, user } = useKitchenSnapshot()
  const now = useNow()
  const me = data.staff.find((s) => s.id === user.id) ?? user
  const today = localDayKey(now)
  const onToday = (iso?: string) => !!iso && localDayKey(iso) === today
  const started = data.items.filter((i) => i.startedBy === me.id && onToday(i.startedAt)).length
  const finished = data.items.filter((i) => i.readyBy === me.id && onToday(i.readyAt)).length

  return (
    <div className="k-page k-page--narrow">
      <section className="k-panel k-profile">
        <span className="k-avatar k-avatar--lg" aria-hidden="true">
          {initials(me.name)}
        </span>
        <div className="k-profile-id">
          <h2 className="k-h2">{me.name}</h2>
          <p className="k-profile-role">
            {ROLE_LABEL[me.role]} · {me.position}
          </p>
          <p className="k-muted">
            Mã nhân viên {shortCode(me.id)} · {me.shift}
          </p>
        </div>
      </section>

      <section className="k-panel">
        <h3 className="k-panel-title">Thông tin tài khoản</h3>
        <dl className="k-dl">
          <dt>Mã nhân viên</dt>
          <dd>{shortCode(me.id)}</dd>
          <dt>Vai trò</dt>
          <dd>
            {ROLE_LABEL[me.role]} ({me.role})
          </dd>
          <dt>Chức vụ</dt>
          <dd>{me.position}</dd>
          <dt>Ca làm</dt>
          <dd>{me.shift}</dd>
          <dt>Tài khoản đăng nhập</dt>
          <dd className="k-mono">{me.username}</dd>
          <dt>Tình trạng món</dt>
          <dd>
            {hasPermission(me, 'kitchen.menu.availability')
              ? 'Được báo tạm hết / mở bán lại'
              : 'Chỉ xem, gửi yêu cầu cập nhật'}
          </dd>
        </dl>
      </section>

      <section className="k-panel">
        <h3 className="k-panel-title">Hôm nay</h3>
        <p>
          Bạn đã bắt đầu <b>{started}</b> món và hoàn thành <b>{finished}</b> món.{' '}
          <KitchenLink className="k-link" to={kitchenPaths.history}>
            Xem lịch sử chế biến
          </KitchenLink>
        </p>
      </section>

      <div className="k-profile-actions">
        <button type="button" className="k-btn k-btn--danger k-btn--lg" onClick={leaveKitchen}>
          <Icon name="logout" />
          Đăng xuất
        </button>
      </div>
      <p className="k-callout">
        <Icon name="info" size={14} />
        Dữ liệu được tải từ máy chủ và cập nhật định kỳ.
      </p>
    </div>
  )
}
