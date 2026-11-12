import { applyDevEvent, type DevEvent } from './devEvents'
import { createSeedData, dayKey, DEMO_PASSWORD, isValidCashierData } from './mockData'
import { applyCashierCommand } from './rules'
import type { CashierService } from './service'
import { CashierError, type CashierData, type CashierStaff, type CommandResult } from './types'

// Local mock of the billing backend. Data lives in localStorage so several
// tabs (two cashiers, or the dev simulator beside the counter) share one
// store. It is NOT a payment integration: nothing here moves real money.

const DATA_KEY = 'restosphere.cashier.demo.v2'
const OFFLINE_KEY = 'restosphere.cashier.dev.offline'
const LOCAL_EVENT = 'restosphere:cashier-data'

let memory: CashierData | null = null

function readRaw(): unknown {
  try {
    const text = localStorage.getItem(DATA_KEY)
    return text ? JSON.parse(text) : memory
  } catch {
    return memory
  }
}

function write(data: CashierData) {
  memory = data
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(data))
  } catch {
    // Storage unavailable (private mode): keep working from memory.
  }
  window.dispatchEvent(new Event(LOCAL_EVENT))
}

/** Loads saved demo data, reseeding on first use, on a new day or on a bad shape. */
function read(now = new Date()): CashierData {
  const value = readRaw()
  if (isValidCashierData(value) && value.seedDay === dayKey(now)) return value
  const seeded = createSeedData(now)
  // Keep the revision moving forward so open tabs accept the new data.
  if (isValidCashierData(value)) seeded.revision = Math.max(seeded.revision, value.revision + 1)
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
  await new Promise((resolve) => setTimeout(resolve, 150 + Math.random() * 150))
  if (isOffline()) throw new CashierError('NETWORK', 'Không thể kết nối máy chủ. Vui lòng thử lại.')
}

export const mockCashierService: CashierService = {
  async load() {
    await network()
    return read()
  },

  async execute(actor, command): Promise<CommandResult> {
    await network()
    // Always apply against the latest stored data, never the caller's copy,
    // so two cashiers acting on one bill get a conflict, not a double charge.
    const result = applyCashierCommand(read(), actor.id, command, new Date())
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
 * once it has a CASHIER role (the current API only knows ADMIN/MANAGER/STAFF). */
export async function mockSignIn(username: string, password: string): Promise<CashierStaff> {
  await new Promise((resolve) => setTimeout(resolve, 250))
  const staff = read().staff.find((s) => s.username === username.trim().toLowerCase())
  if (!staff || password !== DEMO_PASSWORD) throw new CashierError('INVALID', 'Tên đăng nhập hoặc mật khẩu không đúng.')
  return { ...staff, permissions: [...staff.permissions] }
}

export function mockFindStaff(id: string): CashierStaff | null {
  const staff = read().staff.find((s) => s.id === id)
  return staff ? { ...staff, permissions: [...staff.permissions] } : null
}

/** Development-only controls used by /cashier/dev. */
export const mockDevTools = {
  async simulate(event: DevEvent) {
    const result = applyDevEvent(read(), event, new Date())
    write(result.data)
    return result
  },
  reset() {
    const current = readRaw()
    const seeded = createSeedData(new Date())
    if (isValidCashierData(current)) seeded.revision = Math.max(seeded.revision, current.revision + 1)
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
