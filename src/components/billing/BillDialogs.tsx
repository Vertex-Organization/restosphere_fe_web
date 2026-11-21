import { useState } from 'react'
import { METHOD_LABEL } from '../../api/billing/labels'
import {
  computeTotals,
  formatVnd,
  limitAmount,
  validateDiscount,
  withinPercent,
} from '../../api/billing/money'
import { hasPermission, type BillView } from '../../api/billing/selectors'
import type { BillingConfig, CashierStaff, DiscountMode, Payment } from '../../api/billing/types'
import { useCashierData } from '../../hooks/billing/cashierDataContext'
import { Icon } from './Icon'
import { Dialog, MoneyInput } from './ui'

const QUICK_PERCENT = [5, 10, 15, 20]
const QUICK_REASONS = ['Khách thân thiết', 'Món ra chậm', 'Sự cố món ăn', 'Chương trình khuyến mãi']

/**
 * Discount within the cashier's own limit is applied at once. Anything above
 * it becomes a request for the manager; the bill is not discounted (and cannot
 * be paid) until the manager decides.
 */
export function DiscountDialog({
  view,
  user,
  config,
  onClose,
}: {
  view: BillView
  user: CashierStaff
  config: BillingConfig
  onClose: () => void
}) {
  const { run, isPending } = useCashierData()
  const [mode, setMode] = useState<DiscountMode>('PERCENT')
  const [percent, setPercent] = useState('')
  const [amount, setAmount] = useState<number | null>(null)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const busy = isPending(`bill:${view.bill.id}`)

  const subtotal = view.bill.totals.subtotal
  const value = mode === 'PERCENT' ? (percent ? Number(percent) : NaN) : (amount ?? NaN)
  const invalid = Number.isNaN(value) ? '' : validateDiscount(mode, value, subtotal)
  const preview =
    !Number.isNaN(value) && !invalid ? computeTotals(view.items, { mode, value }, config) : null
  const canApply = hasPermission(user, 'discounts.apply')
  const canRequest = hasPermission(user, 'discounts.request')
  const limit = canApply ? user.discountLimitPercent : 0
  const needsApproval = !!preview && !(canApply && withinPercent(preview.discount, subtotal, limit))

  const submit = async () => {
    if (busy) return
    if (Number.isNaN(value)) return setError('Nhập mức giảm.')
    if (invalid) return setError(invalid)
    if (reason.trim().length < 5) return setError('Nhập lý do giảm giá (ít nhất 5 ký tự).')
    if (needsApproval && !canRequest)
      return setError('Tài khoản không có quyền gửi yêu cầu giảm giá.')
    setError('')
    const discount = { mode, value, reason }
    const outcome = await run(
      needsApproval
        ? {
            type: 'request-discount',
            billId: view.bill.id,
            billVersion: view.bill.version,
            discount,
          }
        : {
            type: 'apply-discount',
            billId: view.bill.id,
            billVersion: view.bill.version,
            discount,
          },
      [`bill:${view.bill.id}`],
    )
    if (outcome?.ok) onClose()
    else if (outcome) setError(outcome.error)
  }

  return (
    <Dialog
      title={`Giảm giá · ${view.bill.code}`}
      subtitle={`Bàn ${view.table.code} · Tạm tính ${formatVnd(subtotal)}`}
      onClose={onClose}
      onSubmit={submit}
      footer={
        <>
          <button type="button" className="k-btn" onClick={onClose}>
            Hủy
          </button>
          <button type="submit" className="k-btn k-btn--primary" disabled={busy} aria-busy={busy}>
            {busy ? 'Đang gửi…' : needsApproval ? 'Gửi yêu cầu duyệt' : 'Áp dụng giảm giá'}
          </button>
        </>
      }
    >
      <div className="k-seg c-seg-2" role="radiogroup" aria-label="Cách giảm">
        {(['PERCENT', 'AMOUNT'] as const).map((m) => (
          <label key={m} className="k-seg-option">
            <input
              type="radio"
              name="discount-mode"
              checked={mode === m}
              onChange={() => {
                setMode(m)
                setError('')
              }}
            />
            <span>{m === 'PERCENT' ? 'Theo %' : 'Theo số tiền'}</span>
          </label>
        ))}
      </div>

      {mode === 'PERCENT' ? (
        <div className="k-field">
          <label className="k-label" htmlFor="discount-percent">
            Mức giảm
          </label>
          <div className="c-inline">
            <span className="c-money c-percent">
              <input
                id="discount-percent"
                className="k-input"
                inputMode="numeric"
                autoComplete="off"
                autoFocus
                value={percent}
                aria-invalid={!!invalid}
                onChange={(e) => {
                  const next = e.target.value.trim()
                  if (next && !/^\d{0,3}$/.test(next))
                    return setError('Phần trăm chỉ gồm chữ số, từ 1 đến 100.')
                  setError('')
                  setPercent(next)
                }}
              />
              <span className="c-money-unit" aria-hidden="true">
                %
              </span>
            </span>
            <div className="k-chips">
              {QUICK_PERCENT.map((p) => (
                <button
                  key={p}
                  type="button"
                  className="k-chip"
                  aria-pressed={percent === String(p)}
                  onClick={() => {
                    setPercent(String(p))
                    setError('')
                  }}
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <MoneyInput
          label="Số tiền giảm"
          value={amount}
          onChange={(v) => {
            setAmount(v)
            setError('')
          }}
          invalid={!!invalid}
          autoFocus
        />
      )}

      <div className="k-field">
        <label className="k-label" htmlFor="discount-reason">
          Lý do
        </label>
        <input
          id="discount-reason"
          className="k-input"
          maxLength={200}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Bắt buộc, ghi rõ để Quản lý đối soát"
        />
        <div className="k-chips">
          {QUICK_REASONS.map((r) => (
            <button key={r} type="button" className="k-chip c-chip-sm" onClick={() => setReason(r)}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <p className="k-hint">
        {canApply ? (
          <>
            Hạn mức tự áp dụng của bạn: <b>{limit}%</b> tạm tính (
            {formatVnd(limitAmount(subtotal, limit))}). Vượt mức cần Quản lý duyệt.
          </>
        ) : (
          <>Tài khoản của bạn không tự áp dụng giảm giá. Mọi mức giảm đều gửi Quản lý duyệt.</>
        )}
      </p>

      {preview && (
        <dl className="c-totals c-totals--preview">
          <div>
            <dt>Tạm tính</dt>
            <dd>{formatVnd(preview.subtotal)}</dd>
          </div>
          <div className="c-totals-discount">
            <dt>Giảm</dt>
            <dd>−{formatVnd(preview.discount)}</dd>
          </div>
          <div className="c-totals-sum">
            <dt>Tổng sau giảm</dt>
            <dd>{formatVnd(preview.total)}</dd>
          </div>
        </dl>
      )}
      {needsApproval && (
        <p className="k-callout k-callout--warn">
          <Icon name="alert" size={14} />
          <span>
            Vượt hạn mức: yêu cầu sẽ gửi Quản lý duyệt. Hóa đơn giữ nguyên và tạm khóa thanh toán
            đến khi có kết quả.
          </span>
        </p>
      )}
      {(error || invalid) && (
        <p className="k-form-error" role="alert">
          <Icon name="alert" size={14} />
          {error || invalid}
        </p>
      )}
    </Dialog>
  )
}

/** Ask the manager to remove a line from the bill (wrong item, not received…). */
export function AdjustmentDialog({
  view,
  itemId,
  onClose,
}: {
  view: BillView
  itemId: string
  onClose: () => void
}) {
  const { run, isPending } = useCashierData()
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const item = view.items.find((i) => i.id === itemId)
  const busy = isPending(`bill:${view.bill.id}`)

  const submit = async () => {
    if (busy || !item) return
    if (reason.trim().length < 5) return setError('Nhập lý do (ít nhất 5 ký tự).')
    const outcome = await run(
      { type: 'request-adjustment', billId: view.bill.id, itemId: item.id, reason },
      [`bill:${view.bill.id}`],
    )
    if (outcome?.ok) onClose()
    else if (outcome) setError(outcome.error)
  }

  return (
    <Dialog
      title="Yêu cầu điều chỉnh hóa đơn"
      subtitle={`${view.bill.code} · Bàn ${view.table.code}`}
      onClose={onClose}
      onSubmit={submit}
      footer={
        <>
          <button type="button" className="k-btn" onClick={onClose}>
            Hủy
          </button>
          <button
            type="submit"
            className="k-btn k-btn--primary"
            disabled={busy || !item}
            aria-busy={busy}
          >
            Gửi yêu cầu
          </button>
        </>
      }
    >
      {item && (
        <p className="c-dialog-line">
          Bỏ khỏi hóa đơn:{' '}
          <b>
            {item.quantity} × {item.name}
          </b>{' '}
          · {formatVnd(item.quantity * item.unitPrice)}
        </p>
      )}
      <div className="k-field">
        <label className="k-label" htmlFor="adjust-reason">
          Lý do
        </label>
        <textarea
          id="adjust-reason"
          className="k-textarea"
          maxLength={200}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ví dụ: khách không gọi món này, phục vụ đã xác nhận"
          autoFocus
        />
      </div>
      <p className="k-hint">
        Thu ngân không tự sửa món trên hóa đơn. Quản lý duyệt thì món được hủy và tổng tiền tính
        lại.
      </p>
      {error && (
        <p className="k-form-error" role="alert">
          <Icon name="alert" size={14} />
          {error}
        </p>
      )}
    </Dialog>
  )
}

/** Ask the manager to reverse a completed payment. Completed payments are never edited in place. */
export function VoidDialog({ payment, onClose }: { payment: Payment; onClose: () => void }) {
  const { run, isPending } = useCashierData()
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const busy = isPending(`payment:${payment.id}`)

  const submit = async () => {
    if (busy) return
    if (reason.trim().length < 5) return setError('Nhập lý do (ít nhất 5 ký tự).')
    const outcome = await run({ type: 'request-void', paymentId: payment.id, reason }, [
      `payment:${payment.id}`,
    ])
    if (outcome?.ok) onClose()
    else if (outcome) setError(outcome.error)
  }

  return (
    <Dialog
      title={`Yêu cầu hủy thanh toán ${payment.code}`}
      subtitle={`${METHOD_LABEL[payment.method]} · ${formatVnd(payment.amount)}`}
      onClose={onClose}
      onSubmit={submit}
      footer={
        <>
          <button type="button" className="k-btn" onClick={onClose}>
            Đóng
          </button>
          <button type="submit" className="k-btn k-btn--danger" disabled={busy} aria-busy={busy}>
            Gửi yêu cầu hủy
          </button>
        </>
      }
    >
      <div className="k-field">
        <label className="k-label" htmlFor="void-reason">
          Lý do
        </label>
        <textarea
          id="void-reason"
          className="k-textarea"
          maxLength={200}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ví dụ: ghi nhầm phương thức, khách đã chuyển khoản"
          autoFocus
        />
      </div>
      <p className="k-hint">
        Giao dịch giữ nguyên đến khi Quản lý duyệt. Khi được duyệt, hóa đơn trở lại trạng thái chờ
        thanh toán.
      </p>
      {error && (
        <p className="k-form-error" role="alert">
          <Icon name="alert" size={14} />
          {error}
        </p>
      )}
    </Dialog>
  )
}
