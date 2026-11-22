import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Draggable } from 'gsap/Draggable'
import { InertiaPlugin } from 'gsap/InertiaPlugin'
import { PalazzoTable } from './PalazzoTable'
import { MemberSignup } from './MemberSignup'
import { asset, cateringHref, type Language } from './siteData'
import content from './homeContent.json'
import './HomePage.css'
import './PalazzoTable.css'

gsap.registerPlugin(ScrollTrigger, Draggable, InertiaPlugin)

const gallery = [
  'images/crab.jpg',
  'images/seafood-platter.jpg',
  'images/crab.jpg',
  'images/lobster-prawns.jpg',
  'images/king-crab.jpg',
  'images/seafood-feast.jpg',
  'images/seafood-platter.jpg',
  'images/king-crab.jpg',
  'images/lobster-prawns.jpg',
  'images/lobster-dish.jpg',
  'images/seafood-ceviche.jpg',
  'images/lobster-dish.jpg',
  'images/garlic-prawns.jpg',
  'images/seafood-platter.jpg',
  'images/seafood-ceviche.jpg',
  'images/grilled-squid.jpg',
  'images/grilled-squid.jpg',
  'images/king-crab.jpg',
  'images/lobster-prawns.jpg',
  'images/seafood-feast.jpg',
  'images/lobster-dish.jpg',
  'images/garlic-prawns.jpg',
  'images/boiled-lobster.jpg',
  'images/crab.jpg',
  'images/grilled-squid.jpg',
  'images/garlic-prawns.jpg',
]
const videos = [
  'videos/seafood-stir-fry.mp4',
  'videos/prawn-plating.mp4',
  'videos/seafood-cooking.mp4',
  'videos/seafood-stir-fry.mp4',
]
const featuredImages = [
  'images/signature/king-crab.webp',
  'images/signature/lobster.webp',
  'images/signature/garlic-prawns.webp',
]

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

  return (
    <svg
      className="sb-decorative-path"
      ref={svg}
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <path
        ref={path}
        opacity={location ? 0.08 : 0.1}
        d={
          location
            ? 'M 1440 80 C 1200 120, 980 60, 820 180 C 700 270, 680 390, 720 480 C 760 570, 840 600, 820 680 C 800 750, 720 790, 580 820 C 440 850, 260 830, 0 880'
            : 'M 30 20 C 180 30, 380 150, 530 340 C 590 400, 615 460, 582 510 C 550 558, 482 562, 462 518 C 442 474, 464 418, 522 408 C 580 398, 645 445, 685 530 C 740 640, 780 760, 800 900'
        }
      />
    </svg>
  )
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
        if (distance)
          tween = gsap.to(target, {
            x: -distance,
            duration: distance / 45,
            ease: 'none',
            repeat: -1,
          })
      }
      const resize = () => {
        clearTimeout(timer)
        timer = window.setTimeout(animate, 200)
      }
      animate()
      window.addEventListener('resize', resize)
      return () => {
        tween?.kill()
        clearTimeout(timer)
        window.removeEventListener('resize', resize)
      }
    })
    return () => media.revert()
  }, [])

  return (
    <section
      className="sb-photo-marquee"
      aria-label={language === 'en' ? "Life at The Sea's Crown" : "Hình ảnh tại The Sea's Crown"}
    >
      <div className="sb-photo-track" ref={track}>
        {[0, 1].map((copy) => (
          <div className="sb-photo-group" key={copy} aria-hidden={copy === 1}>
            {gallery.map((name, index) => (
              <img key={index} src={asset(name)} alt="" draggable="false" loading="eager" />
            ))}
          </div>
        ))}
      </div>
    </section>
  )
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

  const goTo = useCallback(
    (wanted: number) => {
      if (!track.current || !viewportWidth.current) return
      const next = Math.max(0, Math.min(last, wanted))
      currentIndex.current = next
      setIndex(next)
      gsap.to(track.current, {
        x: -next * viewportWidth.current,
        duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.7,
        ease: 'power3.out',
        overwrite: true,
        onComplete: () => {
          draggable.current?.update()
        },
      })
    },
    [last],
  )

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
        type: 'x',
        edgeResistance: 0.85,
        bounds: { minX: -last * viewportWidth.current, maxX: 0 },
        inertia: false,
        onPress() {
          gsap.killTweensOf(target)
        },
        onDragStart() {
          dragStart = Number(gsap.getProperty(target, 'x'))
          target.classList.add('is-dragging')
        },
        onDragEnd() {
          const distance = Number(gsap.getProperty(target, 'x')) - dragStart
          target.classList.remove('is-dragging')
          goTo(
            Math.abs(distance) >= viewportWidth.current * 0.15
              ? currentIndex.current + (distance < 0 ? 1 : -1)
              : currentIndex.current,
          )
        },
        onRelease() {
          target.classList.remove('is-dragging')
        },
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

  return (
    <section
      id="seafood-specialties"
      className="sb-sandwiches"
      aria-roledescription="carousel"
      aria-label={en ? 'Signature seafood dishes' : 'Các món hải sản đặc trưng'}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault()
          goTo(index + (event.key === 'ArrowLeft' ? -1 : 1))
        }
      }}
    >
      <ScrollPath />
      <div className="sb-slider-heading">
        <h2>
          {data.sandwichTitle}
          <br />
          <span>{en ? 'Seafood' : 'Hải sản'}</span>
        </h2>
        <div className="sb-slider-arrows">
          <button
            disabled={index === 0}
            onClick={() => goTo(index - 1)}
            aria-label={en ? 'Previous dish' : 'Món trước'}
          >
            <Chevron />
          </button>
          <button
            disabled={index === last}
            onClick={() => goTo(index + 1)}
            aria-label={en ? 'Next dish' : 'Món tiếp theo'}
          >
            <Chevron right />
          </button>
        </div>
      </div>
      <div className="sb-slider-track" ref={track}>
        {data.sandwiches.map((sandwich, i) => (
          <article key={sandwich.title} className="sb-slide" aria-hidden={i !== index}>
            <img
              src={asset(featuredImages[i])}
              width="480"
              height="480"
              draggable="false"
              alt={
                (en
                  ? [
                      'Plate of king crab with garlic butter',
                      'Plate of grilled lobster',
                      'Plate of garlic butter prawns',
                    ]
                  : ['Đĩa cua hoàng đế ăn kèm bơ tỏi', 'Đĩa tôm hùm nướng', 'Đĩa tôm sốt bơ tỏi'])[
                  i
                ]
              }
              loading="lazy"
            />
            <h3>{sandwich.title}</h3>
            <p>{sandwich.description}</p>
          </article>
        ))}
      </div>
      <div className="sb-slider-dots">
        {data.sandwiches.map((sandwich, i) => (
          <button
            key={sandwich.title}
            className={i === index ? 'is-active' : ''}
            aria-label={`${en ? 'Go to dish' : 'Đến món'} ${i + 1}`}
            aria-current={i === index ? 'true' : undefined}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </section>
  )
}

function TikTokSection({ language }: { language: Language }) {
  const section = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const root = section.current
    if (!root) return
    const media = gsap.matchMedia()
    media.add(
      '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
      () => {
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
        const targets = cards.map((card) => card.querySelector<HTMLElement>('.sb-video-preview')!)
        const handlers = cards.map((card, index) => {
          const enter = (event: MouseEvent) => {
            const target = targets[index]
            const rect = target.getBoundingClientRect()
            const x = event.clientX - (rect.left + rect.width / 2)
            const y = event.clientY - (rect.top + rect.height / 2)
            const cross = x * deltaY - y * deltaX
            const distance = Math.hypot(x, y) || 1
            gsap.to(target, {
              inertia: {
                x: { velocity: clampPosition(30 * deltaX), end: 0 },
                y: { velocity: clampPosition(30 * deltaY), end: 0 },
                rotation: { velocity: clampRotation((cross / distance) * 20), end: 0 },
                resistance: 200,
              },
              overwrite: true,
            })
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
      },
    )
    return () => media.revert()
  }, [])

  return (
    <section ref={section} className="sb-tiktok">
      <div>
        <h2>
          {language === 'en' ? 'Follow us on' : 'Theo dõi trên'} <span>TikTok</span>
        </h2>
        <div className="sb-video-grid">
          {videos.map((name, i) => (
            <div className="sb-video-card" key={i}>
              <div className="sb-video-preview">
                <video src={asset(name)} autoPlay muted loop playsInline preload="metadata" />
                <div className="sb-video-gradient" />
                <span>TT{i + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Chevron({ right = false }: { right?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <polyline points={right ? '9 18 15 12 9 6' : '15 18 9 12 15 6'} />
    </svg>
  )
}

function Locations({ language }: { language: Language }) {
  const en = language === 'en'
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Amsterdam',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(now)
  const part = (type: string) => parts.find((p) => p.type === type)?.value || ''
  const day = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(part('weekday'))
  const minutes = Number(part('hour')) * 60 + Number(part('minute'))
  const open = minutes >= 540 && minutes < (day > 4 ? 1050 : 1020)
  const days = en
    ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    : ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ nhật']
  return (
    <section className="sb-locations">
      <ScrollPath location />
      <div className="sb-wide">
        <h2>
          {en ? 'Our' : 'Chi nhánh'}
          <br />
          <span>{en ? 'Locations' : 'của chúng tôi'}</span>
        </h2>
        <div className="sb-location-grid">
          {[
            {
              title: 'Nassaukade',
              address: 'Nassaukade 378H, Amsterdam',
              map: 'CKT2jVSsXiU84Gni9',
              image: 'images/locations/nassaukade.webp',
            },
            {
              title: 'Amstelveenseweg',
              address: 'Amstelveenseweg 156, Amsterdam',
              map: 'mBG7LVu3xHNkC4DNA',
              image: 'images/locations/amstelveenseweg.webp',
            },
          ].map((location) => (
            <article key={location.title}>
              <img
                className="sb-location-photo"
                src={asset(location.image)}
                alt={location.title}
                loading="lazy"
              />
              <div className="sb-location-details">
                <h3>{location.title}</h3>
                <p>{location.address}</p>
                <a
                  className="sb-map-link"
                  href={`https://maps.app.goo.gl/${location.map}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                  >
                    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {en ? 'Open in Google Maps' : 'Xem trên Google Maps'}
                </a>
                <div className="sb-opening-hours">
                  <div className="sb-hours-heading">
                    <h4>{en ? 'Opening hours' : 'Giờ mở cửa'}</h4>
                    <span className={open ? 'sb-open' : 'sb-closed'}>
                      <i />
                      {open ? (en ? 'Open' : 'Đang mở') : en ? 'Closed' : 'Đã đóng'}
                    </span>
                  </div>
                  {days.map((name, i) => (
                    <div key={name} className={`sb-day${i === day ? ' is-today' : ''}`}>
                      <span>{name}</span>
                      <span>09:00–{i > 4 ? '17:30' : '17:00'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function FAQ({ language }: { language: Language }) {
  const [opened, setOpened] = useState<number | null>(null)
  const data = content[language]
  return (
    <section className="sb-faq">
      <div className="sb-wide">
        <h2>{data.faqTitle}</h2>
        <div className="sb-faq-columns">
          {[0, 4].map((start) => (
            <div key={start}>
              {data.faq.slice(start, start + 4).map((item, i) => {
                const number = start + i
                const open = opened === number
                return (
                  <article className={`sb-faq-item${open ? ' is-open' : ''}`} key={item.question}>
                    <h3>
                      <button
                        aria-expanded={open}
                        aria-controls={`faq-${number}`}
                        onClick={() => setOpened(open ? null : number)}
                      >
                        <span>{item.question}</span>
                        <span className="sb-faq-plus" aria-hidden="true" />
                      </button>
                    </h3>
                    <div className="sb-faq-answer" id={`faq-${number}`} inert={!open}>
                      <div>
                        <p>{item.answer}</p>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function HomePage({ language }: { language: Language }) {
  const data = content[language]
  const en = language === 'en'
  return (
    <main id="main-content" className="sb-home">
      <PalazzoTable language={language} />
      <section id="about" className="sb-about" aria-labelledby="sb-about-title">
        <div className="sb-about-inner">
          <h2
            id="sb-about-title"
            aria-label={
              en
                ? 'One table, eight courses and seafood in season.'
                : 'Một bàn tiệc, tám món và hải sản theo mùa.'
            }
          >
            <span className="sb-about-title-line" aria-hidden="true">
              <span>{en ? 'One table,' : 'Một bàn tiệc,'}</span>
              <span className="sb-about-inline-image is-round">
                <img src={asset('images/signature/garlic-prawns.webp')} alt="" loading="lazy" />
              </span>
              <em>{en ? 'eight courses' : 'tám món'}</em>
            </span>
            <span className="sb-about-title-line" aria-hidden="true">
              <span>{en ? 'and seafood' : 'và hải sản'}</span>
              <span className="sb-about-inline-image is-pill">
                <img src={asset('images/lobster-dish.jpg')} alt="" loading="lazy" />
              </span>
              <em>{en ? 'in season.' : 'theo mùa.'}</em>
            </span>
          </h2>
          <div className="sb-about-footer">
            <div className="sb-about-brand">
              <span className="sb-about-mark" aria-hidden="true">
                <img src={asset('images/logo.png')} alt="" />
              </span>
              <span>
                <strong>The Sea's Crown</strong>
                <small>{en ? 'Crab, prawns, squid and lobster' : 'Cua, tôm, mực và tôm hùm'}</small>
              </span>
            </div>
            <a className="sb-about-action" href={`/${language}/menu`}>
              {en ? 'View the menu' : 'Xem thực đơn'}
            </a>
          </div>
        </div>
      </section>
      <section className="sb-catering-intro">
        <div className="sb-catering-inner">
          <img
            src={asset('images/seafood-feast.jpg')}
            alt={en ? "The Sea's Crown catering" : "Dịch vụ đặt tiệc The Sea's Crown"}
            loading="lazy"
          />
          <div className="sb-catering-copy">
            <div>
              <span className="sb-eyebrow">{en ? 'Catering' : 'Đặt tiệc'}</span>
              <h2>{data.cateringTitle}</h2>
            </div>
            <div className="sb-catering-body">
              {data.catering.map((text) => (
                <p key={text}>{text}</p>
              ))}
            </div>
            <div className="sb-catering-actions">
              <a href={cateringHref(language, 'booking')}>{data.cateringLinks[0]}</a>
              <a href={cateringHref(language, 'preorder')}>{data.cateringLinks[1]}</a>
            </div>
          </div>
        </div>
      </section>
      <PhotoMarquee language={language} />
      <section className="sb-membership">
        <img src={asset('images/lobster-prawns.jpg')} alt="" loading="lazy" />
        <div className="sb-membership-overlay" />
        <div className="sb-membership-inner">
          <h2>
            {en ? 'Become a' : 'Trở thành'}
            <br />
            <span>{en ? 'member' : 'thành viên'}</span>
          </h2>
          <div className="sb-membership-card">
            {data.member.map((text) => (
              <p key={text}>{text}</p>
            ))}
            <hr />
            <MemberSignup language={language} />
          </div>
        </div>
      </section>
      <SandwichSlider language={language} />
      <TikTokSection language={language} />
      <Locations language={language} />
      <FAQ language={language} />
    </main>
  )
}
