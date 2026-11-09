import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Draggable } from 'gsap/Draggable'
import { InertiaPlugin } from 'gsap/InertiaPlugin'
import { BubbleLink } from './Shared'
import { asset, external, type Language } from './siteData'
import content from './homeContent.json'
import './HomePage.css'

gsap.registerPlugin(ScrollTrigger, Draggable, InertiaPlugin)

const curve = 'M-71 371.6C126.3 260 593.5 65.8 934.5 80.8c313 13.8 497 136 572 200'
const gallery = ['the-sandwich-bar-26', 'the-sandwichbar-01', 'the-sandwichbar-06', 'the-sandwichbar-17', 'the-sandwichbar-03', 'the-sandwichbar-09', 'the-sandwichbar-21', 'the-sandwichbar-13', 'the-sandwich-bar-27', 'the-sandwichbar-04', 'the-sandwichbar-08', 'the-sandwichbar-24', 'the-sandwichbar-02', 'the-sandwichbar-11', 'the-sandwichbar-18', 'the-sandwichbar-05', 'the-sandwichbar-15', 'the-sandwichbar-23', 'the-sandwichbar-07', 'the-sandwichbar-19', 'the-sandwich-bar-14', 'the-sandwichbar-22', 'the-sandwichbar-10', 'the-sandwichbar-16', 'the-sandwichbar-25', 'the-sandwichbar-12']
const videos = ['4c5cc010c2661f7b07af1bcf8385fc6b2cf81430', '059635aa13249854e2808561c6b57e37e270ea9f', '720ee7345673ebfb5532009b1c1e1fa514ea922c', '4c5cc010c2661f7b07af1bcf8385fc6b2cf81430']

function ScrollPath({ location = false }: { location?: boolean }) {
  const svg = useRef<SVGSVGElement>(null)
  const path = useRef<SVGPathElement>(null)

  useLayoutEffect(() => {
    const line = path.current
    const section = svg.current?.parentElement
    if (!line || !section) return
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const length = line.getTotalLength()
      gsap.set(line, { strokeDasharray: length, strokeDashoffset: length })
      gsap.to(line, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top 80%', end: 'bottom 20%', scrub: 1.5 },
      })
    })
    return () => media.revert()
  }, [])

  return <svg className="sb-decorative-path" ref={svg} viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path ref={path} opacity={location ? .08 : .1} d={location ? 'M 1440 80 C 1200 120, 980 60, 820 180 C 700 270, 680 390, 720 480 C 760 570, 840 600, 820 680 C 800 750, 720 790, 580 820 C 440 850, 260 830, 0 880' : 'M 30 20 C 180 30, 380 150, 530 340 C 590 400, 615 460, 582 510 C 550 558, 482 562, 462 518 C 442 474, 464 418, 522 408 C 580 398, 645 445, 685 530 C 740 640, 780 760, 800 900'} /></svg>
}

function Slogan({ text }: { text: string }) {
  const section = useRef<HTMLElement>(null)
  const path = useRef<SVGTextPathElement>(null)

  useLayoutEffect(() => {
    if (!section.current || !path.current) return
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.set(path.current, { attr: { startOffset: '-50%' } })
      gsap.to(path.current, {
        attr: { startOffset: '0%' }, ease: 'none',
        scrollTrigger: { trigger: section.current, start: 'top bottom', end: 'bottom top', scrub: .5 },
      })
    })
    return () => media.revert()
  }, [text])

  return <section className="sb-slogan" ref={section} aria-label={text}><svg viewBox="0 0 1440 442" fill="none" aria-hidden="true"><path fill="var(--color-cream)" d="M-71 451.6C126.3 340 593.5 145.8 934.5 160.8c313 93.8 497 216 572 280L1511 900L-200 900Z" /><path stroke="var(--color-plum)" strokeWidth="160" d={curve} /></svg><svg className="sb-slogan-text" viewBox="0 0 1440 442" aria-hidden="true"><defs><path id="slogan-curve" d={curve} /></defs><text dominantBaseline="central"><textPath ref={path} href="#slogan-curve" startOffset="-50%">{`${text} • `.repeat(4)}</textPath></text></svg></section>
}

