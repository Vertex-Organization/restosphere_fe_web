import { useState, type ReactNode } from 'react'
import { formatVnd } from '../../../api/billing/money'
import { hasPermission, openShiftOf, shiftSummary, type ShiftSummary } from '../../../api/billing/selectors'
import type { CashierShift } from '../../../api/billing/types'
import { minutesBetween } from '../../../api/kitchen/selectors'
import { shortDuration } from '../../../components/billing/format'
import { Icon, type IconName } from '../../../components/billing/Icon'
import { Alert, Badge, Dialog, MoneyInput } from '../../../components/billing/ui'
import { formatDate, formatTime } from '../../../components/kitchen/format'
import { useCashierSnapshot } from '../../../hooks/billing/cashierDataContext'
import { useNow } from '../../../hooks/kitchen/useNow'

const QUICK_FLOATS = [1_000_000, 2_000_000, 3_000_000]

function Stat({ icon, label, value, sub, tone }: { icon: IconName; label: string; value: ReactNode; sub?: ReactNode; tone?: string }) {
  return (
    <div className={tone ? `c-stat c-stat--${tone}` : 'c-stat'}>
      <span className="c-stat-label"><Icon name={icon} size={14} />{label}</span>
      <b className="c-stat-value">{value}</b>
      {sub && <span className="c-stat-sub">{sub}</span>}
    </div>
  )
}

function Variance({ diff }: { diff: number }) {
  if (diff === 0) return <Badge tone="success">Khớp</Badge>
  return <Badge tone="danger">{diff > 0 ? 'Thừa' : 'Thiếu'} {formatVnd(Math.abs(diff))}</Badge>
}

export default function CashierShiftPage() {
  const { data, user } = useCashierSnapshot()
  if (!hasPermission(user, 'shifts.view')) return <div className="c-empty"><p>Bạn không có quyền xem ca thu ngân.</p></div>
  const shift = openShiftOf(data, user.id)
  const past = data.shifts.filter((s) => s.cashierId === user.id && s.status === 'CLOSED')
    .sort((a, b) => (b.closedAt ?? '').localeCompare(a.closedAt ?? ''))

  return (
    <div className="c-shift-page">
      {shift ? <CurrentShift key={shift.id} shift={shift} /> : <OpenShift />}

      <section className="c-card">
        <h3 className="c-card-title">Ca trước</h3>
        {past.length ? (
          <ul className="c-shift-list">
            {past.map((s) => {
              const sum = shiftSummary(data, s)
              const expected = s.expectedCash ?? sum.expectedCash
              return (
                <li key={s.id}>
                  <b>{s.code}</b>
                  <span className="k-mono">{formatDate(s.openedAt).slice(0, 5)} · {formatTime(s.openedAt)}–{s.closedAt ? formatTime(s.closedAt) : '—'}</span>
                  <span>{sum.count} giao dịch</span>
                  <span className="c-strong">{formatVnd(sum.revenue)}</span>
                  <Variance diff={(s.countedCash ?? 0) - expected} />
                  <span className="c-shift-note" title={s.closingNote}>{s.closingNote ?? ''}</span>
                </li>
              )
            })}
          </ul>
        ) : <p className="k-muted c-small">Chưa có ca nào đã đóng.</p>}
      </section>
    </div>
  )
}

