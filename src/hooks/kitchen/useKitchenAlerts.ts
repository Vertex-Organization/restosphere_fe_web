import { useCallback, useEffect, useRef, useState } from 'react'
import { hasNewDishesInStation, submittedDishIds } from '../../api/kitchen/alerts'
import type { StationId } from '../../api/kitchen/stations'
import type { KitchenData } from '../../api/kitchen/types'
import {
  playKitchenSound,
  vibrateDevice,
  type KitchenSound,
} from '../../components/kitchen/notifySound'
import { useNotifyPrefs } from './useNotifyPrefs'

const KEYS = {
  mode: 'restosphere.kitchen.notifyMode',
  volume: 'restosphere.kitchen.notifyVolume',
}
const FLASH_MS = 2000

export function useKitchenAlerts(data: KitchenData | null, station: StationId) {
  const { mode, modeRef, setMode, volume, setVolume, previewSound } = useNotifyPrefs(KEYS)
  const [flashNew, setFlashNew] = useState(false)
  const seenIds = useRef<ReadonlySet<string> | null>(null)
  const flashTimer = useRef<number | undefined>(undefined)

  const playFeedback = useCallback(
    (sound: Exclude<KitchenSound, 'new-dish'>) => {
      if (modeRef.current === 'silent') return
      if (modeRef.current === 'sound') playKitchenSound(sound)
      vibrateDevice(sound)
    },
    [modeRef],
  )

  useEffect(() => {
    if (!data) return
    const current = submittedDishIds(data)
    const arrived = hasNewDishesInStation(seenIds.current, data, station)
    seenIds.current = current
    if (!arrived) return
    const active = modeRef.current
    if (active === 'silent') return
    if (active === 'sound') playKitchenSound('new-dish')
    const vibrated = vibrateDevice('new-dish')
    if (active === 'vibrate' && !vibrated) {
      window.clearTimeout(flashTimer.current)
      setFlashNew(true)
      flashTimer.current = window.setTimeout(() => setFlashNew(false), FLASH_MS)
    }
  }, [data, station, modeRef])

  useEffect(() => () => window.clearTimeout(flashTimer.current), [])

  return {
    notifyMode: mode,
    setNotifyMode: setMode,
    notifyVolume: volume,
    setNotifyVolume: setVolume,
    previewSound,
    flashNew,
    playFeedback,
  }
}
