import { applyDevEvent, type DevEvent } from './devEvents'
import { createSeedData, dayKey, DEMO_PASSWORD, isValidKitchenData } from './mockData'
import { applyKitchenCommand } from './rules'
import type { KitchenService } from './service'
import { KitchenError, type CommandResult, type KitchenData, type StaffMember } from './types'
import { KITCHEN_DATA_KEY } from './storageKey'

// Local mock of the kitchen backend. Data lives in localStorage so several
// tabs (e.g. two cooks) share one store; it is NOT synchronised with the
// waiter app, which keeps its own mock data on the device.

const DATA_KEY = KITCHEN_DATA_KEY
const OFFLINE_KEY = 'restosphere.kitchen.dev.offline'
const LOCAL_EVENT = 'restosphere:kitchen-data'

let memory: KitchenData | null = null

function readRaw(): unknown {
  try {
    const text = localStorage.getItem(DATA_KEY)
    return text ? JSON.parse(text) : null
  } catch {
    return memory
  }
}

function write(data: KitchenData) {
  memory = data
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(data))
  } catch {
    // Storage unavailable (private mode): keep working from memory.
  }
  window.dispatchEvent(new Event(LOCAL_EVENT))
}

/** Loads saved demo data, reseeding on first use, on a new day or on a bad shape. */
function read(now = new Date()): KitchenData {
  const value = readRaw()
  if (isValidKitchenData(value) && value.seedDay === dayKey(now)) return value
  const seeded = createSeedData(now)
  // Keep the revision moving forward so open tabs accept the new data.
  if (isValidKitchenData(value)) seeded.revision = Math.max(seeded.revision, value.revision + 1)
  write(seeded)
  return seeded
}

function isOffline() {
  try {
    return localStorage.getItem(OFFLINE_KEY) === '1'
  } catch {
    return false
  }
}

async function network() {
  await new Promise((resolve) => setTimeout(resolve, 160 + Math.random() * 140))
  if (isOffline()) throw new KitchenError('NETWORK', 'Không thể kết nối máy chủ. Đang thử lại…')
}

export const mockKitchenService: KitchenService = {
  async load() {
    await network()
    return read()
  },

  async execute(actor, command): Promise<CommandResult> {
    await network()
    // Always apply against the latest stored data, never the caller's copy,
    // so two cooks acting on the same item get a conflict instead of a lost update.
    const result = applyKitchenCommand(read(), actor.id, command, new Date())
    write(result.data)
    return result
  },

  subscribe(listener) {
    const onStorage = (event: StorageEvent) => { if (event.key === DATA_KEY) listener() }
    window.addEventListener('storage', onStorage)
    window.addEventListener(LOCAL_EVENT, listener)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(LOCAL_EVENT, listener)
    }
  },
}

/** Demo sign-in against the mock staff list. Replace with the backend auth
 * once it has a KITCHEN role (the current API only knows ADMIN/MANAGER/STAFF). */
export async function mockSignIn(username: string, password: string): Promise<StaffMember> {
  await new Promise((resolve) => setTimeout(resolve, 250))
  const staff = read().staff.find((s) => s.username === username.trim().toLowerCase())
  if (!staff || password !== DEMO_PASSWORD) throw new KitchenError('INVALID', 'Tên đăng nhập hoặc mật khẩu không đúng.')
  return { ...staff }
}

export function mockFindStaff(id: string): StaffMember | null {
  const staff = read().staff.find((s) => s.id === id)
  return staff ? { ...staff } : null
}

/** Development-only controls used by /kitchen/dev. */
export const mockDevTools = {
  snapshot: () => read(),
  async simulate(event: DevEvent) {
    const result = applyDevEvent(read(), event, new Date())
    write(result.data)
    return result
  },
  reset() {
    const current = readRaw()
    const seeded = createSeedData(new Date())
    if (isValidKitchenData(current)) seeded.revision = Math.max(seeded.revision, current.revision + 1)
    write(seeded)
  },
  isOffline,
  setOffline(offline: boolean) {
    try {
      if (offline) localStorage.setItem(OFFLINE_KEY, '1')
      else localStorage.removeItem(OFFLINE_KEY)
    } catch {
      // Ignore: the toggle is a development convenience only.
    }
    window.dispatchEvent(new Event(LOCAL_EVENT))
  },
}
