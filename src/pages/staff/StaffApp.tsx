import { useEffect } from 'react'
import { useStaffLoading, useStaffSession } from '../../api/staff/auth'
import { BrandLogo } from '../../components/kitchen/BrandLogo'
import { StaffRedirecting } from '../../components/staff/StaffAccessDenied'
import { navigate, useKitchenUrl as useStaffUrl } from '../../routes/kitchenRouter'
import { homePathFor, landingPath, STAFF_BASE, staffPaths } from '../../routes/staffRouter'
import StaffLoginPage from './StaffLoginPage'
import '../../components/staff/staff.css'

/** Opens a workspace (a separate app, so a full page load). */
function Open({ to }: { to: string }) {
  useEffect(() => { window.location.replace(to) }, [to])
  return <div className="st" aria-busy="true"><p className="st-wait"><span className="st-spinner" aria-hidden="true" />Đang mở khu làm việc…</p></div>
}

/** /staff and /staff/login. Workspaces under /staff/<role> are their own apps. */
export default function StaffApp() {
  const { pathname, params } = useStaffUrl()
  const session = useStaffSession()
  const loading = useStaffLoading()
  const home = session ? homePathFor(session.role) : null

  useEffect(() => {
    const root = document.documentElement
    root.lang = 'vi'
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex,nofollow'
    document.head.appendChild(robots)
    return () => robots.remove()
  }, [])

  useEffect(() => {
    // Signed-out visitors of /staff land on the sign-in page (same app, no reload).
    if (!loading && pathname === STAFF_BASE && !home) navigate(staffPaths.login, { replace: true })
  }, [pathname, home, loading])

  if (loading) return <StaffRedirecting />

  if (pathname === staffPaths.login) {
    const next = params.get('next')
    if (session && home) return <Open to={landingPath(session.role, next) ?? home} />
    return <StaffLoginPage next={next} />
  }
  if (pathname === STAFF_BASE) return home ? <Open to={home} /> : <StaffRedirecting />

  return (
    <main className="st">
      <div className="st-card">
        <div className="st-main">
          <BrandLogo width={168} />
          <div>
            <h1 className="st-title">Không tìm thấy trang</h1>
            <p className="st-sub">Đường dẫn này không thuộc khu nhân viên.</p>
          </div>
          <a className="st-btn st-btn--primary" href={STAFF_BASE}>Về khu làm việc</a>
        </div>
      </div>
    </main>
  )
}
