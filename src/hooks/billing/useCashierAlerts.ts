import { useEffect, useRef } from 'react'
import { dueTableCount, paymentRequestArrived } from '../../api/billing/alerts'
import type { CashierData } from '../../api/billing/types'
import { playKitchenSound, vibrateDevice } from '../../components/kitchen/notifySound'
import { useNotifyPrefs } from '../kitchen/useNotifyPrefs'

const KEYS = {
  mode: 'restosphere.cashier.notifyMode',
  volume: 'restosphere.cashier.notifyVolume',
}

export function useCashierAlerts(data: CashierData | null) {
  const { mode, modeRef, setMode, volume, setVolume, previewSound } = useNotifyPrefs(KEYS)
  const lastDue = useRef<number | null>(null)

  useEffect(() => {
    if (!data) return
    const due = dueTableCount(data, Date.now())
    const arrived = paymentRequestArrived(lastDue.current, due)
    lastDue.current = due
    if (!arrived || modeRef.current === 'silent') return
    if (modeRef.current === 'sound') playKitchenSound('new-dish')
    vibrateDevice('new-dish')
  }, [data, modeRef])

  return {
    notifyMode: mode,
    setNotifyMode: setMode,
    notifyVolume: volume,
    setNotifyVolume: setVolume,
    previewSound,
  }
}
