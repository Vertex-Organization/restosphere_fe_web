import { createContext, useContext } from 'react'

export const LocationContext = createContext({ pathname: '/', isAnimating: false })

export function useSiteLocation() {
  return useContext(LocationContext)
}
