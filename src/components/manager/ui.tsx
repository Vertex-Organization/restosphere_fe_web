import { useEffect, useId, useState, type ReactNode } from 'react'
import { Badge, Dialog } from '../billing/ui'
import { Icon, type IconName } from '../billing/Icon'
import { KitchenLink } from '../kitchen/KitchenLink'
import { dateLabel, time } from '../../api/manager/dates'
import { employeeName } from '../../api/manager/selectors'
import { ManagerError } from '../../api/manager/rules'
import { STATUS } from '../../api/manager/labels'
import { useManagerData } from '../../hooks/manager/ManagerDataProvider'
import { managerService, type Activity } from '../../api/manager/service'

export { Badge, Dialog, Icon }
export const Link = KitchenLink
export function Status({ value, label }: { value: string; label?: string }) { const [text, tone] = STATUS[value] ?? [value, 'neutral']; return <Badge tone={tone}>{label ?? text}</Badge> }
export function Button({ children, onClick, icon, primary, disabled, type = 'button' }: { children: ReactNode; onClick?: () => void; icon?: IconName; primary?: boolean; disabled?: boolean; type?: 'button' | 'submit' }) {
  return <button type={type} className={`k-btn ${primary ? 'k-btn--primary' : 'k-btn--secondary'}`} disabled={disabled} onClick={onClick}>{icon && <Icon name={icon} />}{children}</button>
}
export function PageHeading({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return <div className="m-page-heading"><div><h1>{title}</h1><p>{description}</p></div>{actions && <div className="m-actions">{actions}</div>}</div>
}
export function Panel({ title, aside, children, className = '' }: { title: string; aside?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`m-panel ${className}`}><div className="m-panel-head"><h2>{title}</h2>{aside}</div>{children}</section>
}
export function Empty({ children = 'Không có dữ liệu phù hợp với bộ lọc.' }: { children?: ReactNode }) { return <div className="m-empty"><Icon name="inbox" size={24} /><p>{children}</p></div> }
export function DataTable({ headers, children, empty, count }: { headers: string[]; children: ReactNode; empty?: boolean; count?: number }) {
  return <>{empty ? <Empty /> : <div className="m-table-scroll" tabIndex={0} role="region" aria-label="Bảng dữ liệu, có thể cuộn ngang"><table className="m-table"><thead><tr>{headers.map((h, i) => <th key={i} scope="col">{h || <span className="k-visually-hidden">Thao tác</span>}</th>)}</tr></thead><tbody>{children}</tbody></table></div>}{count !== undefined && <div className="m-table-footer">Hiển thị {count} kết quả</div>}</>
}
export function Search({ value, onChange, label = 'Tìm kiếm', placeholder }: { value: string; onChange: (v: string) => void; label?: string; placeholder: string }) {
  return <label className="m-search"><span className="k-visually-hidden">{label}</span><Icon name="search" /><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} /></label>
}
export function Filter({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return <label className="m-filter"><span className="k-visually-hidden">{label}</span><select className="k-select" aria-label={label} value={value} onChange={e => onChange(e.target.value)}>{options.map(o => <option value={o.value} key={o.value}>{o.label}</option>)}</select></label>
}
export function DateFilter({ value, onChange, label = 'Ngày' }: { value: string; onChange: (v: string) => void; label?: string }) { return <label className="m-date-filter"><span>{label}</span><input aria-label={label} className="k-input" type="date" value={value} onChange={e => onChange(e.target.value)} /></label> }
export function RowAction({ children = 'Chi tiết', onClick }: { children?: ReactNode; onClick: () => void }) { return <button type="button" className="m-row-action" onClick={onClick}>{children}<Icon name="chevronRight" size={13} /></button> }
export function Metrics({ items }: { items: { label: string; value: ReactNode; hint?: string; icon: IconName; path?: string }[] }) {
  return <div className="m-metrics">{items.map(m => <div className="m-metric" key={m.label}><div className="m-metric-label">{m.label}<Icon name={m.icon} size={17} /></div><strong>{m.value}</strong>{m.path ? <Link className="m-metric-hint" to={m.path}>{m.hint}<Icon name="arrowRight" size={13} /></Link> : <span className="m-metric-hint">{m.hint}</span>}</div>)}</div>
}
export function History({ entityId }: { entityId: string }) {
  const { data } = useManagerData()
  const [result, setResult] = useState<{ entityId: string; events: Activity[] | null }>()
  useEffect(() => {
    let active = true
    managerService.activity(entityId).then(events => { if (active) setResult({ entityId, events }) }, () => { if (active) setResult({ entityId, events: null }) })
    return () => { active = false }
  }, [entityId])
  const events = result?.entityId === entityId ? result.events : undefined
  return <div className="m-detail-block"><h3>Lịch sử xử lý</h3>{events === undefined ? <p className="m-muted">Đang tải lịch sử…</p> : events === null ? <p className="m-muted">Không tải được lịch sử.</p> : events.length ? <ul className="m-history">{events.map(e => <li key={e.id}><i /><div><span>{e.text}</span><small>{time(e.at)} · {dateLabel(e.at)} · {e.actorName ?? employeeName(data!, e.actorId)}</small></div></li>)}</ul> : <p className="m-muted">Chưa có thay đổi được ghi nhận.</p>}</div>
}
export function DetailDialog({ title, subtitle, onClose, children, entityId, actions }: { title: string; subtitle?: ReactNode; onClose: () => void; children: ReactNode; entityId?: string; actions?: ReactNode }) {
  return <Dialog title={title} subtitle={subtitle} onClose={onClose} footer={<><Button onClick={onClose}>Đóng chi tiết</Button>{actions}</>}><div className="m-detail">{children}{entityId && <History entityId={entityId} />}</div></Dialog>
}
export function Facts({ items }: { items: [string, ReactNode][] }) { return <dl className="m-facts">{items.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl> }

export type FormValues = Record<string, string | boolean | string[]>
export interface FormField { key: string; label: string; type?: 'text' | 'number' | 'date' | 'time' | 'textarea' | 'select' | 'checkbox' | 'multiselect'; options?: { value: string; label: string; disabled?: boolean }[]; disabled?: boolean; hint?: string }
export function FormDialog({ title, description, initial, fields, onSubmit, onClose, submitLabel = 'Lưu thay đổi', extra }: { title: string; description?: string; initial: FormValues; fields: FormField[]; onSubmit: (values: FormValues) => Promise<void>; onClose: () => void; submitLabel?: string; extra?: ReactNode }) {
  const id = useId()
  const [values, setValues] = useState(initial)
  const [error, setError] = useState('')
  const [errorField, setErrorField] = useState('')
  const [saving, setSaving] = useState(false)
  const submit = async () => {
    if (saving) return
    setError(''); setErrorField(''); setSaving(true)
    try { await onSubmit(values); onClose() }
    catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể lưu thay đổi.'); setErrorField(e instanceof ManagerError ? e.field ?? '' : '')
      if (e instanceof ManagerError && e.field) requestAnimationFrame(() => { const field = document.getElementById(`${id}-${e.field}`); (field?.matches('input,select,textarea') ? field : field?.querySelector<HTMLElement>('input,select,textarea'))?.focus() })
    }
    finally { setSaving(false) }
  }
  return <Dialog title={title} subtitle={description} onClose={() => { if (!saving) onClose() }} onSubmit={() => { void submit() }} footer={<><Button onClick={onClose} disabled={saving}>Hủy thay đổi</Button><Button type="submit" primary disabled={saving}>{saving ? 'Đang lưu…' : submitLabel}</Button></>}>
    <div className="m-form">{fields.map(f => {
      const fieldId = `${id}-${f.key}`
      const invalid = errorField === f.key && !!error
      const common = { id: fieldId, disabled: saving || f.disabled, 'aria-invalid': invalid, 'aria-describedby': invalid ? `${fieldId}-error` : f.hint ? `${fieldId}-hint` : undefined }
      const change = (v: string | boolean | string[]) => setValues(old => ({ ...old, [f.key]: v }))
      return <div className="k-field" key={f.key}><label className="k-label" htmlFor={fieldId}>{f.label}</label>
        {f.type === 'select' ? <select {...common} className="k-select" value={String(values[f.key] ?? '')} onChange={e => change(e.target.value)}>{f.options?.map(o => <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>)}</select>
          : f.type === 'textarea' ? <textarea {...common} className="k-input" rows={3} value={String(values[f.key] ?? '')} onChange={e => change(e.target.value)} />
          : f.type === 'checkbox' ? <input {...common} type="checkbox" checked={!!values[f.key]} onChange={e => change(e.target.checked)} />
          : f.type === 'multiselect' ? <div id={fieldId} className="m-check-list" role="group" aria-label={f.label} aria-describedby={common['aria-describedby']}>{f.options?.map(o => <label key={o.value}><input type="checkbox" disabled={saving || o.disabled} checked={(values[f.key] as string[]).includes(o.value)} onChange={e => change(e.target.checked ? [...values[f.key] as string[], o.value] : (values[f.key] as string[]).filter(v => v !== o.value))} />{o.label}</label>)}</div>
          : <input {...common} className="k-input" type={f.type ?? 'text'} value={String(values[f.key] ?? '')} onChange={e => change(e.target.value)} />}
        {f.hint && <small id={`${fieldId}-hint`} className="m-muted">{f.hint}</small>}{invalid && <span id={`${fieldId}-error`} className="k-field-error" role="alert">{error}</span>}
      </div>
    })}{extra}{error && !errorField && <p className="m-form-error" role="alert">{error}</p>}</div>
  </Dialog>
}
