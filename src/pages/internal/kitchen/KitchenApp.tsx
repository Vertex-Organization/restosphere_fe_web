import { lazy, Suspense, useEffect, type ReactNode } from 'react'
import { KitchenDataProvider } from '../../../hooks/kitchen/KitchenDataProvider'
import { useKitchenUser } from '../../../hooks/kitchen/useKitchenAuth'
import { KitchenLayout } from '../../../layouts/KitchenLayout'
import { kitchenPaths, matchKitchenRoute, navigate, useKitchenUrl, type KitchenRoute } from '../../../routes/kitchenRouter'
import KitchenAccessDenied from './KitchenAccessDenied'
import KitchenBoardPage from './KitchenBoardPage'
import KitchenHistoryPage from './KitchenHistoryPage'
import KitchenIncidentsPage from './KitchenIncidentsPage'
import KitchenLoginPage from './KitchenLoginPage'
import KitchenMenuStatusPage from './KitchenMenuStatusPage'
import KitchenNotificationsPage from './KitchenNotificationsPage'
import KitchenProfilePage from './KitchenProfilePage'
import KitchenTicketPage from './KitchenTicketPage'
import '../../../components/kitchen/kitchen.css'
import './kitchenPages.css'

// Development-only simulator; removed from production builds.
const KitchenDevPage = import.meta.env.DEV ? lazy(() => import('./KitchenDevPage')) : null

function Redirect({ to }: { to: string }) {
  useEffect(() => { navigate(to, { replace: true }) }, [to])
  return null
}

const TITLES: Record<KitchenRoute['name'], string> = {
  board: 'Bảng bếp',
  ticket: 'Chi tiết phiếu',
  history: 'Lịch sử chế biến',
  incidents: 'Sự cố',
  'menu-status': 'Tình trạng món',
  notifications: 'Thông báo',
  profile: 'Cá nhân',
  login: 'Đăng nhập',
  dev: 'Mô phỏng (dev)',
  'not-found': 'Không tìm thấy trang',
}

function page(route: KitchenRoute, params: URLSearchParams, url: string): ReactNode {
  switch (route.name) {
    case 'board': return <KitchenBoardPage />
    case 'ticket': return <KitchenTicketPage key={route.id} id={route.id} />
    case 'history': return <KitchenHistoryPage />
    // Re-mount when a new ticket is passed in so the form starts prefilled.
    case 'incidents': return <KitchenIncidentsPage key={url} orderId={params.get('order') ?? ''} itemId={params.get('item') ?? ''} />
    case 'menu-status': return <KitchenMenuStatusPage />
    case 'notifications': return <KitchenNotificationsPage />
    case 'profile': return <KitchenProfilePage />
    case 'dev': return KitchenDevPage ? <Suspense fallback={null}><KitchenDevPage /></Suspense> : null
    default: return (
      <div className="k-state">
        <p className="k-state-title">Không tìm thấy trang</p>
        <p>Đường dẫn này không thuộc khu vực Bếp.</p>
        <a className="k-btn k-btn--primary" href={kitchenPaths.board}>Về bảng bếp</a>
      </div>
    )
  }
}

/** Entry of the /kitchen module: its own shell, never the customer header/footer. */
export default function KitchenApp() {
  const { url, pathname, params } = useKitchenUrl()
  const route = matchKitchenRoute(pathname)
  const user = useKitchenUser()

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('kds-html')
    root.lang = 'vi'
    return () => root.classList.remove('kds-html')
  }, [])

  if (route.name === 'login') {
    const next = params.get('next')
    const target = next && next.startsWith('/kitchen') && !next.startsWith(kitchenPaths.login) ? next : kitchenPaths.board
    if (user?.role === 'KITCHEN') return <Redirect to={target} />
    return <KitchenLoginPage next={target} />
  }
  if (!user) return <Redirect to={`${kitchenPaths.login}?next=${encodeURIComponent(url)}`} />
  if (user.role !== 'KITCHEN') return <KitchenAccessDenied user={user} />

  return (
    <KitchenDataProvider key={user.id} user={user}>
      <KitchenLayout route={route} title={TITLES[route.name]} fill={route.name === 'board' || route.name === 'history'}>
        {page(route, params, url)}
      </KitchenLayout>
    </KitchenDataProvider>
  )
}
