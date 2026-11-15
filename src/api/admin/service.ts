import { MOCK_ADMIN_DATA } from './mockData'
import type { AdminData, AdminService } from './types'

const delay = (ms: number, signal?: AbortSignal) => new Promise<void>((resolve, reject) => {
  const timer = window.setTimeout(resolve, ms)
  signal?.addEventListener('abort', () => {
    window.clearTimeout(timer)
    reject(new DOMException('Request aborted', 'AbortError'))
  }, { once: true })
})

const cloneData = (): AdminData => structuredClone(MOCK_ADMIN_DATA)

export const mockAdminService: AdminService = {
  async load(signal) {
    await delay(280, signal)
    return cloneData()
  },
}

// There are no admin resource endpoints in the current source. Replace this adapter
// when the backend exposes users, roles, restaurant settings and audit logs.
export const adminService: AdminService = mockAdminService
