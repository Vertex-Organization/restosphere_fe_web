import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ROLE_LABEL } from '../api/kitchen/labels'
import { buildBoard, unreadCount } from '../api/kitchen/selectors'
import type { StaffMember } from '../api/kitchen/types'
import { BrandLogo } from '../components/kitchen/BrandLogo'
import { formatDayShort, formatTime, initials } from '../components/kitchen/format'
import { Icon, type IconName } from '../components/kitchen/Icon'
import { KitchenLink } from '../components/kitchen/KitchenLink'
import { useKitchenData } from '../hooks/kitchen/kitchenDataContext'
import { leaveKitchen as signOut } from '../hooks/kitchen/leaveKitchen'
import { useNow } from '../hooks/kitchen/useNow'
import { kitchenPaths, type KitchenRoute } from '../routes/kitchenRouter'
import './KitchenLayout.css'

interface NavItem {
  to: string
  label: string
  short: string
  icon: IconName
  routes: KitchenRoute['name'][]
}

const NAV: NavItem[] = [
  { to: kitchenPaths.board, label: 'Bảng bếp', short: 'Bảng bếp', icon: 'board', routes: ['board', 'ticket'] },
  { to: kitchenPaths.history, label: 'Lịch sử chế biến', short: 'Lịch sử', icon: 'history', routes: ['history'] },
  { to: kitchenPaths.incidents, label: 'Sự cố', short: 'Sự cố', icon: 'alert', routes: ['incidents'] },
  { to: kitchenPaths.menuStatus, label: 'Tình trạng món', short: 'Thực đơn', icon: 'utensils', routes: ['menu-status'] },
  { to: kitchenPaths.notifications, label: 'Thông báo', short: 'Thông báo', icon: 'bell', routes: ['notifications'] },
  { to: kitchenPaths.profile, label: 'Cá nhân', short: 'Cá nhân', icon: 'user', routes: ['profile'] },
]

function AccountMenu({ user }: { user: StaffMember }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false) }
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="k-account" ref={root}>
      <button type="button" className="k-account-btn" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="k-avatar" aria-hidden="true">{initials(user.name)}</span>
        <span className="k-account-text">
          <span className="k-account-name">{user.name}</span>
          <span className="k-account-role">{user.position}</span>
        </span>
        <Icon name="chevronDown" size={14} />
        <span className="k-visually-hidden">Tài khoản</span>
      </button>
      {open && (
        <div className="k-menu" role="menu">
          <div className="k-menu-head">
            <strong>{user.name}</strong>
            <span>{ROLE_LABEL[user.role]} · {user.position} · {user.id}</span>
          </div>
          <KitchenLink role="menuitem" className="k-menu-item" to={kitchenPaths.profile} onClick={() => setOpen(false)}>
            <Icon name="user" />Hồ sơ cá nhân
          </KitchenLink>
          <button type="button" role="menuitem" className="k-menu-item" onClick={signOut}>
            <Icon name="logout" />Đăng xuất
          </button>
        </div>
      )}
    </div>
  )
}

function FeedbackSlot() {
  const { feedback, dismissFeedback } = useKitchenData()
  return (
    <div className="k-feedback" role="status" aria-live="polite">
      {feedback && (
        <span key={feedback.id} className={`k-feedback-msg k-feedback-msg--${feedback.tone}`}>
          <Icon name={feedback.tone === 'success' ? 'checkCircle' : 'alert'} size={15} />
          <span className="k-feedback-text" title={feedback.text}>{feedback.text}</span>
          <button type="button" className="k-feedback-close" onClick={dismissFeedback} aria-label="Đóng thông báo">
            <Icon name="close" size={14} />
          </button>
        </span>
      )}
    </div>
  )
}

interface Props {
  route: KitchenRoute
  title: string
  /** Board-style pages manage their own scroll areas. */
  fill?: boolean
  children: ReactNode
}

