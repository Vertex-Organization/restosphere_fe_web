import { notificationTitle } from './labels'
import type { KitchenData, KitchenNotification, NotificationKind } from './types'

export function notificationLine(title: string, detail: string) {
  const text = detail.trim()
  return text ? `${title} · ${text}` : title
}

const SHORT_KIND_LABEL: Record<NotificationKind, string> = {
  NEW_ORDER: 'Đơn mới',
  ADD_ON: 'Gọi thêm',
  CANCELLED: 'Hủy món',
  PRIORITY: 'Ưu tiên',
  INCIDENT_REPLY: 'Phản hồi',
  MENU_REQUEST: 'Thực đơn',
}

export function notificationKindShort(kind: string) {
  return SHORT_KIND_LABEL[kind as NotificationKind] ?? 'Thông báo'
}

type NotificationData = Pick<KitchenData, 'orders' | 'items'>

export function ticketProgress(data: NotificationData, orderId: string | undefined) {
  if (!orderId || !data.orders.some((order) => order.id === orderId)) return ''
  const live = data.items.filter(
    (item) =>
      item.orderId === orderId &&
      (item.status === 'SUBMITTED' ||
        item.status === 'PREPARING' ||
        item.status === 'READY' ||
        item.status === 'SERVED'),
  )
  if (!live.length) return ''
  const done = live.filter((item) => item.status === 'READY' || item.status === 'SERVED').length
  const started = done > 0 || live.some((item) => item.status === 'PREPARING')
  if (done === live.length) return `Xong ${live.length}/${live.length}`
  return `${started ? 'Đang làm' : 'Chờ'} ${done}/${live.length}`
}

export function notificationParts(
  n: Pick<KitchenNotification, 'kind' | 'title' | 'body' | 'orderId'>,
  data: NotificationData,
) {
  const order = n.orderId ? data.orders.find((o) => o.id === n.orderId) : undefined
  if (!order) {
    return { table: '', detail: notificationLine(notificationTitle(n.kind, n.title), n.body) }
  }
  const count = data.items.filter((item) => item.orderId === order.id).length
  const detail = n.kind === 'NEW_ORDER' && count ? `${count} món` : n.body
  return { table: `Bàn ${order.tableCode}`, detail }
}

export function relativeAgo(minutes: number) {
  if (minutes < 1) return 'vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`
  return `${Math.floor(hours / 24)} ngày trước`
}
