import { useRef, useState } from 'react'
import { METHOD_LABEL } from '../../../api/billing/labels'
import { cashSuggestions, formatAmount, formatVnd } from '../../../api/billing/money'
import {
  billView,
  hasPermission,
  paymentBlock,
  type BillView,
} from '../../../api/billing/selectors'
import type { CashierData, CashierStaff, Payment, PaymentMethod } from '../../../api/billing/types'
import { BillLines, BillTotals } from '../../../components/billing/BillParts'
import { Icon, type IconName } from '../../../components/billing/Icon'
import { Alert, CopyButton, MoneyInput, PaymentStatusBadge } from '../../../components/billing/ui'
import { formatTime } from '../../../components/kitchen/format'
import { KitchenLink as Link } from '../../../components/kitchen/KitchenLink'
import { useCashierSnapshot } from '../../../hooks/billing/cashierDataContext'
import { cashierPaths } from '../../../routes/cashierRouter'

const METHODS: { id: PaymentMethod; icon: IconName; hint: string }[] = [
  { id: 'CASH', icon: 'cash', hint: 'Nhận tiền tại quầy' },
  { id: 'TRANSFER', icon: 'bank', hint: 'Chờ tiền về tài khoản' },
  { id: 'CARD', icon: 'card', hint: 'Chưa hỗ trợ' },
]

/** One key per payment attempt: a retried submit of the same attempt can never be recorded twice. */
function newAttemptKey(billId: string) {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
  return `pay-${billId}-${random}`
}

export default function CashierPaymentPage({ billId }: { billId: string }) {
  const { data, user } = useCashierSnapshot()
  const view = billView(data, billId)
  const [method, setMethod] = useState<PaymentMethod>(() => (view?.pending ? 'TRANSFER' : 'CASH'))
  const [doneId, setDoneId] = useState<string | null>(null)

  if (!view) {
    return (
      <div className="c-empty">
        <p>Không tìm thấy hóa đơn.</p>
        <Link to={cashierPaths.pos} className="k-btn k-btn--primary">
          Về quầy thu ngân
        </Link>
      </div>
    )
  }
  if (!hasPermission(user, 'payments.view'))
    return (
      <div className="c-empty">
        <p>Bạn không có quyền xem thanh toán.</p>
      </div>
    )

  const { bill, table } = view
  const done = doneId ? data.payments.find((p) => p.id === doneId) : undefined
  const effective = view.pending ? 'TRANSFER' : method

  let main
  if (done) {
    main = <PaymentResult payment={done} view={view} onContinue={() => setDoneId(null)} />
  } else if (bill.status === 'PAID') {
    main = <PaidPanel view={view} />
  } else {
    main = (
      <>
        <div className="c-pay-due">
          <span className="c-pay-due-label">{view.paid ? 'Còn phải thu' : 'Cần thu'}</span>
          <b className="c-pay-due-amount">{formatVnd(view.remaining)}</b>
          {view.paid > 0 && (
            <span className="c-pay-due-sub">
              Tổng {formatVnd(bill.totals.total)} · đã thu {formatVnd(view.paid)}
            </span>
          )}
        </div>
        <div className="c-methods" role="radiogroup" aria-label="Phương thức thanh toán">
          {METHODS.map((m) => {
            const enabled = data.config.methods[m.id] && (!view.pending || m.id === 'TRANSFER')
            return (
              <label key={m.id} className="c-method">
                <input
                  type="radio"
                  name="method"
                  checked={effective === m.id}
                  disabled={!enabled}
                  onChange={() => setMethod(m.id)}
                />
                <span className="c-method-box">
                  <Icon name={m.icon} size={20} />
                  <span className="c-method-text">
                    <b>{METHOD_LABEL[m.id]}</b>
                    <small>{m.hint}</small>
                  </span>
                </span>
              </label>
            )
          })}
        </div>
        {view.failed && !view.pending && (
          <Alert tone="danger" icon="xCircle">
            <b>Lần chuyển khoản trước ({view.failed.code}) lỗi.</b> {view.failed.failureReason}
          </Alert>
        )}
        {effective === 'CASH' && (
          <CashForm
            key={`${bill.id}:${bill.version}`}
            data={data}
            view={view}
            user={user}
            onDone={setDoneId}
          />
        )}
        {effective === 'TRANSFER' && <TransferPanel data={data} view={view} user={user} />}
      </>
    )
  }

  return (
    <div className="c-checkout-page">
      <div className="c-page-bar">
        <Link to={cashierPaths.posBill(bill.id)} className="k-back">
          <Icon name="chevronLeft" />
          Quầy
        </Link>
        <h2 className="c-page-title">Thanh toán · Bàn {table.code}</h2>
        <span className="c-bill-code">{bill.code}</span>
      </div>

      <div className="c-checkout">
        <section className="c-card c-pay" aria-label="Thu tiền">
          {main}
        </section>

        <aside className="c-card c-pay-summary" aria-label="Hóa đơn">
          <div className="c-summary-head">
            <b>Bàn {table.code}</b>
            <span>
              {view.session.guests} khách · {view.dishCount} món
            </span>
            <Link to={cashierPaths.bill(bill.id)} className="c-alert-link">
              Chi tiết
            </Link>
          </div>
          <div className="c-summary-lines">
            <BillLines view={view} menu={data.menu} compact />
          </div>
          <BillTotals bill={bill} config={data.config} />
          <div className="c-summary-total">
            <span>Tổng hóa đơn</span>
            <b>{formatVnd(bill.totals.total)}</b>
          </div>
          {view.payments.length > 0 && (
            <details className="c-pay-history">
              <summary>{view.payments.length} giao dịch của hóa đơn</summary>
              <ul>
                {view.payments.map((p) => (
                  <li key={p.id}>
                    <Link to={cashierPaths.transaction(p.id)} className="k-link k-mono">
                      {p.code}
                    </Link>
                    <span>
                      {METHOD_LABEL[p.method]} · {formatTime(p.createdAt)}
                    </span>
                    <b>{formatAmount(p.amount)}</b>
                    <PaymentStatusBadge status={p.status} />
                  </li>
                ))}
              </ul>
            </details>
          )}
        </aside>
      </div>
    </div>
  )
}

