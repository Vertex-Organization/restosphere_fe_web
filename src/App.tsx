import { useEffect } from 'react'
import { Footer, Header, Intro, SmoothScrolling } from './components/sites/sandwich-bar/Shared'
import HomePage from './components/sites/sandwich-bar/HomePage'
import MenuPage from './components/sites/sandwich-bar/MenuPage'
import CateringPage from './components/sites/sandwich-bar/CateringPage'
import LegalPage from './components/sites/sandwich-bar/LegalPage'
import { useSiteLocation } from './components/sites/sandwich-bar/LocationContext'
import { PageTransitionProvider } from './components/sites/sandwich-bar/PageTransition'
import type { Language } from './components/sites/sandwich-bar/siteData'

function Site() {
  const { pathname: route } = useSiteLocation()
  const pathname = route.replace(/\/+$/, '') || '/'
  const language: Language = pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'nl'
  const page = pathname.replace(/^\/(nl|en)(?=\/|$)/, '') || '/'
  const legal = page === '/privacy' || page === '/terms'
  const known = ['/', '/menu', '/catering', '/privacy', '/terms'].includes(page)

  useEffect(() => {
    document.documentElement.lang = language
    const title = page === '/menu' ? 'Menu' : page === '/catering' ? 'Catering' : page === '/privacy' ? 'Privacy' : page === '/terms' ? 'Legal' : ''
    document.title = title ? `${title} | The Sandwich Bar` : 'The Sandwich Bar — Belegde broodjes en Catering'
  }, [language, page])

  return <>
    <SmoothScrolling />
    <a className="skip-link" href="#main-content">{language === 'en' ? 'Skip to content' : 'Ga naar inhoud'}</a>
    <Intro /><Header language={language} page={page} />
    {page === '/' && <HomePage key={pathname} language={language} />}
    {page === '/menu' && <MenuPage key={pathname} language={language} />}
    {page === '/catering' && <CateringPage key={pathname} language={language} />}
    {legal && <LegalPage key={pathname} language={language} kind={page === '/privacy' ? 'privacy' : 'terms'} />}
    {!known && <main id="main-content" className="not-found"><h1>404</h1><p>{language === 'en' ? 'Page not found' : 'Pagina niet gevonden'}</p><a className="sb-pill" href={`/${language}`}>Home</a></main>}
    {(page === '/' || page === '/catering') && <Footer key={`footer:${pathname}`} language={language} />}
  </>
}

function App() {
  return <PageTransitionProvider><Site /></PageTransitionProvider>
}

export default App
