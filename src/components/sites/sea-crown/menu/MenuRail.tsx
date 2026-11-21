import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
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
  /** Category name shown above each dish name. */
  categoryOf?: (dish: Dish) => string | undefined
  /** Controls shown at the end of the heading row (e.g. the filter button). */
  actions?: ReactNode
  /** Content shown between the heading and the rail (e.g. the open filter panel). */
  children?: ReactNode
  /** Shown instead of the rail when no dish matches. */
  empty?: ReactNode
  onOpen: (id: string) => void
}

/** Mouse movement (px) after which a press becomes a drag instead of a click. */
const DRAG_THRESHOLD = 6
/** How far (ms of release speed) a flick carries the rail before it settles. */
const MOMENTUM_MS = 320
/** Only pointer samples this recent count towards the release speed. */
const VELOCITY_WINDOW_MS = 90

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/**
 * A titled, full-width rail the visitor scrolls themselves: swipe on touch
 * screens, trackpad or Shift + wheel, drag with the mouse (with momentum),
 * or the arrow buttons. Nothing moves on its own.
 *
 * Touch scrolling stays native (and CSS-snapped, see MenuRail.css). Mouse
 * drags and arrow clicks run one eased animation that always ends exactly on
 * a card, so nothing jumps when it stops.
 */
