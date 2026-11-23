import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { isAlertNote } from '../../api/kitchen/notes'
import { shortName, staffName } from '../../api/kitchen/rules'
import type { ActiveDishView, ReadyDishView } from '../../api/kitchen/selectors'
import type { KitchenData, KitchenOrderItem as Item } from '../../api/kitchen/types'
import { formatDishWait, formatTime } from './format'
import { DishPhoto } from './DishPhoto'
import { Icon } from './Icon'

const menuOf = (data: KitchenData, item: Item) =>
  data.menuItems.find((m) => m.id === item.menuItemId)

interface RowProps {
  dish: ActiveDishView
  data: KitchenData
  isPending: (key: string) => boolean
  onStart: (item: Item) => void
  onComplete: (item: Item) => void
  onReject: (item: Item) => void
  onReport: (item: Item) => void
}

export function DishActionMenu({
  item,
  disabled,
  onReject,
  onReport,
}: {
  item: Item
  disabled: boolean
  onReject: (item: Item) => void
  onReport: (item: Item) => void
}) {
  const [place, setPlace] = useState<CSSProperties | null>(null)
  const button = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const close = () => setPlace(null)

  useEffect(() => {
    if (!place) return
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node
      if (menu.current?.contains(target) || button.current?.contains(target)) return
      setPlace(null)
    }
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setPlace(null)
      button.current?.focus()
    }
    const onMove = () => setPlace(null)
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', onMove)
    window.addEventListener('scroll', onMove, true)
    menu.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onMove)
      window.removeEventListener('scroll', onMove, true)
    }
  }, [place])

  const toggle = () => {
    if (place) return close()
    const rect = button.current?.getBoundingClientRect()
    if (!rect) return
    const right = window.innerWidth - rect.right
    setPlace(
      rect.bottom + 96 > window.innerHeight
        ? { right, bottom: window.innerHeight - rect.top + 4 }
        : { right, top: rect.bottom + 4 },
    )
  }

  return (
    <>
      <button
        ref={button}
        type="button"
        className="k-btn k-dish-more"
        aria-label="Thêm thao tác"
        aria-haspopup="menu"
        aria-expanded={!!place}
        onClick={toggle}
      >
        ⋯
      </button>
      {place && (
        <div ref={menu} className="k-dish-menu" role="menu" style={place}>
          {item.status === 'SUBMITTED' && (
            <button
              type="button"
              role="menuitem"
              className="k-dish-menu-item k-dish-menu-item--danger"
              disabled={disabled}
              onClick={() => {
                close()
                onReject(item)
              }}
            >
              Từ chối món
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            className="k-dish-menu-item"
            onClick={() => {
              close()
              onReport(item)
            }}
          >
            Báo quản lý
          </button>
        </div>
      )}
    </>
  )
}

/** One dish per row: what, where, how long it has waited, and what to do next. */
export function KitchenDishRow({
  dish,
  data,
  isPending,
  onStart,
  onComplete,
  onReject,
  onReport,
}: RowProps) {
  const { item, order } = dish
  const pending = isPending(item.id)
  const note = item.note || order.priority?.reason
  const priorityText = order.priority
    ? `Ưu tiên: ${order.priority.reason} · Yêu cầu bởi ${staffName(data, order.priority.by)}`
    : undefined
  return (
    <article
      className={`k-dish-row k-dish-row--${dish.tone}`}
      role="listitem"
      aria-label={`${item.quantity} ${item.name}, bàn ${order.tableCode}, ${formatDishWait(dish.tone, dish.minutes).toLowerCase()}`}
    >
      <div className="k-dish-row-main">
        <DishPhoto menu={menuOf(data, item)} />
        <div className="k-dish-row-copy">
          <div className="k-dish-row-title">
            <strong>
              <b>{item.quantity} ×</b> {item.name}
            </strong>
            {priorityText && (
              <span
                className="k-priority-tag"
                tabIndex={0}
                title={priorityText}
                aria-label={priorityText}
              >
                Ưu tiên
              </span>
            )}
          </div>
          {note && (
            <span className={isAlertNote(item.note) ? 'k-note k-note--alert' : 'k-note'}>
              <Icon name="note" size={12} />
              {note}
            </span>
          )}
        </div>
      </div>
      <div className="k-dish-row-cell">
        <strong>Bàn {order.tableCode}</strong>
        <small>{order.area}</small>
      </div>
      <div className="k-dish-row-cell">
        <time dateTime={item.submittedAt}>{formatTime(item.submittedAt)}</time>
        <span className={`k-order-wait k-order-wait--${dish.tone}`}>
          {formatDishWait(dish.tone, dish.minutes)}
        </span>
      </div>
      <div className="k-dish-row-actions">
        {item.status === 'SUBMITTED' && (
          <button
            type="button"
            className="k-btn k-btn--primary"
            disabled={pending}
            aria-busy={pending}
            onClick={() => onStart(item)}
          >
            Bắt đầu
          </button>
        )}
        {item.status === 'PREPARING' && (
          <button
            type="button"
            className="k-btn k-btn--primary"
            disabled={pending}
            aria-busy={pending}
            onClick={() => onComplete(item)}
          >
            Hoàn thành
          </button>
        )}
        <DishActionMenu item={item} disabled={pending} onReject={onReject} onReport={onReport} />
      </div>
    </article>
  )
}

/** One finished dish waiting for service, ordered by completion time. */
export function KitchenReadyDishRow({ dish, data }: { dish: ReadyDishView; data: KitchenData }) {
  const { item, order, waiter } = dish
  const cookName = item.readyBy ? shortName(staffName(data, item.readyBy)) : 'Không rõ'
  return (
    <article
      className={`k-ready-row k-ready-row--${dish.tone}`}
      role="listitem"
      aria-label={`${item.quantity} ${item.name}, bàn ${order.tableCode}, chờ phục vụ ${dish.minutes} phút`}
    >
      <div className="k-ready-dish">
        <DishPhoto menu={menuOf(data, item)} />
        <div>
          <strong>
            <b>{item.quantity} ×</b> {item.name}
          </strong>
          {item.note && (
            <span className={isAlertNote(item.note) ? 'k-note k-note--alert' : 'k-note'}>
              <Icon name="note" size={12} />
              {item.note}
            </span>
          )}
        </div>
      </div>
      <div className="k-ready-cell k-ready-table">
        <span>Bàn</span>
        <strong>{order.tableCode}</strong>
        <small>{order.area}</small>
      </div>
      <div className="k-ready-cell k-ready-completed">
        <span>Hoàn thành</span>
        <strong>
          {formatTime(item.readyAt)} · {cookName}
        </strong>
      </div>
      <div className="k-ready-cell k-ready-wait-cell">
        <span>Chờ phục vụ</span>
        <strong className={`k-ready-wait k-ready-wait--${dish.tone}`}>
          <Icon name="clock" size={14} />
          {dish.minutes} phút
        </strong>
      </div>
      <div className="k-ready-cell k-ready-service">
        <span>Phục vụ bàn</span>
        <strong>{waiter?.name ?? 'Không rõ'}</strong>
        <small>
          {dish.otherActive > 0 ? `${dish.otherActive} món còn đang làm` : 'Có thể mang ra'}
        </small>
      </div>
    </article>
  )
}