function Sticker() {
  const element = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const [grabbed, setGrabbed] = useState(false)
  const [tilt, setTilt] = useState(0)
  const [zIndex, setZIndex] = useState(11)
  const pointer = useRef<{ x: number; y: number; lastX: number } | null>(null)
  const releaseTimer = useRef<number | undefined>(undefined)

  useEffect(() => () => clearTimeout(releaseTimer.current), [])
  const release = () => {
    pointer.current = null
    setGrabbed(false)
    setTilt(0)
    clearTimeout(releaseTimer.current)
    releaseTimer.current = window.setTimeout(() => setZIndex(11), 400)
  }

  return <div ref={element} className="sb-about-sticker" style={{ ...(position ? { left: 0, top: 0, right: 'auto', bottom: 'auto', transform: `translate(${position.x}px, ${position.y}px)` } : {}), zIndex }}
    onPointerDown={event => {
      if (event.button !== 0) return
      event.preventDefault()
      clearTimeout(releaseTimer.current)
      const current = position || { x: event.currentTarget.offsetLeft, y: event.currentTarget.offsetTop }
      setPosition(current)
      pointer.current = { x: event.clientX - current.x, y: event.clientY - current.y, lastX: event.clientX }
      setGrabbed(true)
      setZIndex(999)
      event.currentTarget.setPointerCapture(event.pointerId)
    }}
    onPointerMove={event => {
      if (!pointer.current) return
      const delta = event.clientX - pointer.current.lastX
      pointer.current.lastX = event.clientX
      setPosition({ x: event.clientX - pointer.current.x, y: event.clientY - pointer.current.y })
      setTilt(Math.max(-20, Math.min(20, delta * 1.2)))
    }}
    onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release} aria-hidden="true">
    <div className={`sb-sticker-art${grabbed ? ' is-grabbed' : ''}`} style={{ transform: `rotate(${5 + tilt}deg) scale(${grabbed ? 1.08 : 1})` }}><div><img src={asset('Mannetjes-broodje-beige.png')} draggable="false" alt="" /></div></div>
  </div>
}

function PhotoMarquee({ language }: { language: Language }) {
  const track = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const target = track.current
    if (!target) return
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      let tween: gsap.core.Tween | undefined
      let timer: number | undefined
      const animate = () => {
        tween?.kill()
        gsap.set(target, { x: 0 })
        const distance = target.scrollWidth / 2
        if (distance) tween = gsap.to(target, { x: -distance, duration: distance / 45, ease: 'none', repeat: -1 })
      }
      const resize = () => { clearTimeout(timer); timer = window.setTimeout(animate, 200) }
      animate()
      window.addEventListener('resize', resize)
      return () => { tween?.kill(); clearTimeout(timer); window.removeEventListener('resize', resize) }
    })
    return () => media.revert()
  }, [])

  return <section className="sb-photo-marquee" aria-label={language === 'en' ? 'Life at The Sandwich Bar' : 'Bij The Sandwich Bar'}><div className="sb-photo-track" ref={track}>{[0, 1].map(copy => <div className="sb-photo-group" key={copy} aria-hidden={copy === 1}>{gallery.map(name => <img key={name} src={asset(`locatieshoot/${name}.webp`)} alt="" draggable="false" loading="eager" />)}</div>)}</div></section>
}