function CashForm({
  data,
  view,
  user,
  onDone,
}: {
  data: CashierData
  view: BillView
  user: CashierStaff
  onDone: (id: string) => void
}) {
  const { run, isPending } = useCashierSnapshot()
  const [split, setSplit] = useState(false)
  const [amount, setAmount] = useState<number | null>(null)
  const [tendered, setTendered] = useState<number | null>(null)
  const [error, setError] = useState('')
  const attempt = useRef<string | null>(null)
  const tenderInput = useRef<HTMLInputElement>(null)
  const busy = isPending(`pay:${view.bill.id}`)
  const block = paymentBlock(data, view, user)

  const remaining = view.remaining
  const collect = split ? amount : remaining
  const change = collect !== null && tendered !== null ? tendered - collect : null
  const amountError =
    split && amount !== null && (amount <= 0 || amount > remaining)
      ? `Từ 1đ đến ${formatVnd(remaining)}.`
      : ''
  // Any edit starts a new attempt; an unchanged retry keeps the same key.
  const edit =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      attempt.current = null
      setError('')
      setter(value)
    }

  const submit = async () => {
    if (busy || block) return
    if (collect === null || collect <= 0) return setError('Nhập số tiền thu.')
    if (collect > remaining)
      return setError(`Số tiền thu không được lớn hơn ${formatVnd(remaining)}.`)
    if (tendered === null) {
      tenderInput.current?.focus()
      return setError('Nhập số tiền khách đưa.')
    }
    if (tendered < collect) return setError(`Khách đưa còn thiếu ${formatVnd(collect - tendered)}.`)
    attempt.current ??= newAttemptKey(view.bill.id)
    const outcome = await run(
      {
        type: 'pay-cash',
        billId: view.bill.id,
        billVersion: view.bill.version,
        amount: collect,
        tendered,
        idempotencyKey: attempt.current,
      },
      [`pay:${view.bill.id}`],
    )
    if (!outcome) return
    if (!outcome.ok) return setError(outcome.error)
    attempt.current = null
    if (outcome.result.ref) onDone(outcome.result.ref)
  }

  if (block)
    return (
      <Alert tone="warning" icon="info">
        {block.text}
      </Alert>
    )
  const short = change !== null && change < 0

  return (
    <form
      className="c-tender"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        void submit()
      }}
    >
      {split && (
        <MoneyInput
          label="Thu bằng tiền mặt"
          value={amount}
          onChange={edit(setAmount)}
          invalid={!!amountError}
          aside={<span className="k-hint">{amountError || `Tối đa ${formatVnd(remaining)}`}</span>}
        />
      )}
      <div className="c-tender-row">
        <MoneyInput
          label="Khách đưa"
          value={tendered}
          onChange={edit(setTendered)}
          large
          autoFocus
          inputRef={tenderInput}
          invalid={short}
          placeholder="0"
        />
        <div className={short ? 'c-change c-change--short' : 'c-change'} aria-live="polite">
          <span>{short ? 'Còn thiếu' : 'Tiền thừa'}</span>
          <b>{change === null ? '—' : formatVnd(Math.abs(change))}</b>
        </div>
      </div>
      {collect !== null && collect > 0 && (
        <div className="c-quick" role="group" aria-label="Chọn nhanh số tiền khách đưa">
          {cashSuggestions(collect).map((value) => (
            <button
              key={value}
              type="button"
              className="c-quick-btn"
              aria-pressed={tendered === value}
              onClick={() => edit(setTendered)(value)}
            >
              {value === collect ? 'Đủ tiền' : formatAmount(value)}
            </button>
          ))}
        </div>
      )}
      {error && (
        <Alert tone="danger" icon="alert">
          {error}
        </Alert>
      )}
      <button
        type="submit"
        className="k-btn k-btn--primary c-confirm"
        disabled={busy || collect === null || !!amountError || short}
        aria-busy={busy}
      >
        {busy ? (
          'Đang ghi nhận…'
        ) : (
          <>
            Xác nhận thu {collect ? formatVnd(collect) : ''}
            <Icon name="check" />
          </>
        )}
      </button>
      <button type="button" className="c-text-btn" onClick={() => edit(setSplit)(!split)}>
        {split ? 'Thu toàn bộ bằng tiền mặt' : 'Chia nhiều phương thức (thu một phần)'}
      </button>
    </form>
  )
}

