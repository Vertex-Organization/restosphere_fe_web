import { useCallback, useRef, useState } from 'react'
import { parseNotifyMode, parseNotifyVolume, type NotifyMode } from '../../api/kitchen/alerts'
import {
  playKitchenSound,
  setMasterVolume,
  unlockAudio,
  vibrateDevice,
  type KitchenSound,
} from '../../components/kitchen/notifySound'

export interface NotifyStorageKeys {
  mode: string
  volume: string
}

function read(key: string) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    return
  }
}

/** Remembered notification mode and volume, shared by the kitchen and cashier shells. */
export function useNotifyPrefs(keys: NotifyStorageKeys) {
  const [mode, setModeState] = useState<NotifyMode>(() => parseNotifyMode(read(keys.mode)))
  const [volume, setVolumeState] = useState<number>(() => {
    const stored = parseNotifyVolume(read(keys.volume))
    setMasterVolume(stored)
    return stored
  })
  const modeRef = useRef(mode)

  const setMode = useCallback(
    (next: NotifyMode) => {
      modeRef.current = next
      setModeState(next)
      write(keys.mode, next)
      if (next === 'sound') {
        unlockAudio()
        playKitchenSound('start')
      }
    },
    [keys.mode],
  )

  const setVolume = useCallback(
    (next: number) => {
      const clamped = parseNotifyVolume(String(next))
      setMasterVolume(clamped)
      setVolumeState(clamped)
      write(keys.volume, String(clamped))
    },
    [keys.volume],
  )

  const previewSound = useCallback((sound: KitchenSound) => {
    unlockAudio()
    playKitchenSound(sound)
    vibrateDevice(sound)
  }, [])

  return { mode, modeRef, setMode, volume, setVolume, previewSound }
}