function SandwichSlider({ language }: { language: Language }) {
  const [index, setIndex] = useState(0)
  const track = useRef<HTMLDivElement>(null)
  const viewportWidth = useRef(0)
  const currentIndex = useRef(0)
  const draggable = useRef<Draggable | null>(null)
  const data = content[language]
  const en = language === 'en'
  const last = data.sandwiches.length - 1

  const goTo = useCallback((wanted: number) => {
    if (!track.current || !viewportWidth.current) return
    const next = Math.max(0, Math.min(last, wanted))
    currentIndex.current = next
    setIndex(next)
    gsap.to(track.current, {
      x: -next * viewportWidth.current,
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : .7,
      ease: 'power3.out', overwrite: true,
      onComplete: () => { draggable.current?.update() },
    })
  }, [last])

  useLayoutEffect(() => {
    const target = track.current
    if (!target) return
    let dragStart = 0
    const setup = () => {
      draggable.current?.kill()
      gsap.killTweensOf(target)
      viewportWidth.current = window.innerWidth
      gsap.set(target, { x: -currentIndex.current * viewportWidth.current })
      draggable.current = Draggable.create(target, {
        type: 'x', edgeResistance: .85,
        bounds: { minX: -last * viewportWidth.current, maxX: 0 }, inertia: false,
        onPress() { gsap.killTweensOf(target) },
        onDragStart() {
          dragStart = Number(gsap.getProperty(target, 'x'))
          target.classList.add('is-dragging')
        },
        onDragEnd() {
          const distance = Number(gsap.getProperty(target, 'x')) - dragStart
          target.classList.remove('is-dragging')
          goTo(Math.abs(distance) >= viewportWidth.current * .15 ? currentIndex.current + (distance < 0 ? 1 : -1) : currentIndex.current)
        },
        onRelease() { target.classList.remove('is-dragging') },
      })[0]
    }
    setup()
    window.addEventListener('resize', setup)
    return () => {
      window.removeEventListener('resize', setup)
      draggable.current?.kill()
      draggable.current = null
      gsap.killTweensOf(target)
    }
  }, [goTo, last])

  return <section className="sb-sandwiches" aria-roledescription="carousel" aria-label={en ? 'Our sandwiches' : 'Onze sandwiches'} onKeyDown={event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); goTo(index + (event.key === 'ArrowLeft' ? -1 : 1)) }
  }}>
    <ScrollPath />
    <div className="sb-slider-heading"><h2>{data.sandwichTitle}<br /><span>Sandwiches</span></h2><div className="sb-slider-arrows"><button disabled={index === 0} onClick={() => goTo(index - 1)} aria-label={en ? 'Previous sandwich' : 'Vorige sandwich'}><Chevron /></button><button disabled={index === last} onClick={() => goTo(index + 1)} aria-label={en ? 'Next sandwich' : 'Volgende sandwich'}><Chevron right /></button></div></div>
    <div className="sb-slider-track" ref={track}>
      {data.sandwiches.map((sandwich, i) => <article key={sandwich.title} className="sb-slide" aria-hidden={i !== index}><img src={asset(`The Sandwichbar - Vrijstaand ${i + 1}.webp`)} width="480" height="480" draggable="false" alt={sandwich.title} loading="lazy" /><h3>{sandwich.title}</h3><p>{sandwich.description}</p></article>)}
    </div><div className="sb-slider-dots">{data.sandwiches.map((sandwich, i) => <button key={sandwich.title} className={i === index ? 'is-active' : ''} aria-label={`${en ? 'Go to sandwich' : 'Ga naar sandwich'} ${i + 1}`} aria-current={i === index ? 'true' : undefined} onClick={() => goTo(i)} />)}</div>
  </section>
}