function OpenShift() {
  const { user, run, isPending } = useCashierSnapshot()
  const [float, setFloat] = useState<number | null>(null)
  const [error, setError] = useState('')
  const canManage = hasPermission(user, 'shifts.manage')
  const busy = isPending('shift')

  const submit = async () => {
    if (busy) return
    if (float === null) return setError('Nhập tiền đầu ca (nhập 0 nếu không có).')
    const outcome = await run({ type: 'open-shift', openingFloat: float }, ['shift'])
    if (outcome && !outcome.ok) setError(outcome.error)
  }

  return (
    <section className="c-card c-open-shift">
      <span className="c-icon-box c-icon-box--lg c-icon-box--warning"><Icon name="drawer" size={20} /></span>
      <div className="c-open-shift-text">
        <h3 className="c-card-title">Chưa mở ca</h3>
        <p className="k-muted">Mở ca để bắt đầu thu tiền. Tiền đầu ca là tiền lẻ trong két để thối, không tính vào doanh thu.</p>
      </div>
      <form className="c-open-shift-form" noValidate onSubmit={(e) => { e.preventDefault(); void submit() }}>
        <MoneyInput label="Tiền đầu ca" value={float} onChange={(v) => { setFloat(v); setError('') }} autoFocus disabled={!canManage} placeholder="0" />
        <div className="c-quick c-quick--3">
          {QUICK_FLOATS.map((v) => (
            <button key={v} type="button" className="c-quick-btn" aria-pressed={float === v} disabled={!canManage} onClick={() => setFloat(v)}>{formatVnd(v)}</button>
          ))}
        </div>
        {error && <Alert tone="danger" icon="alert">{error}</Alert>}
        <button type="submit" className="k-btn k-btn--primary c-confirm" disabled={!canManage || busy} aria-busy={busy}>Mở ca</button>
        {!canManage && <p className="k-hint">Tài khoản của bạn không được mở ca.</p>}
      </form>
    </section>
  )
}

function MethodBar({ s }: { s: ShiftSummary }) {
  const parts = [
    { key: 'cash', label: 'Tiền mặt', icon: 'cash' as IconName, amount: s.cash, count: s.cashCount },
    { key: 'transfer', label: 'Chuyển khoản', icon: 'bank' as IconName, amount: s.transfer, count: s.transferCount },
  ]
  const total = s.revenue || 1
  return (
    <>
      <div className="c-bar" role="img" aria-label={parts.map((p) => `${p.label} ${Math.round((p.amount / total) * 100)}%`).join(', ')}>
        {parts.map((p) => p.amount > 0 && <span key={p.key} className={`c-bar-part c-bar-part--${p.key}`} style={{ flexGrow: p.amount }} />)}
      </div>
      <ul className="c-legend">
        {parts.map((p) => (
          <li key={p.key}>
            <span className={`c-dot c-dot--${p.key}`} />
            <span>{p.label}</span>
            <span className="k-muted">{p.count} GD · {Math.round((p.amount / total) * 100)}%</span>
            <b>{formatVnd(p.amount)}</b>
          </li>
        ))}
        <li className="c-legend-off">
          <span className="c-dot" />
          <span>Thẻ</span>
          <span className="k-muted">Chưa hỗ trợ</span>
          <b>—</b>
        </li>
      </ul>
    </>
  )
}

