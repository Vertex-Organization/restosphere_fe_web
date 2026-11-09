import AuthHeader from '../../components/auth/AuthHeader'
import LoginForm from '../../components/auth/LoginForm'
import RestaurantBrand from '../../components/ui/RestaurantBrand'
import './LoginPage.css'

function getReturnUrl() {
  const value = new URLSearchParams(window.location.search).get('returnUrl')
  if (value) {
    try {
      const url = new URL(value, window.location.origin)
      if (url.origin === window.location.origin) return `${url.pathname}${url.search}${url.hash}`
    } catch {
      // Fall back to the restaurant homepage for an invalid return URL.
    }
  }
  return '/menu/combo'
}

export default function LoginPage() {
  return (
    <div className="pc-page">
      <div className="pc-background" aria-hidden="true" />
      <AuthHeader />
      <main className="pc-main">
        <h1 className="pc-sr-only">Đăng nhập</h1>
        <div className="pc-container">
          <div className="pc-toolbar">
            <a className="pc-back" href={getReturnUrl()}>
              <span className="pc-back-icon" aria-hidden="true">
                <img src="/sites/thepizzacompany-vn/back.svg" width="48" height="48" alt="" />
                <img className="pc-back-hover" src="/sites/thepizzacompany-vn/back-hover.svg" width="48" height="48" alt="" />
              </span>
              <span>Đăng nhập</span>
            </a>
          </div>

          <section className="pc-card" aria-label="Đăng nhập The Sea's Crown">
            <div className="pc-banner"><RestaurantBrand /></div>
            <div className="pc-checker" aria-hidden="true" />
            <LoginForm />
          </section>
        </div>
      </main>
    </div>
  )
}
