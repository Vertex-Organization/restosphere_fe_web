import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import type { Dish } from '../../../../api/menu/types'
import type { Language } from '../siteData'
import { DishCard } from './DishCard'
import { COPY } from './menuCopy'
import './MenuRail.css'

type MenuRailProps = {
  id: string
  title: string
  variant: 'food' | 'drink'
  dishes: Dish[]
  language: Language
  /** Auto-scroll speed in px per second. */
  speed: number
  /** Stops auto-scrolling, e.g. while a dish dialog is open. */
  paused?: boolean
  /** Filter controls shown between the heading and the rail. */
  children?: ReactNode
  onOpen: (id: string) => void
}

/** How long auto-scroll waits after the visitor touches, scrolls or clicks. */
const RESUME_AFTER_MS = 3500

/**
 * A titled, full-width rail that drifts slowly sideways in an endless loop.
 * The items are rendered twice so the loop has no visible jump; the copy is
 * hidden from assistive technology and keyboard focus. Hovering, focusing,
 * touching or scrolling pauses the drift.
 */
export function MenuRail({ id, title, variant, dishes, language, speed, paused = false, children, onOpen }: MenuRailProps) {
  const t = COPY[language]
  const track = useRef<HTMLUListElement>(null)
  const [looping, setLooping] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [visible, setVisible] = useState(false)
  const [reducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const holdUntil = useRef(0)
  const position = useRef(0)

  const hold = useCallback(() => { holdUntil.current = performance.now() + RESUME_AFTER_MS }, [])

  /** Width of one full set of items: where the copy starts. */
  const setWidth = useCallback(() => {
    const list = track.current
    const first = list?.firstElementChild as HTMLElement | null
    const copy = list?.querySelector<HTMLElement>('[data-copy-start]')
    return first && copy ? copy.offsetLeft - first.offsetLeft : 0
  }, [])

  // Loop only when one set of items is wider than the screen.
  useLayoutEffect(() => {
    const list = track.current
    if (!list) return
    const measure = () => {
      const single = setWidth() || list.scrollWidth
      setLooping(dishes.length > 1 && single > list.clientWidth + 8)
    }
    list.scrollLeft = 0
    position.current = 0
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(list)
    return () => observer.disconnect()
  }, [dishes, setWidth])

  // Only animate while the rail is on screen.
  useEffect(() => {
    const list = track.current
    if (!list) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    observer.observe(list)
    return () => observer.disconnect()
  }, [dishes.length])

  const running = looping && visible && !paused && !hovered && !focused && !reducedMotion

  useEffect(() => {
    const list = track.current
    if (!running || !list) return
    position.current = list.scrollLeft
    let last = performance.now()
    let frame = requestAnimationFrame(function step(now) {
      const elapsed = Math.min(now - last, 100)
      last = now
      // The visitor moved the rail (swipe, trackpad): continue from there.
      if (Math.abs(list.scrollLeft - position.current) > 2) position.current = list.scrollLeft
      if (now >= holdUntil.current && !document.hidden) {
        const width = setWidth()
        position.current += (speed * elapsed) / 1000
        if (width && position.current >= width) position.current -= width
        list.scrollLeft = position.current
      }
      frame = requestAnimationFrame(step)
    })
    return () => cancelAnimationFrame(frame)
  }, [running, speed, setWidth])

  // Mouse wheel over the rail scrolls it sideways (eased) instead of the page.
  // React's onWheel is passive, so the listener is attached by hand.
  const loopingRef = useRef(looping)
  const stopGlide = useRef(() => {})
  useEffect(() => { loopingRef.current = looping }, [looping])
  useEffect(() => {
    const list = track.current
    if (!list) return
    let target: number | null = null
    let frame = 0
    // Lets pointer-leave stop an unfinished glide so the drift takes over at once.
    stopGlide.current = () => { cancelAnimationFrame(frame); target = null }

    const glide = () => {
      if (target === null) return
      const width = loopingRef.current ? setWidth() : 0
      // Keep both values inside the first set so the loop never hits an end.
      if (width && target >= width) { target -= width; list.scrollLeft -= width }
      if (width && target < 0) { target += width; list.scrollLeft += width }
      const distance = target - list.scrollLeft
      if (Math.abs(distance) < 0.5) { list.scrollLeft = target; target = null; return }
      list.scrollLeft += distance * 0.2
      frame = requestAnimationFrame(glide)
    }

    const onWheel = (event: WheelEvent) => {
      // Horizontal trackpad swipes and pinch-zoom keep their native behaviour.
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return
      const delta = event.deltaMode === 1 ? event.deltaY * 32 : event.deltaY
      const max = list.scrollWidth - list.clientWidth
      const from = target ?? list.scrollLeft
      // A rail that does not loop hands the wheel back to the page at its ends.
      if (!loopingRef.current && ((delta < 0 && from <= 0) || (delta > 0 && from >= max))) return
      // No hold() here: hovering already pauses the drift, and leaving resumes it at once.
      event.preventDefault()
      target = loopingRef.current ? from + delta : Math.max(0, Math.min(max, from + delta))
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(glide)
    }

    list.addEventListener('wheel', onWheel, { passive: false })
    return () => { list.removeEventListener('wheel', onWheel); cancelAnimationFrame(frame) }
  }, [dishes.length, hold, setWidth])

  const page = (direction: 1 | -1) => {
    const list = track.current
    if (!list) return
    hold()
    const amount = list.clientWidth * 0.8
    // Going back from the start: jump to the same spot in the copy first.
    if (looping && direction < 0 && list.scrollLeft < amount) list.scrollLeft += setWidth()
    list.scrollBy({ left: direction * amount, behavior: 'smooth' })
  }

  const items = (copy: boolean) => dishes.map((dish, index) => (
    <DishCard key={`${copy ? 'copy-' : ''}${dish.id}`} dish={dish} language={language} index={index} variant={variant} copy={copy} onOpen={onOpen} />
  ))

  return (
    <section id={id} className={`menu-rail menu-rail--${variant}`} aria-labelledby={`${id}-title`}>
      <header className="menu-rail-header">
        <div className="menu-rail-title-wrap">
          <h2 id={`${id}-title`}>{title}</h2>
          <span className="menu-rail-count">{t.count(dishes.length)}</span>
        </div>
        {looping && (
          <span className="menu-rail-arrows">
            <button type="button" onClick={() => page(-1)} aria-label={t.previous} aria-controls={`${id}-track`}>‹</button>
            <button type="button" onClick={() => page(1)} aria-label={t.next} aria-controls={`${id}-track`}>›</button>
          </span>
        )}
      </header>
      {children}
      {dishes.length
        ? (
          <ul
            id={`${id}-track`}
            className={`menu-track${looping ? ' is-looping' : ''}`}
            ref={track}
            // Lenis must leave wheel events here to the rail's own handler.
            data-lenis-prevent-wheel
            onPointerEnter={(e) => { if (e.pointerType === 'mouse') setHovered(true) }}
            onPointerLeave={(e) => {
              if (e.pointerType !== 'mouse') return
              // Mouse out: resume drifting immediately, from wherever the rail is now.
              stopGlide.current()
              holdUntil.current = 0
              setHovered(false)
            }}
            onTouchStart={hold}
            onTouchEnd={hold}
            // Only keyboard focus pauses; a mouse click leaves focus on the card,
            // which must not keep the rail still after the mouse moves away.
            onFocus={(e) => { if (e.target.matches(':focus-visible')) setFocused(true) }}
            onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false) }}
          >
            {items(false)}
            {looping && items(true)}
          </ul>
        )
        : <p className="menu-empty">{t.empty}</p>}
    </section>
  )
}
