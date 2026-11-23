import { useCallback, useState } from 'react'
import { parseStationId, type StationId } from '../../api/kitchen/stations'

const STORAGE_KEY = 'restosphere.kitchen.station'

function loadStation(): StationId {
  try {
    return parseStationId(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    return parseStationId(null)
  }
}

export function useKitchenStation() {
  const [station, setStationState] = useState<StationId>(loadStation)

  const setStation = useCallback((next: StationId) => {
    setStationState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      return
    }
  }, [])

  return { station, setStation }
}
