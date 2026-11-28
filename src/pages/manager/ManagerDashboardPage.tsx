import { shortCode } from '../../components/kitchen/format'
import { businessDay, dateLabel, minutes, money, time } from '../../api/manager/dates'
import {
  dashboard,
  employeeName,
  orderCode,
  tableCode,
  tableForOrder,
} from '../../api/manager/selectors'
import { useManagerData } from '../../hooks/manager/ManagerDataProvider'
import { useNow } from '../../hooks/kitchen/useNow'
import { managerPath } from '../../routes/managerRouter'
import { DataTable, Icon, Link, PageHeading, Panel, Status } from '../../components/manager/ui'
import { APPROVAL_TYPE, incidentTitle } from '../../api/manager/labels'

export default function ManagerDashboardPage() {
  const { data: d, refresh } = useManagerData()
  const now = useNow()
  if (!d) return null
  const s = dashboard(d, now)
  const isLate = (r: (typeof d.reservations)[number]) =>
    (r.status === 'CONFIRMED' || r.status === 'PENDING') && minutes(r.at, now) > 15
  const waitingReservations = d.reservations
    .filter(
      (r) => ['CONFIRMED', 'PENDING'].includes(r.status) && businessDay(r.at) === businessDay(now),
    )
    .sort((a, b) => a.at.localeCompare(b.at))
  const upcoming = waitingReservations.slice(0, 4)
  const recentActivity = [...d.history].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 5)
  const alerts = [
    ...s.lateOrders.map((o) => ({
      id: o.id,
      title: `Bàn ${tableForOrder(d, o)} chờ món ${minutes(o.at, now)} phút`,
      description: `${orderCode(o)} · Cần kiểm tra với bếp`,
      path: managerPath('orders', o.id),
      icon: 'clock' as const,
      tone: 'danger',
    })),
    ...s.incidents.map((i) => ({
      id: i.id,
      title: incidentTitle(i),
      description: `${i.code} · ${employeeName(d, i.reporterId)}`,
      path: managerPath('incidents', i.id),
      icon: 'alert' as const,
      tone: i.severity === 'HIGH' ? 'danger' : 'warning',
    })),
    ...d.reservations.filter(isLate).map((r) => ({
      id: r.id,
      title: `${r.customer} trễ giờ nhận bàn`,
      description: `${r.code ?? r.id} · Bàn ${tableCode(d, r.tableId)} · ${time(r.at)}`,
      path: managerPath('reservations', r.id),
      icon: 'users' as const,
      tone: 'warning',
    })),
  ]
  return (
    <div className="m-dashboard-page">
      <PageHeading
        title="Tổng quan"
        description={`${dateLabel(now)} · Tình hình hoạt động nhà hàng hôm nay`}
        actions={
          <>
            <span className="m-live-label">
              <i />
              Theo dõi vận hành
            </span>
            <button
              type="button"
              className="k-btn k-icon-btn"
              aria-label="Làm mới dữ liệu"
              title="Làm mới dữ liệu"
              onClick={() => {
                void refresh()
              }}
            >
              <Icon name="refresh" />
            </button>
          </>
        }
      />
      <section className="m-overview-metrics" aria-label="Chỉ số hoạt động hôm nay">
        <Link className="m-overview-card m-overview-card--revenue" to={managerPath('reports')}>
          <div className="m-overview-card-top">
            <span className="m-overview-icon">
              <Icon name="cash" size={21} />
            </span>
            <span className="m-overview-tag">
              <i />
              Đã thanh toán
            </span>
          </div>
          <h2>Doanh thu hôm nay</h2>
          <strong className="m-overview-value">{money(s.revenue)}</strong>
          <p>Giao dịch đã thanh toán thành công</p>
          <div className="m-overview-card-foot">
            <span>Xem báo cáo doanh thu</span>
            <Icon name="arrowRight" size={16} />
          </div>
        </Link>
        <Link className="m-overview-card m-overview-card--tables" to={managerPath('tables')}>
          <div className="m-overview-card-top">
            <span className="m-overview-icon">
              <Icon name="users" size={21} />
            </span>
            <span className="m-overview-tag">
              {d.tables.length ? Math.round((s.occupied / d.tables.length) * 100) : 0}% sử dụng
            </span>
          </div>
          <h2>Bàn đang phục vụ</h2>
          <strong className="m-overview-value">
            {s.occupied}
            <em>/ {d.tables.length} bàn</em>
          </strong>
          <p>{d.sessions.reduce((n, t) => n + t.guests, 0)} khách tại nhà hàng</p>
          <div className="m-overview-card-foot">
            <span>Xem sơ đồ bàn</span>
            <Icon name="arrowRight" size={16} />
          </div>
        </Link>
        <Link
          className="m-overview-card m-overview-card--reservations"
          to={managerPath('reservations')}
        >
          <div className="m-overview-card-top">
            <span className="m-overview-icon">
              <Icon name="clipboard" size={21} />
            </span>
            <span className="m-overview-tag">Trong hôm nay</span>
          </div>
          <h2>Lịch đặt hôm nay</h2>
          <strong className="m-overview-value">
            {s.reservations}
            <em>lịch đặt</em>
          </strong>
          <p>{waitingReservations.length} lịch đặt đang chờ khách</p>
          <div className="m-overview-card-foot">
            <span>Quản lý lịch đặt</span>
            <Icon name="arrowRight" size={16} />
          </div>
        </Link>
        <Link className="m-overview-card m-overview-card--orders" to={managerPath('orders')}>
          <div className="m-overview-card-top">
            <span className="m-overview-icon">
              <Icon name="receipt" size={21} />
            </span>
            <span className="m-overview-tag">
              <i />
              Đang xử lý
            </span>
          </div>
          <h2>Đơn đang xử lý</h2>
          <strong className="m-overview-value">
            {s.activeOrders}
            <em>đơn hàng</em>
          </strong>
          <p>{s.ready} món chờ phục vụ</p>
          <div className="m-overview-card-foot">
            <span>Theo dõi đơn hàng</span>
            <Icon name="arrowRight" size={16} />
          </div>
        </Link>
      </section>
      <div className="m-dashboard-grid">
        <Panel
          className="m-service-panel"
          title="Giám sát vận hành"
          aside={
            <Link className="m-text-link" to={managerPath('operations')}>
              Xem vận hành
              <Icon name="arrowRight" size={14} />
            </Link>
          }
        >
          <div className="m-operation-strip">
            <Link to={managerPath('tables')}>
              <span className="m-status-dot info" />
              <strong>{s.occupied}</strong>
              <span>Bàn có khách</span>
            </Link>
            <Link to={managerPath('tables')}>
              <span className="m-status-dot neutral" />
              <strong>{d.tables.length - s.occupied}</strong>
              <span>Bàn trống</span>
            </Link>
            <Link to={managerPath('kitchen')}>
              <span className="m-status-dot success" />
              <strong>{s.ready}</strong>
              <span>Món chờ phục vụ</span>
            </Link>
            <Link to={managerPath('operations')}>
              <span className="m-status-dot neutral" />
              <strong>{d.sessions.filter((t) => t.paymentRequested).length}</strong>
              <span>Chờ thanh toán</span>
            </Link>
          </div>
          <div className="m-service-floors">
            {d.areas.map((area) => {
              const tables = d.tables.filter((t) => t.areaId === area.id)
              const occupied = tables.filter((t) => t.status === 'OCCUPIED').length
              return (
                <section className="m-service-floor" key={area.id} aria-label={area.name}>
                  <header className="m-service-floor-head">
                    <div>
                      <h3>{area.name}</h3>
                      <p>
                        {tables.length} bàn · {tables.reduce((total, t) => total + t.seats, 0)} ghế
                      </p>
                    </div>
                    <div className="m-service-floor-summary">
                      <span>
                        <b>{occupied}</b> có khách
                      </span>
                      <span>
                        <b>{tables.length - occupied}</b> trống
                      </span>
                    </div>
                  </header>
                  <div className="m-service-tables">
                    {tables.map((t) => {
                      const hasGuests = t.status === 'OCCUPIED'
                      const label = hasGuests ? 'Có khách' : 'Trống'
                      return (
                        <Link
                          key={t.id}
                          className={`m-service-table ${hasGuests ? 'is-occupied' : 'is-empty'}`}
                          to={managerPath('tables', t.id)}
                          aria-label={`Bàn ${t.code}, ${t.seats} ghế, ${label}`}
                        >
                          <strong>{t.code}</strong>
                          <span className="m-service-table-status">
                            <i />
                            {label}
                          </span>
                          <small>{t.seats} ghế</small>
                        </Link>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>
          <div className="m-service-legend">
            <span>
              <i />
              Trống
            </span>
            <span>
              <i />
              Có khách
            </span>
          </div>
        </Panel>
        <Panel
          className="m-dashboard-bookings"
          title="Đặt bàn sắp đến"
          aside={
            <Link className="m-text-link" to={managerPath('reservations')}>
              Xem đặt bàn
              <Icon name="arrowRight" size={14} />
            </Link>
          }
        >
          <div className="m-dashboard-context">
            <span>{waitingReservations.length} lịch đặt đang chờ khách hôm nay</span>
            <span>Hiển thị {upcoming.length} lịch gần nhất</span>
          </div>
          <DataTable
            headers={['Khách hàng', 'Giờ đến', 'Số khách', 'Bàn', 'Trạng thái']}
            empty={!upcoming.length}
          >
            {upcoming.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link className="m-cell-link" to={managerPath('reservations', r.id)}>
                    {r.customer}
                    <small>{r.code ?? r.id}</small>
                  </Link>
                </td>
                <td className="m-num">{time(r.at)}</td>
                <td>{r.guests} khách</td>
                <td>
                  <span className="m-table-code">{tableCode(d, r.tableId)}</span>
                </td>
                <td>
                  <Status
                    value={r.status}
                    label={r.status === 'PENDING' ? 'Chờ xác nhận' : undefined}
                  />
                </td>
              </tr>
            ))}
          </DataTable>
        </Panel>
        <Panel
          className="m-dashboard-alerts"
          title="Cần chú ý"
          aside={<span className="m-count m-count--danger">{alerts.length}</span>}
        >
          <div className="m-alert-list">
            {alerts.length ? (
              alerts.slice(0, 4).map((a) => (
                <Link key={a.id} className={`m-alert-row ${a.tone}`} to={a.path}>
                  <span className="m-alert-icon">
                    <Icon name={a.icon} size={16} />
                  </span>
                  <div>
                    <strong>{a.title}</strong>
                    <small>{a.description}</small>
                  </div>
                  <Icon name="chevronRight" size={14} />
                </Link>
              ))
            ) : (
              <p className="m-inline-empty">Không có cảnh báo đang mở.</p>
            )}
          </div>
        </Panel>
        <Panel
          className="m-dashboard-approvals"
          title="Yêu cầu phê duyệt"
          aside={<span className="m-count">{s.pending.length}</span>}
        >
          <div className="m-review-list">
            {s.pending.length ? (
              s.pending.slice(0, 3).map((a) => (
                <Link className="m-review-card" to={managerPath('approvals', a.id)} key={a.id}>
                  <span
                    className={`m-review-icon ${['CANCEL_ITEM', 'PAYMENT_VOID'].includes(a.type) ? 'is-cancel' : ''}`}
                  >
                    <Icon
                      name={
                        a.type === 'RESERVATION'
                          ? 'users'
                          : a.type === 'MENU_STATUS'
                            ? 'utensils'
                            : a.type === 'DISCOUNT'
                              ? 'cash'
                              : 'receipt'
                      }
                      size={18}
                    />
                  </span>
                  <div className="m-review-body">
                    <div className="m-review-title">
                      <strong>{APPROVAL_TYPE[a.type]}</strong>
                      <span className="m-review-status">Chờ duyệt</span>
                    </div>
                    <div className="m-review-meta">
                      <span
                        title={`${employeeName(d, a.requestedBy)} · ${dateLabel(a.requestedAt)}`}
                      >
                        {a.code} · {employeeName(d, a.requestedBy)} · {time(a.requestedAt)}
                      </span>
                      {a.amount > 0 && <b>{money(a.amount)}</b>}
                    </div>
                    <div className="m-review-bottom">
                      <p className="m-review-reason">{a.reason || 'Chờ quản lý xem xét yêu cầu'}</p>
                      <span className="m-review-action">
                        Xem xét
                        <Icon name="arrowRight" size={13} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="m-review-empty">
                <Icon name="checkCircle" size={24} />
                <strong>Đã xử lý hết yêu cầu</strong>
                <p>Không có yêu cầu đang chờ phê duyệt.</p>
              </div>
            )}
          </div>
          <div className="m-review-footer">
            <span>
              {Math.min(3, s.pending.length)} / {s.pending.length} yêu cầu chờ duyệt
            </span>
            <Link className="m-text-link" to={managerPath('approvals')}>
              Xem tất cả
              <Icon name="arrowRight" size={14} />
            </Link>
          </div>
        </Panel>
        <Panel
          className="m-dashboard-history"
          title="Hoạt động gần đây"
          aside={<Icon name="history" size={16} />}
        >
          <ol className="m-recent-activity">
            {recentActivity.map((e, index) => (
              <li key={e.id}>
                <time className="m-recent-time" dateTime={e.at} title={dateLabel(e.at)}>
                  {time(e.at)}
                </time>
                <span
                  className={`m-recent-dot ${index === 0 ? 'is-latest' : ''}`}
                  aria-hidden="true"
                />
                <div className="m-recent-content">
                  <p>{e.text}</p>
                  <div className="m-recent-meta">
                    <span>
                      <Icon name="user" size={12} />
                      {employeeName(d, e.actorId)}
                    </span>
                    <span className="m-recent-code">{shortCode(e.entityId)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
          {!recentActivity.length && (
            <div className="m-recent-empty">
              <Icon name="history" size={24} />
              <p>Chưa có hoạt động được ghi nhận.</p>
            </div>
          )}
          {recentActivity.length > 0 && (
            <div className="m-recent-footer">{recentActivity.length} hoạt động mới nhất</div>
          )}
        </Panel>
      </div>
    </div>
  )
}
