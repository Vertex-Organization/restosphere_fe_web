import { minutesBetween } from '../../api/kitchen/selectors'
import type { KitchenOrderItem as Item, MenuItem } from '../../api/kitchen/types'
import { DishPhoto } from './DishPhoto'
import { formatDuration, formatTime } from './format'
import { Icon } from './Icon'
import { KitchenStatusBadge } from './KitchenStatusBadge'

interface Props {
  item: Item
  menu?: MenuItem
  now: number
  variant: 'active' | 'ready'
  cookName?: string
  pending?: boolean
  onStart?: () => void
  onComplete?: () => void
}

/** One OrderItem line on a ticket, with the single action its status allows.
 * Quantity, name and status share one line so a ticket stays short. */
export function KitchenOrderItem({ item, menu, now, variant, cookName, pending, onStart, onComplete }: Props) {
  const preparing = item.status === 'PREPARING'
  return (
    <li className={`k-item k-item--${item.status.toLowerCase()} k-item--${variant}`}>
      <DishPhoto menu={menu} />
      <div className="k-item-main">
        <div className="k-item-head">
          <span className="k-item-qty">{item.quantity} ×</span>
          <div className="k-item-line">
            <span className="k-item-name">{item.name}</span>
            {variant === 'active' ? (
              <span className="k-item-meta">
                <KitchenStatusBadge status={item.status} />
                {preparing && <span>{formatDuration(minutesBetween(item.startedAt, now))}{cookName && ` · ${cookName}`}</span>}
              </span>
            ) : (
              <span className="k-item-meta k-item-done">Xong {formatTime(item.readyAt)}{cookName && ` · ${cookName}`}</span>
            )}
          </div>
        </div>
        {item.note && <span className="k-note"><Icon name="note" size={13} />{item.note}</span>}
      </div>
      {variant === 'active' && item.status === 'SUBMITTED' && onStart && (
        <button type="button" className="k-btn k-btn--outline k-item-action" onClick={onStart} disabled={pending} aria-busy={pending}
          aria-label={`Bắt đầu chế biến ${item.quantity} ${item.name}`}>
          Bắt đầu
        </button>
      )}
      {variant === 'active' && preparing && onComplete && (
        <button type="button" className="k-btn k-btn--primary k-item-action" onClick={onComplete} disabled={pending} aria-busy={pending}
          aria-label={`Hoàn thành ${item.quantity} ${item.name}`}>
          Hoàn thành
        </button>
      )}
    </li>
  )
}
