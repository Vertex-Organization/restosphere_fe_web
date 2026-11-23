import { createContext, useContext } from 'react'
import type { NotifyMode } from '../../api/kitchen/alerts'
import type { KitchenSound } from '../../components/kitchen/notifySound'
import type {
  CashierCommand,
  CashierData,
  CashierStaff,
  CommandResult,
} from '../../api/billing/types'

export interface Feedback {
  id: number
  tone: 'success' | 'error'
  text: string
  /** Connection errors clear themselves once the server answers again. */
  network?: boolean
}

export type RunResult = { ok: true; result: CommandResult } | { ok: false; error: string }

export interface CashierDataValue {
  user: CashierStaff
  data: CashierData | null
  /** Message of the last failed load; data may still hold the last good copy. */
  loadError: string | null
  refresh: () => Promise<void>
  /** Runs a command once per key at a time. A second call with a busy key is ignored. */
  run: (
    command: CashierCommand,
    keys: string[],
    options?: { quiet?: boolean },
  ) => Promise<RunResult | null>
  isPending: (key: string) => boolean
  feedback: Feedback | null
  dismissFeedback: () => void
  notifyMode: NotifyMode
  setNotifyMode: (mode: NotifyMode) => void
  notifyVolume: number
  setNotifyVolume: (volume: number) => void
  previewSound: (sound: KitchenSound) => void
}

export const CashierDataContext = createContext<CashierDataValue | null>(null)

export function useCashierData() {
  const value = useContext(CashierDataContext)
  if (!value) throw new Error('useCashierData must be used inside CashierDataProvider')
  return value
}

/** For pages rendered by CashierLayout, which only mounts them once data exists. */
export function useCashierSnapshot() {
  const value = useCashierData()
  if (!value.data) throw new Error('Cashier data is not loaded yet')
  // The signed-in account as stored on the server (permissions may change while signed in).
  const user = value.data.staff.find((s) => s.id === value.user.id) ?? value.user
  return { ...value, user, data: value.data }
}
