import { useEffect, type ReactNode } from 'react'
import { useStaffGate } from '../../../hooks/staff/useStaffGate'
import { KitchenDataProvider } from '../../../hooks/kitchen/KitchenDataProvider'
import { useKitchenUser } from '../../../hooks/kitchen/useKitchenAuth'
import { KitchenLayout } from '../../../layouts/KitchenLayout'
import {
  KITCHEN_BASE,
  kitchenPaths,
  matchKitchenRoute,
  navigate,
  useKitchenUrl,
  type KitchenRoute,
} from '../../../routes/kitchenRouter'
import KitchenBoardPage from './KitchenBoardPage'
import KitchenHistoryPage from './KitchenHistoryPage'
import KitchenMenuStatusPage from './KitchenMenuStatusPage'
import KitchenNotificationsPage from './KitchenNotificationsPage'
import KitchenProfilePage from './KitchenProfilePage'
import KitchenTicketPage from './KitchenTicketPage'
import '../../../components/kitchen/kitchen.css'
import './kitchenPages.css'

const TITLES: Record<KitchenRoute['name'], string> = {
  board: 'Bảng bếp',
  ticket: 'Chi tiết phiếu',
  history: 'Lịch sử chế biến',
  'menu-status': 'Tình trạng món',
  notifications: 'Thông báo',
  profile: 'Cá nhân',
  dev: 'Mô phỏng (dev)',
  'not-found': 'Không tìm thấy trang',
}

function page(route: KitchenRoute): ReactNode {
  switch (route.name) {
    case 'board':
      return <KitchenBoardPage />
    case 'ticket':
      return <KitchenTicketPage key={route.id} id={route.id} />
    case 'history':
      return <KitchenHistoryPage />
    case 'menu-status':
      return <KitchenMenuStatusPage />
    case 'notifications':
      return <KitchenNotificationsPage />
    case 'profile':
      return <KitchenProfilePage />
    default:
      return (
        <div className="k-state">
          <p className="k-state-title">Không tìm thấy trang</p>
          <p>Đường dẫn này không thuộc khu vực Bếp.</p>
          <a className="k-btn k-btn--primary" href={kitchenPaths.board}>
            Về bảng bếp
          </a>
        </div>
      )
  }
}

/** Entry of the kitchen workspace (/staff/kitchen): its own shell, never the customer header/footer.
 * Sign-in happens once at /staff/login; this module only checks the role. */
export default function KitchenApp() {
  const { pathname } = useKitchenUrl()
  const route = matchKitchenRoute(pathname)
  const user = useKitchenUser()

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('kds-html')
    root.lang = 'vi'
    return () => root.classList.remove('kds-html')
  }, [])

  useEffect(() => {
    if (pathname === `${KITCHEN_BASE}/incidents`) navigate(kitchenPaths.board, { replace: true })
  }, [pathname])

  const blocked = useStaffGate('KITCHEN', !!user)
  if (blocked || !user) return blocked

  return (
    <KitchenDataProvider key={user.id} user={user}>
      <KitchenLayout
        route={route}
        title={TITLES[route.name]}
        fill={route.name === 'board' || route.name === 'history'}
      >
        {page(route)}
      </KitchenLayout>
    </KitchenDataProvider>
  )
}
