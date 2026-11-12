import { lazy, Suspense, useEffect } from 'react'
import { Footer, Header, Intro, SmoothScrolling } from './components/sites/sea-crown/Shared'
import HomePage from './components/sites/sea-crown/HomePage'
import MenuPage from './components/sites/sea-crown/MenuPage'
import CateringPage from './components/sites/sea-crown/CateringPage'
import LegalPage from './components/sites/sea-crown/LegalPage'
import { useSiteLocation } from './components/sites/sea-crown/LocationContext'
import { PageTransitionProvider } from './components/sites/sea-crown/PageTransition'
import type { Language } from './components/sites/sea-crown/siteData'
import { isKitchenPath } from './routes/kitchenRouter'

// Internal staff module, loaded only on /kitchen so customers never download it.
const KitchenApp = lazy(() => import('./pages/internal/kitchen/KitchenApp'))

function Site() {
  const { pathname: route } = useSiteLocation()
  const pathname = route.replace(/\/+$/, '') || '/'
  const language: Language = pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'vi'
  const page = pathname.replace(/^\/(vi|nl|en)(?=\/|$)/, '') || '/'
  const legal = page === '/privacy' || page === '/terms'
  const known = ['/', '/menu', '/catering', '/privacy', '/terms'].includes(page)

  useEffect(() => {
    document.documentElement.lang = language
    const titles = language === 'vi'
      ? { '/menu': 'Thực đơn', '/catering': 'Đặt tiệc', '/privacy': 'Chính sách bảo mật', '/terms': 'Điều khoản sử dụng' }
      : { '/menu': 'Menu', '/catering': 'Catering', '/privacy': 'Privacy', '/terms': 'Legal' }
    const title = titles[page as keyof typeof titles]
    document.title = title ? `${title} | The Sea's Crown` : language === 'vi' ? "The Sea's Crown — Hải sản tươi ngon mỗi ngày" : "The Sea's Crown — Fresh seafood, every day"
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (description) description.content = language === 'vi' ? "Thưởng thức cua, tôm, mực, tôm hùm và cua hoàng đế tại The Sea's Crown. Khám phá thực đơn hải sản và tư vấn đặt tiệc." : "Enjoy crab, prawns, squid, lobster and king crab at The Sea's Crown. Explore our seafood menu and discuss your next gathering."
  }, [language, page])

  return <>
    <SmoothScrolling />
    <a className="skip-link" href="#main-content">{language === 'en' ? 'Skip to content' : 'Đến nội dung chính'}</a>
    <Intro /><Header language={language} page={page} />
    {page === '/' && <HomePage key={pathname} language={language} />}
    {page === '/menu' && <MenuPage key={pathname} language={language} />}
    {page === '/catering' && <CateringPage key={pathname} language={language} />}
    {legal && <LegalPage key={pathname} language={language} kind={page === '/privacy' ? 'privacy' : 'terms'} />}
    {!known && <main id="main-content" className="not-found"><h1>404</h1><p>{language === 'en' ? 'Page not found' : 'Không tìm thấy trang'}</p><a className="sb-pill" href={`/${language}`}>{language === 'en' ? 'Home' : 'Trang chủ'}</a></main>}
    {(page === '/' || page === '/catering') && <Footer key={`footer:${pathname}`} language={language} />}
  </>
}

function App() {
  // Customer pages and /kitchen are separate apps; moving between them is a full page load.
  if (isKitchenPath(window.location.pathname)) return <Suspense fallback={null}><KitchenApp /></Suspense>
  return <PageTransitionProvider><Site /></PageTransitionProvider>
}

export default App
