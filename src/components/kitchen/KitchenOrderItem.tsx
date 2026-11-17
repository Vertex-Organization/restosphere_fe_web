import { useEffect, useId, useRef, useState } from 'react'
import { useKitchenSnapshot } from '../../hooks/kitchen/kitchenDataContext'
import { minutesBetween } from '../../api/kitchen/selectors'
import type { KitchenOrderItem as Item, MenuItem } from '../../api/kitchen/types'
import { DishPhoto } from './DishPhoto'
import { formatDuration, formatTime } from './format'
import { Icon } from './Icon'
import { KitchenStatusBadge } from './KitchenStatusBadge'

export type KitchenItemAction = 'start' | 'complete'

export function KitchenActionConfirmDialog({ action, items, tableCode, onClose, onConfirm }: {
  action: KitchenItemAction
  items: Item[]
  tableCode: string
  onClose: () => void
  onConfirm: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  const starting = action === 'start'
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => dialog?.close() }, [])

  return (
    <dialog ref={ref} className="k-confirm-dialog" aria-labelledby={titleId} aria-describedby={descriptionId}
      onCancel={(event) => { event.preventDefault(); onClose() }}>
      <form className="k-confirm-form" onSubmit={(event) => { event.preventDefault(); onConfirm() }}>
        <header className="k-confirm-head">
          <span className={`k-confirm-icon k-confirm-icon--${action}`} aria-hidden="true">
            <Icon name={starting ? 'utensils' : 'checkCircle'} size={20} />
          </span>
          <div>
            <h2 id={titleId}>{starting ? 'Xác nhận bắt đầu món?' : 'Xác nhận hoàn thành món?'}</h2>
            <p id={descriptionId}>
              {starting
                ? 'Món sẽ chuyển sang Đang chế biến và ghi nhận người bắt đầu.'
                : 'Món sẽ chuyển sang Đã xong và chờ phục vụ mang ra.'}
            </p>
          </div>
        </header>
        <div className="k-confirm-items">
          <p className="k-confirm-table">Bàn {tableCode}</p>
          <ul>
            {items.map((item) => <li key={item.id}><b>{item.quantity} ×</b> {item.name}</li>)}
          </ul>
        </div>
        <footer className="k-confirm-actions">
          <button type="button" className="k-btn k-btn--lg" autoFocus onClick={onClose}>Quay lại</button>
          <button type="submit" className="k-btn k-btn--primary k-btn--lg">
            {starting ? 'Xác nhận bắt đầu' : 'Xác nhận đã xong'}
          </button>
        </footer>
      </form>
    </dialog>
  )
}

export function RejectItemDialog({ item, onClose }: { item: Item; onClose: () => void }) {
  const { run, isPending } = useKitchenSnapshot()
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const pending = isPending(item.id)
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => dialog?.close() }, [])
  return <dialog ref={ref} aria-labelledby={titleId} className="k-panel" onCancel={(e) => { e.preventDefault(); if (!pending) onClose() }}>
    <form className="k-form" onSubmit={(e) => { e.preventDefault(); if (pending) return; void run({ type: 'reject', itemId: item.id, version: item.version, reason }, [item.id]).then((ok) => { if (ok) onClose(); else setError('Không thể từ chối món. Kiểm tra trạng thái và lý do, rồi thử lại.') }) }}>
      <h2 id={titleId} className="k-panel-title">Từ chối {item.name}</h2>
      <label className="k-field"><span className="k-label">Lý do từ chối</span><textarea className="k-input" required minLength={5} maxLength={200} value={reason} onChange={(e) => setReason(e.target.value)} /></label>
      {error && <p role="alert" className="k-form-error">{error}</p>}
      <div className="k-form-row"><button type="button" className="k-btn" disabled={pending} onClick={onClose}>Quay lại</button><button type="submit" className="k-btn k-btn--danger" disabled={pending || reason.trim().length < 5}>Từ chối</button></div>
    </form>
  </dialog>
}

interface Props {
  item: Item
  menu?: MenuItem
  now: number
  variant: 'active' | 'ready'
  cookName?: string
  pending?: boolean
  onStart?: () => void
  onComplete?: () => void
  onReject?: () => void
}

/** One OrderItem line on a ticket, with the single action its status allows.
 * Quantity, name and status share one line so a ticket stays short. */
export function KitchenOrderItem({ item, menu, now, variant, cookName, pending, onStart, onComplete, onReject }: Props) {
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
      {variant === 'active' && item.status === 'SUBMITTED' && onReject && <button type="button" className="k-btn k-btn--danger" onClick={onReject} disabled={pending} aria-label={`Từ chối ${item.name}`}>Từ chối</button>}
      {variant === 'active' && preparing && onComplete && (
        <button type="button" className="k-btn k-btn--primary k-item-action" onClick={onComplete} disabled={pending} aria-busy={pending}
          aria-label={`Hoàn thành ${item.quantity} ${item.name}`}>
          Hoàn thành
        </button>
      )}
    </li>
  )
}
