import { getManagerUser } from './auth'
import { createManagerData } from './mockData'
import { applyManagerCommand, ManagerError } from './rules'
import type { ManagerCommand, ManagerData } from './types'

export interface ManagerService {
  readonly mode: 'mock' | 'api'
  load(): Promise<ManagerData>
  execute(command: ManagerCommand, expectedRevision: number): Promise<ManagerData>
  subscribe(listener: () => void): () => void
}
const KEY = 'restosphere.manager.data.v5'
const listeners = new Set<() => void>()
function read(): ManagerData {
  const raw = localStorage.getItem(KEY)
  if (!raw) { const seed = createManagerData(); localStorage.setItem(KEY, JSON.stringify(seed)); return seed }
  try {
    const value = JSON.parse(raw) as ManagerData
    const lists = ['areas', 'tables', 'sessions', 'orders', 'reservations', 'employees', 'shifts', 'menu', 'categories', 'approvals', 'incidents', 'notifications', 'bills', 'payments', 'history', 'outbox'] as const
    if (value.schema !== 1 || !Number.isInteger(value.revision) || !lists.every(k => Array.isArray(value[k]))) throw new Error()
    if (!value.orders.every(o => Array.isArray(o.items) && o.items.every(i => ['SUBMITTED', 'PREPARING', 'READY', 'SERVED', 'REJECTED', 'CANCELLED', 'VOIDED'].includes(i.status)))) throw new Error()
    if (!value.reservations.every(r => ['PENDING', 'CONFIRMED', 'ARRIVED', 'SEATED', 'COMPLETED', 'REJECTED', 'CANCELLED', 'NO_SHOW'].includes(r.status))) throw new Error()
    if (!value.tables.every(t => ['AVAILABLE', 'OCCUPIED', 'CLEANING', 'OUT_OF_SERVICE'].includes(t.status))) throw new Error()
    if (!value.notifications.every(n => ['APPROVAL', 'INCIDENT', 'ORDER', 'MENU_REQUEST', 'CASHIER_SHIFT_CLOSED', 'REQUEST_WITHDRAWN'].includes(n.kind))) throw new Error()
    if (!value.menu.every(m => ['AVAILABLE', 'SOLD_OUT', 'DISCONTINUED'].includes(m.status))) throw new Error()
    if (!value.incidents.every(i => typeof i.code === 'string' && typeof i.description === 'string' && ['OUT_OF_STOCK', 'EQUIPMENT', 'CANNOT_PREPARE', 'NOTE_CLARIFICATION', 'OTHER'].includes(i.type) && ['OPEN', 'ACKNOWLEDGED', 'RESOLVED'].includes(i.status))) throw new Error()
    return value
  } catch { throw new ManagerError('Dữ liệu mô phỏng đã hỏng. Hãy xóa riêng khóa restosphere.manager.data.v5 trong bộ nhớ trình duyệt để khởi tạo lại.') }
}
let queue = Promise.resolve()
export const managerService: ManagerService = {
  mode: 'mock',
  async load() {
    if (getManagerUser()?.role !== 'MANAGER') throw new ManagerError('Phiên quản lý không hợp lệ.')
    return read()
  },
  execute(command, expectedRevision) {
    const run = () => {
      const next = applyManagerCommand(read(), getManagerUser(), command, expectedRevision)
      localStorage.setItem(KEY, JSON.stringify(next))
      listeners.forEach(fn => fn())
      return next
    }
    // Serialize across same-origin tabs where Web Locks is available; revision checks reject stale decisions.
    const result = queue.then(() => navigator.locks ? navigator.locks.request(KEY, run) : run())
    queue = result.then(() => undefined, () => undefined)
    return result
  },
  subscribe(listener) {
    listeners.add(listener)
    const onStorage = (e: StorageEvent) => { if (e.key === KEY) listener() }
    window.addEventListener('storage', onStorage)
    return () => { listeners.delete(listener); window.removeEventListener('storage', onStorage) }
  },
}
// No operational backend contract exists yet. Do not invent endpoint paths.
// An HTTP implementation must validate JWT, branch scope, permissions, revisions and all business rules server-side.
