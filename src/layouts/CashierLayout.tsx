import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ROLE_LABEL } from '../api/kitchen/labels'
import { openShiftOf, pendingRequestCount, posRows, unreadCount } from '../api/billing/selectors'
import type { CashierStaff } from '../api/billing/types'
import { Icon, type IconName } from '../components/billing/Icon'
import { BrandLogo } from '../components/kitchen/BrandLogo'
import { formatDayShort, formatTime, initials, shortCode } from '../components/kitchen/format'
import { KitchenLink as Link } from '../components/kitchen/KitchenLink'
import { useCashierData } from '../hooks/billing/cashierDataContext'
import { leaveCashier as signOut } from '../hooks/billing/useCashierAuth'
import { useNow } from '../hooks/kitchen/useNow'
import { cashierPaths, type CashierRoute } from '../routes/cashierRouter'
// Shared staff shell (compact sidebar + header), same look as the kitchen module.
import './KitchenLayout.css'

interface NavItem {
  to: string
  label: string
  short: string
  icon: IconName
  routes: CashierRoute['name'][]
  count?: 'requests' | 'unread'
}

const NAV: NavItem[] = [
  {
    to: cashierPaths.pos,
    label: 'Quầy thu ngân',
    short: 'Quầy',
    icon: 'drawer',
    routes: ['pos', 'bill', 'payment', 'receipt'],
  },
  {
    to: cashierPaths.transactions,
    label: 'Giao dịch',
    short: 'Giao dịch',
    icon: 'list',
    routes: ['transactions', 'transaction'],
  },
  {
    to: cashierPaths.requests,
    label: 'Yêu cầu',
    short: 'Yêu cầu',
    icon: 'clipboard',
    routes: ['requests'],
    count: 'requests',
  },
  { to: cashierPaths.shift, label: 'Ca làm', short: 'Ca làm', icon: 'clock', routes: ['shift'] },
  {
    to: cashierPaths.notifications,
    label: 'Thông báo',
    short: 'Thông báo',
    icon: 'bell',
    routes: ['notifications'],
    count: 'unread',
  },
  {
    to: cashierPaths.profile,
    label: 'Cá nhân',
    short: 'Cá nhân',
    icon: 'user',
    routes: ['profile'],
  },
]

