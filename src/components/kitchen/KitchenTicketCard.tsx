import { shortName, staffName } from '../../api/kitchen/rules'
import type { ActiveDishView, ReadyDishView } from '../../api/kitchen/selectors'
import type { KitchenData, KitchenOrderItem as Item } from '../../api/kitchen/types'
import { kitchenPaths } from '../../routes/kitchenRouter'
import { formatTime } from './format'
import { DishPhoto } from './DishPhoto'
import { Icon } from './Icon'
import { KitchenLink } from './KitchenLink'
import { KitchenStatusBadge } from './KitchenStatusBadge'
import { KitchenTimer } from './KitchenTimer'

const menuOf = (data: KitchenData, item: Item) => data.menuItems.find((m) => m.id === item.menuItemId)

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

/** One finished dish waiting for service, ordered by completion time. */
export function KitchenReadyDishRow({ dish, data }: { dish: ReadyDishView; data: KitchenData }) {
  const { item, order, waiter } = dish
  const cookName = item.readyBy ? shortName(staffName(data, item.readyBy)) : 'Không rõ'
  return (
    <article className={`k-ready-row k-ready-row--${dish.tone}`} role="listitem"
      aria-label={`${item.quantity} ${item.name}, bàn ${order.tableCode}, chờ phục vụ ${dish.minutes} phút`}>
      <div className="k-ready-dish">
        <DishPhoto menu={menuOf(data, item)} />
        <div>
          <strong><b>{item.quantity} ×</b> {item.name}</strong>
          {item.note && <span className="k-note"><Icon name="note" size={12} />{item.note}</span>}
        </div>
      </div>
      <div className="k-ready-cell k-ready-table">
        <span>Bàn</span>
        <strong>{order.tableCode}</strong>
        <small>{order.area}</small>
      </div>
      <div className="k-ready-cell k-ready-completed">
        <span>Hoàn thành</span>
        <strong>{formatTime(item.readyAt)} · {cookName}</strong>
      </div>
      <div className="k-ready-cell k-ready-wait-cell">
        <span>Chờ phục vụ</span>
        <strong className={`k-ready-wait k-ready-wait--${dish.tone}`}><Icon name="clock" size={14} />{dish.minutes} phút</strong>
      </div>
      <div className="k-ready-cell k-ready-service">
        <span>Phục vụ bàn</span>
        <strong>{waiter?.name ?? 'Không rõ'}</strong>
        <small>{dish.otherActive > 0 ? `${dish.otherActive} món còn đang làm` : 'Có thể mang ra'}</small>
      </div>
    </article>
  )
}
