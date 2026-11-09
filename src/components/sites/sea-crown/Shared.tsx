import { useEffect, useLayoutEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import FooterPlayground from './FooterPlayground'
import { asset, external, type Language } from './siteData'
import './Shared.css'

export function SmoothScrolling() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      anchors: true,
    })
    const reset = () => lenis.scrollTo(0, { immediate: true, force: true })
    const synchronize = () => lenis.scrollTo(window.scrollY, { immediate: true, force: true })
    window.addEventListener('sandwich:scroll-top', reset)
    window.addEventListener('sandwich:scroll-sync', synchronize)
    lenis.on('scroll', ScrollTrigger.update)
    return () => { window.removeEventListener('sandwich:scroll-top', reset); window.removeEventListener('sandwich:scroll-sync', synchronize); lenis.destroy() }
  }, [])
  return null
}

export function SocialIcon({ kind }: { kind: 'instagram' | 'tiktok' }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{kind === 'instagram' ? <><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".5" fill="currentColor" /></> : <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />}</svg>
}

function SocialLinks() {
  return <div className="sb-social-links">{(['instagram', 'tiktok'] as const).map(kind => <a key={kind} href={external[kind]} target="_blank" rel="noopener noreferrer" aria-label={kind === 'instagram' ? 'Instagram' : 'TikTok'}><SocialIcon kind={kind} /></a>)}</div>
}

function MagneticLink({ href, current, children }: { href: string; current: boolean; children: ReactNode }) {
  const wrapper = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = wrapper.current
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce), (pointer: coarse)').matches) return
    const move = (event: MouseEvent) => {
      const bounds = element.getBoundingClientRect()
      gsap.to(element, { x: (event.clientX - bounds.left - bounds.width / 2) * .35, y: (event.clientY - bounds.top - bounds.height / 2) * .35, duration: .4, ease: 'power3.out', overwrite: true })
    }
    const leave = () => { gsap.to(element, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1, 0.4)', overwrite: true }) }
    element.addEventListener('mousemove', move)
    element.addEventListener('mouseleave', leave)
    return () => { element.removeEventListener('mousemove', move); element.removeEventListener('mouseleave', leave); gsap.killTweensOf(element) }
  }, [])
  return <div className="sb-magnetic-link" ref={wrapper}><a className="sb-pill" href={href} aria-current={current ? 'page' : undefined}>{children}</a></div>
}

export function Header({ language, page }: { language: Language; page: string }) {
  const logo = useRef<HTMLAnchorElement>(null)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce), (pointer: coarse)').matches) return
    const move = (event: PointerEvent) => {
      logo.current?.style.setProperty('--logo-x', `${(event.clientX / window.innerWidth - .5) * 48}px`)
      logo.current?.style.setProperty('--logo-y', `${(event.clientY / window.innerHeight - .5) * 24}px`)
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [])
  return <header className="sb-header"><nav aria-label={language === 'en' ? 'Main navigation' : 'Điều hướng chính'}>
    <div className="sb-header-left"><SocialLinks /><div className="sb-languages"><a lang="vi" href={`/vi${page === '/' ? '' : page}`} aria-current={language === 'vi' ? 'true' : undefined}>VI</a><span>/</span><a lang="en" href={`/en${page === '/' ? '' : page}`} aria-current={language === 'en' ? 'true' : undefined}>EN</a></div></div>
    <a className="sb-logo" ref={logo} href={`/${language}`} aria-label={language === 'en' ? "The Sea's Crown — Home" : "The Sea's Crown — Trang chủ"}><img src={asset('images/logo.png')} width="160" height="116" alt="The Sea's Crown" /></a>
    <div className="sb-header-right"><MagneticLink href={`/${language}/menu`} current={page === '/menu'}>{language === 'en' ? 'Menu' : 'Thực đơn'}</MagneticLink><MagneticLink href={`/${language}/catering`} current={page === '/catering'}>{language === 'en' ? 'Catering' : 'Đặt tiệc'}</MagneticLink></div>
  </nav></header>
}

