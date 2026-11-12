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
const KEY = 'restosphere.manager.data.v1'
const listeners = new Set<() => void>()
function read(): ManagerData {
  const raw = localStorage.getItem(KEY)
  if (!raw) { const seed = createManagerData(); localStorage.setItem(KEY, JSON.stringify(seed)); return seed }
  try {
    const value = JSON.parse(raw) as ManagerData
    const lists = ['areas', 'tables', 'sessions', 'orders', 'reservations', 'employees', 'shifts', 'menu', 'categories', 'approvals', 'incidents', 'notifications', 'bills', 'payments', 'history'] as const
    if (value.schema !== 1 || !Number.isInteger(value.revision) || !lists.every(k => Array.isArray(value[k]))) throw new Error()
    return value
  } catch { throw new ManagerError('Dữ liệu mô phỏng đã hỏng. Hãy xóa riêng khóa restosphere.manager.data.v1 trong bộ nhớ trình duyệt để khởi tạo lại.') }
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
