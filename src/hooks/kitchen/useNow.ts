import { useSyncExternalStore } from 'react'

// One shared clock for every timer on screen, refreshed every 10 seconds so
// minute counters stay correct without re-rendering each second.

const TICK_MS = 10_000
let now = Date.now()
let timer = 0
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (!timer) {
    now = Date.now()
    timer = window.setInterval(() => {
      now = Date.now()
      listeners.forEach((l) => l())
    }, TICK_MS)
  }
  return () => {
    listeners.delete(listener)
    if (!listeners.size) {
      window.clearInterval(timer)
      timer = 0
    }
  }
}

export function useNow() {
  return useSyncExternalStore(subscribe, () => now)
}