export function Intro() {
  const panel = useRef<HTMLDivElement>(null)
  const line = useRef<HTMLDivElement>(null)
  const car = useRef<HTMLImageElement>(null)
  const firstVisit = useRef<boolean | null>(null)
  useLayoutEffect(() => {
    if (!panel.current || !line.current || !car.current) return
    if (firstVisit.current === null) {
      try { firstVisit.current = !sessionStorage.getItem('intro-seen'); sessionStorage.setItem('intro-seen', '1') } catch { firstVisit.current = true }
    }
    if (!firstVisit.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      panel.current.style.display = 'none'
      return
    }
    let timeline: gsap.core.Timeline | undefined
    const context = gsap.context(() => {
      const hero = Array.from(document.querySelectorAll('[data-hero-title], [data-hero-subtitle], [data-hero-button]'))
      if (hero.length) gsap.set(hero, { autoAlpha: 0, y: 20 })
      gsap.set(panel.current, { display: 'block', xPercent: 0 })
      gsap.set(car.current, { x: -400, transformOrigin: '15% 100%' })
    })
    const start = () => {
      context.add(() => {
        timeline = gsap.timeline()
          .to(line.current, { width: window.innerWidth + 400, duration: 1.8, ease: 'power2.in' }, 0)
          .to(car.current, { x: window.innerWidth + 400, duration: 2.2, ease: 'power3.in' }, 0)
          .to(car.current, { rotation: -7, duration: .55, ease: 'power1.out' }, .25)
          .to(car.current, { rotation: 0, duration: .18, ease: 'power3.in' }, 1.55)
          .to(panel.current, { xPercent: 200, duration: 1.4, ease: 'power3.inOut' }, 2.2)
          .call(() => {
            if (panel.current) panel.current.style.display = 'none'
            window.dispatchEvent(new CustomEvent('sandwich:page-enter', { detail: { reason: 'intro', delay: 0 } }))
          }, undefined, 3.1)
      })
    }
    if (document.readyState === 'complete') start()
    else window.addEventListener('load', start, { once: true })
    return () => { window.removeEventListener('load', start); timeline?.kill(); context.revert() }
  }, [])
  return <div className="sb-intro" ref={panel} aria-hidden="true"><div className="sb-intro-line" ref={line} /><img src={asset('illustrations/movingcar.svg')} ref={car} alt="" /></div>
}

export function BubbleLink({ href, children }: { href: string; children: React.ReactNode }) {
  const arrow = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><polyline points="18 8 18 18 8 18" /><line x1="18" y1="18" x2="5" y2="5" /></svg>
  return <a className="sb-bubble" data-hero-button="true" href={href}><span className="sb-bubble-arrow">{arrow}</span><span className="sb-bubble-content">{children}</span><span className="sb-bubble-arrow sb-bubble-duplicate">{arrow}</span></a>
}

export function Footer({ language }: { language: Language }) {
  const en = language === 'en'
  return <footer className="sb-footer"><img className="sb-footer-background" src={asset('images/logo.png')} alt="" aria-hidden="true" /><FooterPlayground />
    <div className="sb-footer-content"><div className="sb-footer-brand"><p><img src="/sites/sea-crown/images/lobster-prawns.jpg" width="260" height="192" alt={en ? "Lobster and prawns at The Sea's Crown" : "Món tôm hùm và tôm tại The Sea's Crown"} loading="lazy" /></p><small className="sb-desktop-credit">{en ? 'Site by' : 'Thiết kế bởi'} <a href="https://mikdevelopment.nl" target="_blank" rel="noopener noreferrer">Mik Development</a></small></div>
      <nav className="sb-footer-nav" aria-label={en ? 'Footer' : 'Chân trang'}><a href={`/${language}`}>{en ? 'Home' : 'Trang chủ'}</a><a href={`/${language}/menu`}>{en ? 'Menu' : 'Thực đơn'}</a><a href={`/${language}/catering`}>{en ? 'Catering' : 'Đặt tiệc'}</a></nav>
      <div className="sb-footer-contact"><div><h3>{en ? 'General' : 'Liên hệ chung'}</h3><a href="mailto:info@thesandwichbar.nl">info@thesandwichbar.nl</a><p><a href="tel:+31207790114">020 779 0114 (Nassaukade)</a><br />&amp; <a href="tel:+31203585387">020 358 53 87 (Amstelveenseweg)</a></p><small>{en ? 'Not for catering orders' : 'Không tiếp nhận đơn đặt tiệc'}</small></div><div><h3>{en ? 'Catering' : 'Đặt tiệc'}</h3><a href="mailto:orders@thesandwichbar.nl">orders@thesandwichbar.nl</a><a href="tel:+31615657447">06-15657447</a><a href="tel:+31615004988">06-15004988</a></div><div className="sb-legal-links"><a href={`/${language}/privacy`}>{en ? 'Privacy' : 'Bảo mật'}</a><a href={`/${language}/terms`}>{en ? 'Legal' : 'Điều khoản'}</a></div></div>
      <div className="sb-footer-follow"><p>{en ? "Seafood, shared tables and stories from The Sea's Crown. Follow us for dishes to discover and moments from our kitchen." : "Hải sản tươi ngon, những bàn tiệc sum vầy và câu chuyện tại The Sea's Crown. Theo dõi nhà hàng để khám phá món ăn và những khoảnh khắc trong bếp."}</p><div><h3>{en ? 'Follow us' : 'Theo dõi chúng tôi'}</h3><SocialLinks /></div></div>
    </div><small className="sb-mobile-credit">{en ? 'Site by' : 'Thiết kế bởi'} <a href="https://mikdevelopment.nl" target="_blank" rel="noopener noreferrer">Mik Development</a></small><div className="sb-footer-playground" aria-hidden="true" />
  </footer>
}
