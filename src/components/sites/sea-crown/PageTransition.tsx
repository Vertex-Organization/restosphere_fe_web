import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { gsap } from 'gsap'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { LocationContext } from './LocationContext'
import './PageTransition.css'

gsap.registerPlugin(DrawSVGPlugin, ScrollTrigger)

const wipePath =
  'M43 259C296 11.5688 994 -3 922.994 498.259C851.988 999.517 281.229 1004.28 123 767C-35.2287 529.721 179 259 472 259C765 259 792 498.259 659 654C526 809.741 319 755 285 669.001C251 583.001 299 452 496 452C693 452 876.073 639.171 935 937.001'
const normalizePath = (path: string) =>
  path.startsWith('/auth/') || /^\/menu\/.+/.test(path) ? '/' : path
const isSiteRoute = (path: string) =>
  /^(?:\/(?:vi|nl|en))?(?:\/(?:menu|catering|privacy|terms))?\/?$/.test(path)

/** Keeps navigation local while drawing the original site's plum SVG wipe. */
export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const [pathname, setPathname] = useState(() => normalizePath(window.location.pathname))
  const [isAnimating, setAnimating] = useState(false)
  const path = useRef<SVGPathElement>(null)
  const activePath = useRef(pathname)
  const busy = useRef(false)
  const pendingEntry = useRef(false)
  const timeline = useRef<gsap.core.Timeline | null>(null)
  const heading = useRef<Element | null>(null)
  const pendingScroll = useRef<{ kind: 'push' | 'pop'; hash: string } | null>(null)

  const finish = useCallback(() => {
    busy.current = false
    setAnimating(false)
    if (path.current) gsap.set(path.current, { strokeWidth: 0 })
  }, [])

  const commit = useCallback(
    (url: URL, animate: boolean) => {
      pendingEntry.current = animate
      pendingScroll.current = { kind: 'push', hash: url.hash }
      window.history.pushState(null, '', url.pathname + url.search + url.hash)
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      window.dispatchEvent(new Event('sandwich:scroll-top'))
      setPathname(url.pathname)
      if (!animate) finish()
    },
    [finish],
  )

  useEffect(() => {
    if (window.location.pathname !== normalizePath(window.location.pathname)) {
      window.history.replaceState(null, '', '/')
    }
    const click = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      )
        return
      const anchor = event.target instanceof Element ? event.target.closest('a') : null
      if (
        !anchor ||
        anchor.hasAttribute('download') ||
        (anchor.target && anchor.target !== '_self')
      )
        return
      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin || !isSiteRoute(url.pathname)) return
      // Same-page anchors are handled by Lenis, including the skip link.
      if (url.pathname === activePath.current && url.hash) return
      event.preventDefault()
      if (busy.current || url.pathname === activePath.current) return
      // Only links that opt in (logo, language switcher) get the SVG wipe.
      if (!anchor.hasAttribute('data-page-transition')) {
        commit(url, false)
        return
      }
      busy.current = true
      setAnimating(true)
      const shape = path.current
      if (!shape || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        commit(url, false)
        return
      }
      timeline.current?.kill()
      timeline.current = gsap
        .timeline({ onComplete: () => commit(url, true) })
        .set(shape, { strokeWidth: '5%', drawSVG: '0% 0%' })
        .to(shape, { drawSVG: '0% 85%', duration: 1, ease: 'power1.inOut' })
        .to(shape, { strokeWidth: '30%', duration: 0.75, ease: 'power1.inOut' }, 0.25)
    }
    const pop = () => {
      timeline.current?.kill()
      if (heading.current) gsap.set(heading.current, { autoAlpha: 1, yPercent: 0 })
      pendingEntry.current = false
      pendingScroll.current = { kind: 'pop', hash: window.location.hash }
      window.dispatchEvent(new Event('sandwich:scroll-sync'))
      const next = normalizePath(window.location.pathname)
      if (next !== window.location.pathname) window.history.replaceState(null, '', next)
      setPathname(next)
      finish()
    }
    document.addEventListener('click', click)
    window.addEventListener('popstate', pop)
    return () => {
      timeline.current?.kill()
      document.removeEventListener('click', click)
      window.removeEventListener('popstate', pop)
    }
  }, [commit, finish])

  useLayoutEffect(() => {
    activePath.current = pathname
    const scroll = pendingScroll.current
    pendingScroll.current = null
    if (scroll?.kind === 'push' && scroll.hash) {
      let id = scroll.hash.slice(1)
      try {
        id = decodeURIComponent(id)
      } catch {
        /* Use the literal hash if malformed. */
      }
      document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' })
      window.dispatchEvent(new Event('sandwich:scroll-sync'))
    }
    const frame =
      scroll?.kind === 'pop'
        ? requestAnimationFrame(() => window.dispatchEvent(new Event('sandwich:scroll-sync')))
        : 0
    ScrollTrigger.refresh()
    if (!pendingEntry.current) return () => cancelAnimationFrame(frame)
    pendingEntry.current = false
    const shape = path.current
    if (!shape) {
      finish()
      return () => cancelAnimationFrame(frame)
    }
    timeline.current?.kill()
    const reveal = gsap
      .timeline({ onComplete: finish })
      .set(shape, { drawSVG: '0% 100%', strokeWidth: '30%' })
      .to(shape, { drawSVG: '100% 100%', strokeWidth: '5%', duration: 1.25, ease: 'power1.inOut' })
    heading.current = document.querySelector('main h1, section h1')
    if (heading.current)
      reveal.fromTo(
        heading.current,
        { yPercent: 25, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, ease: 'expo.out', duration: 1 },
        0.75,
      )
    timeline.current = reveal
    return () => cancelAnimationFrame(frame)
  }, [pathname, finish])

  return (
    <LocationContext.Provider value={{ pathname, isAnimating }}>
      {children}
      <div className="sb-page-transition" data-transition-wrap="true" aria-hidden="true">
        <svg viewBox="0 0 1000 1000" fill="none" preserveAspectRatio="none">
          <path
            ref={path}
            d={wipePath}
            stroke="currentColor"
            strokeWidth="0"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </LocationContext.Provider>
  )
}