function AccountMenu({ user }: { user: CashierStaff }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="k-account" ref={root}>
      <button
        type="button"
        className="k-account-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="k-avatar" aria-hidden="true">
          {initials(user.name)}
        </span>
        <span className="k-account-text">
          <span className="k-account-name">{user.name}</span>
          <span className="k-account-role">{ROLE_LABEL[user.role]}</span>
        </span>
        <Icon name="chevronDown" size={14} />
        <span className="k-visually-hidden">Tài khoản</span>
      </button>
      {open && (
        <div className="k-menu" role="menu">
          <div className="k-menu-head">
            <strong>{user.name}</strong>
            <span>
              {ROLE_LABEL[user.role]} · {shortCode(user.id)}
            </span>
          </div>
          <Link
            role="menuitem"
            className="k-menu-item"
            to={cashierPaths.profile}
            onClick={() => setOpen(false)}
          >
            <Icon name="user" />
            Hồ sơ cá nhân
          </Link>
          <Link
            role="menuitem"
            className="k-menu-item"
            to={cashierPaths.shift}
            onClick={() => setOpen(false)}
          >
            <Icon name="clock" />
            Ca thu ngân
          </Link>
          <button type="button" role="menuitem" className="k-menu-item" onClick={signOut}>
            <Icon name="logout" />
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  )
}

function FeedbackSlot() {
  const { feedback, dismissFeedback } = useCashierData()
  return (
    <div className="k-feedback" role="status" aria-live="polite">
      {feedback && (
        <span key={feedback.id} className={`k-feedback-msg k-feedback-msg--${feedback.tone}`}>
          <Icon name={feedback.tone === 'success' ? 'checkCircle' : 'alert'} size={15} />
          <span className="k-feedback-text" title={feedback.text}>
            {feedback.text}
          </span>
          <button
            type="button"
            className="k-feedback-close"
            onClick={dismissFeedback}
            aria-label="Đóng thông báo"
          >
            <Icon name="close" size={14} />
          </button>
        </span>
      )}
    </div>
  )
}

interface Props {
  route: CashierRoute
  title: string
  /** Pages that manage their own scroll areas (counter, transaction list). */
  fill?: boolean
  children: ReactNode
}

export function CashierLayout({ route, title, fill, children }: Props) {
  const { user, data, loadError, refresh } = useCashierData()
  const now = useNow()
  const content = useRef<HTMLElement>(null)
  const unread = data ? unreadCount(data, user.id) : 0
  const requests = data ? pendingRequestCount(data) : 0
  const shift = data ? openShiftOf(data, user.id) : undefined
  const due = data ? posRows(data, now).filter((r) => r.status === 'PAYMENT_REQUESTED').length : 0

  const routeKey =
    'id' in route
      ? `${route.name}:${route.id}`
      : 'billId' in route
        ? `${route.name}:${route.billId}`
        : route.name
  useEffect(() => {
    document.title = `${title} · RestoSphere Thu ngân`
  }, [title])
  useEffect(() => {
    content.current?.scrollTo({ top: 0 })
  }, [routeKey])

  const navLinks = (variant: 'side' | 'bottom') =>
    NAV.map((item) => {
      const current = item.routes.includes(route.name)
      const count = item.count === 'unread' ? unread : item.count === 'requests' ? requests : 0
      const countLabel = item.count === 'unread' ? `${count} chưa đọc` : `${count} chờ duyệt`
      return (
        <Link
          key={item.to}
          to={item.to}
          className={variant === 'side' ? 'k-nav-link' : 'k-bottom-link'}
          aria-current={current ? 'page' : undefined}
          title={variant === 'side' ? item.label : undefined}
        >
          <Icon name={item.icon} size={18} />
          <span className="k-nav-label">{variant === 'side' ? item.label : item.short}</span>
          {count > 0 && (
            <span className="k-nav-count" aria-label={countLabel}>
              {count}
            </span>
          )}
        </Link>
      )
    })

  let body: ReactNode = children
  if (!data && loadError) {
    body = (
      <div className="k-state" role="alert">
        <Icon name="offline" size={22} />
        <p className="k-state-title">Không tải được dữ liệu thu ngân</p>
        <p>{loadError}</p>
        <button
          type="button"
          className="k-btn k-btn--primary"
          onClick={() => {
            void refresh()
          }}
        >
          <Icon name="refresh" />
          Thử lại
        </button>
      </div>
    )
  } else if (!data) {
    body = (
      <div className="k-state" aria-busy="true">
        <span className="k-spinner" aria-hidden="true" />
        Đang tải dữ liệu thu ngân…
      </div>
    )
  }

  return (
    <div className="kds k-app c-app">
      <aside className="k-sidebar" aria-label="Điều hướng thu ngân">
        <Link
          to={cashierPaths.pos}
          className="k-brand"
          aria-label="RestoSphere Thu ngân — Quầy thu ngân"
        >
          <BrandLogo width={150} />
          <span className="k-brand-module">Cashier · Thu ngân</span>
        </Link>
        <nav className="k-nav">{navLinks('side')}</nav>
        <div className="k-sidebar-foot">
          <button
            type="button"
            className="k-nav-link k-signout"
            onClick={signOut}
            title="Đăng xuất"
          >
            <Icon name="logout" size={18} />
            <span className="k-nav-label">Đăng xuất</span>
          </button>
        </div>
      </aside>

      <div className="k-main">
        <header className="k-header">
          <h1 className="k-page-title">{title}</h1>
          {data && (
            <div className="k-hcounts c-hstatus">
              {shift ? (
                <Link
                  to={cashierPaths.shift}
                  className="c-shift-chip c-shift-chip--open"
                  title="Ca thu ngân đang mở"
                >
                  {shortCode(shift.code)} · từ {formatTime(shift.openedAt)}
                </Link>
              ) : (
                <Link to={cashierPaths.shift} className="c-shift-chip c-shift-chip--closed">
                  Chưa mở ca
                </Link>
              )}
              <span className="k-hcount c-hcount--due">
                <b>{due}</b> bàn chờ thanh toán
              </span>
            </div>
          )}
          <FeedbackSlot />
          <div className="k-header-tools">
            {loadError && data && (
              <button
                type="button"
                className="k-sync-warn"
                onClick={() => {
                  void refresh()
                }}
                title={loadError}
              >
                <Icon name="offline" size={14} />
                Mất kết nối · Thử lại
              </button>
            )}
            <div className="k-clock">
              <time className="k-clock-time" dateTime={new Date(now).toISOString()}>
                {formatTime(now)}
              </time>
              <span className="k-clock-sub">{formatDayShort(now)}</span>
            </div>
            <Link
              to={cashierPaths.notifications}
              className="k-bell"
              aria-label={`Thông báo${unread ? `, ${unread} chưa đọc` : ''}`}
            >
              <Icon name="bell" size={18} />
              {unread > 0 && <span className="k-bell-count">{unread > 9 ? '9+' : unread}</span>}
            </Link>
            <AccountMenu user={user} />
          </div>
        </header>
        <main
          ref={content}
          id="cashier-main"
          className={fill && data ? 'k-content k-content--fill' : 'k-content'}
        >
          {body}
        </main>
      </div>

      <nav className="k-bottomnav" aria-label="Điều hướng thu ngân">
        {navLinks('bottom')}
      </nav>
    </div>
  )
}
