import { useState, type FormEvent } from 'react'
import { INCIDENT_STATUS_LABEL, INCIDENT_TYPE_LABEL, ITEM_STATUS_LABEL, SEVERITY_LABEL } from '../../../api/kitchen/labels'
import { hasPermission, staffName } from '../../../api/kitchen/rules'
import type { Incident, IncidentSeverity, IncidentStatus, IncidentType, KitchenData } from '../../../api/kitchen/types'
import { formatTime } from '../../../components/kitchen/format'
import { Icon } from '../../../components/kitchen/Icon'
import { KitchenFilters } from '../../../components/kitchen/KitchenFilters'
import { KitchenLink } from '../../../components/kitchen/KitchenLink'
import { Badge, type BadgeTone } from '../../../components/kitchen/KitchenStatusBadge'
import { useKitchenSnapshot } from '../../../hooks/kitchen/kitchenDataContext'
import { kitchenPaths } from '../../../routes/kitchenRouter'

const TYPES = Object.keys(INCIDENT_TYPE_LABEL) as IncidentType[]
const SEVERITIES: IncidentSeverity[] = ['LOW', 'MEDIUM', 'HIGH']
const SEVERITY_TONE: Record<IncidentSeverity, BadgeTone> = { LOW: 'neutral', MEDIUM: 'warning', HIGH: 'danger' }
const STATUS_TONE: Record<IncidentStatus, BadgeTone> = { OPEN: 'warning', ACKNOWLEDGED: 'info', RESOLVED: 'success' }

type ListFilter = 'open' | 'resolved' | 'all'
const FORM_KEY = 'incident-form'

