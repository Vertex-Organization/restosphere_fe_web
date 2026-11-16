import { shortName, staffName } from '../../api/kitchen/rules'
import type { ActiveDishView, TicketView } from '../../api/kitchen/selectors'
import type { KitchenData, KitchenOrderItem as Item } from '../../api/kitchen/types'
import { kitchenPaths } from '../../routes/kitchenRouter'
import { formatTime } from './format'
import { DishPhoto } from './DishPhoto'
import { Icon } from './Icon'
import { KitchenLink } from './KitchenLink'
import { KitchenOrderItem } from './KitchenOrderItem'
import { KitchenStatusBadge } from './KitchenStatusBadge'
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
      <span className="k-ticket-code">#{order.code}</span>
      {order.sequence > 1 && <span className="k-tag">Gọi thêm · lượt {order.sequence}</span>}
    </div>
  )
}

interface ListItemProps {
  dish: ActiveDishView
  queuePosition: number
  data: KitchenData
  selected: boolean
  onSelect: () => void
}

/** Large, glanceable row in the FIFO list. */
export function KitchenDishListItem({ dish, queuePosition, data, selected, onSelect }: ListItemProps) {
  const { item, order } = dish
  const note = item.note || order.priority?.reason
  return (
    <button type="button" className="k-order-list-item" aria-pressed={selected} onClick={onSelect}>
      <span className="k-order-rank">{queuePosition}</span>
      <DishPhoto menu={menuOf(data, item)} />
      <span className="k-order-copy">
        <span className="k-order-name">
          <span className="k-order-dish-name"><b>{item.quantity} ×</b> {item.name}</span>
          <KitchenStatusBadge status={item.status} />
        </span>
        <span className="k-order-meta">
          <b>Bàn {order.tableCode}</b><time dateTime={item.submittedAt}>{formatTime(item.submittedAt)}</time>
          <span className={`k-order-wait k-order-wait--${dish.tone}`}>{dish.tone === 'late' ? 'Quá giờ' : 'Chờ'} {dish.minutes} phút</span>
        </span>
        {note && <span className="k-order-note"><Icon name="note" size={12} />{note}</span>}
      </span>
    </button>
  )
}

interface DetailProps {
  dish: ActiveDishView
  data: KitchenData
  isPending: (key: string) => boolean
  onStart: (item: Item) => void
  onComplete: (item: Item) => void
  onReject: (item: Item) => void
}

/** Detail pane for the selected dish; secondary actions stay out of the list. */
export function KitchenDishDetail({ dish, data, isPending, onStart, onComplete, onReject }: DetailProps) {
  const { item, order } = dish
  const pending = isPending(item.id)
  const menu = menuOf(data, item)
  return (
    <article className="k-dish-detail" aria-labelledby="selected-dish-title">
      <header className="k-dish-detail-head">
        <div className="k-dish-detail-title">
          <DishPhoto menu={menu} />
          <div>
            <p className="k-detail-label">Chi tiết món</p>
            <h3 id="selected-dish-title">{item.quantity} × {item.name}</h3>
          </div>
        </div>
        <div className="k-dish-detail-status">
          <KitchenStatusBadge status={item.status} />
          <KitchenTimer label={dish.tone === 'late' ? 'Quá giờ ·' : 'Chờ'} minutes={dish.minutes} tone={dish.tone} />
        </div>
      </header>
      {(item.note || order.priority) && (
        <div className="k-dish-detail-notes">
          {item.note && <p><Icon name="note" size={14} /><span><b>Lưu ý món</b>{item.note}</span></p>}
          {order.priority && <p><Icon name="flag" size={14} /><span><b>Lưu ý từ phục vụ</b>{order.priority.reason}</span></p>}
        </div>
      )}
      <dl className="k-dish-facts">
        <div><dt>Bàn</dt><dd>{order.tableCode} · {order.area}</dd></div>
        <div><dt>Giờ gọi</dt><dd>{formatTime(item.submittedAt)}</dd></div>
        <div><dt>Bắt đầu</dt><dd>{item.startedAt ? `${formatTime(item.startedAt)} · ${staffName(data, item.startedBy)}` : 'Chưa bắt đầu'}</dd></div>
        <div><dt>Thời gian chờ</dt><dd>{dish.minutes} phút</dd></div>
      </dl>
      <footer className="k-dish-detail-actions">
        {item.status === 'SUBMITTED' && <button type="button" className="k-btn k-btn--primary k-btn--lg" disabled={pending} onClick={() => onStart(item)}>Bắt đầu món</button>}
        {item.status === 'PREPARING' && <button type="button" className="k-btn k-btn--primary k-btn--lg" disabled={pending} onClick={() => onComplete(item)}>Hoàn thành món</button>}
        {item.status === 'SUBMITTED' && <button type="button" className="k-btn k-btn--danger k-btn--lg" disabled={pending} onClick={() => onReject(item)}>Từ chối món</button>}
        <KitchenLink className="k-btn k-btn--lg" to={kitchenPaths.reportIncident(order.id, item.id)}><Icon name="alert" size={15} />Báo sự cố</KitchenLink>
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
      </footer>
    </article>
  )
}