function TikTokSection({ language }: { language: Language }) {
  const section = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const root = section.current
    if (!root) return
    const media = gsap.matchMedia()
    media.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const clampPosition = gsap.utils.clamp(-1080, 1080)
      const clampRotation = gsap.utils.clamp(-60, 60)
      let previousX = 0
      let previousY = 0
      let deltaX = 0
      let deltaY = 0
      let frame = 0
      const movement = (event: MouseEvent) => {
        if (frame) return
        frame = requestAnimationFrame(() => {
          deltaX = event.clientX - previousX
          deltaY = event.clientY - previousY
          previousX = event.clientX
          previousY = event.clientY
          frame = 0
        })
      }
      const cards = Array.from(root.querySelectorAll<HTMLElement>('.sb-video-card'))
      const targets = cards.map(card => card.querySelector('a')!)
      const handlers = cards.map((card, index) => {
        const enter = (event: MouseEvent) => {
          const target = targets[index]
          const rect = target.getBoundingClientRect()
          const x = event.clientX - (rect.left + rect.width / 2)
          const y = event.clientY - (rect.top + rect.height / 2)
          const cross = x * deltaY - y * deltaX
          const distance = Math.hypot(x, y) || 1
          gsap.to(target, { inertia: {
            x: { velocity: clampPosition(30 * deltaX), end: 0 },
            y: { velocity: clampPosition(30 * deltaY), end: 0 },
            rotation: { velocity: clampRotation(cross / distance * 20), end: 0 },
            resistance: 200,
          }, overwrite: true })
        }
        card.addEventListener('mouseenter', enter)
        return enter
      })
      root.addEventListener('mousemove', movement)
      return () => {
        cancelAnimationFrame(frame)
        root.removeEventListener('mousemove', movement)
        cards.forEach((card, index) => card.removeEventListener('mouseenter', handlers[index]))
        gsap.killTweensOf(targets)
        gsap.set(targets, { clearProps: 'transform' })
      }
    })
    return () => media.revert()
  }, [])

  return <section ref={section} className="sb-tiktok"><div><h2>{language === 'en' ? 'Follow us on' : 'Volg ons op'} <span>TikTok</span></h2><div className="sb-video-grid">{videos.map((name, i) => <div className="sb-video-card" key={i}><a href={external.tiktok} target="_blank" rel="noopener noreferrer" aria-label={`${language === 'en' ? 'Watch on TikTok' : 'Bekijk op TikTok'} ${i + 1}`}><video src={asset(`videos/${name}.mp4`)} autoPlay muted loop playsInline preload="metadata" /><div className="sb-video-gradient" /><span>TT{i + 1}</span></a></div>)}</div></div></section>
}

function Chevron({ right = false }: { right?: boolean }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points={right ? '9 18 15 12 9 6' : '15 18 9 12 15 6'} /></svg>
}

function Locations({ language }: { language: Language }) {
  const en = language === 'en'
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(now)
  const part = (type: string) => parts.find(p => p.type === type)?.value || ''
  const day = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(part('weekday'))
  const minutes = Number(part('hour')) * 60 + Number(part('minute'))
  const open = minutes >= 540 && minutes < (day > 4 ? 1050 : 1020)
  const days = en ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] : ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag']
  return <section className="sb-locations"><ScrollPath location /><div className="sb-wide"><h2>{en ? 'Our' : 'Onze'}<br /><span>{en ? 'Locations' : 'Locaties'}</span></h2><div className="sb-location-grid">{[
    { title: 'Nassaukade', address: 'Nassaukade 378H, Amsterdam', map: 'CKT2jVSsXiU84Gni9', image: 'tsb1-location.webp' },
    { title: 'Amstelveenseweg', address: 'Amstelveenseweg 156, Amsterdam', map: 'mBG7LVu3xHNkC4DNA', image: 'tsb2-location.webp' },
  ].map(location => <article key={location.title}><img className="sb-location-photo" src={asset(location.image)} alt={location.title} loading="lazy" /><div className="sb-location-details"><h3>{location.title}</h3><p>{location.address}</p><a className="sb-map-link" href={`https://maps.app.goo.gl/${location.map}`} target="_blank" rel="noopener noreferrer"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>Open in Google Maps</a><div className="sb-opening-hours"><div className="sb-hours-heading"><h4>{en ? 'Opening hours' : 'Openingstijden'}</h4><span className={open ? 'sb-open' : 'sb-closed'}><i />{open ? 'Open' : en ? 'Closed' : 'Gesloten'}</span></div>{days.map((name, i) => <div key={name} className={`sb-day${i === day ? ' is-today' : ''}`}><span>{name}</span><span>09:00–{i > 4 ? '17:30' : '17:00'}</span></div>)}</div></div></article>)}</div></div></section>
}

