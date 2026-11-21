import { useEffect, type ReactNode } from 'react'
import { useManagerUser } from '../../api/manager/auth'
import { Button } from '../../components/manager/ui'
import { ManagerDataProvider } from '../../hooks/manager/ManagerDataProvider'
import { useStaffGate } from '../../hooks/staff/useStaffGate'
import { ManagerLayout } from '../../layouts/ManagerLayout'
import {
  managerPath,
  matchManagerRoute,
  navigate,
  useManagerUrl,
  type ManagerPage,
} from '../../routes/managerRouter'
import ManagerDashboardPage from './ManagerDashboardPage'
import OperationsPage from './OperationsPage'
import ReservationsPage from './ReservationsPage'
import TablesPage from './TablesPage'
import OrdersPage from './OrdersPage'
import KitchenMonitorPage from './KitchenMonitorPage'
import EmployeesPage from './EmployeesPage'
import ShiftsPage from './ShiftsPage'
import MenuPage from './MenuPage'
import MenuCategoriesPage from './MenuCategoriesPage'
import ApprovalsPage from './ApprovalsPage'
import ReportsPage from './ReportsPage'
import IncidentsPage from './IncidentsPage'
import NotificationsPage from './NotificationsPage'
import ProfilePage from './ProfilePage'
import '../../components/kitchen/kitchen.css'
import '../../components/billing/billing.css'
import '../../components/manager/manager.css'
import '../../components/manager/workspace.css'

function renderPage(page: ManagerPage | 'not-found', id: string): ReactNode {
  switch (page) {
    case 'dashboard':
      return <ManagerDashboardPage />
    case 'operations':
      return <OperationsPage />
    case 'reservations':
      return <ReservationsPage key={id} selectedId={id} />
    case 'tables':
      return <TablesPage key={id} selectedId={id} />
    case 'orders':
      return <OrdersPage key={id} selectedId={id} />
    case 'kitchen':
      return <KitchenMonitorPage />
    case 'employees':
      return <EmployeesPage />
    case 'shifts':
      return <ShiftsPage />
    case 'menu':
      return <MenuPage />
    case 'categories':
      return <MenuCategoriesPage />
    case 'approvals':
      return <ApprovalsPage key={id} selectedId={id} />
    case 'reports':
      return <ReportsPage />
    case 'incidents':
      return <IncidentsPage key={id} selectedId={id} />
    case 'notifications':
      return <NotificationsPage />
    case 'profile':
      return <ProfilePage />
    default:
      return (
        <div className="m-empty">
          <h1>Không tìm thấy trang</h1>
          <p>Đường dẫn này không thuộc không gian quản lý.</p>
          <Button onClick={() => navigate(managerPath('dashboard'))}>Về tổng quan</Button>
        </div>
      )
  }
}
export default function ManagerApp() {
  const { pathname, params } = useManagerUrl()
  const user = useManagerUser()
  const route = matchManagerRoute(pathname)
  useEffect(() => {
    const root = document.documentElement
    root.classList.add('m-html')
    root.lang = 'vi'
    root.dataset.type = 'software'
    const metas = { 'page-type': 'software', 'site-kind': 'software', robots: 'noindex,nofollow' }
    const nodes = Object.entries(metas).map(([name, content]) => {
      const meta = document.createElement('meta')
      meta.name = name
      meta.content = content
      document.head.appendChild(meta)
      return meta
    })
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const previousDescription = description?.content
    if (description)
      description.content =
        'RestoSphere Manager: giám sát hoạt động, phân công nhân viên và xử lý nghiệp vụ nhà hàng.'
    const theme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    const previousTheme = theme?.content
    if (theme) theme.content = '#f4f7f6'
    document.title = 'RestoSphere · Quản lý nhà hàng'
    return () => {
      root.classList.remove('m-html')
      delete root.dataset.type
      nodes.forEach((n) => n.remove())
      if (description && previousDescription) description.content = previousDescription
      if (theme && previousTheme) theme.content = previousTheme
    }
  }, [])
  // Sign-in happens once at /staff/login; this workspace only checks the role.
  const blocked = useStaffGate('MANAGER', !!user)
  if (blocked || !user) return blocked
  return (
    <ManagerDataProvider key={user.id}>
      <ManagerLayout page={route}>{renderPage(route, params.get('id') ?? '')}</ManagerLayout>
    </ManagerDataProvider>
  )
}
