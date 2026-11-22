import type { CashierNotificationKind } from '../../api/billing/types'
import type { IconName } from './Icon'

export interface CashierNotificationPresentation {
  icon: IconName
  tone: string
  label: string
}

const PRESENTATION: Record<CashierNotificationKind, CashierNotificationPresentation> = {
  PAYMENT_REQUEST: { icon: 'receipt', tone: 'primary', label: 'Yêu cầu thanh toán' },
  PAYMENT_REQUEST_WITHDRAWN: {
    icon: 'xCircle',
    tone: 'warning',
    label: 'Phục vụ rút yêu cầu',
  },
  TRANSFER_RECEIVED: { icon: 'bank', tone: 'success', label: 'Đã nhận chuyển khoản' },
  TRANSFER_FAILED: { icon: 'xCircle', tone: 'danger', label: 'Chuyển khoản lỗi' },
  REQUEST_DECIDED: { icon: 'clipboard', tone: 'warning', label: 'Kết quả yêu cầu' },
}

const FALLBACK: CashierNotificationPresentation = {
  icon: 'bell',
  tone: 'neutral',
  label: 'Thông báo',
}

/** Backend notification kinds are extensible strings; unknown kinds must not break the page. */
export function cashierNotificationPresentation(kind: string): CashierNotificationPresentation {
  return PRESENTATION[kind as CashierNotificationKind] ?? FALLBACK
}
