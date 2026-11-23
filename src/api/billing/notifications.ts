import { notificationTitle } from '../kitchen/labels'
import { notificationLine } from '../kitchen/notifications'
import { formatVnd } from './money'
import { billView } from './selectors'
import type { CashierData, CashierNotification } from './types'

const SHORT_KIND_LABEL: Record<string, string> = {
  PAYMENT_REQUEST: 'Thanh toán',
  PAYMENT_REQUEST_WITHDRAWN: 'Rút yêu cầu',
  TRANSFER_RECEIVED: 'Đã nhận CK',
  TRANSFER_FAILED: 'CK lỗi',
  REQUEST_DECIDED: 'Kết quả',
}

export function cashierKindShort(kind: string) {
  return SHORT_KIND_LABEL[kind] ?? 'Thông báo'
}

type NotificationSource = Pick<
  CashierNotification,
  'kind' | 'title' | 'body' | 'billId' | 'paymentId'
>

/** Table label plus a short grey detail (usually the amount) for one notification row. */
export function cashierNotificationParts(n: NotificationSource, data: CashierData) {
  const view = n.billId ? billView(data, n.billId) : null
  if (!view) {
    return { table: '', detail: notificationLine(notificationTitle(n.kind, n.title), n.body) }
  }
  const payment = n.paymentId ? data.payments.find((p) => p.id === n.paymentId) : undefined
  const table = `Bàn ${view.table.code}`
  if (payment) return { table, detail: formatVnd(payment.amount) }
  if (n.kind === 'PAYMENT_REQUEST' || n.kind === 'PAYMENT_REQUEST_WITHDRAWN')
    return { table, detail: formatVnd(view.bill.totals.total) }
  return { table, detail: n.body }
}
