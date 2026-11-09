import { useEffect, useRef, useState } from 'react'
import './MenuHero.css'

export type MenuHeroSlide = {
  id: string
  image: string
  alt: string
}

type MenuHeroProps = {
  slides: MenuHeroSlide[]
  onSelect?: (slideId: string) => void
}

export default function MenuHero({ slides, onSelect }: MenuHeroProps) {
  const [position, setPosition] = useState(1)
  const [animate, setAnimate] = useState(true)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const swipeStart = useRef<{ x: number; y: number } | null>(null)
  const swiped = useRef(false)
  const transitioning = useRef(false)
  const currentIndex = slides.length ? (position - 1 + slides.length) % slides.length : 0
  const advance = (direction: number) => {
    if (reducedMotion) {
      setPosition((current) => (current - 1 + direction + slides.length) % slides.length + 1)
    } else if (!transitioning.current) {
      transitioning.current = true
      setPosition((current) => current + direction)
    }
  }

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReducedMotion(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (slides.length < 2 || hovered || focused || reducedMotion) return
    const timer = window.setInterval(() => {
      if (!document.hidden && !transitioning.current) {
        transitioning.current = true
        setPosition((current) => current + 1)
      }
    }, 4000)
    return () => window.clearInterval(timer)
  }, [slides.length, hovered, focused, reducedMotion, position])

  if (!slides.length) return null
  const renderedSlides = [slides[slides.length - 1], ...slides, slides[0]]

  return (
    <section className="sc-menu-container sc-hero" aria-label="Ưu đãi nổi bật" aria-roledescription="trình chiếu">
      <div className="sc-hero-window" onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setHovered(true)
      }} onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') setHovered(false)
      }} onFocus={() => setFocused(true)} onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
      }} onKeyDown={(event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault()
          advance(event.key === 'ArrowLeft' ? -1 : 1)
        }
      }} onTouchStart={(event) => {
        const touch = event.touches[0]
        swipeStart.current = { x: touch.clientX, y: touch.clientY }
        swiped.current = false
      }} onTouchEnd={(event) => {
        const touch = event.changedTouches[0]
        const start = swipeStart.current
        if (start && Math.abs(touch.clientX - start.x) > 40 && Math.abs(touch.clientX - start.x) > Math.abs(touch.clientY - start.y)) {
          swiped.current = true
          advance(touch.clientX < start.x ? 1 : -1)
          window.setTimeout(() => { swiped.current = false }, 250)
        }
        swipeStart.current = null
      }}>
        <div className={`sc-hero-track${animate ? '' : ' sc-hero-track-reset'}`} style={{ transform: `translateX(-${position * 100}%)` }} onTransitionEnd={(event) => {
          if (event.target !== event.currentTarget) return
          transitioning.current = false
          if (position === 0 || position === slides.length + 1) {
            setAnimate(false)
            setPosition(position === 0 ? slides.length : 1)
            requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)))
          }
        }}>
          {renderedSlides.map((slide, slidePosition) => {
            const isClone = slidePosition === 0 || slidePosition === renderedSlides.length - 1
            const isActive = !isClone && slidePosition - 1 === currentIndex
            return <div className="sc-hero-slide" key={`${slide.id}-${slidePosition}`} role="group" aria-roledescription="trang" aria-label={`${slidePosition} / ${slides.length}`} aria-hidden={!isActive}>
              <button type="button" className="sc-hero-select" tabIndex={isActive ? 0 : -1} onClick={() => {
                if (!swiped.current) onSelect?.(slide.id)
                swiped.current = false
              }} aria-label={slide.alt}>
                <img src={slide.image} alt={slide.alt} width="1200" height="480" loading={slidePosition < 3 ? 'eager' : 'lazy'} draggable="false" />
              </button>
            </div>
          })}
        </div>
        {slides.length > 1 && <>
          <button type="button" className="sc-hero-arrow sc-hero-prev" aria-label="Ưu đãi trước" onClick={() => advance(-1)}><img src="/sites/thepizzacompany-vn/menu/user_carousel.svg" width="36" height="28" alt="" /></button>
          <button type="button" className="sc-hero-arrow sc-hero-next" aria-label="Ưu đãi tiếp theo" onClick={() => advance(1)}><img src="/sites/thepizzacompany-vn/menu/user_carousel.svg" width="36" height="28" alt="" /></button>
        </>}
        <span className="sc-hero-status" aria-live={focused || hovered ? 'polite' : 'off'}>{currentIndex + 1} / {slides.length}</span>
      </div>
    </section>
  )
}
