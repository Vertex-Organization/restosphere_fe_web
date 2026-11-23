import { createContext, useContext } from 'react'
import type { NotifyMode } from '../../api/kitchen/alerts'
import type { StationId } from '../../api/kitchen/stations'
import type { KitchenSound } from '../../components/kitchen/notifySound'
import type { KitchenCommand, KitchenData, StaffMember } from '../../api/kitchen/types'

export interface Feedback {
  id: number
  tone: 'success' | 'error'
  text: string
  /** Connection errors clear themselves once the server answers again. */
  network?: boolean
}

export interface KitchenDataValue {
  user: StaffMember
  data: KitchenData | null
  /** Message of the last failed load; data may still hold the last good copy. */
  loadError: string | null
  refresh: () => Promise<void>
  /** Runs a command once per key at a time; resolves to its summary or null on failure. */
  run: (command: KitchenCommand, keys: string[]) => Promise<string | null>
  isPending: (key: string) => boolean
  feedback: Feedback | null
  dismissFeedback: () => void
  notifyMode: NotifyMode
  setNotifyMode: (mode: NotifyMode) => void
  notifyVolume: number
  setNotifyVolume: (volume: number) => void
  previewSound: (sound: KitchenSound) => void
  flashNew: boolean
  station: StationId
  setStation: (station: StationId) => void
}

export const KitchenDataContext = createContext<KitchenDataValue | null>(null)

export function useKitchenData() {
  const value = useContext(KitchenDataContext)
  if (!value) throw new Error('useKitchenData must be used inside KitchenDataProvider')
  return value
}

/** For pages rendered by KitchenLayout, which only mounts them once data exists. */
export function useKitchenSnapshot() {
  const value = useKitchenData()
  if (!value.data) throw new Error('Kitchen data is not loaded yet')
  return { ...value, data: value.data }
}
