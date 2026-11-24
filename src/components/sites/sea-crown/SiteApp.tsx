import { useEffect } from 'react'
import { Footer, Header, Intro, SmoothScrolling } from './Shared'
import HomePage from './HomePage'
import MenuPage from './MenuPage'
import CateringPage from './CateringPage'
import LegalPage from './LegalPage'
import ReservationStatusPage from './ReservationStatusPage'
import PaymentResultPage from './PaymentResultPage'
import { useSiteLocation } from './LocationContext'
import { PageTransitionProvider } from './PageTransition'
import type { Language } from './siteData'

function Site() {
  const { pathname: route } = useSiteLocation()
  const pathname = route.replace(/\/+$/, '') || '/'
  const language: Language = pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'vi'
  const page = pathname.replace(/^\/(vi|nl|en)(?=\/|$)/, '') || '/'
  const legal = page === '/privacy' || page === '/terms'
  const isStatus = page === '/reservation-status'
  const isPaymentResult = page === '/payment/result'
  const known = [
    '/',
    '/menu',
    '/catering',
    '/privacy',
    '/terms',
    '/reservation-status',
    '/payment/result',
  ].includes(page)

  useEffect(() => {
    document.documentElement.lang = language
    const titles =
      language === 'vi'
        ? {
            '/menu': 'Thực đơn',
            '/catering': 'Đặt tiệc',
            '/privacy': 'Chính sách bảo mật',
            '/terms': 'Điều khoản sử dụng',
          }
        : { '/menu': 'Menu', '/catering': 'Catering', '/privacy': 'Privacy', '/terms': 'Legal' }
    const title = titles[page as keyof typeof titles]
    document.title = title
      ? `${title} | The Sea's Crown`
      : language === 'vi'
        ? "The Sea's Crown — Hải sản tươi ngon mỗi ngày"
        : "The Sea's Crown — Fresh seafood, every day"
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (description)
      description.content =
        language === 'vi'
          ? "Thưởng thức cua, tôm, mực, tôm hùm và cua hoàng đế tại The Sea's Crown. Khám phá thực đơn hải sản và tư vấn đặt tiệc."
          : "Enjoy crab, prawns, squid, lobster and king crab at The Sea's Crown. Explore our seafood menu and discuss your next gathering."
  }, [language, page])

  return (
    <>
      <SmoothScrolling />
      <a className="skip-link" href="#main-content">
        {language === 'en' ? 'Skip to content' : 'Đến nội dung chính'}
      </a>
      <Intro />
      <Header language={language} page={page} />
      {page === '/' && <HomePage key={pathname} language={language} />}
      {page === '/menu' && <MenuPage key={pathname} language={language} />}
      {page === '/catering' && <CateringPage key={pathname} language={language} />}
      {legal && (
        <LegalPage
          key={pathname}
          language={language}
          kind={page === '/privacy' ? 'privacy' : 'terms'}
        />
      )}
      {isStatus && <ReservationStatusPage key={pathname} language={language} />}
      {isPaymentResult && <PaymentResultPage key={pathname} language={language} />}
      {!known && (
        <main id="main-content" className="not-found">
          <h1>404</h1>
          <p>{language === 'en' ? 'Page not found' : 'Không tìm thấy trang'}</p>
          <a className="sb-pill" href={`/${language}`}>
            {language === 'en' ? 'Home' : 'Trang chủ'}
          </a>
        </main>
      )}
      {(page === '/' || page === '/catering') && (
        <Footer key={`footer:${pathname}`} language={language} />
      )}
    </>
  )
}

export default function SiteApp() {
  return (
    <PageTransitionProvider>
      <Site />
    </PageTransitionProvider>
  )
}
