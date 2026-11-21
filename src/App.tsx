import {
  Component,
  lazy,
  Suspense,
  useLayoutEffect,
  useSyncExternalStore,
  type ComponentType,
  type ErrorInfo,
  type ReactNode,
} from 'react'
import {
  advanceAppProgress,
  beginAppProgress,
  completeAppProgress,
  getAppProgress,
  subscribeAppProgress,
} from './appProgress'
import { isCashierPath } from './routes/cashierRouter'
import { isKitchenPath, useKitchenUrl as useAppUrl } from './routes/kitchenRouter'
import { isManagerPath } from './routes/managerRouter'
import { isAdminPath } from './routes/adminRouter'
import { isStaffPath } from './routes/staffRouter'

const lazyRetryKey = 'restosphere.lazy-retry-at'

function paintProgressStage() {
  return new Promise<void>((resolve) => {
    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      window.clearTimeout(fallback)
      resolve()
    }
    const fallback = window.setTimeout(finish, 100)
    window.requestAnimationFrame(() => window.setTimeout(finish, 0))
  })
}

function lazyRoute<T extends ComponentType>(label: string, load: () => Promise<{ default: T }>) {
  return lazy(async () => {
    const progressRun = beginAppProgress(label)
    try {
      const module = await load()
      advanceAppProgress(progressRun, label)
      // Paint the real "bundle loaded, rendering" milestone before React
      // starts the potentially expensive route render.
      await paintProgressStage()
      sessionStorage.removeItem(lazyRetryKey)
      return module
    } catch (error) {
      const retryable =
        error instanceof TypeError &&
        /dynamically imported module|module script/i.test(error.message)
      let shouldRetry = false
      if (retryable) {
        try {
          const retriedAt = Number(sessionStorage.getItem(lazyRetryKey) || 0)
          shouldRetry = Date.now() - retriedAt > 10_000
          if (shouldRetry) sessionStorage.setItem(lazyRetryKey, String(Date.now()))
        } catch {
          // If storage is unavailable, show the error state instead of risking a reload loop.
        }
      }
      if (!shouldRetry) throw error
      window.location.reload()
      return await new Promise<never>(() => {})
    }
  })
}

// Root modules are loaded only on their own paths.
const KitchenApp = lazyRoute('giao diện Bếp', () => import('./pages/internal/kitchen/KitchenApp'))
const CashierApp = lazyRoute(
  'giao diện Thu ngân',
  () => import('./pages/internal/billing/CashierApp'),
)
const ManagerApp = lazyRoute('giao diện Quản lý', () => import('./pages/manager/ManagerApp'))
const AdminApp = lazyRoute('giao diện Quản trị', () => import('./pages/admin/AdminApp'))
const StaffApp = lazyRoute('trang đăng nhập', () => import('./pages/staff/StaffApp'))
const SiteApp = lazyRoute('website nhà hàng', () => import('./components/sites/sea-crown/SiteApp'))

function AppLoading() {
  const progress = useSyncExternalStore(subscribeAppProgress, getAppProgress, getAppProgress)
  return (
    <div className="app-boot" role="status" aria-live="polite" aria-busy="true">
      <div className="app-progress">
        <div className="app-progress__meta">
          <strong>RestoSphere</strong>
          <span>{progress.value}%</span>
        </div>
        <div
          className="app-progress__track"
          role="progressbar"
          aria-label={progress.label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress.value}
        >
          <span className="app-progress__value" style={{ width: `${progress.value}%` }} />
        </div>
        <p>{progress.label}</p>
      </div>
    </div>
  )
}

function RouteCommit({ children, path }: { children: ReactNode; path: string }) {
  useLayoutEffect(() => {
    completeAppProgress()
  }, [path])
  return children
}

class AppErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unable to render application route', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="app-boot app-boot--error" role="alert">
        <strong>Không thể mở giao diện</strong>
        <span>Trình duyệt chưa tải được mã nguồn mới nhất.</span>
        <button type="button" onClick={() => window.location.reload()}>
          Tải lại trang
        </button>
      </div>
    )
  }
}

function App() {
  // The root must react to history navigation as well as browser reloads. Each
  // workspace has its own lazy app, but moving between them stays client-side.
  const { pathname: path } = useAppUrl()
  let content: ReactNode
  if (isAdminPath(path)) content = <AdminApp />
  else if (isKitchenPath(path)) content = <KitchenApp />
  else if (isCashierPath(path)) content = <CashierApp />
  else if (isManagerPath(path)) content = <ManagerApp />
  else if (isStaffPath(path)) content = <StaffApp />
  else content = <SiteApp />
  return (
    <AppErrorBoundary key={path}>
      <Suspense fallback={<AppLoading />}>
        <RouteCommit path={path}>{content}</RouteCommit>
      </Suspense>
    </AppErrorBoundary>
  )
}

export default App
