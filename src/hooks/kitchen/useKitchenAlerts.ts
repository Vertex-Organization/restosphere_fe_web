import { useCallback, useEffect, useRef, useState } from 'react'
import {
  hasNewDishesInStation,
  parseNotifyMode,
  parseNotifyVolume,
  submittedDishIds,
  type NotifyMode,
} from '../../api/kitchen/alerts'
import type { StationId } from '../../api/kitchen/stations'
import type { KitchenData } from '../../api/kitchen/types'
import {
  playKitchenSound,
  setMasterVolume,
  unlockAudio,
  vibrateDevice,
  type KitchenSound,
} from '../../components/kitchen/notifySound'

const STORAGE_KEY = 'restosphere.kitchen.notifyMode'
const VOLUME_KEY = 'restosphere.kitchen.notifyVolume'
const FLASH_MS = 2000

function loadMode(): NotifyMode {
  try {
    return parseNotifyMode(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    return parseNotifyMode(null)
  }
}

function saveMode(mode: NotifyMode) {
  try {
    window.localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    return
  }
}

function loadVolume(): number {
  try {
    return parseNotifyVolume(window.localStorage.getItem(VOLUME_KEY))
  } catch {
    return parseNotifyVolume(null)
  }
}

function saveVolume(volume: number) {
  try {
    window.localStorage.setItem(VOLUME_KEY, String(volume))
  } catch {
    return
  }
}

export function useKitchenAlerts(data: KitchenData | null, station: StationId) {
  const [mode, setModeState] = useState<NotifyMode>(loadMode)
  const [volume, setVolumeState] = useState<number>(() => {
    const stored = loadVolume()
    setMasterVolume(stored)
    return stored
  })
  const [flashNew, setFlashNew] = useState(false)
  const modeRef = useRef(mode)
  const seenIds = useRef<ReadonlySet<string> | null>(null)
  const flashTimer = useRef<number | undefined>(undefined)

  const setMode = useCallback((next: NotifyMode) => {
    modeRef.current = next
    setModeState(next)
    saveMode(next)
    if (next === 'sound') {
      unlockAudio()
      playKitchenSound('start')
    }
  }, [])

  const setVolume = useCallback((next: number) => {
    const clamped = parseNotifyVolume(String(next))
    setMasterVolume(clamped)
    setVolumeState(clamped)
    saveVolume(clamped)
  }, [])

  const playFeedback = useCallback((sound: Exclude<KitchenSound, 'new-dish'>) => {
    if (modeRef.current === 'silent') return
    if (modeRef.current === 'sound') playKitchenSound(sound)
    vibrateDevice(sound)
  }, [])

  const previewSound = useCallback((sound: KitchenSound) => {
    unlockAudio()
    playKitchenSound(sound)
    vibrateDevice(sound)
  }, [])

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
  }, [data, station])

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
