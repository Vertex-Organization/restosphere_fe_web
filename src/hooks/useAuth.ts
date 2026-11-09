import { useEffect, useSyncExternalStore } from 'react'
import { getAuthState, restoreAuth, subscribeAuth } from '../api/auth'

export default function useAuth() {
  const state = useSyncExternalStore(subscribeAuth, getAuthState)
  useEffect(() => { void restoreAuth() }, [])
  return state
}