function CurrentShift({ shift }: { shift: CashierShift }) {
  const { data, user } = useCashierSnapshot()
  const now = useNow()
  const [closing, setClosing] = useState(false)
  const s = shiftSummary(data, shift)
  const canManage = hasPermission(user, 'shifts.manage')
  const extras = [
    s.pendingCount ? `${s.pendingCount} chờ xác nhận` : '',
    s.voidedCount ? `${s.voidedCount} đã hủy` : '',
    s.failedCount ? `${s.failedCount} lỗi` : '',
  ].filter(Boolean).join(' · ')

  return (
    <>
      <div className="c-stats">
        <Stat icon="clock" label={`Ca ${shift.code}`} value={<span className="c-stat-open">Đang mở</span>}
          sub={`Từ ${formatTime(shift.openedAt)} · ${shortDuration(minutesBetween(shift.openedAt, now))}`} tone="success" />
        <Stat icon="receipt" label="Doanh thu ca" value={formatVnd(s.revenue)} sub="Tiền mặt + chuyển khoản" />
        <Stat icon="list" label="Giao dịch" value={s.count} sub={extras || 'Không có giao dịch treo'} />
        <Stat icon="drawer" label="Tiền mặt dự kiến" value={formatVnd(s.expectedCash)} sub={`Gồm ${formatVnd(shift.openingFloat)} đầu ca`} />
      </div>

      <div className="c-shift-grid">
        <section className="c-card">
          <h3 className="c-card-title">Theo phương thức</h3>
          <MethodBar s={s} />
          {s.pendingCount > 0 && (
            <Alert tone="info" icon="hourglass">{s.pendingCount} chuyển khoản ({formatVnd(s.pendingAmount)}) đang chờ, chưa tính vào doanh thu.</Alert>
          )}
        </section>

        <section className="c-card c-drawer">
          <h3 className="c-card-title">Két tiền mặt</h3>
          <div className="c-equation">
            <div><span>Đầu ca</span><b>{formatVnd(shift.openingFloat)}</b></div>
            <span className="c-equation-op">+</span>
            <div><span>Thu tiền mặt</span><b>{formatVnd(s.cash)}</b></div>
            <span className="c-equation-op">=</span>
            <div className="c-equation-result"><span>Dự kiến trong két</span><b>{formatVnd(s.expectedCash)}</b></div>
          </div>
          <p className="k-hint">Két chỉ giữ tiền mặt (đã trừ tiền thừa trả khách); doanh thu ca còn gồm chuyển khoản.</p>
          <div className="c-drawer-action">
            {s.pendingCount > 0 && <span className="k-hint">Xử lý chuyển khoản đang chờ trước khi đóng ca.</span>}
            <button type="button" className="k-btn k-btn--primary" disabled={!canManage || s.pendingCount > 0} onClick={() => setClosing(true)}>
              Đối soát &amp; đóng ca
            </button>
          </div>
        </section>
      </div>

      {closing && <CloseShiftDialog shift={shift} summary={s} onClose={() => setClosing(false)} />}
    </>
  )
}

function CloseShiftDialog({ shift, summary: s, onClose }: { shift: CashierShift; summary: ShiftSummary; onClose: () => void }) {
  const { run, isPending } = useCashierSnapshot()
  const [counted, setCounted] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [checked, setChecked] = useState(false)
  const [error, setError] = useState('')
  const busy = isPending('shift')
  const diff = counted === null ? null : counted - s.expectedCash

  const close = async () => {
    if (busy) return
    if (counted === null) return setError('Nhập số tiền mặt kiểm đếm trong két.')
    if (diff !== 0 && note.trim().length < 5) return setError('Có chênh lệch: ghi chú lý do (ít nhất 5 ký tự).')
    if (!checked) return setError('Xác nhận bạn đã kiểm đếm két.')
    const outcome = await run({ type: 'close-shift', shiftId: shift.id, countedCash: counted, note }, ['shift'])
    if (outcome?.ok) onClose()
    else if (outcome) setError(outcome.error)
  }

  return (
    <Dialog title={`Đóng ca ${shift.code}`} subtitle={`Tiền mặt dự kiến trong két: ${formatVnd(s.expectedCash)}`} onClose={onClose} onSubmit={close}
      footer={(
        <>
          <button type="button" className="k-btn" onClick={onClose}>Hủy</button>
          <button type="submit" className="k-btn k-btn--primary" disabled={busy} aria-busy={busy}>Đóng ca</button>
        </>
      )}>
      <MoneyInput label="Tiền mặt kiểm đếm thực tế" value={counted} onChange={(v) => { setCounted(v); setError('') }} large autoFocus placeholder="0" />
      <div className="c-variance">
        <span>Chênh lệch</span>
        {diff === null ? <b>—</b> : <Variance diff={diff} />}
      </div>
      <div className="k-field">
        <label className="k-label" htmlFor="close-note">Ghi chú{diff ? ' (bắt buộc khi chênh lệch)' : ''}</label>
        <textarea id="close-note" className="k-textarea" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <label className="k-check">
        <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
        Tôi đã kiểm đếm két và xác nhận số liệu
      </label>
      {error && <Alert tone="danger" icon="alert">{error}</Alert>}
    </Dialog>
  )
}
