import { useEffect, useState } from 'react'
import { menuService } from '../api/menu/service'
import type { MenuData } from '../api/menu/types'

type MenuState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; data: MenuData }

export function useMenuData() {
  const [state, setState] = useState<MenuState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    const load = () => {
      menuService.load().then(
        (data) => { if (active) setState({ status: 'ready', data }) },
        () => { if (active) setState((current) => (current.status === 'ready' ? current : { status: 'error' })) },
      )
    }
    load()
    const unsubscribe = menuService.subscribe(load)
    return () => { active = false; unsubscribe() }
  }, [attempt])

  const retry = () => {
    setState({ status: 'loading' })
    setAttempt((n) => n + 1)
  }

  return { state, retry }
}
