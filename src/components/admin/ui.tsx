import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Icon, type IconName } from '../billing/Icon'
import { navigate } from '../../routes/adminRouter'
import type { AccountStatus, AdminRole } from '../../api/admin/types'
import { ROLE_LABELS } from './constants'

export { Icon }

export function AdminLink({ to, children, className, onClick, ...props }: { to: string; children: ReactNode; className?: string; onClick?: () => void } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  const external = !to.startsWith('/')
  return <a href={to} className={className} onClick={(event) => {
    onClick?.()
    if (external || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    navigate(to)
  }} {...props}>{children}</a>
}

export function Button({ children, tone = 'secondary', icon, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'primary' | 'secondary' | 'danger' | 'quiet'; icon?: IconName }) {
  return <button {...props} className={`a-button a-button--${tone} ${className}`.trim()}>{icon && <Icon name={icon} size={16} />}{children}</button>
}

export function PageHeader({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return <div className="a-page-header"><div><h1>{title}</h1><p>{description}</p></div>{actions && <div className="a-page-actions">{actions}</div>}</div>
}

export function RoleBadge({ role }: { role: AdminRole }) {
  return <span className={`a-badge a-badge--role a-role-${role.toLowerCase()}`}>{ROLE_LABELS[role]}</span>
}

export function StatusBadge({ status }: { status: AccountStatus }) {
  return <span className={`a-badge a-badge--${status === 'ACTIVE' ? 'success' : 'danger'}`}><i />{status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}</span>
}

export function DemoNotice({ children = 'Dữ liệu được tải từ máy chủ' }: { children?: ReactNode }) {
  return <div className="a-demo-notice" role="note"><Icon name="info" size={16} /><span>{children}</span></div>
}

export function DataTable({ labels, children, empty, emptyText = 'Không có dữ liệu phù hợp.' }: { labels: string[]; children: ReactNode; empty?: boolean; emptyText?: string }) {
  if (empty) return <EmptyState title="Chưa có kết quả" description={emptyText} />
  return <div className="a-table-wrap" tabIndex={0} role="region" aria-label="Bảng dữ liệu, có thể cuộn ngang"><table className="a-table"><thead><tr>{labels.map((label) => <th key={label || 'action'} scope="col">{label || <span className="a-sr-only">Thao tác</span>}</th>)}</tr></thead><tbody>{children}</tbody></table></div>
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="a-empty"><span className="a-empty-icon"><Icon name="inbox" size={22} /></span><div><h3>{title}</h3><p>{description}</p></div>{action}</div>
}

export function LoadingState() {
  return <div className="a-loading" aria-busy="true"><span className="a-spinner" /><span>Đang tải dữ liệu quản trị…</span></div>
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="a-empty a-empty--error" role="alert"><span className="a-empty-icon"><Icon name="offline" size={22} /></span><div><h3>Không tải được dữ liệu</h3><p>{message}</p></div><Button tone="secondary" onClick={onRetry}>Thử tải lại</Button></div>
}

export function Modal({ title, description, children, footer, onClose, wide = false }: { title: string; description?: string; children: ReactNode; footer?: ReactNode; onClose: () => void; wide?: boolean }) {
  const dialog = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose })
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    dialog.current?.focus()
    const close = (event: KeyboardEvent) => event.key === 'Escape' && onCloseRef.current()
    document.addEventListener('keydown', close)
    return () => { document.removeEventListener('keydown', close); previous?.focus() }
  }, [])
  return <div className="a-modal-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><div ref={dialog} className={`a-modal ${wide ? 'a-modal--wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby="a-modal-title" tabIndex={-1}><header><div><h2 id="a-modal-title">{title}</h2>{description && <p>{description}</p>}</div><button type="button" className="a-icon-button" aria-label="Đóng hộp thoại" onClick={onClose}><Icon name="close" size={18} /></button></header><div className="a-modal-body">{children}</div>{footer && <footer>{footer}</footer>}</div></div>
}

export function SectionCard({ title, description, icon, action, children, className = '' }: { title: string; description?: string; icon?: IconName; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`a-section-card ${className}`.trim()}><header><div className="a-section-heading">{icon && <span className="a-section-icon"><Icon name={icon} size={18} /></span>}<div><h2>{title}</h2>{description && <p>{description}</p>}</div></div>{action}</header><div className="a-section-body">{children}</div></section>
}

export function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return <label className="a-field"><span>{label}</span>{children}{error ? <small className="a-field-error">{error}</small> : hint ? <small>{hint}</small> : null}</label>
}
