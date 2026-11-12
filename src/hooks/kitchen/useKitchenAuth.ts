import { useSyncExternalStore } from 'react'
import { getKitchenUser, subscribeKitchenAuth } from '../../api/kitchen/auth'

export function useKitchenUser() {
  return useSyncExternalStore(subscribeKitchenAuth, getKitchenUser)
}