export default function KitchenIncidentsPage({ orderId, itemId }: { orderId: string; itemId: string }) {
  const { data, run, isPending, user } = useKitchenSnapshot()
  const me = data.staff.find((s) => s.id === user.id) ?? user
  const canReport = hasPermission(me, 'kitchen.incidents.create')

  const initialOrder = data.orders.some((o) => o.id === orderId) ? orderId : ''
  const initialItem = initialOrder && data.items.some((i) => i.id === itemId && i.orderId === initialOrder) ? itemId : ''
  const [order, setOrder] = useState(initialOrder)
  const [item, setItem] = useState(initialItem)
  const [type, setType] = useState<IncidentType | ''>('')
  const [severity, setSeverity] = useState<IncidentSeverity>('MEDIUM')
  const [description, setDescription] = useState('')
  const [tried, setTried] = useState(false)
  const [done, setDone] = useState('')
  const [filter, setFilter] = useState<ListFilter>('open')

  // Tickets still in the kitchen, plus the one passed in from the board.
  const orderOptions = data.orders
    .filter((o) => o.id === order || data.items.some((i) => i.orderId === o.id && (i.status === 'SUBMITTED' || i.status === 'PREPARING' || i.status === 'READY')))
    .sort((a, b) => a.tableCode.localeCompare(b.tableCode) || a.sequence - b.sequence)
  const itemOptions = data.items.filter((i) => i.orderId === order)
  const descriptionError = description.trim().length < 5 ? 'Mô tả cần ít nhất 5 ký tự.' : ''
  const typeError = type ? '' : 'Chọn loại sự cố.'

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setTried(true)
    setDone('')
    if (!type || descriptionError) return
    const summary = await run({
      type: 'report-incident',
      input: { type, severity, description, orderId: order || undefined, itemId: item || undefined },
    }, [FORM_KEY])
    if (summary === null) return
    setDone(summary)
    setTried(false)
    setType('')
    setSeverity('MEDIUM')
    setDescription('')
    setOrder('')
    setItem('')
  }

  const open = data.incidents.filter((i) => i.status !== 'RESOLVED')
  const list = filter === 'all' ? data.incidents : filter === 'open' ? open : data.incidents.filter((i) => i.status === 'RESOLVED')

  return (
    <div className="k-split">
      <section className="k-panel k-panel--flush" aria-labelledby="incident-list-title">
        <div className="k-panel-bar">
          <h2 id="incident-list-title" className="k-panel-title">Danh sách sự cố</h2>
          <KitchenFilters label="Lọc sự cố" value={filter} onChange={setFilter} options={[
            { value: 'open', label: 'Đang xử lý', count: open.length },
            { value: 'resolved', label: 'Đã xử lý', count: data.incidents.length - open.length },
            { value: 'all', label: 'Tất cả', count: data.incidents.length },
          ]} />
        </div>
        {list.length ? (
          <ul className="k-incidents">{list.map((incident) => <IncidentRow key={incident.id} incident={incident} data={data} />)}</ul>
        ) : (
          <p className="k-empty">{filter === 'open' ? 'Không có sự cố đang chờ xử lý.' : 'Chưa có sự cố.'}</p>
        )}
      </section>

      <section className="k-panel k-incident-form" aria-labelledby="incident-form-title">
        <h2 id="incident-form-title" className="k-panel-title">Báo sự cố</h2>
        {!canReport ? (
          <p className="k-muted">Tài khoản của bạn không có quyền báo sự cố.</p>
        ) : (
          <form className="k-form" onSubmit={submit} noValidate>
            <label className="k-field">
              <span className="k-label">Phiếu liên quan</span>
              <select className="k-select" value={order} onChange={(e) => { setOrder(e.target.value); setItem('') }}>
                <option value="">Không gắn phiếu (thiết bị, khu bếp…)</option>
                {orderOptions.map((o) => (
                  <option key={o.id} value={o.id}>#{o.code} · Bàn {o.tableCode}{o.sequence > 1 ? ` · lượt ${o.sequence}` : ''}</option>
                ))}
              </select>
            </label>
            <label className="k-field">
              <span className="k-label">Món liên quan</span>
              <select className="k-select" value={item} onChange={(e) => setItem(e.target.value)} disabled={!order}>
                <option value="">{order ? 'Cả phiếu' : 'Chọn phiếu trước'}</option>
                {itemOptions.map((i) => (
                  <option key={i.id} value={i.id}>{i.quantity} × {i.name} ({ITEM_STATUS_LABEL[i.status]})</option>
                ))}
              </select>
            </label>
            <label className="k-field">
              <span className="k-label">Loại sự cố</span>
              <select className="k-select" value={type} onChange={(e) => setType(e.target.value as IncidentType)}
                aria-invalid={tried && !!typeError} aria-describedby={tried && typeError ? 'incident-type-error' : undefined}>
                <option value="">Chọn loại sự cố</option>
                {TYPES.map((t) => <option key={t} value={t}>{INCIDENT_TYPE_LABEL[t]}</option>)}
              </select>
              {tried && typeError && <span id="incident-type-error" className="k-field-error">{typeError}</span>}
            </label>
            <fieldset className="k-field k-fieldset">
              <legend className="k-label">Mức độ</legend>
              <div className="k-seg">
                {SEVERITIES.map((s) => (
                  <label key={s} className="k-seg-option">
                    <input type="radio" name="severity" value={s} checked={severity === s} onChange={() => setSeverity(s)} />
                    <span>{SEVERITY_LABEL[s]}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="k-field">
              <span className="k-label">Mô tả</span>
              <textarea className="k-textarea" rows={3} maxLength={500} value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Ví dụ: Hết nấm kim châm, còn đủ cho 1 phần lẩu."
                aria-invalid={tried && !!descriptionError} aria-describedby={tried && descriptionError ? 'incident-desc-error' : undefined} />
              {tried && descriptionError && <span id="incident-desc-error" className="k-field-error">{descriptionError}</span>}
            </label>
            <div className="k-field">
              <span className="k-label">Người báo</span>
              <span className="k-readonly">{me.name} · {me.position}</span>
            </div>
            <p className="k-hint">Quản lý ca luôn nhận thông báo; phục vụ của bàn được báo khi sự cố ảnh hưởng tới món. Báo sự cố không tự hủy món.</p>
            {done && <p className="k-form-success" role="status"><Icon name="checkCircle" size={15} />{done}</p>}
            <button type="submit" className="k-btn k-btn--primary k-btn--lg k-btn--block" disabled={isPending(FORM_KEY)} aria-busy={isPending(FORM_KEY)}>
              {isPending(FORM_KEY) ? 'Đang gửi…' : 'Gửi báo cáo'}
            </button>
          </form>
        )}
      </section>
    </div>
  )
}

function IncidentRow({ incident, data }: { incident: Incident; data: KitchenData }) {
  const linkedOrder = data.orders.find((o) => o.id === incident.orderId)
  const linkedItem = data.items.find((i) => i.id === incident.itemId)
  return (
    <li className="k-incident">
      <div className="k-incident-top">
        <span className="k-strong k-mono">{incident.code}</span>
        <span className="k-strong">{INCIDENT_TYPE_LABEL[incident.type]}</span>
        <Badge tone={SEVERITY_TONE[incident.severity]}>{SEVERITY_LABEL[incident.severity]}</Badge>
        <span className="k-incident-status"><Badge tone={STATUS_TONE[incident.status]}>{INCIDENT_STATUS_LABEL[incident.status]}</Badge></span>
      </div>
      <p className="k-incident-desc">{incident.description}</p>
      <p className="k-incident-meta">
        {linkedOrder && (
          <>
            <KitchenLink className="k-link" to={kitchenPaths.ticket(linkedOrder.id)}>Bàn {linkedOrder.tableCode} · #{linkedOrder.code}</KitchenLink>
            {linkedItem && ` · ${linkedItem.name}`} ·{' '}
          </>
        )}
        {formatTime(incident.at)} · {staffName(data, incident.reporterId)}
        {incident.notifiedStaffIds.length > 0 && ` · đã báo ${incident.notifiedStaffIds.map((id) => staffName(data, id)).join(', ')}`}
      </p>
      {incident.response && (
        <p className="k-incident-reply">
          <Icon name="message" size={13} />
          <span><b>{staffName(data, incident.response.by)}</b> · {formatTime(incident.response.at)}: {incident.response.text}</span>
        </p>
      )}
    </li>
  )
}
