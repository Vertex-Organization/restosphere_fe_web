import { shortName } from '../../api/kitchen/rules'
import type { TicketView } from '../../api/kitchen/selectors'
import type { KitchenData, KitchenOrderItem as Item } from '../../api/kitchen/types'
import { kitchenPaths } from '../../routes/kitchenRouter'
import { formatTime } from './format'
import { Icon } from './Icon'
import { KitchenLink } from './KitchenLink'
import { KitchenOrderItem } from './KitchenOrderItem'
import { KitchenTimer } from './KitchenTimer'

const menuOf = (data: KitchenData, item: Item) => data.menuItems.find((m) => m.id === item.menuItemId)

function cook(data: KitchenData, id?: string) {
  const staff = id ? data.staff.find((s) => s.id === id) : undefined
  return staff ? shortName(staff.name) : undefined
}

function TicketTitle({ ticket }: { ticket: TicketView }) {
  const { order } = ticket
  return (
    <div className="k-ticket-title">
      <h3 className="k-ticket-table">Bàn {order.tableCode}</h3>
      <KitchenLink className="k-ticket-code" to={kitchenPaths.ticket(order.id)} aria-label={`Chi tiết phiếu ${order.code}`}>#{order.code}</KitchenLink>
      {order.sequence > 1 && <span className="k-tag">Gọi thêm · lượt {order.sequence}</span>}
    </div>
  )
}

interface ActiveProps {
  ticket: TicketView
  data: KitchenData
  now: number
  isPending: (key: string) => boolean
  onStart: (items: Item[]) => void
  onComplete: (items: Item[]) => void
}

/** Left column: items still to start or being cooked. */
export function KitchenTicketCard({ ticket, data, now, isPending, onStart, onComplete }: ActiveProps) {
  const { order, items } = ticket
  const submitted = items.filter((i) => i.status === 'SUBMITTED')
  const preparing = items.filter((i) => i.status === 'PREPARING')
  const stripe = ticket.tone === 'late' ? 'late' : submitted.length ? 'new' : 'preparing'
  const busy = (list: Item[]) => list.some((i) => isPending(i.id))

  return (
    <article className={`k-ticket k-ticket--${stripe}`} aria-label={`Bàn ${order.tableCode}, phiếu ${order.code}`}>
      <header className="k-ticket-head">
        <TicketTitle ticket={ticket} />
        <KitchenTimer label={ticket.tone === 'late' ? 'Quá giờ ·' : 'Chờ'} minutes={ticket.minutes} tone={ticket.tone} />
        <p className="k-ticket-meta">
          Gửi {formatTime(order.submittedAt)} · {ticket.waiter?.name ?? 'Không rõ'} · {order.guests} khách
        </p>
        {order.priority && (
          <p className="k-ticket-priority"><Icon name="flag" size={13} />Ưu tiên: {order.priority.reason}</p>
        )}
      </header>
      <ul className="k-items">
        {items.map((item) => (
          <KitchenOrderItem key={item.id} item={item} menu={menuOf(data, item)} now={now} variant="active" cookName={cook(data, item.startedBy)}
            pending={isPending(item.id)} onStart={() => onStart([item])} onComplete={() => onComplete([item])} />
        ))}
      </ul>
      <footer className="k-ticket-foot">
        {ticket.otherReady > 0 && (
          <span className="k-ticket-hint"><Icon name="checkCircle" size={14} />{ticket.otherReady} món đã xong, chờ mang ra</span>
        )}
        <div className="k-ticket-actions">
          {submitted.length > 1 && (
            <button type="button" className="k-btn k-btn--outline" disabled={busy(submitted)} onClick={() => onStart(submitted)}>
              Bắt đầu cả phiếu ({submitted.length})
            </button>
          )}
          {preparing.length > 1 && (
            <button type="button" className="k-btn k-btn--primary" disabled={busy(preparing)} onClick={() => onComplete(preparing)}>
              Hoàn thành cả phiếu ({preparing.length})
            </button>
          )}
          <KitchenLink className="k-btn k-btn--ghost" to={kitchenPaths.ticket(order.id)}>Chi tiết</KitchenLink>
          <KitchenLink className="k-btn k-btn--ghost" to={kitchenPaths.reportIncident(order.id)}>Báo sự cố</KitchenLink>
        </div>
      </footer>
    </article>
  )
}

/** Right column: finished items waiting for the waiter. Kitchen has no action here. */
export function ReadyTicketCard({ ticket, data, now }: { ticket: TicketView; data: KitchenData; now: number }) {
  const { order, items } = ticket
  return (
    <article className={`k-ticket k-ticket--ready${ticket.tone === 'late' ? ' k-ticket--ready-late' : ''}`}
      aria-label={`Bàn ${order.tableCode}, phiếu ${order.code}, đã làm xong`}>
      <header className="k-ticket-head">
        <TicketTitle ticket={ticket} />
        <KitchenTimer label="Chờ mang ra" minutes={ticket.minutes} tone={ticket.tone} />
        <p className="k-ticket-meta">Phục vụ: {ticket.waiter?.name ?? 'Không rõ'} · {order.area}</p>
      </header>
      <ul className="k-items">
        {items.map((item) => (
          <KitchenOrderItem key={item.id} item={item} menu={menuOf(data, item)} now={now} variant="ready" cookName={cook(data, item.readyBy)} />
        ))}
      </ul>
      <footer className="k-ticket-foot">
        <span className="k-ticket-hint">
          <Icon name="user" size={14} />Chờ phục vụ xác nhận{ticket.otherActive > 0 && ` · ${ticket.otherActive} món còn đang làm`}
        </span>
        <div className="k-ticket-actions">
          <KitchenLink className="k-btn k-btn--ghost" to={kitchenPaths.ticket(order.id)}>Chi tiết</KitchenLink>
        </div>
      </footer>
    </article>
  )
}
