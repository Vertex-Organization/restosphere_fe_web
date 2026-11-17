import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { AuthUser } from '../api/auth'
import { adminSignOut } from '../api/admin/auth'
import { BrandLogo } from '../components/kitchen/BrandLogo'
import { AdminLink, ErrorState, Icon, LoadingState } from '../components/admin/ui'
import { useAdminData } from '../hooks/admin/AdminDataProvider'
import { adminPath, type AdminPage } from '../routes/adminRouter'
import { WORKSPACES } from '../routes/staffRouter'
import type { IconName } from '../components/billing/Icon'

const NAV_ITEMS: { page: AdminPage; label: string; icon: IconName }[] = [
  { page: 'dashboard', label: 'Tổng quan', icon: 'board' },
  { page: 'users', label: 'Tài khoản', icon: 'users' },
  { page: 'roles', label: 'Phân quyền', icon: 'checkCircle' },
  { page: 'restaurant', label: 'Thông tin nhà hàng', icon: 'utensils' },
  { page: 'settings', label: 'Cài đặt', icon: 'edit' },
  { page: 'audit-logs', label: 'Nhật ký hoạt động', icon: 'history' },
]

const ADMIN_TITLES: Record<AdminPage, string> = {
  dashboard: 'Tổng quan',
  users: 'Quản lý tài khoản',
  roles: 'Phân quyền',
  restaurant: 'Thông tin nhà hàng',
  settings: 'Cài đặt',
  'audit-logs': 'Nhật ký hoạt động',
}

function initials(name: string) {
  const words = name.trim().split(/\s+/)
  return words.slice(-2).map((word) => word[0]).join('').toUpperCase()
}

export function AdminLayout({ page, user, children }: { page: AdminPage | 'not-found'; user: AuthUser; children: ReactNode }) {
  const { data, loading, error, reload } = useAdminData()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const main = useRef<HTMLElement>(null)
  const sidebar = useRef<HTMLElement>(null)
  const title = page === 'not-found' ? 'Không tìm thấy trang' : ADMIN_TITLES[page]

  useEffect(() => {
    document.title = `${title} · RestoSphere Admin`
    main.current?.scrollTo(0, 0)
  }, [page, title])

  useEffect(() => {
    if (!mobileOpen) return
    const previous = document.activeElement as HTMLElement | null
    const elements = () => [...(sidebar.current?.querySelectorAll<HTMLElement>('a,button') ?? [])].filter((element) => element.getClientRects().length > 0)
    elements()[0]?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false)
      if (event.key !== 'Tab') return
      const controls = elements()
      const first = controls[0]
      const last = controls.at(-1)
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('keydown', onKeyDown); previous?.focus() }
  }, [mobileOpen])

  const signOut = adminSignOut

  return <div className={`a-app ${collapsed ? 'a-app--collapsed' : ''}`}>
    <a className="a-skip" href="#admin-main">Đến nội dung chính</a>
    {mobileOpen && <button type="button" className="a-nav-backdrop" aria-label="Đóng điều hướng" onClick={() => setMobileOpen(false)} />}
    <aside ref={sidebar} className={`a-sidebar ${mobileOpen ? 'is-open' : ''}`} aria-label="Điều hướng quản trị">
      <AdminLink className="a-brand" to={adminPath('dashboard')} onClick={() => setMobileOpen(false)}><BrandLogo width={148} /><span>Không gian Admin</span></AdminLink>
      <nav className="a-nav-list">{NAV_ITEMS.map((item) => <AdminLink key={item.page} className="a-nav-item" to={adminPath(item.page)} title={item.label} aria-current={item.page === page ? 'page' : undefined} onClick={() => setMobileOpen(false)}><Icon name={item.icon} size={18} /><span>{item.label}</span></AdminLink>)}</nav>
      <div className="a-sidebar-foot"><div className="a-restaurant-chip"><span><Icon name="utensils" size={17} /></span><div><strong>{data?.restaurant.name ?? 'RestoSphere'}</strong><small>Nhà hàng đang quản lý</small></div></div><button type="button" className="a-nav-item a-collapse" aria-expanded={!collapsed} aria-label={collapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'} onClick={() => setCollapsed((value) => !value)}><Icon name={collapsed ? 'chevronRight' : 'chevronLeft'} size={18} /><span>Thu gọn thanh bên</span></button></div>
    </aside>

    <div className="a-shell">
      <header className="a-topbar"><div className="a-topbar-left"><button type="button" className="a-icon-button a-menu-button" aria-label="Mở điều hướng" aria-expanded={mobileOpen} onClick={() => setMobileOpen((value) => !value)}><Icon name="list" size={20} /></button><div className="a-breadcrumb"><span>Quản trị</span><Icon name="chevronRight" size={13} /><strong>{title}</strong></div></div><div className="a-topbar-right"><label className="a-role-switcher"><span className="a-sr-only">Chuyển giao diện</span><Icon name="refresh" size={15} /><select aria-label="Chuyển giao diện" defaultValue={WORKSPACES.ADMIN.base} onChange={(event) => window.location.assign(event.target.value)}><option value={WORKSPACES.ADMIN.base}>Admin</option><option value={WORKSPACES.MANAGER.base}>Manager</option><option value={WORKSPACES.KITCHEN.base}>Kitchen</option><option value={WORKSPACES.CASHIER.base}>Cashier</option><option value="/">Customer</option></select></label><div className="a-account-wrap"><button type="button" className="a-account" aria-expanded={accountOpen} onClick={() => setAccountOpen((value) => !value)}><span className="a-avatar">{initials(user.fullName)}</span><span><strong>{user.fullName}</strong><small>Quản trị hệ thống</small></span><Icon name="chevronDown" size={13} /></button>{accountOpen && <div className="a-account-menu"><div><strong>{user.fullName}</strong><span>{user.email}</span></div><button type="button" onClick={signOut}><Icon name="logout" size={16} />Đăng xuất</button></div>}</div></div></header>
      <main ref={main} id="admin-main" tabIndex={-1} className="a-content">{error ? <ErrorState message={error} onRetry={reload} /> : loading ? <LoadingState /> : children}<footer className="a-workspace-footer"><span>RestoSphere · Admin Web</span><span>Dữ liệu từ máy chủ</span></footer></main>
    </div>
  </div>
}
