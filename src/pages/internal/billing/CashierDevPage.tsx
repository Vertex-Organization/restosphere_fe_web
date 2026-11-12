import { useState } from 'react'
import { openSessions, type DevEvent, type RoundLine } from '../../../api/billing/devEvents'
import { BILL_STATUS_LABEL, REQUEST_TYPE_LABEL, TABLE_STATUS_LABEL } from '../../../api/billing/labels'
import { formatVnd } from '../../../api/billing/money'
import { mockDevTools } from '../../../api/billing/mockService'
import { CashierError } from '../../../api/billing/types'
import { ROLE_LABEL } from '../../../api/kitchen/labels'
import { Icon } from '../../../components/billing/Icon'
import { formatTime } from '../../../components/kitchen/format'
import { useCashierSnapshot } from '../../../hooks/billing/cashierDataContext'

// DEVELOPMENT ONLY. Simulates what the Waiter app, the kitchen, the shift
// manager and the bank would send through the backend, so the cashier screens
// can be tested end to end. Not linked or bundled in production builds.

const emptyLine = (): RoundLine => ({ menuItemId: '', quantity: 1 })

export default function CashierDevPage() {
  const { data } = useCashierSnapshot()
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [session, setSession] = useState('')
  const [table, setTable] = useState('')
  const [guests, setGuests] = useState(2)
  const [waiter, setWaiter] = useState('NV002')
  const [lines, setLines] = useState<RoundLine[]>([emptyLine()])
  const [failReason, setFailReason] = useState('Khách chuyển sai số tiền, ngân hàng đã hoàn lại')
  const [note, setNote] = useState('')
  const [offline, setOffline] = useState(mockDevTools.isOffline)
  const [confirmReset, setConfirmReset] = useState(false)

  const simulate = async (event: DevEvent) => {
    try {
      const result = await mockDevTools.simulate(event)
      setMessage({ ok: true, text: result.summary })
      return true
    } catch (error) {
      setMessage({ ok: false, text: error instanceof CashierError ? error.message : String(error) })
      return false
    }
  }

  const sessions = openSessions(data)
  const freeTables = data.tables.filter((t) => t.status === 'AVAILABLE')
  const waiters = data.staff.filter((s) => s.role === 'WAITER')
  const pendingTransfers = data.payments.filter((p) => p.status === 'PENDING')
  const pendingRequests = data.requests.filter((r) => r.status === 'PENDING')
  const billCode = (id: string) => data.bills.find((b) => b.id === id)?.code ?? id
  const chosen = sessions.find((s) => s.session.id === session)

  const sendRound = async () => {
    const ok = chosen
      ? await simulate({ type: 'add-round', sessionId: chosen.session.id, lines })
      : await simulate({ type: 'walk-in', tableId: table, guests, waiterId: waiter, lines })
    if (ok) setLines([emptyLine()])
  }

  return (
    <div className="k-page">
      <p className="k-callout k-callout--warn">
        <Icon name="terminal" size={14} />
        <span>Trang mô phỏng chỉ có khi phát triển. Thao tác ở đây đóng vai Phục vụ, Bếp, Quản lý và Ngân hàng — không phải quyền của Thu ngân.</span>
      </p>
      {message && <p className={message.ok ? 'k-form-success' : 'k-form-error'} role="status">{message.text}</p>}

      <div className="k-dev-grid">
        <section className="k-panel">
          <h3 className="k-panel-title">Phục vụ · gọi món</h3>
          <div className="k-form">
            <label className="k-field">
              <span className="k-label">Lượt phục vụ</span>
              <select className="k-select" value={session} onChange={(e) => setSession(e.target.value)}>
                <option value="">Mở bàn mới (walk-in)</option>
                {sessions.filter((s) => s.bill.status === 'UNPAID').map((s) => (
                  <option key={s.session.id} value={s.session.id}>Gọi thêm · Bàn {s.table.code} · {s.bill.code}</option>
                ))}
              </select>
            </label>
            {!chosen && (
              <div className="k-form-row">
                <label className="k-field">
                  <span className="k-label">Bàn trống</span>
                  <select className="k-select" value={table} onChange={(e) => setTable(e.target.value)}>
                    <option value="">Chọn bàn</option>
                    {freeTables.map((t) => <option key={t.id} value={t.id}>{t.code} · {t.area} · {t.capacity} chỗ</option>)}
                  </select>
                </label>
                <label className="k-field">
                  <span className="k-label">Khách</span>
                  <input className="k-input" type="number" min={1} max={12} value={guests} onChange={(e) => setGuests(Number(e.target.value))} />
                </label>
                <label className="k-field">
                  <span className="k-label">Phục vụ</span>
                  <select className="k-select" value={waiter} onChange={(e) => setWaiter(e.target.value)}>
                    {waiters.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </label>
              </div>
            )}
            {lines.map((line, i) => (
              <div key={i} className="k-form-row k-dev-line">
                <select className="k-select" value={line.menuItemId} aria-label={`Món ${i + 1}`}
                  onChange={(e) => setLines(lines.map((l, j) => (j === i ? { ...l, menuItemId: e.target.value } : l)))}>
                  <option value="">Chọn món</option>
                  {data.menu.map((m) => <option key={m.id} value={m.id}>{m.name} · {formatVnd(m.price)}</option>)}
                </select>
                <input className="k-input k-dev-qty" type="number" min={1} max={99} value={line.quantity} aria-label="Số lượng"
                  onChange={(e) => setLines(lines.map((l, j) => (j === i ? { ...l, quantity: Number(e.target.value) } : l)))} />
              </div>
            ))}
            <div className="k-form-row">
              <button type="button" className="k-btn" onClick={() => setLines([...lines, emptyLine()])}>Thêm dòng</button>
              <button type="button" className="k-btn k-btn--primary" onClick={() => { void sendRound() }}>Gửi bếp</button>
            </div>
          </div>
        </section>

        <section className="k-panel">
          <h3 className="k-panel-title">Lượt đang phục vụ</h3>
          <ul className="k-dev-list">
            {sessions.map(({ session: s, table: t, bill }) => (
              <li key={s.id}>
                <span>
                  <b>{t.code}</b> · {bill.code} · {BILL_STATUS_LABEL[bill.status]} · bàn {TABLE_STATUS_LABEL[t.status].toLowerCase()}
                </span>
                <span className="c-inline-gap">
                  {bill.status !== 'PAID' && <button type="button" className="k-btn k-btn--ghost" onClick={() => { void simulate({ type: 'serve-remaining', sessionId: s.id }) }}>Ra hết món</button>}
                  {bill.status === 'UNPAID' && <button type="button" className="k-btn k-btn--outline" onClick={() => { void simulate({ type: 'waiter-request-payment', sessionId: s.id }) }}>Yêu cầu TT</button>}
                  {bill.status === 'PAID' && !s.guestLeftAt && <button type="button" className="k-btn" onClick={() => { void simulate({ type: 'guest-left', sessionId: s.id }) }}>Khách rời</button>}
                  {s.guestLeftAt && <button type="button" className="k-btn" onClick={() => { void simulate({ type: 'table-cleaned', sessionId: s.id }) }}>Dọn xong</button>}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="k-panel">
          <h3 className="k-panel-title">Ngân hàng · chuyển khoản chờ</h3>
          {pendingTransfers.length ? (
            <>
              <ul className="k-dev-list">
                {pendingTransfers.map((p) => (
                  <li key={p.id}>
                    <span>{p.code} · {billCode(p.billId)} · {formatVnd(p.amount)} · {p.transferContent}</span>
                    <span className="c-inline-gap">
                      <button type="button" className="k-btn k-btn--primary" onClick={() => { void simulate({ type: 'bank-confirm', paymentId: p.id }) }}>Đã nhận tiền</button>
                      <button type="button" className="k-btn k-btn--danger" onClick={() => { void simulate({ type: 'bank-fail', paymentId: p.id, reason: failReason }) }}>Báo lỗi</button>
                    </span>
                  </li>
                ))}
              </ul>
              <label className="k-field">
                <span className="k-label">Lý do lỗi</span>
                <input className="k-input" value={failReason} onChange={(e) => setFailReason(e.target.value)} />
              </label>
            </>
          ) : <p className="k-muted">Không có chuyển khoản chờ xác nhận.</p>}
        </section>

        <section className="k-panel">
          <h3 className="k-panel-title">Quản lý · duyệt yêu cầu</h3>
          {pendingRequests.length ? (
            <>
              <ul className="k-dev-list">
                {pendingRequests.map((r) => (
                  <li key={r.id}>
                    <span>{r.code} · {REQUEST_TYPE_LABEL[r.type]} · {billCode(r.billId)}{r.discount ? ` · ${formatVnd(r.discount.amount)}` : ''}</span>
                    <span className="c-inline-gap">
                      <button type="button" className="k-btn k-btn--primary" onClick={() => { void simulate({ type: 'manager-decide', requestId: r.id, approve: true, note }) }}>Duyệt</button>
                      <button type="button" className="k-btn k-btn--danger" onClick={() => { void simulate({ type: 'manager-decide', requestId: r.id, approve: false, note }) }}>Từ chối</button>
                    </span>
                  </li>
                ))}
              </ul>
              <label className="k-field">
                <span className="k-label">Ghi chú của Quản lý</span>
                <input className="k-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Không bắt buộc" />
              </label>
            </>
          ) : <p className="k-muted">Không có yêu cầu chờ duyệt.</p>}
        </section>

        <section className="k-panel">
          <h3 className="k-panel-title">Hệ thống</h3>
          <div className="k-form">
            <label className="k-check">
              <input type="checkbox" checked={offline} onChange={(e) => { mockDevTools.setOffline(e.target.checked); setOffline(e.target.checked) }} />
              Giả lập mất kết nối máy chủ
            </label>
            {confirmReset ? (
              <div className="k-form-row">
                <span className="k-muted">Xóa mọi thao tác và tạo lại dữ liệu mẫu?</span>
                <button type="button" className="k-btn k-btn--danger" onClick={() => { mockDevTools.reset(); setConfirmReset(false); setMessage({ ok: true, text: 'Đã tạo lại dữ liệu mẫu' }) }}>Tạo lại</button>
                <button type="button" className="k-btn" onClick={() => setConfirmReset(false)}>Hủy</button>
              </div>
            ) : <button type="button" className="k-btn" onClick={() => setConfirmReset(true)}><Icon name="refresh" />Tạo lại dữ liệu mẫu</button>}
          </div>
        </section>

        <section className="k-panel">
          <h3 className="k-panel-title">Tin gửi sang vai trò khác</h3>
          {data.outbox.length ? (
            <ul className="k-dev-list k-dev-outbox">
              {data.outbox.slice(0, 12).map((m) => (
                <li key={m.id}>
                  <span><b>{ROLE_LABEL[m.audience]}</b> · {m.title}<br /><span className="k-muted">{m.body}</span></span>
                  <span className="k-muted k-mono">{formatTime(m.at)}</span>
                </li>
              ))}
            </ul>
          ) : <p className="k-muted">Chưa có tin nào.</p>}
        </section>
      </div>
    </div>
  )
}