export function KitchenLayout({ route, title, fill, children }: Props) {
  const { user, data, loadError, refresh } = useKitchenData()
  const now = useNow()
  const content = useRef<HTMLElement>(null)
  const counts = data ? buildBoard(data, now).counts : null
  const unread = data ? unreadCount(data, user.id) : 0

  const routeKey = route.name === 'ticket' ? `ticket:${route.id}` : route.name

  useEffect(() => { document.title = `${title} · RestoSphere Kitchen` }, [title])
  // Start each page at the top; polling re-renders keep the scroll position.
  useEffect(() => { content.current?.scrollTo({ top: 0 }) }, [routeKey])

  const navLinks = (variant: 'side' | 'bottom') => NAV.map((item) => {
    const current = item.routes.includes(route.name)
    const badge = item.icon === 'bell' && unread > 0
    return (
      <KitchenLink key={item.to} to={item.to} className={variant === 'side' ? 'k-nav-link' : 'k-bottom-link'}
        aria-current={current ? 'page' : undefined} title={variant === 'side' ? item.label : undefined}>
        <Icon name={item.icon} size={18} />
        <span className="k-nav-label">{variant === 'side' ? item.label : item.short}</span>
        {badge && <span className="k-nav-count" aria-label={`${unread} chưa đọc`}>{unread}</span>}
      </KitchenLink>
    )
  })

  let body: ReactNode = children
  if (!data && loadError) {
    body = (
      <div className="k-state" role="alert">
        <Icon name="offline" size={22} />
        <p className="k-state-title">Không tải được dữ liệu bếp</p>
        <p>{loadError}</p>
        <button type="button" className="k-btn k-btn--primary" onClick={() => { void refresh() }}><Icon name="refresh" />Thử lại</button>
      </div>
    )
  } else if (!data) {
    body = <div className="k-state" aria-busy="true"><span className="k-spinner" aria-hidden="true" />Đang tải dữ liệu bếp…</div>
  }

  return (
    <div className="kds k-app">
      <aside className="k-sidebar" aria-label="Điều hướng khu vực Bếp">
        <KitchenLink to={kitchenPaths.board} className="k-brand" aria-label="RestoSphere Kitchen — Bảng bếp">
          <BrandLogo width={150} />
          <span className="k-brand-module">Kitchen · Khu vực bếp</span>
        </KitchenLink>
        <nav className="k-nav">{navLinks('side')}</nav>
        <div className="k-sidebar-foot">
          {import.meta.env.DEV && (
            <KitchenLink to={kitchenPaths.dev} className="k-nav-link k-dev-link" aria-current={route.name === 'dev' ? 'page' : undefined} title="Công cụ mô phỏng (chỉ khi phát triển)">
              <Icon name="terminal" size={18} /><span className="k-nav-label">Mô phỏng (dev)</span>
            </KitchenLink>
          )}
          <button type="button" className="k-nav-link k-signout" onClick={signOut} title="Đăng xuất">
            <Icon name="logout" size={18} /><span className="k-nav-label">Đăng xuất</span>
          </button>
        </div>
      </aside>

      <div className="k-main">
        <header className="k-header">
          <h1 className="k-page-title">{title}</h1>
          {counts && (
            <div className="k-hcounts" aria-label="Tình hình bếp">
              <span className="k-hcount k-hcount--new"><b>{counts.newTickets}</b> phiếu mới</span>
              <span className="k-hcount k-hcount--preparing"><b>{counts.preparingItems}</b> món đang làm</span>
              <span className="k-hcount k-hcount--ready"><b>{counts.readyItems}</b> món đã xong</span>
            </div>
          )}
          <FeedbackSlot />
          <div className="k-header-tools">
            {loadError && data && (
              <button type="button" className="k-sync-warn" onClick={() => { void refresh() }} title={loadError}>
                <Icon name="offline" size={14} />Mất kết nối · Thử lại
              </button>
            )}
            <div className="k-clock">
              <time className="k-clock-time" dateTime={new Date(now).toISOString()}>{formatTime(now)}</time>
              <span className="k-clock-sub">{formatDayShort(now)} · {user.shift.split(' · ')[0]}</span>
            </div>
            <KitchenLink to={kitchenPaths.notifications} className="k-bell" aria-label={`Thông báo${unread ? `, ${unread} chưa đọc` : ''}`}>
              <Icon name="bell" size={18} />
              {unread > 0 && <span className="k-bell-count">{unread > 9 ? '9+' : unread}</span>}
            </KitchenLink>
            <AccountMenu user={user} />
          </div>
        </header>
        <main ref={content} id="kitchen-main" className={fill && data ? 'k-content k-content--fill' : 'k-content'}>
          {body}
        </main>
      </div>

      <nav className="k-bottomnav" aria-label="Điều hướng khu vực Bếp">{navLinks('bottom')}</nav>
    </div>
  )
}
