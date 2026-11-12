import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from 'react'
import {
  BILL_STATUS_LABEL, BILL_STATUS_TONE, ITEM_STATUS_LABEL, ITEM_STATUS_TONE, PAYMENT_STATUS_LABEL, PAYMENT_STATUS_TONE,
  REQUEST_STATUS_LABEL, REQUEST_STATUS_TONE, type Tone,
} from '../../api/billing/labels'
import { formatAmount, parseMoney } from '../../api/billing/money'
import type { BillStatus, PaymentStatus, RequestStatus, SentItemStatus } from '../../api/billing/types'
import { Icon, type IconName } from './Icon'

export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={`k-badge k-badge--${tone}`}>{children}</span>
}

/** Small dish photo; drinks without a photo get a neutral glyph. */
export function DishThumb({ url, size = 36 }: { url?: string; size?: number }) {
  if (!url) {
    return <span className="c-thumb c-thumb--empty" style={{ width: size, height: size }} aria-hidden="true"><Icon name="cup" size={Math.round(size * 0.45)} /></span>
  }
  return <img className="c-thumb" src={url} width={size} height={size} alt="" loading="lazy" decoding="async" />
}

/** One compact status line (wraps to two at most) instead of a large callout. */
export function Alert({ tone, icon, children, action }: { tone: 'info' | 'warning' | 'danger' | 'success'; icon: IconName; children: ReactNode; action?: ReactNode }) {
  return (
    <p className={`c-alert c-alert--${tone}`} role={tone === 'danger' ? 'alert' : undefined}>
      <Icon name={icon} size={14} />
      <span className="c-alert-text">{children}</span>
      {action}
    </p>
  )
}

export function BillStatusBadge({ status }: { status: BillStatus }) {
  return <Badge tone={BILL_STATUS_TONE[status]}>{BILL_STATUS_LABEL[status]}</Badge>
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge tone={PAYMENT_STATUS_TONE[status]}>{PAYMENT_STATUS_LABEL[status]}</Badge>
}

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  return <Badge tone={REQUEST_STATUS_TONE[status]}>{REQUEST_STATUS_LABEL[status]}</Badge>
}

export function ItemStatusBadge({ status }: { status: SentItemStatus }) {
  return <Badge tone={ITEM_STATUS_TONE[status]}>{ITEM_STATUS_LABEL[status]}</Badge>
}

interface MoneyInputProps {
  value: number | null
  onChange: (value: number | null) => void
  label: string
  /** Shown in the label row, e.g. a hint or the limit. */
  aside?: ReactNode
  invalid?: boolean
  large?: boolean
  autoFocus?: boolean
  placeholder?: string
  inputRef?: RefObject<HTMLInputElement | null>
  describedBy?: string
  disabled?: boolean
}

/**
 * Amount field in đồng. Shows group separators while typing; signs, letters
 * and other symbols are refused with a message instead of being dropped silently.
 */
export function MoneyInput({ value, onChange, label, aside, invalid, large, autoFocus, placeholder, inputRef, describedBy, disabled }: MoneyInputProps) {
  const [error, setError] = useState('')
  const id = useId()
  const errorId = `${id}-error`
  return (
    <div className="k-field">
      <span className="c-field-head">
        <label className="k-label" htmlFor={id}>{label}</label>
        {aside}
      </span>
      <span className={large ? 'c-money c-money--lg' : 'c-money'}>
        <input
          id={id} ref={inputRef} className="k-input" inputMode="numeric" autoComplete="off" spellCheck={false}
          autoFocus={autoFocus} placeholder={placeholder} disabled={disabled}
          value={value === null ? '' : formatAmount(value)}
          aria-invalid={invalid || !!error}
          aria-describedby={[error ? errorId : '', describedBy ?? ''].filter(Boolean).join(' ') || undefined}
          onChange={(event) => {
            const parsed = parseMoney(event.target.value)
            if (parsed.error) {
              setError(parsed.error)
              return
            }
            setError('')
            onChange(parsed.value)
          }}
        />
        <span className="c-money-unit" aria-hidden="true">đ</span>
      </span>
      {error && <span id={errorId} className="k-field-error" role="alert">{error}</span>}
    </div>
  )
}

interface DialogProps {
  title: string
  subtitle?: ReactNode
  onClose: () => void
  children: ReactNode
  footer: ReactNode
  /** Form submit handler; the footer's submit button triggers it. */
  onSubmit?: () => void
  wide?: boolean
}

/** Modal dialog on the native <dialog> element (focus trap and Esc built in). Mount it only while open. */
export function Dialog({ title, subtitle, onClose, children, footer, onSubmit, wide }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) dialog.showModal()
    return () => { if (dialog?.open) dialog.close() }
  }, [])
  return (
    <dialog ref={ref} className={wide ? 'c-dialog c-dialog--wide' : 'c-dialog'} aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); onClose() }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <form className="c-dialog-form" noValidate onSubmit={(event) => { event.preventDefault(); onSubmit?.() }}>
        <header className="c-dialog-head">
          <div>
            <h2 id={titleId} className="c-dialog-title">{title}</h2>
            {subtitle && <p className="c-dialog-sub">{subtitle}</p>}
          </div>
          <button type="button" className="k-btn k-btn--ghost k-icon-btn" onClick={onClose} aria-label="Đóng">
            <Icon name="close" />
          </button>
        </header>
        <div className="c-dialog-body">{children}</div>
        <footer className="c-dialog-foot">{footer}</footer>
      </form>
    </dialog>
  )
}

/** Copies a value (account number, transfer content) and confirms inline. */
export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1600)
    return () => window.clearTimeout(timer)
  }, [copied])
  return (
    <button type="button" className="c-copy" aria-label={`Sao chép ${label}`}
      onClick={() => { void navigator.clipboard?.writeText(value).then(() => setCopied(true), () => undefined) }}>
      <Icon name={copied ? 'check' : 'copy'} size={14} />
      {copied ? 'Đã chép' : 'Chép'}
    </button>
  )
}
