import { businessDay, minutes } from './dates'
import type { ManagerData, Order } from './types'

export const employeeName = (d: ManagerData, id: string) => d.employees.find(e => e.id === id)?.name ?? id
export const tableForOrder = (d: ManagerData, order: Order) => d.sessions.find(s => s.id === order.sessionId)?.tableId ?? '—'
export const pendingItems = (order: Order) => order.items.filter(i => ['NEW', 'PREPARING', 'READY'].includes(i.status))
export function orderStatus(order: Order) {
  if (order.items.some(i => i.status === 'NEW' || i.status === 'PREPARING')) return 'PREPARING'
  if (order.items.some(i => i.status === 'READY')) return 'READY'
  return 'SERVED'
}
export const isLateOrder = (o: Order, now: number) => o.items.some(i => ['NEW', 'PREPARING'].includes(i.status)) && minutes(o.at, now) > 25
export function dashboard(d: ManagerData, now: number) {
  const today = businessDay(now)
  return {
    revenue: d.payments.filter(p => p.status === 'COMPLETED' && businessDay(p.at) === today).reduce((n, p) => n + p.amount, 0),
    occupied: d.tables.filter(t => t.status === 'OCCUPIED').length,
    reservations: d.reservations.filter(r => businessDay(r.at) === today).length,
    activeOrders: d.orders.filter(o => pendingItems(o).length).length,
    pending: d.approvals.filter(a => a.status === 'PENDING'),
    incidents: d.incidents.filter(i => i.status !== 'RESOLVED'),
    lateOrders: d.orders.filter(o => isLateOrder(o, now)),
    ready: d.orders.flatMap(o => o.items).filter(i => i.status === 'READY').reduce((n, i) => n + i.quantity, 0),
    cleaning: d.tables.filter(t => t.status === 'CLEANING').length,
  }
}