function FAQ({ language }: { language: Language }) {
  const [opened, setOpened] = useState<number | null>(null)
  const data = content[language]
  return <section className="sb-faq"><div className="sb-wide"><h2>{data.faqTitle}</h2><div className="sb-faq-columns">{[0, 4].map(start => <div key={start}>{data.faq.slice(start, start + 4).map((item, i) => {
    const number = start + i
    const open = opened === number
    return <article className={`sb-faq-item${open ? ' is-open' : ''}`} key={item.question}><h3><button aria-expanded={open} aria-controls={`faq-${number}`} onClick={() => setOpened(open ? null : number)}><span>{item.question}</span><span className="sb-faq-plus" aria-hidden="true" /></button></h3><div className="sb-faq-answer" id={`faq-${number}`} inert={!open}><div><p>{item.answer.split(/(https:\/\/catering\.thesandwichbar\.nl)/).map((text, j) => text === external.order ? <a href={text} key={j}>{text}</a> : text)}</p></div></div></article>
  })}</div>)}</div></div></section>
}

export default function HomePage({ language }: { language: Language }) {
  const data = content[language]
  const en = language === 'en'
  const main = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    const root = main.current
    if (!root) return
    const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-hero-title], [data-hero-subtitle], .sb-hero-description > .sb-bubble'))
    let tween: gsap.core.Tween | undefined
    const enter = (event: Event) => {
      const detail = (event as CustomEvent<{ reason?: string; delay?: number }>).detail
      if (detail?.reason !== 'intro') return
      tween?.kill()
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) gsap.set(targets, { autoAlpha: 1, y: 0 })
      else tween = gsap.to(targets, { autoAlpha: 1, y: 0, duration: 1, stagger: .2, ease: 'power3.inOut', delay: detail?.delay || 0 })
    }
    window.addEventListener('sandwich:page-enter', enter)
    return () => { window.removeEventListener('sandwich:page-enter', enter); tween?.kill() }
  }, [])
  return <main id="main-content" className="sb-home" ref={main}>
    <section className="sb-hero"><img className="sb-hero-photo" src={asset('The Sandwichbar 04.webp')} alt="The Sandwich Bar" fetchPriority="high" /><div className="sb-hero-shade" /><div className="sb-hero-title"><h1 data-hero-title>The Sandwich Bar</h1></div><div className="sb-hero-description"><p data-hero-subtitle>{data.hero}</p><BubbleLink href={`/${language}/menu`}>{data.heroButton}</BubbleLink></div></section>
    <Slogan text={data.slogan} />
    <section className="sb-about"><div><img src={asset('locatieshoot/the-sandwichbar-20.webp')} alt="The Sandwich Bar locatie" loading="lazy" /><div className="sb-about-copy">{data.about.map(text => <p key={text}>{text}</p>)}</div></div><Sticker /></section>
    <section className="sb-catering-intro"><div className="sb-catering-inner"><img src={asset('The Sandwichbar 02.webp')} alt="The Sandwich Bar catering" loading="lazy" /><div className="sb-catering-copy"><div><span className="sb-eyebrow">Catering</span><h2>{data.cateringTitle}</h2></div><div className="sb-catering-body">{data.catering.map(text => <p key={text}>{text}</p>)}</div><div className="sb-catering-actions"><a href={external.order}>{data.cateringLinks[0]}</a><a href={`/${language}/catering`}>{data.cateringLinks[1]}</a></div></div></div></section>
    <PhotoMarquee language={language} />
    <section className="sb-membership"><img src={asset('The Sandwichbar 07.webp')} alt="" loading="lazy" /><div className="sb-membership-overlay" /><div className="sb-membership-inner"><h2>{en ? 'Become a' : 'Word'}<br /><span>member</span></h2><div className="sb-membership-card">{data.member.slice(0, 3).map(text => <p key={text}>{text}</p>)}<hr /><div><p>{data.member[3]}</p><a href={external.member}>{data.memberButton}</a></div></div></div></section>
    <SandwichSlider language={language} />
    <TikTokSection language={language} />
    <Locations language={language} /><FAQ language={language} />
  </main>
}