function TransferPanel({
  data,
  view,
  user,
}: {
  data: CashierData
  view: BillView
  user: CashierStaff
}) {
  const { run, isPending } = useCashierSnapshot()
  const [split, setSplit] = useState(false)
  const [amount, setAmount] = useState<number | null>(null)
  const [error, setError] = useState('')
  const attempt = useRef<string | null>(null)
  const busy = isPending(`pay:${view.bill.id}`)
  const bank = data.config.bank

  if (view.pending) return <PendingTransfer data={data} payment={view.pending} user={user} />
  const block = paymentBlock(data, view, user)
  if (block)
    return (
      <Alert tone="warning" icon="info">
        {block.text}
      </Alert>
    )
  if (!bank)
    return (
      <Alert tone="warning" icon="info">
        Chưa cấu hình tài khoản nhận chuyển khoản.
      </Alert>
    )

  const collect = split ? amount : view.remaining
  const create = async () => {
    if (busy) return
    if (!collect || collect <= 0 || collect > view.remaining)
      return setError(`Số tiền từ 1đ đến ${formatVnd(view.remaining)}.`)
    attempt.current ??= newAttemptKey(view.bill.id)
    const outcome = await run(
      {
        type: 'create-transfer',
        billId: view.bill.id,
        billVersion: view.bill.version,
        amount: collect,
        idempotencyKey: attempt.current,
      },
      [`pay:${view.bill.id}`],
    )
    if (outcome && !outcome.ok) setError(outcome.error)
    if (outcome?.ok) attempt.current = null
  }

  return (
    <form
      className="c-tender"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        void create()
      }}
    >
      {split && (
        <MoneyInput
          label="Số tiền chuyển khoản"
          value={amount}
          onChange={(v) => {
            attempt.current = null
            setError('')
            setAmount(v)
          }}
          aside={<span className="k-hint">Tối đa {formatVnd(view.remaining)}</span>}
          autoFocus
        />
      )}
      <div className="c-bankcard">
        <Icon name="bank" size={18} />
        <div>
          <b>{bank.bankName}</b>
          <span className="k-mono">
            {bank.accountNumber} · {bank.accountName}
          </span>
        </div>
      </div>
      <p className="k-hint">
        Nội dung chuyển khoản được tạo tự động. Hóa đơn chỉ được tính là đã thanh toán khi tiền được
        xác minh.
      </p>
      {error && (
        <Alert tone="danger" icon="alert">
          {error}
        </Alert>
      )}
      <button
        type="submit"
        className="k-btn k-btn--primary c-confirm"
        disabled={busy || !collect}
        aria-busy={busy}
      >
        {busy ? 'Đang tạo…' : `Tạo yêu cầu chuyển khoản ${collect ? formatVnd(collect) : ''}`}
      </button>
      <button
        type="button"
        className="c-text-btn"
        onClick={() => {
          attempt.current = null
          setSplit(!split)
        }}
      >
        {split ? 'Chuyển khoản toàn bộ' : 'Chia nhiều phương thức (thu một phần)'}
      </button>
    </form>
  )
}

