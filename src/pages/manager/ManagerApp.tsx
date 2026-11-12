import { useEffect, type ReactNode } from 'react'
import { useManagerUser, managerSignOut } from '../../api/manager/auth'
import { Button } from '../../components/manager/ui'
import { ManagerDataProvider } from '../../hooks/manager/ManagerDataProvider'
import { ManagerLayout } from '../../layouts/ManagerLayout'
import { matchManagerRoute, navigate, useManagerUrl, type ManagerPage } from '../../routes/managerRouter'
import ManagerLoginPage from './ManagerLoginPage'
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

function Redirect({ to }: { to: string }) { useEffect(() => { navigate(to, { replace: true }) }, [to]); return null }
function renderPage(page: ManagerPage | 'not-found', id: string): ReactNode {
  switch (page) {
    case 'dashboard': return <ManagerDashboardPage />
    case 'operations': return <OperationsPage />
    case 'reservations': return <ReservationsPage key={id} selectedId={id} />
    case 'tables': return <TablesPage key={id} selectedId={id} />
    case 'orders': return <OrdersPage key={id} selectedId={id} />
    case 'kitchen': return <KitchenMonitorPage />
    case 'employees': return <EmployeesPage />
    case 'shifts': return <ShiftsPage />
    case 'menu': return <MenuPage />
    case 'categories': return <MenuCategoriesPage />
    case 'approvals': return <ApprovalsPage key={id} selectedId={id} />
    case 'reports': return <ReportsPage />
    case 'incidents': return <IncidentsPage key={id} selectedId={id} />
    case 'notifications': return <NotificationsPage />
    case 'profile': return <ProfilePage />
    default: return <div className="m-empty"><h1>Không tìm thấy trang</h1><p>Đường dẫn này không thuộc không gian quản lý.</p><Button onClick={() => navigate('/manager')}>Về tổng quan</Button></div>
  }
}
export default function ManagerApp() {
  const { url, pathname, params } = useManagerUrl(); const user = useManagerUser(); const route = matchManagerRoute(pathname)
  useEffect(() => {
    const root = document.documentElement
    root.classList.add('m-html'); root.lang = 'vi'; root.dataset.type = 'software'
    const metas = { 'page-type': 'software', 'site-kind': 'software', robots: 'noindex,nofollow' }
    const nodes = Object.entries(metas).map(([name, content]) => { const meta = document.createElement('meta'); meta.name = name; meta.content = content; document.head.appendChild(meta); return meta })
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const previousDescription = description?.content
    if (description) description.content = 'RestoSphere Manager: giám sát hoạt động, phân công nhân viên và xử lý nghiệp vụ nhà hàng.'
    const theme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    const previousTheme = theme?.content
    if (theme) theme.content = '#f4f7f6'
    document.title = 'RestoSphere · Quản lý nhà hàng'
    return () => { root.classList.remove('m-html'); delete root.dataset.type; nodes.forEach(n => n.remove()); if (description && previousDescription) description.content = previousDescription; if (theme && previousTheme) theme.content = previousTheme }
  }, [])
  if (route === 'login') {
    const requested = params.get('next')
    const next = requested && (requested === '/manager' || requested.startsWith('/manager/')) && !requested.startsWith('/manager/login') ? requested : '/manager'
    return user?.role === 'MANAGER' ? <Redirect to={next} /> : <ManagerLoginPage next={next} />
  }
  if (!user) return <Redirect to={`/manager/login?next=${encodeURIComponent(url)}`} />
  if (user.role !== 'MANAGER') return <div className="kds m-login"><div className="m-login-card"><h1>Không có quyền truy cập</h1><p>Tài khoản hiện tại không có vai trò Quản lý nhà hàng.</p><Button onClick={() => { managerSignOut(); navigate('/manager/login', { replace: true }) }}>Đăng nhập tài khoản khác</Button></div></div>
  return <ManagerDataProvider key={user.id}><ManagerLayout page={route}>{renderPage(route, params.get('id') ?? '')}</ManagerLayout></ManagerDataProvider>
}
