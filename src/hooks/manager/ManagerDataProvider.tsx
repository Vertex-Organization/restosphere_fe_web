import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { managerService } from '../../api/manager/service'
import { getManagerUser, updateManagerProfile } from '../../api/manager/auth'
import type { ManagerUser } from '../../api/manager/types'
import type { ManagerCommand, ManagerData } from '../../api/manager/types'

interface Store { data: ManagerData | null; error: string; busy: boolean; notice: string; refresh: () => Promise<void>; execute: (command: ManagerCommand) => Promise<void>; dismiss: () => void }
const Context = createContext<Store | null>(null)
export function ManagerDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ManagerData | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  useEffect(() => {
    const profile = data?.employees.find(employee => employee.id === getManagerUser()?.id)
    if (profile) updateManagerProfile(profile as typeof profile & ManagerUser)
  }, [data])
  const refresh = useCallback(async () => { try { setData(await managerService.load()); setError('') } catch (e) { setError(e instanceof Error ? e.message : 'Không tải được dữ liệu.') } }, [])
  useEffect(() => {
    let active = true
    void managerService.load().then(next => { if (active) { setData(next); setError('') } }, e => { if (active) setError(e instanceof Error ? e.message : 'Không tải được dữ liệu.') })
    const unsubscribe = managerService.subscribe(() => { void refresh() })
    return () => { active = false; unsubscribe() }
  }, [refresh])
  const execute = async (command: ManagerCommand) => {
    if (!data) throw new Error('Dữ liệu chưa sẵn sàng.')
    setBusy(true)
    try { setData(await managerService.execute(command)); setNotice('Đã lưu thay đổi.') }
    catch (e) { await refresh(); throw e }
    finally { setBusy(false) }
  }
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(''), 5000); return () => clearTimeout(timer) }, [notice])
  return <Context.Provider value={{ data, error, busy, notice, refresh, execute, dismiss: () => setNotice('') }}>{children}</Context.Provider>
}
// Shared hook and provider intentionally share their small module, matching this workspace's provider pattern.
// eslint-disable-next-line react-refresh/only-export-components
export function useManagerData() { const value = useContext(Context); if (!value) throw new Error('Missing ManagerDataProvider'); return value }
