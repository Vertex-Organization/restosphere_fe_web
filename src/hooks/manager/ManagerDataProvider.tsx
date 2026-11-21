import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { managerService } from '../../api/manager/service'
import { updateManagerProfile } from '../../api/manager/auth'
import type { ManagerCommand, ManagerData } from '../../api/manager/types'

interface Store {
  data: ManagerData | null
  error: string
  busy: boolean
  notice: string
  refresh: () => Promise<void>
  execute: (command: ManagerCommand) => Promise<void>
  dismiss: () => void
}
const Context = createContext<Store | null>(null)
export function ManagerDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ManagerData | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const loading = useRef<Promise<void> | null>(null)
  useEffect(() => {
    if (data?.me) updateManagerProfile(data.me)
  }, [data])
  const refresh = useCallback((): Promise<void> => {
    if (loading.current) return loading.current
    const request = managerService.load().then(
      (next) => {
        setData(next)
        setError('')
      },
      (e: unknown) => {
        setError(e instanceof Error ? e.message : 'Không tải được dữ liệu.')
      },
    )
    loading.current = request
    void request.finally(() => {
      if (loading.current === request) loading.current = null
    })
    return request
  }, [])
  useEffect(() => {
    void refresh()
    const unsubscribe = managerService.subscribe(() => {
      void refresh()
    })
    return unsubscribe
  }, [refresh])
  const execute = async (command: ManagerCommand) => {
    if (!data) throw new Error('Dữ liệu chưa sẵn sàng.')
    setBusy(true)
    try {
      setData(await managerService.execute(command))
      setError('')
      setNotice('Đã lưu thay đổi.')
    } catch (e) {
      await refresh()
      throw e
    } finally {
      setBusy(false)
    }
  }
  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 5000)
    return () => clearTimeout(timer)
  }, [notice])
  return (
    <Context.Provider
      value={{ data, error, busy, notice, refresh, execute, dismiss: () => setNotice('') }}
    >
      {children}
    </Context.Provider>
  )
}
// Shared hook and provider intentionally share their small module, matching this workspace's provider pattern.
// eslint-disable-next-line react-refresh/only-export-components
export function useManagerData() {
  const value = useContext(Context)
  if (!value) throw new Error('Missing ManagerDataProvider')
  return value
}
