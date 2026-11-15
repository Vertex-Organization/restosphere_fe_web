import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { adminService } from '../../api/admin/service'
import type { AdminData } from '../../api/admin/types'

interface AdminDataState {
  data: AdminData | null
  loading: boolean
  error: string
  reload: () => void
}

const AdminDataContext = createContext<AdminDataState | null>(null)

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AdminData | null>(null)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    adminService.load(controller.signal).then(setData).catch((reason: unknown) => {
      if (reason instanceof DOMException && reason.name === 'AbortError') return
      setError(reason instanceof Error ? reason.message : 'Không tải được dữ liệu quản trị.')
    })
    return () => controller.abort()
  }, [reloadKey])

  const value = useMemo<AdminDataState>(() => ({
    data,
    loading: !data && !error,
    error,
    reload: () => { setError(''); setData(null); setReloadKey((value) => value + 1) },
  }), [data, error])

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>
}

// The provider and its colocated hook intentionally share the same small module.
// eslint-disable-next-line react-refresh/only-export-components
export function useAdminData() {
  const value = useContext(AdminDataContext)
  if (!value) throw new Error('useAdminData must be used inside AdminDataProvider')
  return value
}
