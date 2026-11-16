import { useState } from 'react'
import { KitchenActionConfirmDialog, RejectItemDialog, type KitchenItemAction } from '../../../components/kitchen/KitchenOrderItem'
import { INCIDENT_STATUS_LABEL, INCIDENT_TYPE_LABEL } from '../../../api/kitchen/labels'
import { canComplete, canStart, hasPermission, shortName, staffName } from '../../../api/kitchen/rules'
import { minutesBetween, waitTone } from '../../../api/kitchen/selectors'
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
const isFinished = (item: KitchenOrderItem) => item.status === 'READY' || item.status === 'SERVED'
const isInactive = (item: KitchenOrderItem) => item.status === 'REJECTED' || item.status === 'CANCELLED' || item.status === 'VOIDED'

export default function KitchenTicketPage({ id }: { id: string }) {
  const { data, run, isPending, user } = useKitchenSnapshot()
  const now = useNow()
  const [rejectItem, setRejectItem] = useState<KitchenOrderItem | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ action: KitchenItemAction; items: KitchenOrderItem[] } | null>(null)
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
  const displayItems = [...items].sort((a, b) => Number(isFinished(a) || isInactive(a)) - Number(isFinished(b) || isInactive(b)))
  const submitted = items.filter(canStart)
  const preparing = items.filter(canComplete)
  const finished = items.filter(isFinished)
  const inactive = items.filter(isInactive)
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
  const statusDetail = (item: KitchenOrderItem) => {
    if (item.status === 'SUBMITTED') {
      const minutes = minutesBetween(item.submittedAt, now)
      return { text: `Gọi ${formatTime(item.submittedAt)} · chờ ${formatDuration(minutes)}`, tone: waitTone(minutes) }
    }
    if (item.status === 'PREPARING') {
      return { text: `Bắt đầu ${formatTime(item.startedAt)} · ${who(item.startedBy)} · đang làm ${formatDuration(minutesBetween(item.startedAt, now))}`, tone: 'normal' }
    }
    if (item.status === 'READY') {
      return { text: `Xong ${formatTime(item.readyAt)} · ${who(item.readyBy)} · chờ phục vụ ${formatDuration(minutesBetween(item.readyAt, now))}`, tone: 'normal' }
    }
    if (item.status === 'SERVED') return { text: `Phục vụ lúc ${formatTime(item.servedAt)}`, tone: 'normal' }
    if (item.status === 'REJECTED') return { text: `Từ chối lúc ${formatTime(item.rejectedAt)} · ${who(item.rejectedBy)}`, tone: 'normal' }
    if (item.status === 'CANCELLED') return { text: `Hủy lúc ${formatTime(item.cancelledAt)} · ${who(item.cancelledBy)}`, tone: 'normal' }
    return { text: 'Đã bỏ khỏi hóa đơn', tone: 'normal' }
  }

  return (
    <div className="k-page k-ticket-page">
      {rejectItem && <RejectItemDialog item={rejectItem} onClose={() => setRejectItem(null)} />}
      {confirmAction && <KitchenActionConfirmDialog action={confirmAction.action} items={confirmAction.items} tableCode={order.tableCode}
        onClose={() => setConfirmAction(null)} onConfirm={() => {
          const current = confirmAction
          setConfirmAction(null)
          if (current.action === 'start') start(current.items)
          else complete(current.items)
        }} />}
      <header className="k-ticket-head">
        <div className="k-ticket-head-main">
          <KitchenLink to={kitchenPaths.board} className="k-back"><Icon name="chevronLeft" size={15} />Bảng bếp</KitchenLink>
          <div className="k-ticket-heading">
            <div className="k-ticket-title-row">
              <h2>Bàn {order.tableCode}</h2>
              <span>Phiếu #{order.code} · Lượt {order.sequence}</span>
              {order.priority && <Badge tone="danger"><Icon name="flag" size={12} />Ưu tiên</Badge>}
            </div>
            <div className="k-ticket-meta">
              <span><Icon name="clock" size={14} />Gọi {formatTime(order.submittedAt)}</span>
              {open && <strong>Đã chờ {formatDuration(minutesBetween(order.submittedAt, now))}</strong>}
              <span>{items.length} món</span>
            </div>
          </div>
        </div>
        <div className="k-ticket-bulk-actions">
          {/* Single items are handled on their own row; these act on the whole ticket. */}
          {allowed && submitted.length > 1 && (
            <button type="button" className="k-btn k-btn--outline k-btn--lg" disabled={busy(submitted)} onClick={() => setConfirmAction({ action: 'start', items: submitted })}>
              Bắt đầu cả phiếu ({submitted.length})
            </button>
          )}
          {allowed && preparing.length > 1 && (
            <button type="button" className="k-btn k-btn--primary k-btn--lg" disabled={busy(preparing)} onClick={() => setConfirmAction({ action: 'complete', items: preparing })}>
              Hoàn thành cả phiếu ({preparing.length})
            </button>
          )}
        </div>
      </header>

      <div className="k-detail k-ticket-layout">
        <div className="k-detail-main">
          <section className="k-panel k-ticket-items-panel">
            <div className="k-ticket-section-head">
              <div>
                <h3>Món trong phiếu</h3>
                <p>Món chưa xong được đặt trước để bếp thao tác nhanh.</p>
              </div>
              <div className="k-ticket-counts" aria-label="Tổng hợp trạng thái món">
                {submitted.length > 0 && <span><i className="k-ticket-dot k-ticket-dot--new" />{submitted.length} mới</span>}
                {preparing.length > 0 && <span><i className="k-ticket-dot k-ticket-dot--preparing" />{preparing.length} đang làm</span>}
                {finished.length > 0 && <span><i className="k-ticket-dot k-ticket-dot--done" />{finished.length} đã xong</span>}
                {inactive.length > 0 && <span>{inactive.length} ngưng xử lý</span>}
              </div>
            </div>
            <ol className="k-ticket-item-list">
              {displayItems.map((item) => {
                const detail = statusDetail(item)
                return (
                  <li key={item.id} className={`k-ticket-item k-ticket-item--${item.status.toLowerCase()}`}>
                    <DishPhoto menu={data.menuItems.find((m) => m.id === item.menuItemId)} />
                    <div className="k-ticket-item-main">
                      <div className="k-ticket-item-title"><strong>{item.quantity} ×</strong><span>{item.name}</span></div>
                      {item.note && <span className="k-note"><Icon name="note" size={13} />{item.note}</span>}
                      {item.rejectionReason && <span className="k-cell-danger">Lý do từ chối: {item.rejectionReason}</span>}
                      {item.cancellationReason && <span className="k-cell-danger">Lý do hủy: {item.cancellationReason}</span>}
                    </div>
                    <div className="k-ticket-item-state">
                      <KitchenStatusBadge status={item.status} />
                      <span className={`k-ticket-item-state-detail k-ticket-item-state-detail--${detail.tone}`}>{detail.text}</span>
                    </div>
                    <div className="k-ticket-item-actions">
                      {allowed && canStart(item) && (
                        <button type="button" className="k-btn k-btn--primary k-btn--lg" disabled={isPending(item.id)} onClick={() => setConfirmAction({ action: 'start', items: [item] })}>Bắt đầu món</button>
                      )}
                      {allowed && canComplete(item) && (
                        <button type="button" className="k-btn k-btn--primary k-btn--lg" disabled={isPending(item.id)} onClick={() => setConfirmAction({ action: 'complete', items: [item] })}>Hoàn thành món</button>
                      )}
                      {allowed && canStart(item) && <button type="button" className="k-btn k-btn--danger k-btn--lg" disabled={isPending(item.id)} onClick={() => setRejectItem(item)}>Từ chối</button>}
                      <KitchenLink className="k-btn k-btn--lg" to={kitchenPaths.reportIncident(order.id, item.id)}><Icon name="alert" size={14} />Sự cố</KitchenLink>
                    </div>
                  </li>
                )
              })}
            </ol>
          </section>

          <details className="k-panel k-ticket-history">
            <summary>
              <span><Icon name="history" size={16} />Lịch sử trạng thái</span>
              <span className="k-muted">{events.length} cập nhật <Icon name="chevronDown" size={15} /></span>
            </summary>
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
          </details>
        </div>

        <aside className="k-detail-side">
          <section className="k-panel">
            <h3 className="k-panel-title">Thông tin phục vụ</h3>
            <dl className="k-dl">
              <dt>Khu vực</dt><dd>{order.area}</dd>
              <dt>Số khách</dt><dd>{order.guests}</dd>
              <dt>Nhân viên order</dt><dd>{staffName(data, order.waiterId)}</dd>
              <dt>Ngày gọi</dt><dd>{formatDate(order.submittedAt)}</dd>
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
