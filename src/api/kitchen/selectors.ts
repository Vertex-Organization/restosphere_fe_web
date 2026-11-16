import type { KitchenData, KitchenOrder, KitchenOrderItem, StaffMember } from './types'

/** Ticket wait (since the waiter sent it) that turns amber, then red. */
export const WAIT_WARN_MINUTES = 10
export const WAIT_LATE_MINUTES = 15
/** Time a finished dish may wait for the waiter before it is flagged. */
export const READY_WARN_MINUTES = 5
export const READY_LATE_MINUTES = 10

export type TimeTone = 'normal' | 'warn' | 'late'

export function minutesBetween(fromIso: string | undefined, now: number) {
  if (!fromIso) return 0
  return Math.max(0, Math.floor((now - new Date(fromIso).getTime()) / 60000))
}

export function waitTone(minutes: number, warn = WAIT_WARN_MINUTES, late = WAIT_LATE_MINUTES): TimeTone {
  return minutes >= late ? 'late' : minutes >= warn ? 'warn' : 'normal'
}

export interface TicketView {
  order: KitchenOrder
  waiter?: StaffMember
  /** Items belonging in this column, in the order the waiter entered them. */
  items: KitchenOrderItem[]
  /** Same-ticket items currently in the other column (keeps the link visible). */
  otherReady: number
  otherActive: number
  minutes: number
  tone: TimeTone
}

export interface ActiveDishView {
  item: KitchenOrderItem
  order: KitchenOrder
  waiter?: StaffMember
  /** Ready items from the same ordering round, shown only as context. */
  otherReady: number
  minutes: number
  tone: TimeTone
}

export type KitchenFilter = 'all' | 'new' | 'preparing' | 'late'

export interface BoardView {
  active: TicketView[]
  ready: TicketView[]
  counts: { newTickets: number; newItems: number; preparingItems: number; readyItems: number; late: number }
}

export function buildBoard(data: KitchenData, now: number): BoardView {
  const byOrder = new Map<string, KitchenOrderItem[]>()
  for (const item of data.items) {
    const list = byOrder.get(item.orderId)
    if (list) list.push(item)
    else byOrder.set(item.orderId, [item])
  }

  const active: TicketView[] = []
  const ready: TicketView[] = []
  for (const order of data.orders) {
    const items = byOrder.get(order.id) ?? []
    const left = items.filter((i) => i.status === 'SUBMITTED' || i.status === 'PREPARING')
    const right = items.filter((i) => i.status === 'READY')
    const waiter = data.staff.find((s) => s.id === order.waiterId)
    if (left.length) {
      const minutes = minutesBetween(order.submittedAt, now)
      active.push({ order, waiter, items: left, otherReady: right.length, otherActive: 0, minutes, tone: waitTone(minutes) })
    }
    if (right.length) {
      const oldest = right.reduce((min, i) => (i.readyAt && i.readyAt < min ? i.readyAt : min), right[0].readyAt ?? order.submittedAt)
      const minutes = minutesBetween(oldest, now)
      ready.push({ order, waiter, items: right, otherReady: 0, otherActive: left.length, minutes, tone: waitTone(minutes, READY_WARN_MINUTES, READY_LATE_MINUTES) })
    }
  }

  // Priority requests first, then the longest-waiting tickets.
  active.sort((a, b) => Number(!!b.order.priority) - Number(!!a.order.priority) || b.minutes - a.minutes
    || a.order.submittedAt.localeCompare(b.order.submittedAt))
  // Dishes that have waited longest for the waiter come first.
  ready.sort((a, b) => b.minutes - a.minutes || a.order.code.localeCompare(b.order.code))

  const activeItems = active.flatMap((t) => t.items)
  return {
    active,
    ready,
    counts: {
      newTickets: active.filter((t) => t.items.some((i) => i.status === 'SUBMITTED')).length,
      newItems: activeItems.filter((i) => i.status === 'SUBMITTED').length,
      preparingItems: activeItems.filter((i) => i.status === 'PREPARING').length,
      readyItems: ready.reduce((sum, t) => sum + t.items.length, 0),
      late: active.filter((t) => t.tone === 'late').length,
    },
  }
}

export function filterActive(tickets: TicketView[], filter: KitchenFilter) {
  switch (filter) {
    case 'new': return tickets.filter((t) => t.items.some((i) => i.status === 'SUBMITTED'))
    case 'preparing': return tickets.filter((t) => t.items.some((i) => i.status === 'PREPARING'))
    case 'late': return tickets.filter((t) => t.tone === 'late')
    default: return tickets
  }
}

/** The action queue is dish-first, not table-first. A dish ordered earlier is
 * always placed before a later dish, even when the later table is marked
 * priority. The priority note remains visible so the kitchen can coordinate. */
export function buildActiveDishQueue(data: KitchenData, now: number): ActiveDishView[] {
  const orders = new Map(data.orders.map((order) => [order.id, order]))
  const readyByOrder = new Map<string, number>()
  for (const item of data.items) {
    if (item.status === 'READY') readyByOrder.set(item.orderId, (readyByOrder.get(item.orderId) ?? 0) + 1)
  }

  return data.items
    .filter((item) => item.status === 'SUBMITTED' || item.status === 'PREPARING')
    .flatMap((item) => {
      const order = orders.get(item.orderId)
      if (!order) return []
      const minutes = minutesBetween(item.submittedAt, now)
      return [{
        item,
        order,
        waiter: data.staff.find((staff) => staff.id === order.waiterId),
        otherReady: readyByOrder.get(order.id) ?? 0,
        minutes,
        tone: waitTone(minutes),
      } satisfies ActiveDishView]
    })
    .sort((a, b) => a.item.submittedAt.localeCompare(b.item.submittedAt)
      || a.order.code.localeCompare(b.order.code) || a.item.id.localeCompare(b.item.id))
}

export function filterActiveDishes(dishes: ActiveDishView[], filter: KitchenFilter) {
  switch (filter) {
    case 'new': return dishes.filter((dish) => dish.item.status === 'SUBMITTED')
    case 'preparing': return dishes.filter((dish) => dish.item.status === 'PREPARING')
    case 'late': return dishes.filter((dish) => dish.tone === 'late')
    default: return dishes
  }
}

export function unreadCount(data: KitchenData, userId: string) {
  return data.notifications.filter((n) => !n.readBy.includes(userId)).length
}
