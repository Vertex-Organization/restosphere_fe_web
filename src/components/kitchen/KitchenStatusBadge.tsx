import type { ReactNode } from 'react'
import { ITEM_STATUS_LABEL } from '../../api/kitchen/labels'
import type { OrderItemStatus } from '../../api/kitchen/types'

export type BadgeTone = 'neutral' | 'info' | 'warning' | 'success' | 'danger' | 'primary'

const STATUS_TONE: Record<OrderItemStatus, BadgeTone> = {
  DRAFT: 'neutral',
  SUBMITTED: 'info',
  PREPARING: 'warning',
  READY: 'success',
  SERVED: 'neutral',
  CANCELLED: 'danger',
}

export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return <span className={`k-badge k-badge--${tone}`}>{children}</span>
}

export function KitchenStatusBadge({ status }: { status: OrderItemStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{ITEM_STATUS_LABEL[status]}</Badge>
}