export function MenuRail({
  id,
  title,
  variant,
  dishes,
  language,
  categoryOf,
  actions,
  children,
  empty,
  onOpen,
}: MenuRailProps) {
  const t = COPY[language]
  const track = useRef<HTMLUListElement>(null)
  const [edges, setEdges] = useState({ start: true, end: true })

  const updateEdges = useCallback(() => {
    const list = track.current
    if (!list) return
    const max = list.scrollWidth - list.clientWidth
    const start = list.scrollLeft <= 2
    const end = list.scrollLeft >= max - 2
    setEdges((current) =>
      current.start === start && current.end === end ? current : { start, end },
    )
  }, [])

  // --- Eased glide -------------------------------------------------------
  const frame = useRef(0)
  const glideTarget = useRef<number | null>(null)

  const stopGlide = useCallback(() => {
    cancelAnimationFrame(frame.current)
    glideTarget.current = null
    track.current?.classList.remove('is-gliding')
  }, [])

  /** Scroll offsets at which each card lines up with the gutter. */
  const snapPoints = useCallback(() => {
    const list = track.current
    if (!list) return [0]
    const cards = Array.from(list.children) as HTMLElement[]
    const origin = cards[0]?.offsetLeft ?? 0
    const max = list.scrollWidth - list.clientWidth
    const points = cards.map((card) => Math.min(card.offsetLeft - origin, max))
    return [...new Set([...points, max])]
  }, [])

  const nearestSnap = useCallback(
    (x: number) =>
      snapPoints().reduce((best, p) => (Math.abs(p - x) < Math.abs(best - x) ? p : best), 0),
    [snapPoints],
  )

  const glideTo = useCallback(
    (to: number, duration?: number) => {
      const list = track.current
      if (!list) return
      cancelAnimationFrame(frame.current)
      const max = list.scrollWidth - list.clientWidth
      const target = clamp(Math.round(to), 0, max)
      const from = list.scrollLeft
      const distance = target - from
      if (Math.abs(distance) < 1) {
        stopGlide()
        return
      }
      const time = duration ?? clamp(Math.abs(distance) * 0.6, 280, 650)
      const start = performance.now()
      glideTarget.current = target
      // Native snapping would fight the animation, so it is off while gliding.
      list.classList.add('is-gliding')
      const step = (now: number) => {
        const progress = Math.min(1, (now - start) / time)
        list.scrollLeft = from + distance * easeOutCubic(progress)
        if (progress < 1) frame.current = requestAnimationFrame(step)
        else stopGlide()
      }
      frame.current = requestAnimationFrame(step)
    },
    [stopGlide],
  )

  useEffect(() => stopGlide, [stopGlide])

  // New results start at the beginning; re-measure when the size changes.
  useEffect(() => {
    const list = track.current
    if (!list) return
    stopGlide()
    list.scrollLeft = 0
    updateEdges()
    const observer = new ResizeObserver(updateEdges)
    observer.observe(list)
    return () => observer.disconnect()
  }, [dishes, updateEdges, stopGlide])

  /** Arrow buttons: move by the cards that fit on screen. Repeated clicks chain. */
  const page = (direction: 1 | -1) => {
    const list = track.current
    if (!list) return
    const from = glideTarget.current ?? list.scrollLeft
    const points = snapPoints()
    const span = list.clientWidth * 0.85
    const next =
      direction > 0
        ? (points.filter((p) => p > from + 1 && p <= from + span).pop() ??
          points.find((p) => p > from + 1))
        : (points.filter((p) => p < from - 1 && p >= from - span).shift() ??
          [...points].reverse().find((p) => p < from - 1))
    glideTo(next ?? from)
  }

  // --- Mouse drag with momentum ------------------------------------------
  const drag = useRef<{
    x: number
    left: number
    moved: boolean
    samples: { x: number; t: number }[]
  } | null>(null)
  const suppressClick = useRef(false)

  const onPointerDown = (event: React.PointerEvent<HTMLUListElement>) => {
    const list = track.current
    if (!list) return
    // Any touch or click stops a running glide where it is.
    stopGlide()
    if (event.pointerType !== 'mouse' || event.button !== 0) return
    drag.current = {
      x: event.clientX,
      left: list.scrollLeft,
      moved: false,
      samples: [{ x: event.clientX, t: event.timeStamp }],
    }
  }

  const onPointerMove = (event: React.PointerEvent<HTMLUListElement>) => {
    const state = drag.current
    const list = track.current
    if (!state || !list) return
    const dx = event.clientX - state.x
    if (!state.moved && Math.abs(dx) < DRAG_THRESHOLD) return
    if (!state.moved) {
      state.moved = true
      list.classList.add('is-dragging')
      list.setPointerCapture(event.pointerId)
    }
    list.scrollLeft = state.left - dx
    state.samples.push({ x: event.clientX, t: event.timeStamp })
    while (state.samples.length > 2 && event.timeStamp - state.samples[0].t > VELOCITY_WINDOW_MS)
      state.samples.shift()
  }

  const endDrag = (event: React.PointerEvent<HTMLUListElement>) => {
    const state = drag.current
    const list = track.current
    drag.current = null
    if (!state?.moved || !list) return
    list.classList.remove('is-dragging')
    // Release speed (px/ms) from the last few samples carries the rail on.
    const first = state.samples[0]
    const elapsed = event.timeStamp - first.t
    const velocity =
      elapsed > 0 && elapsed < VELOCITY_WINDOW_MS * 2 ? (event.clientX - first.x) / elapsed : 0
    glideTo(nearestSnap(list.scrollLeft - velocity * MOMENTUM_MS))
    // The click that follows this pointerup must not open a card.
    suppressClick.current = true
    setTimeout(() => {
      suppressClick.current = false
    }, 0)
  }

  const onClickCapture = (event: React.MouseEvent) => {
    if (suppressClick.current) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  const scrollable = !(edges.start && edges.end)

  return (
    <section id={id} className={`menu-rail menu-rail--${variant}`} aria-labelledby={`${id}-title`}>
      <header className="menu-rail-header">
        <div className="menu-rail-title-wrap">
          <h2 id={`${id}-title`}>{title}</h2>
          <span className="menu-rail-count">{t.count(dishes.length)}</span>
        </div>
        <div className="menu-rail-actions">
          {actions}
          {dishes.length > 0 && scrollable && (
            <span className="menu-rail-arrows">
              <button
                type="button"
                onClick={() => page(-1)}
                disabled={edges.start}
                aria-label={t.previous}
                aria-controls={`${id}-track`}
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => page(1)}
                disabled={edges.end}
                aria-label={t.next}
                aria-controls={`${id}-track`}
              >
                ›
              </button>
            </span>
          )}
        </div>
      </header>
      {children}
      {dishes.length ? (
        // Fades are overlays on the wrapper: masking the scroller itself would repaint it every frame.
        <div
          className={`menu-track-wrap${edges.start ? '' : ' has-before'}${edges.end ? '' : ' has-after'}`}
        >
          <ul
            id={`${id}-track`}
            className="menu-track"
            ref={track}
            onScroll={updateEdges}
            // A wheel or trackpad gesture takes over from a running glide.
            onWheel={() => {
              if (glideTarget.current !== null) stopGlide()
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onClickCapture={onClickCapture}
            onDragStart={(e) => e.preventDefault()}
          >
            {dishes.map((dish, index) => (
              <DishCard
                key={dish.id}
                dish={dish}
                language={language}
                index={index}
                variant={variant}
                category={categoryOf?.(dish)}
                onOpen={onOpen}
              />
            ))}
          </ul>
        </div>
      ) : (
        (empty ?? <p className="menu-empty">{t.empty}</p>)
      )}
    </section>
  )
}
