import { useState } from 'react'
import { RejectItemDialog } from '../../../components/kitchen/KitchenOrderItem'
import { INCIDENT_STATUS_LABEL, INCIDENT_TYPE_LABEL } from '../../../api/kitchen/labels'
import { canComplete, canStart, hasPermission, shortName, staffName } from '../../../api/kitchen/rules'
import { minutesBetween } from '../../../api/kitchen/selectors'
import type { KitchenOrderItem } from '../../../api/kitchen/types'
import { DishPhoto } from '../../../components/kitchen/DishPhoto'
import { formatDate, formatDuration, formatTime } from '../../../components/kitchen/format'
import { Icon } from '../../../components/kitchen/Icon'
import { KitchenLink } from '../../../components/kitchen/KitchenLink'
import { Badge, KitchenStatusBadge } from '../../../components/kitchen/KitchenStatusBadge'
import { useKitchenSnapshot } from '../../../hooks/kitchen/kitchenDataContext'
import { useNow } from '../../../hooks/kitchen/useNow'
import { kitchenPaths } from '../../../routes/kitchenRouter'

const refs = (items: KitchenOrderItem[]) => items.map((i) => ({ id: i.id, version: i.version }))

export default function KitchenTicketPage({ id }: { id: string }) {
  const { data, run, isPending, user } = useKitchenSnapshot()
  const now = useNow()
  const [rejectItem, setRejectItem] = useState<KitchenOrderItem | null>(null)
  const order = data.orders.find((o) => o.id === id)

  if (!order) {
    return (
      <div className="k-state">
        <p className="k-state-title">Không tìm thấy phiếu</p>
        <p>Phiếu có thể đã bị xóa hoặc đường dẫn không đúng.</p>
        <KitchenLink className="k-btn k-btn--primary" to={kitchenPaths.board}>Về bảng bếp</KitchenLink>
      </div>
    )
  }

  const me = data.staff.find((s) => s.id === user.id) ?? user
  const allowed = hasPermission(me, 'kitchen.items.update')
  const items = data.items.filter((i) => i.orderId === order.id)
  const submitted = items.filter(canStart)
  const preparing = items.filter(canComplete)
  const rounds = data.orders.filter((o) => o.sessionId === order.sessionId).sort((a, b) => a.sequence - b.sequence)
  const incidents = data.incidents.filter((i) => i.orderId === order.id)
  const events = items
    .flatMap((item) => item.history.map((change) => ({ ...change, item })))
    .sort((a, b) => b.at.localeCompare(a.at))
  const open = items.some((i) => i.status === 'SUBMITTED' || i.status === 'PREPARING')
  const busy = (list: KitchenOrderItem[]) => list.some((i) => isPending(i.id))
  const start = (list: KitchenOrderItem[]) => { void run({ type: 'start', items: refs(list) }, list.map((i) => i.id)) }
  const complete = (list: KitchenOrderItem[]) => { void run({ type: 'complete', items: refs(list) }, list.map((i) => i.id)) }
  const who = (staffId?: string) => (staffId ? shortName(staffName(data, staffId)) : '')

  return (
    <div className="k-page">
      {rejectItem && <RejectItemDialog item={rejectItem} onClose={() => setRejectItem(null)} />}
      <div className="k-page-head">
        <KitchenLink to={kitchenPaths.board} className="k-back"><Icon name="chevronLeft" size={15} />Bảng bếp</KitchenLink>
        <div className="k-page-heading">
          <h2 className="k-h2">Bàn {order.tableCode} · Phiếu #{order.code}</h2>
          {order.sequence > 1 && <span className="k-tag">Gọi thêm · lượt {order.sequence}</span>}
          {order.priority && <Badge tone="danger"><Icon name="flag" size={12} />Ưu tiên</Badge>}
          <span className="k-muted">
            Gửi {formatTime(order.submittedAt)}{open && ` · đã chờ ${formatDuration(minutesBetween(order.submittedAt, now))}`}
          </span>
        </div>
        <div className="k-page-actions">
          {/* Single items are handled on their own row; these act on the whole ticket. */}
          {allowed && submitted.length > 1 && (
            <button type="button" className="k-btn k-btn--outline" disabled={busy(submitted)} onClick={() => start(submitted)}>
              Bắt đầu cả phiếu ({submitted.length})
            </button>
          )}
          {allowed && preparing.length > 1 && (
            <button type="button" className="k-btn k-btn--primary" disabled={busy(preparing)} onClick={() => complete(preparing)}>
              Hoàn thành cả phiếu ({preparing.length})
            </button>
          )}
          <KitchenLink className="k-btn" to={kitchenPaths.reportIncident(order.id)}><Icon name="alert" size={15} />Báo sự cố</KitchenLink>
        </div>
      </div>

      <div className="k-detail">
        <div className="k-detail-main">
          <section className="k-panel">
            <h3 className="k-panel-title">Món trong phiếu <span className="k-muted">({items.length})</span></h3>
            <div className="k-table-wrap k-table-wrap--flat">
              <table className="k-table">
                <thead>
                  <tr>
                    <th className="k-num">SL</th><th>Món</th><th>Trạng thái</th><th>Bắt đầu</th><th>Hoàn thành</th><th>Phục vụ</th>
                    <th><span className="k-visually-hidden">Thao tác</span></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="k-num k-strong">{item.quantity}</td>
                      <td>
                        <div className="k-cell-dish">
                          <DishPhoto menu={data.menuItems.find((m) => m.id === item.menuItemId)} />
                          <div className="k-cell-stack">
                            <span className="k-strong">{item.name}</span>
                            {item.note && <span className="k-note"><Icon name="note" size={13} />{item.note}</span>}
                            {item.rejectionReason && <span className="k-cell-danger">Lý do từ chối: {item.rejectionReason}</span>}
                             {item.cancellationReason && <span className="k-cell-danger">Lý do hủy: {item.cancellationReason}</span>}
                          </div>
                        </div>
                      </td>
                      <td><KitchenStatusBadge status={item.status} /></td>
                      <td className="k-mono">{item.startedAt ? `${formatTime(item.startedAt)} · ${who(item.startedBy)}` : '—'}</td>
                      <td className="k-mono">{item.readyAt ? `${formatTime(item.readyAt)} · ${who(item.readyBy)}` : '—'}</td>
                      <td className="k-mono">{item.servedAt ? formatTime(item.servedAt) : '—'}</td>
                      <td className="k-cell-actions">
                        {allowed && canStart(item) && (
                          <button type="button" className="k-btn k-btn--outline" disabled={isPending(item.id)} onClick={() => start([item])}>Bắt đầu</button>
                        )}
                        {allowed && canStart(item) && <button type="button" className="k-btn k-btn--danger" disabled={isPending(item.id)} onClick={() => setRejectItem(item)}>Từ chối</button>}
                        {allowed && canComplete(item) && (
                          <button type="button" className="k-btn k-btn--primary" disabled={isPending(item.id)} onClick={() => complete([item])}>Hoàn thành</button>
                        )}
                        {item.status === 'READY' && <span className="k-muted">Chờ phục vụ</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="k-panel">
            <h3 className="k-panel-title">Lịch sử trạng thái</h3>
            <ol className="k-timeline">
              {events.map((event) => (
                <li key={`${event.item.id}-${event.status}-${event.at}`}>
                  <time className="k-mono" dateTime={event.at}>{formatTime(event.at)}</time>
                  <KitchenStatusBadge status={event.status} />
                  <span className="k-timeline-text">
                    {event.item.quantity} × {event.item.name}
                    <span className="k-muted"> · {staffName(data, event.by)}{event.note && ` · ${event.note}`}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="k-detail-side">
          <section className="k-panel">
            <h3 className="k-panel-title">Thông tin phiếu</h3>
            <dl className="k-dl">
              <dt>Bàn</dt><dd>{order.tableCode} · {order.area}</dd>
              <dt>Số khách</dt><dd>{order.guests}</dd>
              <dt>Lượt gọi</dt><dd>Lượt {order.sequence}</dd>
              <dt>Gửi lúc</dt><dd>{formatTime(order.submittedAt)} · {formatDate(order.submittedAt)}</dd>
              <dt>Nhân viên order</dt><dd>{staffName(data, order.waiterId)}</dd>
              {order.priority && <><dt>Ưu tiên</dt><dd className="k-cell-danger">{order.priority.reason}</dd></>}
            </dl>
          </section>

          <section className="k-panel">
            <h3 className="k-panel-title">Các lượt gọi của bàn</h3>
            <ul className="k-rounds">
              {rounds.map((round) => {
                const roundItems = data.items.filter((i) => i.orderId === round.id)
                const left = roundItems.filter((i) => i.status === 'SUBMITTED' || i.status === 'PREPARING').length
                const ready = roundItems.filter((i) => i.status === 'READY').length
                return (
                  <li key={round.id}>
                    <KitchenLink to={kitchenPaths.ticket(round.id)} aria-current={round.id === order.id ? 'page' : undefined}>
                      #{round.code} · Lượt {round.sequence}
                    </KitchenLink>
                    <span className="k-muted">
                      {formatTime(round.submittedAt)} · {roundItems.length} món{left ? ` · ${left} đang làm` : ''}{ready ? ` · ${ready} đã xong` : ''}
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>

          {incidents.length > 0 && (
            <section className="k-panel">
              <h3 className="k-panel-title">Sự cố liên quan</h3>
              <ul className="k-rounds">
                {incidents.map((incident) => (
                  <li key={incident.id}>
                    <KitchenLink to={kitchenPaths.incidents}>{incident.code} · {INCIDENT_TYPE_LABEL[incident.type]}</KitchenLink>
                    <span className="k-muted">{INCIDENT_STATUS_LABEL[incident.status]} · {formatTime(incident.at)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  )
}
