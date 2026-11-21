import { useState } from 'react'
import { METHOD_LABEL, REQUEST_TYPE_LABEL } from '../../../api/billing/labels'
import { formatVnd } from '../../../api/billing/money'
import { hasPermission, staffName } from '../../../api/billing/selectors'
import { VoidDialog } from '../../../components/billing/BillDialogs'
import { Icon } from '../../../components/billing/Icon'
import { PaymentStatusBadge, RequestStatusBadge } from '../../../components/billing/ui'
import { formatDate, formatTime } from '../../../components/kitchen/format'
import { KitchenLink as Link } from '../../../components/kitchen/KitchenLink'
import { useCashierSnapshot } from '../../../hooks/billing/cashierDataContext'
import { cashierPaths } from '../../../routes/cashierRouter'

const when = (iso?: string) => (iso ? `${formatTime(iso)} · ${formatDate(iso)}` : '—')

export default function CashierTransactionPage({ id }: { id: string }) {
  const { data, user } = useCashierSnapshot()
  const [voiding, setVoiding] = useState(false)
  const payment = data.payments.find((p) => p.id === id)

  if (!hasPermission(user, 'transactions.view')) {
    return (
      <div className="k-state">
        <p className="k-state-title">Bạn không có quyền xem giao dịch.</p>
      </div>
    )
  }
  if (!payment) {
    return (
      <div className="k-state">
        <p className="k-state-title">Không tìm thấy giao dịch</p>
        <Link to={cashierPaths.transactions} className="k-btn k-btn--primary">
          Về lịch sử giao dịch
        </Link>
      </div>
    )
  }

  const bill = data.bills.find((b) => b.id === payment.billId)
  const session = data.sessions.find((s) => s.id === bill?.sessionId)
  const table = data.tables.find((t) => t.id === session?.tableId)
  const shift = data.shifts.find((s) => s.id === payment.shiftId)
  const requests = data.requests.filter((r) => r.paymentId === payment.id)
  const pendingVoid = requests.find((r) => r.status === 'PENDING')
  const canRequestVoid =
    payment.status === 'SUCCEEDED' &&
    !pendingVoid &&
    !session?.closedAt &&
    hasPermission(user, 'requests.create')

  return (
    <div className="k-page k-page--narrow">
      <div className="k-page-head">
        <Link to={cashierPaths.transactions} className="k-back">
          <Icon name="chevronLeft" />
          Lịch sử giao dịch
        </Link>
        <div className="k-page-heading">
          <h2 className="k-h2">Giao dịch {payment.code}</h2>
          <PaymentStatusBadge status={payment.status} />
        </div>
        <div className="k-page-actions">
          {bill &&
            hasPermission(user, bill.status === 'PAID' ? 'receipts.print' : 'bills.prepare') && (
              <Link to={cashierPaths.receipt(bill.id)} className="k-btn">
                <Icon name="printer" />
                Hóa đơn in
              </Link>
            )}
          {canRequestVoid && (
            <button type="button" className="k-btn k-btn--danger" onClick={() => setVoiding(true)}>
              <Icon name="undo" />
              Yêu cầu hủy thanh toán
            </button>
          )}
        </div>
      </div>

      <section className="k-panel">
        <div className="c-tx-amount">
          <span>{METHOD_LABEL[payment.method]}</span>
          <b>{formatVnd(payment.amount)}</b>
        </div>
        <dl className="k-dl c-dl-ids">
          <dt>Payment ID</dt>
          <dd className="k-mono">{payment.id}</dd>
          <dt>Mã giao dịch</dt>
          <dd>{payment.code}</dd>
          <dt>Hóa đơn</dt>
          <dd>
            {bill ? (
              <>
                <Link to={cashierPaths.bill(bill.id)} className="k-link">
                  {bill.code}
                </Link>{' '}
                <span className="k-muted k-mono">({bill.id})</span>
              </>
            ) : (
              '—'
            )}
          </dd>
          <dt>Bàn</dt>
          <dd>{table ? `${table.code} · ${table.area}` : '—'}</dd>
          <dt>Tạo lúc</dt>
          <dd>{when(payment.createdAt)}</dd>
          <dt>Hoàn tất</dt>
          <dd>{when(payment.completedAt)}</dd>
          <dt>Thu ngân</dt>
          <dd>{staffName(data, payment.createdBy)}</dd>
          <dt>Ca</dt>
          <dd>{shift ? `${shift.code} · ${staffName(data, shift.cashierId)}` : '—'}</dd>
          {payment.method === 'CASH' && (
            <>
              <dt>Khách đưa</dt>
              <dd>{formatVnd(payment.tendered ?? payment.amount)}</dd>
              <dt>Tiền thừa</dt>
              <dd>{formatVnd(payment.change ?? 0)}</dd>
            </>
          )}
          {payment.method === 'TRANSFER' && (
            <>
              <dt>Nội dung CK</dt>
              <dd className="k-mono">{payment.transferContent ?? '—'}</dd>
              <dt>Mã ngân hàng</dt>
              <dd className="k-mono">{payment.bankReference ?? '—'}</dd>
              <dt>Xác minh bởi</dt>
              <dd>{payment.verifiedBy ? staffName(data, payment.verifiedBy) : 'Chưa xác minh'}</dd>
            </>
          )}
          {payment.failureReason && (
            <>
              <dt>Lý do lỗi</dt>
              <dd className="c-text-danger">{payment.failureReason}</dd>
            </>
          )}
          {payment.cancelledBy && (
            <>
              <dt>Hủy yêu cầu bởi</dt>
              <dd>{staffName(data, payment.cancelledBy)}</dd>
            </>
          )}
          {payment.voidedAt && (
            <>
              <dt>Hủy thanh toán</dt>
              <dd>
                {when(payment.voidedAt)} · duyệt bởi {staffName(data, payment.voidedBy)}
              </dd>
            </>
          )}
        </dl>
      </section>

      {requests.length > 0 && (
        <section className="k-panel">
          <h3 className="k-panel-title">Yêu cầu liên quan</h3>
          <ul className="k-rounds">
            {requests.map((r) => (
              <li key={r.id}>
                <span className="c-inline-gap">
                  <Link to={cashierPaths.request(r.id)} className="k-link">
                    {r.code}
                  </Link>
                  {REQUEST_TYPE_LABEL[r.type]}
                  <RequestStatusBadge status={r.status} />
                </span>
                <span className="k-muted">
                  {r.reason}
                  {r.decisionNote ? ` — ${r.decisionNote}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="k-callout">
        <Icon name="info" size={14} />
        <span>
          Giao dịch đã ghi nhận không chỉnh sửa trực tiếp. Hủy thanh toán phải gửi yêu cầu và được
          Quản lý duyệt; hoàn tiền sau khi khách rời cần Quản lý xử lý theo quy trình riêng.
        </span>
      </p>

      {voiding && <VoidDialog payment={payment} onClose={() => setVoiding(false)} />}
    </div>
  )
}