function PendingTransfer({
  data,
  payment,
  user,
}: {
  data: CashierData
  payment: Payment
  user: CashierStaff
}) {
  const { run, isPending } = useCashierSnapshot()
  const [manual, setManual] = useState(false)
  const [reference, setReference] = useState('')
  const [checked, setChecked] = useState(false)
  const [error, setError] = useState('')
  const busy = isPending(`pay:${payment.billId}`)
  const bank = data.config.bank
  const canConfirm = hasPermission(user, 'payments.confirm_transfer')

  const confirm = async () => {
    if (busy) return
    if (!reference.trim()) return setError('Nhập mã giao dịch trên sao kê ngân hàng.')
    if (!checked) return setError('Xác nhận bạn đã kiểm tra tiền vào tài khoản.')
    const outcome = await run(
      { type: 'confirm-transfer', paymentId: payment.id, bankReference: reference },
      [`pay:${payment.billId}`],
    )
    if (outcome && !outcome.ok) setError(outcome.error)
  }

  return (
    <div className="c-tender">
      <ol className="c-steps" aria-label="Trạng thái chuyển khoản">
        <li className="c-step c-step--done">
          <Icon name="check" size={13} />
          Đã tạo yêu cầu {formatTime(payment.createdAt)}
        </li>
        <li className="c-step c-step--current" aria-current="step">
          <span className="k-spinner c-step-spin" aria-hidden="true" />
          Đang chờ tiền về
        </li>
        <li className="c-step">Đã xác minh</li>
      </ol>
      <dl className="c-transfer">
        <div className="c-transfer-amount">
          <dt>Số tiền</dt>
          <dd>{formatVnd(payment.amount)}</dd>
        </div>
        <div>
          <dt>Nội dung</dt>
          <dd className="k-mono c-strong">
            {payment.transferContent}{' '}
            <CopyButton value={payment.transferContent ?? ''} label="nội dung chuyển khoản" />
          </dd>
        </div>
        {bank && (
          <div>
            <dt>Tài khoản</dt>
            <dd className="k-mono">
              {bank.accountNumber}{' '}
              <CopyButton value={bank.accountNumber.replace(/\s/g, '')} label="số tài khoản" />
            </dd>
          </div>
        )}
        {bank && (
          <div>
            <dt>Ngân hàng</dt>
            <dd>
              {bank.bankName} · {bank.accountName}
            </dd>
          </div>
        )}
      </dl>
      {data.config.qrImageUrl ? (
        <img
          className="c-qr"
          src={data.config.qrImageUrl}
          alt="Mã QR tài khoản nhận tiền của nhà hàng"
          width={160}
          height={160}
        />
      ) : (
        <p className="k-hint">
          Chưa cấu hình ảnh QR. Khách chuyển theo số tài khoản và đúng nội dung ở trên. Hệ thống
          chưa kết nối ngân hàng để tự xác minh.
        </p>
      )}

      {manual && canConfirm ? (
        <form
          className="c-manual"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            void confirm()
          }}
        >
          <div className="k-field">
            <label className="k-label" htmlFor="bank-ref">
              Mã giao dịch ngân hàng
            </label>
            <input
              id="bank-ref"
              className="k-input k-mono"
              autoComplete="off"
              spellCheck={false}
              maxLength={40}
              autoFocus
              value={reference}
              onChange={(e) => {
                setReference(e.target.value)
                setError('')
              }}
              placeholder="Mã trên sao kê hoặc app ngân hàng"
            />
          </div>
          <label className="k-check">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />
            Tôi đã thấy {formatVnd(payment.amount)} vào tài khoản với đúng nội dung.
          </label>
          {error && (
            <Alert tone="danger" icon="alert">
              {error}
            </Alert>
          )}
          <div className="c-row-actions">
            <button type="button" className="k-btn" onClick={() => setManual(false)}>
              Quay lại
            </button>
            <button type="submit" className="k-btn k-btn--primary" disabled={busy} aria-busy={busy}>
              Xác nhận đã nhận tiền
            </button>
          </div>
        </form>
      ) : (
        <div className="c-row-actions">
          <button
            type="button"
            className="k-btn k-btn--danger"
            disabled={busy}
            onClick={() => {
              void run({ type: 'cancel-transfer', paymentId: payment.id }, [
                `pay:${payment.billId}`,
              ])
            }}
          >
            Hủy yêu cầu
          </button>
          {canConfirm ? (
            <button type="button" className="k-btn k-btn--outline" onClick={() => setManual(true)}>
              Xác nhận thủ công…
            </button>
          ) : (
            <span className="k-hint">Chờ ngân hàng xác minh hoặc báo thu ngân chính.</span>
          )}
        </div>
      )}
    </div>
  )
}

