import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useMenuData } from '../../../hooks/useMenuData'
import { BookingForm } from './catering/BookingForm'
import { BOOKING_COPY, type Cart } from './catering/bookingCopy'
import { PreorderMenu } from './catering/PreorderMenu'
import { asset, type Language } from './siteData'
import './CateringPage.css'
import './catering/Booking.css'

const oddImages = [
  'images/seafood-platter.jpg',
  'images/king-crab.jpg',
  'images/grilled-squid.jpg',
  'images/lobster-prawns.jpg',
]
const evenImages = [
  'images/seafood-feast.jpg',
  'images/seafood-platter.jpg',
  'images/crab.jpg',
  'images/seafood-ceviche.jpg',
]
const copy = {
  vi: {
    title: 'Cùng nhau thưởng thức một bàn tiệc hải sản',
    intro:
      "Sinh nhật, họp mặt gia đình hay liên hoan cùng đồng nghiệp — The Sea's Crown cùng bạn lên thực đơn cua, tôm, mực và tôm hùm cho dịp đặc biệt. Chia sẻ số khách, thời gian và sở thích để nhà hàng tư vấn món cùng khẩu phần phù hợp.",
    order: 'Đặt bàn ngay',
    preorder: 'Chọn món trước',
    questions: 'Trao đổi về bữa tiệc của bạn:',
  },
  en: {
    title: 'Bring everyone together over a seafood feast',
    intro:
      "A birthday, family gathering or team celebration — The Sea's Crown helps you plan a menu of crab, prawns, squid and lobster. Share your guest count, preferred time and tastes so our team can discuss suitable dishes and portions.",
    order: 'Book a table',
    preorder: 'Pre-order dishes',
    questions: 'Tell us about your occasion:',
  },
}

function ImageStream({ images, offset = false }: { images: string[]; offset?: boolean }) {
  const container = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = track.current
    const wrapper = container.current
    if (!element || !wrapper) return
    const motion = window.matchMedia(
      '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
    )
    let animation: gsap.core.Tween | undefined
    let resizeFrame = 0
    let previousWidth = -1

    const animate = () => {
      const progress = animation?.progress() ?? 0
      animation?.kill()
      gsap.set(element, { clearProps: 'transform' })
      if (!motion.matches) return
      const firstGroup = Array.from(element.children).slice(0, images.length) as HTMLElement[]
      // Include the final gap between the original group and its identical copy.
      const distance = firstGroup.reduce((height, image) => height + image.offsetHeight + 12, 0)
      if (!distance) return
      animation = gsap.to(element, {
        y: -distance,
        duration: offset ? 22 : 28,
        ease: 'none',
        repeat: -1,
        paused: !onScreen,
      })
      animation.progress(progress)
    }

    // Only animate while the hero is on screen: the endless tween otherwise keeps
    // repainting 16 large photos the whole time the visitor reads the rest of the page.
    let onScreen = true
    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      if (onScreen) animation?.play()
      else animation?.pause()
    })
    visibility.observe(wrapper)

    const resize = () => {
      const currentWidth = wrapper.getBoundingClientRect().width
      if (currentWidth === previousWidth) return
      previousWidth = currentWidth
      cancelAnimationFrame(resizeFrame)
      resizeFrame = requestAnimationFrame(animate)
    }
    const observer = new ResizeObserver(resize)
    observer.observe(wrapper)
    motion.addEventListener('change', animate)
    animate()
    return () => {
      cancelAnimationFrame(resizeFrame)
      observer.disconnect()
      visibility.disconnect()
      motion.removeEventListener('change', animate)
      animation?.kill()
      gsap.set(element, { clearProps: 'transform' })
    }
  }, [images, offset])

  return (
    <div
      ref={container}
      className={`sb-catering-stream${offset ? ' is-offset' : ''}`}
      aria-hidden="true"
    >
      <div ref={track} className="sb-catering-stream-track">
        {[...images, ...images].map((image, index) => (
          <img
            key={`${image}-${index}`}
            src={asset(image)}
            alt=""
            loading={index < 4 ? 'eager' : 'lazy'}
          />
        ))}
      </div>
    </div>
  )
}

