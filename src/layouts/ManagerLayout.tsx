import { useEffect, useRef, useState, type ReactNode } from 'react'
import { managerSignOut, useManagerUser } from '../api/manager/auth'
import { dateLabel, time } from '../api/manager/dates'
import { useManagerData } from '../hooks/manager/ManagerDataProvider'
import { Icon, Link } from '../components/manager/ui'
import type { IconName } from '../components/billing/Icon'
import { BrandLogo } from '../components/kitchen/BrandLogo'
import { useNow } from '../hooks/kitchen/useNow'
import { managerPath, type ManagerPage } from '../routes/managerRouter'

const NAV: { page: ManagerPage; label: string; icon: IconName; children?: ManagerPage[]; group?: string }[] = [
  { page: 'dashboard', label: 'Tổng quan', icon: 'board', group: 'Vận hành' },
  { page: 'operations', label: 'Giám sát vận hành', icon: 'history' },
  { page: 'reservations', label: 'Đặt bàn & khu vực', icon: 'users', children: ['tables'] },
  { page: 'orders', label: 'Đơn hàng & bếp', icon: 'receipt', children: ['kitchen'] },
  { page: 'employees', label: 'Nhân viên & ca làm', icon: 'user', children: ['shifts'], group: 'Quản lý' },
  { page: 'menu', label: 'Thực đơn', icon: 'utensils', children: ['categories'] },
  { page: 'approvals', label: 'Phê duyệt', icon: 'checkCircle' },
  { page: 'reports', label: 'Báo cáo', icon: 'list' },
  { page: 'incidents', label: 'Sự cố', icon: 'flag' },
  { page: 'notifications', label: 'Thông báo', icon: 'bell', group: 'Tài khoản' },
  { page: 'profile', label: 'Cá nhân', icon: 'user' },
]
const MANAGER_TITLES: Record<ManagerPage, string> = { dashboard: 'Tổng quan', operations: 'Giám sát vận hành', reservations: 'Quản lý đặt bàn', tables: 'Bàn & khu vực', orders: 'Giám sát đơn hàng', kitchen: 'Giám sát bếp', employees: 'Nhân viên', shifts: 'Ca làm', menu: 'Thực đơn', categories: 'Danh mục thực đơn', approvals: 'Phê duyệt', reports: 'Doanh thu & báo cáo', incidents: 'Sự cố', notifications: 'Thông báo', profile: 'Cá nhân' }
export function ManagerLayout({ page, children }: { page: ManagerPage | 'not-found'; children: ReactNode }) {
  const { data, error, notice, refresh, dismiss } = useManagerData()
  const user = useManagerUser()!
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const content = useRef<HTMLElement>(null)
  const sidebar = useRef<HTMLElement>(null)
  const now = useNow()
  const pending = data?.approvals.filter(a => a.status === 'PENDING').length ?? 0
  const unread = data?.notifications.filter(n => !n.readBy.includes(user.id)).length ?? 0
  useEffect(() => { document.title = `${page === 'not-found' ? 'Không tìm thấy trang' : MANAGER_TITLES[page]} · RestoSphere Manager`; content.current?.scrollTo(0, 0) }, [page])
  useEffect(() => {
    if (!mobileOpen) return
    const previous = document.activeElement as HTMLElement | null
    const items = () => [...(sidebar.current?.querySelectorAll<HTMLElement>('a,button') ?? [])].filter(el => el.getClientRects().length)
    items()[0]?.focus()
    const keydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
      if (e.key === 'Tab') {
        const controls = items(); const first = controls[0]; const last = controls.at(-1)
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus() }
      }
    }
    document.addEventListener('keydown', keydown)
    return () => { document.removeEventListener('keydown', keydown); previous?.focus() }
  }, [mobileOpen])
  const signOut = managerSignOut
  const closeNavigation = () => setMobileOpen(false)
  return <div className={`kds m-app ${collapsed ? 'm-app--collapsed' : ''}`}>
    <a className="m-skip" href="#manager-main">Đến nội dung chính</a>
    {mobileOpen && <button type="button" className="m-nav-backdrop" aria-label="Đóng điều hướng" onClick={closeNavigation} />}
    <aside ref={sidebar} className={`m-sidebar ${mobileOpen ? 'is-open' : ''}`} aria-label="Điều hướng quản lý">
      <Link className="m-brand" to={managerPath('dashboard')} onClick={closeNavigation}><BrandLogo width={158} /><span>Quản lý nhà hàng</span></Link>
      <nav className="m-nav">{NAV.map(item => <div key={item.page}>{item.group && <p className="m-nav-group">{item.group}</p>}<Link className="m-nav-link" to={managerPath(item.page)} title={item.label} onClick={closeNavigation} aria-current={item.page === page || item.children?.includes(page as ManagerPage) ? 'page' : undefined}><Icon name={item.icon} size={18} /><span>{item.label}</span>{item.page === 'approvals' && pending > 0 && <b>{pending}</b>}{item.page === 'notifications' && unread > 0 && <b>{unread}</b>}</Link></div>)}</nav>
      <div className="m-sidebar-foot"><div className="m-branch"><span className="m-branch-symbol"><Icon name="utensils" size={18} /></span><div><strong>The Sea's Crown</strong><small>Không gian vận hành</small></div></div><button className="m-nav-link" type="button" onClick={() => setCollapsed(v => !v)} aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'} aria-expanded={!collapsed}><Icon name={collapsed ? 'chevronRight' : 'chevronLeft'} /><span>Thu gọn thanh bên</span></button><button className="m-nav-link" type="button" onClick={signOut} title="Đăng xuất"><Icon name="logout" /><span>Đăng xuất</span></button></div>
    </aside>
    <div className="m-main"><header className="m-header"><div className="m-header-left"><button type="button" className="m-menu-button k-btn k-icon-btn" aria-label="Mở điều hướng" aria-expanded={mobileOpen} onClick={() => setMobileOpen(v => !v)}><Icon name="list" size={20} /></button><span className="m-breadcrumb">Không gian quản lý <Icon name="chevronRight" size={13} /><strong>{page === 'not-found' ? '404' : MANAGER_TITLES[page]}</strong></span></div><div className="m-header-right"><span className="m-demo-badge">Dữ liệu mô phỏng</span><div className="m-clock"><strong>{time(now)}</strong><span>{dateLabel(now)}</span></div><Link className="m-bell" to={managerPath('notifications')} aria-label={`Thông báo, ${unread} chưa đọc`}><Icon name="bell" size={19} />{unread > 0 && <b>{unread}</b>}</Link><Link className="m-account" to={managerPath('profile')}><span className="m-avatar">MA</span><span><strong>{user.name}</strong><small>Quản lý nhà hàng</small></span><Icon name="chevronDown" size={13} /></Link></div></header>
      <main ref={content} id="manager-main" tabIndex={-1} className="m-content">{error ? <div className="m-load-error" role="alert"><Icon name="offline" size={24} /><h1>Không tải được dữ liệu</h1><p>{error}</p><button type="button" className="k-btn k-btn--primary" onClick={() => { void refresh() }}>Thử tải lại</button></div> : !data ? <div className="m-empty" aria-busy="true"><span className="k-spinner" />Đang tải dữ liệu nhà hàng…</div> : children}<footer className="m-workspace-foot"><span>RestoSphere · Không gian quản lý</span><span>Mô phỏng cục bộ · Chưa kết nối API nghiệp vụ</span></footer></main>
    </div>
    {notice && <div className="m-toast" role="status"><Icon name="checkCircle" /><span>{notice}</span><button type="button" aria-label="Đóng thông báo" onClick={dismiss}><Icon name="close" size={14} /></button></div>}
  </div>
}
