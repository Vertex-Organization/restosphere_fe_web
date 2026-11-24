import { useRef, useState } from 'react'
import { cashSuggestions, formatAmount, formatVnd } from '../../../api/billing/money'
import { hasPermission, openShiftOf } from '../../../api/billing/selectors'
import type { PendingDeposit } from '../../../api/billing/types'
import { Alert, MoneyInput } from '../../../components/billing/ui'
import { formatDate, formatTime } from '../../../components/kitchen/format'
import { KitchenLink as Link } from '../../../components/kitchen/KitchenLink'
import { useCashierSnapshot } from '../../../hooks/billing/cashierDataContext'
import { cashierPaths } from '../../../routes/cashierRouter'

type Mode = 'cash' | 'transfer'

function newAttemptKey(reservationId: string) {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
  return `dep-${reservationId}-${random}`
}

/** Bookings reception handed over to take the deposit in cash; the cashier never works off a note. */
export default function CashierDepositsPage() {
  const { data, user } = useCashierSnapshot()
  const [openId, setOpenId] = useState('')
  const canPay = hasPermission(user, 'payments.create')
  const hasShift = !!openShiftOf(data, user.id)

  return (
    <div className="c-deposits">
      <div className="c-page-bar">
        <h2 className="c-page-title">Cọc chờ thu</h2>
        <span className="k-hint">{data.pendingDeposits.length} đặt bàn</span>
      </div>
      {!hasShift && (
        <Alert tone="warning" icon="info">
          Mở ca thu ngân trước khi thu cọc.
        </Alert>
      )}
      <p className="k-hint">
        Tiền cọc không hoàn lại dù khách hủy hay không đến. Lễ tân không nhận tiền, chỉ chuyển đặt
        bàn sang đây.
      </p>
      {data.pendingDeposits.length === 0 ? (
        <div className="c-empty">
          <p>Không có khoản cọc nào đang chờ thu.</p>
        </div>
      ) : (
        <ul className="c-deposit-list">
          {data.pendingDeposits.map((deposit) => (
            <li key={deposit.reservationId} className="c-card">
              <div className="c-deposit-head">
                <div>
                  <b>
                    {deposit.code} · {deposit.customerName}
                  </b>
                  <span className="k-hint">
                    {deposit.phone} · đến {formatTime(deposit.startsAt)} {formatDate(deposit.startsAt)}
                  </span>
                </div>
                <div className="c-deposit-amount">
                  <b>{formatVnd(deposit.amount)}</b>
                  <span className="k-hint">hạn thu {formatTime(deposit.dueAt)}</span>
                </div>
                <button
                  type="button"
                  className="k-btn k-btn--primary"
                  disabled={!canPay || !hasShift}
                  onClick={() => setOpenId(openId === deposit.reservationId ? '' : deposit.reservationId)}
                >
                  Thu cọc
                </button>
              </div>
              {openId === deposit.reservationId && (
                <DepositForm key={deposit.reservationId} deposit={deposit} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function DepositForm({ deposit }: { deposit: PendingDeposit }) {
  const { run, isPending } = useCashierSnapshot()
  const [mode, setMode] = useState<Mode>('cash')
  const [tendered, setTendered] = useState<number | null>(null)
  const [reference, setReference] = useState('')
  const [proof, setProof] = useState('')
  const [managerEmail, setManagerEmail] = useState('')
  const [managerPassword, setManagerPassword] = useState('')
  const [checked, setChecked] = useState(false)
  const [error, setError] = useState('')
  const [paidId, setPaidId] = useState('')
  const attempt = useRef<string | null>(null)
  const busy = isPending(`deposit:${deposit.reservationId}`)
  const change = tendered === null ? null : tendered - deposit.amount

  const touch = () => {
    attempt.current = null
    setError('')
  }

  const submit = async () => {
    if (busy) return
    attempt.current ??= newAttemptKey(deposit.reservationId)
    const key = `deposit:${deposit.reservationId}`
    if (mode === 'cash') {
      if (tendered === null) return setError('Nhập số tiền khách đưa.')
      if (tendered < deposit.amount)
        return setError(`Khách đưa còn thiếu ${formatVnd(deposit.amount - tendered)}.`)
      const outcome = await run(
        {
          type: 'deposit-cash',
          reservationId: deposit.reservationId,
          tendered,
          idempotencyKey: attempt.current,
        },
        [key],
      )
      if (!outcome) return
      if (!outcome.ok) return setError(outcome.error)
      attempt.current = null
      if (outcome.result.ref) setPaidId(outcome.result.ref)
      return
    }
    if (!reference.trim()) return setError('Nhập mã giao dịch trên sao kê ngân hàng.')
    if (!managerEmail.trim() || !managerPassword)
      return setError('Quản lý nhập email và mật khẩu để xác nhận.')
    if (!checked) return setError('Quản lý xác nhận đã thấy tiền vào tài khoản nhà hàng.')
    const outcome = await run(
      {
        type: 'deposit-manual-transfer',
        reservationId: deposit.reservationId,
        idempotencyKey: attempt.current,
        transactionReference: reference.trim(),
        ...(proof.trim() ? { proofImageUrl: proof.trim() } : {}),
        managerEmail: managerEmail.trim(),
        managerPassword,
      },
      [key],
    )
    if (!outcome) return
    setManagerPassword('')
    if (!outcome.ok) return setError(outcome.error)
    attempt.current = null
    if (outcome.result.ref) setPaidId(outcome.result.ref)
  }

  if (paidId) {
    return (
      <div className="c-result" role="status">
        <p className="c-result-title">Đã thu cọc {formatVnd(deposit.amount)}</p>
        {mode === 'cash' && change !== null && change > 0 && (
          <div className="c-result-change">
            <span>Trả lại khách</span>
            <b>{formatVnd(change)}</b>
          </div>
        )}
        <div className="c-result-actions">
          <Link to={cashierPaths.depositReceipt(paidId)} className="k-btn k-btn--primary">
            In biên nhận cọc
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form
      className="c-tender"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        void submit()
      }}
    >
      <div className="c-methods" role="radiogroup" aria-label="Cách thu cọc">
        {(
          [
            ['cash', 'Tiền mặt'],
            ['transfer', 'Chuyển khoản thủ công'],
          ] as const
        ).map(([id, label]) => (
          <label key={id} className="c-method">
            <input
              type="radio"
              name={`deposit-${deposit.reservationId}`}
              checked={mode === id}
              onChange={() => {
                touch()
                setMode(id)
              }}
            />
            <span className="c-method-box">
              <span className="c-method-text">
                <b>{label}</b>
                <small>
                  {id === 'cash' ? 'Vào két của ca này' : 'Khi payOS lỗi, quản lý xác nhận'}
                </small>
              </span>
            </span>
          </label>
        ))}
      </div>
      {mode === 'cash' ? (
        <>
          <div className="c-tender-row">
            <MoneyInput
              label="Khách đưa"
              value={tendered}
              onChange={(v) => {
                touch()
                setTendered(v)
              }}
              large
              autoFocus
              invalid={change !== null && change < 0}
              placeholder="0"
            />
            <div
              className={change !== null && change < 0 ? 'c-change c-change--short' : 'c-change'}
              aria-live="polite"
            >
              <span>{change !== null && change < 0 ? 'Còn thiếu' : 'Tiền thừa'}</span>
              <b>{change === null ? '—' : formatVnd(Math.abs(change))}</b>
            </div>
          </div>
          <div className="c-quick" role="group" aria-label="Chọn nhanh số tiền khách đưa">
            {cashSuggestions(deposit.amount).map((value) => (
              <button
                key={value}
                type="button"
                className="c-quick-btn"
                aria-pressed={tendered === value}
                onClick={() => {
                  touch()
                  setTendered(value)
                }}
              >
                {value === deposit.amount ? 'Đủ tiền' : formatAmount(value)}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="k-field">
            <label className="k-label" htmlFor={`dep-ref-${deposit.reservationId}`}>
              Mã giao dịch ngân hàng
            </label>
            <input
              id={`dep-ref-${deposit.reservationId}`}
              className="k-input k-mono"
              autoComplete="off"
              spellCheck={false}
              maxLength={150}
              value={reference}
              onChange={(e) => {
                touch()
                setReference(e.target.value)
              }}
            />
          </div>
          <div className="k-field">
            <label className="k-label" htmlFor={`dep-proof-${deposit.reservationId}`}>
              Ảnh chứng từ (đường dẫn, không bắt buộc)
            </label>
            <input
              id={`dep-proof-${deposit.reservationId}`}
              className="k-input"
              autoComplete="off"
              maxLength={500}
              value={proof}
              onChange={(e) => {
                touch()
                setProof(e.target.value)
              }}
              placeholder="https://"
            />
          </div>
          <div className="k-field">
            <label className="k-label" htmlFor={`dep-mail-${deposit.reservationId}`}>
              Email quản lý
            </label>
            <input
              id={`dep-mail-${deposit.reservationId}`}
              className="k-input"
              type="email"
              autoComplete="off"
              value={managerEmail}
              onChange={(e) => {
                touch()
                setManagerEmail(e.target.value)
              }}
            />
          </div>
          <div className="k-field">
            <label className="k-label" htmlFor={`dep-pass-${deposit.reservationId}`}>
              Mật khẩu quản lý
            </label>
            <input
              id={`dep-pass-${deposit.reservationId}`}
              className="k-input"
              type="password"
              autoComplete="new-password"
              value={managerPassword}
              onChange={(e) => {
                touch()
                setManagerPassword(e.target.value)
              }}
            />
          </div>
          <label className="k-check">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />
            Tôi đã thấy {formatVnd(deposit.amount)} vào tài khoản nhà hàng.
          </label>
        </>
      )}
      {error && (
        <Alert tone="danger" icon="alert">
          {error}
        </Alert>
      )}
      <button
        type="submit"
        className="k-btn k-btn--primary c-confirm"
        disabled={busy}
        aria-busy={busy}
      >
        {busy ? 'Đang ghi nhận…' : `Xác nhận thu cọc ${formatVnd(deposit.amount)}`}
      </button>
    </form>
  )
}