export default function CateringPage({ language }: { language: Language }) {
  const t = copy[language]
  const b = BOOKING_COPY[language]
  const { state, retry } = useMenuData()
  const data = state.status === 'ready' ? state.data : null
  // Pre-ordered dishes and guest count, shared by the dish picker and the booking form.
  const [cart, setCart] = useState<Cart>({})
  const [guests, setGuests] = useState(4)
  const setQuantity = (dishId: string, quantity: number) =>
    setCart((current) => {
      const next = { ...current }
      if (quantity > 0) next[dishId] = Math.round(quantity * 2) / 2
      else delete next[dishId]
      return next
    })
  const applyPartySet = (items: Cart, recommendedGuests: number) => {
    setCart({ ...items })
    setGuests((current) => Math.max(current, recommendedGuests))
  }

  return (
    <main id="main-content" className="sb-catering-page">
      <section className="sb-catering-hero">
        <img
          className="sb-catering-mobile-image"
          src={asset('images/seafood-platter.jpg')}
          alt={language === 'en' ? "The Sea's Crown catering" : "Dịch vụ đặt tiệc The Sea's Crown"}
        />
        <div className="sb-catering-hero-inner">
          <div className="sb-catering-hero-copy">
            <span className="sb-catering-eyebrow">
              {language === 'en' ? 'Catering' : 'Đặt tiệc'}
            </span>
            <h1>{t.title}</h1>
            <p>{t.intro}</p>
            <div className="bk-hero-actions">
              <a className="sb-catering-button bk-hero-primary" href="#catering-booking">
                {t.order}
              </a>
              <a className="sb-catering-button" href="#catering-preorder">
                {t.preorder}
              </a>
            </div>
            <div className="sb-catering-contact">
              <p>{t.questions}</p>
              <div>
                <a href="mailto:orders@thesandwichbar.nl">orders@thesandwichbar.nl</a>
                <a href="tel:0615657447">06-15657447</a>
                <a href="tel:0615004988">06-15004988</a>
              </div>
            </div>
          </div>
          <div className="sb-catering-streams">
            <ImageStream images={oddImages} />
            <ImageStream images={evenImages} offset />
          </div>
        </div>
      </section>
      <PreorderMenu
        data={data}
        status={state.status}
        onRetry={retry}
        cart={cart}
        guests={guests}
        onChange={setQuantity}
        onApplySet={applyPartySet}
        onClearCart={() => setCart({})}
        language={language}
      />
      {/* Red block (formerly the printed event menu): table booking with a floor plan and pre-ordered dishes. */}
      <section id="catering-booking" className="bk-booking" aria-labelledby="bk-booking-title">
        <div className="sb-catering-container">
          <header className="bk-booking-header">
            <span className="sb-catering-eyebrow">{b.bookingEyebrow}</span>
            <h2 id="bk-booking-title">{b.bookingTitle}</h2>
            <p>{b.bookingIntro}</p>
            <p className="bk-booking-note">{b.bookingNote}</p>
          </header>
          <div className="bk-booking-card">
            <BookingForm
              language={language}
              dishes={data?.dishes ?? []}
              cart={cart}
              guests={guests}
              onGuestsChange={setGuests}
              onCartChange={setQuantity}
              onCartClear={() => setCart({})}
            />
          </div>
          <div className="bk-footer-divider" aria-hidden="true">
            <span className="bk-footer-divider-line" />
            <span className="bk-footer-divider-emblem">
              <span className="bk-footer-divider-diamond" />
              <span className="bk-footer-divider-text">
                {language === 'en'
                  ? "THE SEA'S CROWN · SEAFOOD FEAST"
                  : "THE SEA'S CROWN · HẸN GẶP BẠN TẠI BÀN TIỆC"}
              </span>
              <span className="bk-footer-divider-diamond" />
            </span>
            <span className="bk-footer-divider-line" />
          </div>
        </div>
      </section>
    </main>
  )
}