function PaymentResult({
  payment,
  view,
  onContinue,
}: {
  payment: Payment
  view: BillView
  onContinue: () => void
}) {
  const settled = view.bill.status === 'PAID'
  return (
    <div className="c-result" role="status">
      <span className="c-result-icon">
        <Icon name="check" size={26} />
      </span>
      <p className="c-result-title">
        Đã thu {formatVnd(payment.amount)} {METHOD_LABEL[payment.method].toLowerCase()}
      </p>
      {payment.method === 'CASH' && (
        <div className="c-result-change">
          <span>Trả lại khách</span>
          <b>{formatVnd(payment.change ?? 0)}</b>
          <small>Khách đưa {formatVnd(payment.tendered ?? 0)}</small>
        </div>
      )}
      <p className="c-result-line">
        {settled ? (
          <>
            Hóa đơn {view.bill.code} đã thanh toán đủ. Bàn {view.table.code} chỉ trống sau khi phục
            vụ xác nhận khách rời và dọn bàn.
          </>
        ) : (
          <>
            Còn phải thu <b>{formatVnd(view.remaining)}</b>.
          </>
        )}
      </p>
      <div className="c-result-actions">
        <Link to={cashierPaths.pos} className="k-btn k-btn--lg">
          Về quầy
        </Link>
        {settled ? (
          <Link
            to={cashierPaths.receipt(view.bill.id)}
            className="k-btn k-btn--primary k-btn--lg"
            autoFocus
          >
            <Icon name="printer" />
            In hóa đơn
          </Link>
        ) : (
          <button
            type="button"
            className="k-btn k-btn--primary k-btn--lg"
            onClick={onContinue}
            autoFocus
          >
            Thu tiếp phần còn lại
          </button>
        )}
      </div>
    </div>
  )
}

function PaidPanel({ view }: { view: BillView }) {
  const succeeded = view.payments.filter((p) => p.status === 'SUCCEEDED')
  return (
    <div className="c-result" role="status">
      <span className="c-result-icon">
        <Icon name="check" size={26} />
      </span>
      <p className="c-result-title">Hóa đơn đã thanh toán đủ {formatVnd(view.bill.totals.total)}</p>
      <ul className="c-result-list">
        {succeeded.map((p) => (
          <li key={p.id}>
            <Icon name={p.method === 'CASH' ? 'cash' : 'bank'} size={14} />
            {METHOD_LABEL[p.method]} {formatVnd(p.amount)}
            {p.verifiedBy === 'BANK' ? ' · ngân hàng xác minh' : ''}
          </li>
        ))}
      </ul>
      <p className="k-hint">
        Muốn hủy một giao dịch đã hoàn tất, gửi yêu cầu từ trang chi tiết giao dịch.
      </p>
      <div className="c-result-actions">
        <Link to={cashierPaths.pos} className="k-btn k-btn--lg">
          Về quầy
        </Link>
        <Link to={cashierPaths.receipt(view.bill.id)} className="k-btn k-btn--primary k-btn--lg">
          <Icon name="printer" />
          In hóa đơn
        </Link>
      </div>
    </div>
  )
}
