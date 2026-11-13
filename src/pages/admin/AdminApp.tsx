import { useEffect, type ReactNode } from 'react'
import { AdminDataProvider } from '../../hooks/admin/AdminDataProvider'
import { AdminLayout } from '../../layouts/AdminLayout'
import { Button, Icon } from '../../components/admin/ui'
import { adminSignOut, useAdminUser } from '../../api/admin/auth'
import { matchAdminRoute, navigate, useAdminUrl, type AdminPage } from '../../routes/adminRouter'
import AdminLoginPage from './AdminLoginPage'
import AdminDashboardPage from './AdminDashboardPage'
import AdminUsersPage from './AdminUsersPage'
import AdminRolesPage from './AdminRolesPage'
import AdminRestaurantPage from './AdminRestaurantPage'
import AdminSettingsPage from './AdminSettingsPage'
import AdminAuditLogsPage from './AdminAuditLogsPage'
import '../../components/admin/admin.css'

function Redirect({ to }: { to: string }) {
  useEffect(() => { navigate(to, { replace: true }) }, [to])
  return null
}

function renderPage(page: AdminPage | 'not-found'): ReactNode {
  switch (page) {
    case 'dashboard': return <AdminDashboardPage />
    case 'users': return <AdminUsersPage />
    case 'roles': return <AdminRolesPage />
    case 'restaurant': return <AdminRestaurantPage />
    case 'settings': return <AdminSettingsPage />
    case 'audit-logs': return <AdminAuditLogsPage />
    default: return <div className="a-empty a-not-found"><span className="a-empty-icon"><Icon name="alert" size={22} /></span><div><h1>Không tìm thấy trang</h1><p>Đường dẫn này không thuộc không gian Admin.</p></div><Button onClick={() => navigate('/admin')}>Về tổng quan</Button></div>
  }
}

export default function AdminApp() {
  const { url, pathname, params } = useAdminUrl()
  const route = matchAdminRoute(pathname)
  const user = useAdminUser()

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('a-html')
    root.lang = 'vi'
    root.dataset.type = 'software'
    root.dataset.radius = 'soft'
    const metas = { 'page-type': 'software', 'site-kind': 'software', robots: 'noindex,nofollow' }
    const nodes = Object.entries(metas).map(([name, content]) => { const meta = document.createElement('meta'); meta.name = name; meta.content = content; document.head.appendChild(meta); return meta })
    const theme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const oldTheme = theme?.content
    const oldDescription = description?.content
    if (theme) theme.content = '#f4f7f6'
    if (description) description.content = 'RestoSphere Admin: quản lý tài khoản, vai trò và cấu hình cơ bản của nhà hàng.'
    return () => { root.classList.remove('a-html'); delete root.dataset.type; delete root.dataset.radius; nodes.forEach((node) => node.remove()); if (theme && oldTheme) theme.content = oldTheme; if (description && oldDescription) description.content = oldDescription }
  }, [])

  if (route === 'login') {
    const requested = params.get('next')
    const next = requested && (requested === '/admin' || requested.startsWith('/admin/')) && !requested.startsWith('/admin/login') ? requested : '/admin'
    if (user?.role === 'ADMIN') return <Redirect to={next} />
    return <AdminLoginPage next={next} />
  }

  if (!user) return <Redirect to={`/admin/login?next=${encodeURIComponent(url)}`} />

  if (user.role !== 'ADMIN') return <main className="a-access-denied"><div><span className="a-empty-icon"><Icon name="alert" size={22} /></span><h1>Không có quyền truy cập</h1><p>Phiên demo hiện tại không có vai trò ADMIN.</p><Button tone="primary" onClick={() => { adminSignOut(); navigate('/admin/login', { replace: true }) }}>Đăng nhập tài khoản khác</Button></div></main>

  return <AdminDataProvider><AdminLayout page={route} user={user}>{renderPage(route)}</AdminLayout></AdminDataProvider>
}
