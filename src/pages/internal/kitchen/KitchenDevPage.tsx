import { useState, type FormEvent } from 'react'
import { activeSessions, type DevEvent, type SubmitLine } from '../../../api/kitchen/devEvents'
import { ROLE_LABEL } from '../../../api/kitchen/labels'
import { mockDevTools } from '../../../api/kitchen/mockService'
import { KitchenError } from '../../../api/kitchen/types'
import { formatTime } from '../../../components/kitchen/format'
import { Icon } from '../../../components/kitchen/Icon'
import { useKitchenSnapshot } from '../../../hooks/kitchen/kitchenDataContext'

// DEVELOPMENT ONLY. Simulates what the Waiter app and the shift manager would
// send through the backend, so the kitchen screens can be tested end to end.
// Not linked or bundled in production builds.

const emptyLine = (): SubmitLine => ({ menuItemId: '', quantity: 1, note: '' })

export default function KitchenDevPage() {
  const { data } = useKitchenSnapshot()
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [session, setSession] = useState('')
  const [table, setTable] = useState('')
  const [waiter, setWaiter] = useState('NV002')
  const [lines, setLines] = useState<SubmitLine[]>([emptyLine()])
  const [cancelItem, setCancelItem] = useState('')
  const [cancelReason, setCancelReason] = useState('Khách đổi món')
  const [priorityOrder, setPriorityOrder] = useState('')
  const [incident, setIncident] = useState('')
  const [reply, setReply] = useState('Đã tiếp nhận, đang xử lý.')
  const [resolve, setResolve] = useState(false)
  const [offline, setOffline] = useState(mockDevTools.isOffline)
  const [confirmReset, setConfirmReset] = useState(false)

  const simulate = async (event: DevEvent) => {
    try {
      const result = await mockDevTools.simulate(event)
      setMessage({ ok: true, text: result.summary })
      return true
    } catch (error) {
      setMessage({ ok: false, text: error instanceof KitchenError ? error.message : String(error) })
      return false
    }
  }

  const sessions = activeSessions(data)
  const waiters = data.staff.filter((s) => s.role === 'WAITER')
  const available = data.menuItems.filter((m) => m.status === 'AVAILABLE')
  const label = (itemId: string) => {
    const item = data.items.find((i) => i.id === itemId)
    const order = data.orders.find((o) => o.id === item?.orderId)
    return item && order ? `Bàn ${order.tableCode} · #${order.code} · ${item.quantity} × ${item.name}` : itemId
  }
  const ready = data.items.filter((i) => i.status === 'READY')
  const cancellable = data.items.filter((i) => i.status === 'SUBMITTED' || i.status === 'PREPARING')
  const activeOrders = data.orders.filter((o) => data.items.some((i) => i.orderId === o.id && (i.status === 'SUBMITTED' || i.status === 'PREPARING')))
  const openIncidents = data.incidents.filter((i) => i.status !== 'RESOLVED')
  const requests = data.menuRequests.filter((r) => r.status === 'PENDING')

  const submitOrder = async (event: FormEvent) => {
    event.preventDefault()
    const ok = await simulate({ type: 'waiter-submit', sessionId: session || undefined, tableCode: table, guests: 2, waiterId: waiter, lines })
    if (ok) {
      setLines([emptyLine()])
      setTable('')
    }
  }
  const updateLine = (index: number, patch: Partial<SubmitLine>) => setLines((list) => list.map((l, i) => (i === index ? { ...l, ...patch } : l)))

  return (
    <div className="k-page">
      <p className="k-callout k-callout--warn">
        <Icon name="terminal" size={14} />
        Chỉ có khi phát triển. Trang này giả lập thao tác của Phục vụ và Quản lý ca trên dữ liệu mô phỏng cục bộ;
        không đồng bộ với ứng dụng Mobile.
      </p>
      {message && (
        <p className={message.ok ? 'k-form-success' : 'k-form-error'} role="status">
          <Icon name={message.ok ? 'checkCircle' : 'alert'} size={15} />{message.text}
        </p>
      )}

      <div className="k-dev-grid">
        <section className="k-panel">
          <h2 className="k-panel-title">Phục vụ gửi món</h2>
          <form className="k-form" onSubmit={submitOrder}>
            <div className="k-form-row">
              <label className="k-field">
                <span className="k-label">Bàn</span>
                <select className="k-select" value={session} onChange={(e) => setSession(e.target.value)}>
                  <option value="">Bàn mới…</option>
                  {sessions.map((s) => <option key={s.sessionId} value={s.sessionId}>Bàn {s.tableCode} · gọi thêm (lượt {s.lastSequence + 1})</option>)}
                </select>
              </label>
              {!session && (
                <label className="k-field">
                  <span className="k-label">Mã bàn mới</span>
                  <input className="k-input" value={table} onChange={(e) => setTable(e.target.value)} placeholder="A06" />
                </label>
              )}
              {!session && (
                <label className="k-field">
                  <span className="k-label">Phục vụ</span>
                  <select className="k-select" value={waiter} onChange={(e) => setWaiter(e.target.value)}>
                    {waiters.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </label>
              )}
            </div>
            {lines.map((line, index) => (
              <div className="k-form-row k-dev-line" key={index}>
                <select className="k-select" aria-label="Món" value={line.menuItemId} onChange={(e) => updateLine(index, { menuItemId: e.target.value })}>
                  <option value="">Chọn món</option>
                  {available.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <input className="k-input k-dev-qty" type="number" min={1} max={99} aria-label="Số lượng" value={line.quantity}
                  onChange={(e) => updateLine(index, { quantity: Number(e.target.value) })} />
                <input className="k-input" aria-label="Ghi chú" placeholder="Ghi chú" value={line.note} onChange={(e) => updateLine(index, { note: e.target.value })} />
              </div>
            ))}
            <div className="k-form-row">
              <button type="button" className="k-btn" onClick={() => setLines((list) => [...list, emptyLine()])} disabled={lines.length >= 6}>Thêm dòng</button>
              <button type="submit" className="k-btn k-btn--primary">Gửi bếp</button>
            </div>
          </form>
        </section>

        <section className="k-panel">
          <h2 className="k-panel-title">Phục vụ xác nhận đã mang ra <span className="k-muted">({ready.length})</span></h2>
          {ready.length ? (
            <ul className="k-dev-list">
              {ready.map((item) => (
                <li key={item.id}>
                  <span>{label(item.id)}</span>
                  <button type="button" className="k-btn" onClick={() => { void simulate({ type: 'waiter-serve', itemId: item.id }) }}>Đã phục vụ</button>
                </li>
              ))}
            </ul>
          ) : <p className="k-muted">Không có món READY.</p>}
        </section>

        <section className="k-panel">
          <h2 className="k-panel-title">Hủy món theo quy trình</h2>
          <div className="k-form">
            <select className="k-select" aria-label="Món cần hủy" value={cancelItem} onChange={(e) => setCancelItem(e.target.value)}>
              <option value="">Chọn món chưa xong</option>
              {cancellable.map((i) => <option key={i.id} value={i.id}>{label(i.id)}</option>)}
            </select>
            <div className="k-form-row">
              <input className="k-input" aria-label="Lý do hủy" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
              <button type="button" className="k-btn k-btn--danger" disabled={!cancelItem}
                onClick={() => { void simulate({ type: 'cancel-item', itemId: cancelItem, reason: cancelReason }).then((ok) => ok && setCancelItem('')) }}>
                Hủy món
              </button>
            </div>
          </div>
        </section>

        <section className="k-panel">
          <h2 className="k-panel-title">Yêu cầu ưu tiên</h2>
          <div className="k-form-row">
            <select className="k-select" aria-label="Phiếu" value={priorityOrder} onChange={(e) => setPriorityOrder(e.target.value)}>
              <option value="">Chọn phiếu đang làm</option>
              {activeOrders.map((o) => <option key={o.id} value={o.id}>#{o.code} · Bàn {o.tableCode}</option>)}
            </select>
            <button type="button" className="k-btn" disabled={!priorityOrder}
              onClick={() => { void simulate({ type: 'priority', orderId: priorityOrder, reason: 'Khách cần đi sớm' }) }}>
              Gửi ưu tiên
            </button>
          </div>
        </section>

        <section className="k-panel">
          <h2 className="k-panel-title">Quản lý phản hồi sự cố</h2>
          <div className="k-form">
            <select className="k-select" aria-label="Sự cố" value={incident} onChange={(e) => setIncident(e.target.value)}>
              <option value="">Chọn sự cố chưa xử lý xong</option>
              {openIncidents.map((i) => <option key={i.id} value={i.id}>{i.code} · {i.description.slice(0, 50)}</option>)}
            </select>
            <input className="k-input" aria-label="Phản hồi" value={reply} onChange={(e) => setReply(e.target.value)} />
            <div className="k-form-row">
              <label className="k-check"><input type="checkbox" checked={resolve} onChange={(e) => setResolve(e.target.checked)} />Đánh dấu đã xử lý</label>
              <button type="button" className="k-btn" disabled={!incident}
                onClick={() => { void simulate({ type: 'incident-reply', incidentId: incident, text: reply, resolve }) }}>
                Gửi phản hồi
              </button>
            </div>
          </div>
        </section>

        <section className="k-panel">
          <h2 className="k-panel-title">Quản lý duyệt yêu cầu thực đơn</h2>
          {requests.length ? (
            <ul className="k-dev-list">
              {requests.map((r) => (
                <li key={r.id}>
                  <span>{r.requested === 'SOLD_OUT' ? 'Báo tạm hết' : 'Mở bán lại'}: {data.menuItems.find((m) => m.id === r.menuItemId)?.name}</span>
                  <span className="k-form-row">
                    <button type="button" className="k-btn k-btn--outline" onClick={() => { void simulate({ type: 'menu-request-decision', requestId: r.id, approve: true }) }}>Duyệt</button>
                    <button type="button" className="k-btn" onClick={() => { void simulate({ type: 'menu-request-decision', requestId: r.id, approve: false }) }}>Từ chối</button>
                  </span>
                </li>
              ))}
            </ul>
          ) : <p className="k-muted">Không có yêu cầu chờ duyệt (đăng nhập kitchen2 để gửi).</p>}
        </section>

        <section className="k-panel">
          <h2 className="k-panel-title">Tin Bếp đã gửi cho vai trò khác</h2>
          <ul className="k-dev-list k-dev-outbox">
            {data.outbox.slice(0, 8).map((m) => (
              <li key={m.id}>
                <span><b>{ROLE_LABEL[m.audience]}</b>{m.staffId && ` (${data.staff.find((s) => s.id === m.staffId)?.name ?? m.staffId})`} · {m.title}</span>
                <span className="k-muted">{formatTime(m.at)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="k-panel">
          <h2 className="k-panel-title">Hệ thống</h2>
          <div className="k-form">
            <label className="k-check">
              <input type="checkbox" checked={offline} onChange={(e) => { mockDevTools.setOffline(e.target.checked); setOffline(e.target.checked) }} />
              Giả lập mất kết nối máy chủ
            </label>
            <div className="k-form-row">
              {confirmReset ? (
                <>
                  <button type="button" className="k-btn k-btn--danger" onClick={() => { mockDevTools.reset(); setConfirmReset(false); setMessage({ ok: true, text: 'Đã tạo lại dữ liệu demo.' }) }}>Xác nhận tạo lại</button>
                  <button type="button" className="k-btn k-btn--ghost" onClick={() => setConfirmReset(false)}>Hủy</button>
                </>
              ) : (
                <button type="button" className="k-btn" onClick={() => setConfirmReset(true)}><Icon name="refresh" size={15} />Tạo lại dữ liệu demo</button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
