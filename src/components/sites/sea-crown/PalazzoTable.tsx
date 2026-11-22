import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { asset, type Language } from './siteData'
import {
  getActiveCourse,
  getPalazzoTableMetrics,
  normalizeAngle,
  PALAZZO_COURSE_COUNT,
  PALAZZO_STEP,
} from './palazzoTableMath'

type Course = {
  image: string
  alt: string
  title: string
  note: string
}

type Copy = {
  ariaLabel: string
  courseLabel: string
  menuButton: string
  hintLabel: string
  previousLabel: string
  nextLabel: string
  goToLabel: string
}

type MotionState = {
  mode: 'idle' | 'drag' | 'coast' | 'spring'
  velocity: number
  target: number
  lastPointerAngle: number
  lastMove: number
  downX: number
  downY: number
  moved: boolean
  lastInput: number
  lastAuto: number
  lockUntil: number
  frame: number
}

const imageRoot = 'palazzo/images'

const localizedContent: Record<Language, { copy: Copy; courses: Course[] }> = {
  vi: {
    copy: {
      ariaLabel: 'Bàn xoay các món đặc sản',
      courseLabel: 'Món',
      menuButton: 'Xem thực đơn',
      hintLabel: 'Kéo bàn để xoay món',
      previousLabel: 'Món trước',
      nextLabel: 'Món tiếp theo',
      goToLabel: 'Chuyển đến món',
    },
    courses: [
      {
        image: 'lobster-bisque.png',
        alt: 'Tôm hùm áp bơ với xốt bisque và trứng cá hồi',
        title: 'Tôm hùm áp bơ, *bisque,* trứng cá hồi',
        note: 'Thịt tôm hùm áp bơ, bisque cô đặc, trứng cá hồi và thì là non.',
      },
      {
        image: 'langoustine-crudo.png',
        alt: 'Tôm langoustine crudo với cam đỏ và trứng cá',
        title: 'Langoustine crudo, *cam đỏ,* trứng cá',
        note: 'Langoustine tươi, cam đỏ, chanh ngón tay, dầu thảo mộc và trứng cá vàng.',
      },
      {
        image: 'king-crab-caviar.png',
        alt: 'Cua hoàng đế với bơ, dưa leo và trứng cá tầm',
        title: 'Cua hoàng đế, *bơ,* trứng cá tầm',
        note: 'Thịt cua hoàng đế, kem bơ, dưa leo mỏng, yuzu và trứng cá tầm Oscietra.',
      },
      {
        image: 'seared-scallops.png',
        alt: 'Sò điệp áp chảo với bơ nâu và hạt phỉ',
        title: 'Sò điệp áp chảo, *bơ nâu,* hạt phỉ',
        note: 'Sò điệp áp chảo, kem súp lơ mịn, bơ nâu, hạt phỉ và xốt nấm truffle.',
      },
      {
        image: 'lobster-ravioli.png',
        alt: 'Ravioli tôm hùm với xốt bơ hải sản và bottarga',
        title: 'Ravioli tôm hùm, *bơ hải sản,* bottarga',
        note: 'Ravioli nghệ tây gói tay, thịt tôm hùm, bơ hải sản, xô thơm và bottarga.',
      },
      {
        image: 'miso-black-cod.png',
        alt: 'Cá tuyết đen với miso và nước dùng dashi',
        title: 'Cá tuyết đen, *miso,* dashi',
        note: 'Cá tuyết đen phủ miso, dashi kombu, tỏi tây nướng, nấm shimeji và vỏ yuzu.',
      },
      {
        image: 'chargrilled-octopus.png',
        alt: 'Bạch tuộc nướng than với ớt đỏ và khoai tây',
        title: 'Bạch tuộc nướng than, *ớt đỏ,* tỏi đen',
        note: 'Xúc tu bạch tuộc nướng than, kem ớt đỏ hun khói, khoai tây confit và tỏi đen.',
      },
      {
        image: 'oysters-caviar.png',
        alt: 'Hàu tươi với trứng cá tầm và xốt champagne',
        title: 'Hàu tươi, *trứng cá tầm,* champagne',
        note: 'Ba hàu lạnh, trứng cá tầm Oscietra, xốt champagne, dưa leo và chanh vàng.',
      },
    ],
  },
  en: {
    copy: {
      ariaLabel: 'Rotating table of signature dishes',
      courseLabel: 'Course',
      menuButton: 'View the menu',
      hintLabel: 'Drag the table to turn it',
      previousLabel: 'Previous course',
      nextLabel: 'Next course',
      goToLabel: 'Go to course',
    },
    courses: [
      {
        image: 'lobster-bisque.png',
        alt: 'Butter-poached lobster with bisque and salmon roe',
        title: 'Butter-poached lobster, *bisque,* salmon roe',
        note: 'Butter-poached lobster, reduced shellfish bisque, salmon roe and young fennel.',
      },
      {
        image: 'langoustine-crudo.png',
        alt: 'Langoustine crudo with blood orange and caviar',
        title: 'Langoustine crudo, *blood orange,* caviar',
        note: 'Pristine langoustine, blood orange, finger lime, herb oil and golden caviar.',
      },
      {
        image: 'king-crab-caviar.png',
        alt: 'King crab with avocado, cucumber and Oscietra caviar',
        title: 'King crab, *avocado,* Oscietra caviar',
        note: 'King crab, avocado mousse, ribboned cucumber, yuzu and Oscietra caviar.',
      },
      {
        image: 'seared-scallops.png',
        alt: 'Seared scallops with brown butter and hazelnut',
        title: 'Seared scallops, *brown butter,* hazelnut',
        note: 'Diver scallops, cauliflower purée, brown butter, toasted hazelnut and truffle jus.',
      },
      {
        image: 'lobster-ravioli.png',
        alt: 'Lobster ravioli with shellfish butter and bottarga',
        title: 'Lobster ravioli, *shellfish butter,* bottarga',
        note: 'Handmade saffron ravioli, lobster, shellfish beurre blanc, sage and bottarga.',
      },
      {
        image: 'miso-black-cod.png',
        alt: 'Black cod with miso and dashi',
        title: 'Black cod, *miso,* dashi',
        note: 'Miso-glazed black cod, kombu dashi, charred leek, shimeji and fresh yuzu.',
      },
      {
        image: 'chargrilled-octopus.png',
        alt: 'Chargrilled octopus with red pepper and black garlic',
        title: 'Chargrilled octopus, *red pepper,* black garlic',
        note: 'Charred octopus, smoked red-pepper purée, confit potato and black garlic glaze.',
      },
      {
        image: 'oysters-caviar.png',
        alt: 'Fresh oysters with Oscietra caviar and champagne mignonette',
        title: 'Fresh oysters, *Oscietra caviar,* champagne',
        note: 'Three chilled oysters, Oscietra caviar, champagne mignonette, cucumber and lemon.',
      },
    ],
  },
}

function CourseTitle({ title }: { title: string }) {
  return title
    .split('*')
    .map((part, index) =>
      index % 2 ? (
        <em key={`${part}-${index}`}>{part}</em>
      ) : (
        <span key={`${part}-${index}`}>{part}</span>
      ),
    )
}

export function PalazzoTable({ language }: { language: Language }) {
  const { copy, courses } = localizedContent[language]
  const sectionRef = useRef<HTMLElement>(null)
  const tableRef = useRef<HTMLDivElement>(null)
  const plateRefs = useRef<Array<HTMLDivElement | null>>([])
  const angleRef = useRef(-3 * PALAZZO_STEP)
  const activeRef = useRef(3)
  const visibleRef = useRef(false)
  const reducedMotionRef = useRef(false)
  const [active, setActive] = useState(3)
  const [entered, setEntered] = useState(false)
  const [metrics, setMetrics] = useState(() => getPalazzoTableMetrics(1440, 900))
  const motion = useRef<MotionState>({
    mode: 'idle',
    velocity: 0,
    target: -3 * PALAZZO_STEP,
    lastPointerAngle: 0,
    lastMove: 0,
    downX: 0,
    downY: 0,
    moved: false,
    lastInput: 0,
    lastAuto: 0,
    lockUntil: 0,
    frame: 0,
  })

  const applyAngle = useCallback(
    (angle: number) => {
      angleRef.current = angle
      tableRef.current?.style.setProperty('--table-angle', `${angle}deg`)

      plateRefs.current.forEach((plate, index) => {
        if (!plate) return
        const distance = Math.abs(normalizeAngle(index * PALAZZO_STEP + angle))
        const scale = 1 + 0.26 * Math.max(0, 1 - distance / PALAZZO_STEP)
        plate.style.setProperty('--plate-scale', String(scale))
      })

      const next = getActiveCourse(angle, courses.length)
      if (next !== activeRef.current) {
        activeRef.current = next
        setActive(next)
      }
    },
    [courses.length],
  )

  const animate = useCallback(
    function animateFrame(time: number) {
      const state = motion.current
      const delta = Math.min(0.032, Math.max(0.001, (time - (state.lastMove || time)) / 1000))
      state.lastMove = time
      let angle = angleRef.current

      if (state.mode === 'coast') {
        state.velocity *= 0.93 ** (delta * 60)
        angle += state.velocity * delta
        if (Math.abs(state.velocity) < 25) {
          state.mode = 'spring'
          state.target = Math.round(angle / PALAZZO_STEP) * PALAZZO_STEP
        }
      } else if (state.mode === 'spring') {
        const force = -120 * (angle - state.target) - 18 * state.velocity
        state.velocity += force * delta
        angle += state.velocity * delta
        if (Math.abs(angle - state.target) < 0.05 && Math.abs(state.velocity) < 0.5) {
          angle = state.target
          state.mode = 'idle'
          state.velocity = 0
        }
      }

      applyAngle(angle)
      if (state.mode === 'coast' || state.mode === 'spring') {
        state.frame = requestAnimationFrame(animateFrame)
      } else {
        state.frame = 0
      }
    },
    [applyAngle],
  )

  const startAnimation = useCallback(() => {
    const state = motion.current
    if (!state.frame) {
      state.lastMove = performance.now()
      state.frame = requestAnimationFrame(animate)
    }
  }, [animate])

  const goToOffset = useCallback(
    (offset: number) => {
      const state = motion.current
      state.lastInput = performance.now()
      state.target =
        (state.mode === 'spring'
          ? state.target
          : Math.round(angleRef.current / PALAZZO_STEP) * PALAZZO_STEP) -
        offset * PALAZZO_STEP

      if (reducedMotionRef.current) {
        state.mode = 'idle'
        state.velocity = 0
        applyAngle(state.target)
        return
      }

      state.mode = 'spring'
      startAnimation()
    },
    [applyAngle, startAnimation],
  )

  const goToCourse = useCallback(
    (index: number) => {
      const current = activeRef.current
      let offset = index - current
      if (offset > courses.length / 2) offset -= courses.length
      if (offset < -courses.length / 2) offset += courses.length
      goToOffset(offset)
    },
    [courses.length, goToOffset],
  )

  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const update = () => {
      const rect = section.getBoundingClientRect()
      setMetrics(getPalazzoTableMetrics(rect.width, rect.height))
    }
    update()

    const resize = new ResizeObserver(update)
    resize.observe(section)
    return () => resize.disconnect()
  }, [])

  useEffect(() => {
    const now = performance.now()
    motion.current.lastInput = now
    motion.current.lastAuto = now
    reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    applyAngle(angleRef.current)

    const section = sectionRef.current
    if (!section) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting
        if (entry.isIntersecting) setEntered(true)
      },
      { threshold: 0.35 },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [applyAngle])

  useEffect(() => {
    if (reducedMotionRef.current) return
    const timer = window.setInterval(() => {
      const state = motion.current
      const now = performance.now()
      if (
        visibleRef.current &&
        state.mode === 'idle' &&
        now - state.lastInput >= 7000 &&
        now - state.lastAuto >= 4800
      ) {
        state.lastAuto = now
        goToOffset(1)
      }
    }, 250)
    return () => window.clearInterval(timer)
  }, [goToOffset])

  useEffect(
    () => () => {
      cancelAnimationFrame(motion.current.frame)
    },
    [],
  )

  const pointerAngle = (clientX: number, clientY: number) => {
    const table = tableRef.current
    if (!table) return 0
    const rect = table.getBoundingClientRect()
    return (
      (Math.atan2(clientY - (rect.top + rect.height / 2), clientX - (rect.left + rect.width / 2)) *
        180) /
      Math.PI
    )
  }

  const activeCourse = courses[active] ?? courses[0]

  return (
    <section
      id="signature-table"
      ref={sectionRef}
      className={`sb-palazzo${entered ? ' is-entered' : ''}`}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label={copy.ariaLabel}
      onKeyDown={(event) => {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
        event.preventDefault()
        const now = performance.now()
        if (now < motion.current.lockUntil) return
        motion.current.lockUntil = now + 420
        goToOffset(event.key === 'ArrowRight' ? 1 : -1)
      }}
      style={
        {
          '--palazzo-stage': `${metrics.stageSize}px`,
          '--palazzo-orbit': `${metrics.orbitRadius}px`,
          '--palazzo-plate': `${metrics.plateSize}px`,
          '--palazzo-center-x': `${metrics.centerX}px`,
          '--palazzo-center-y': `${metrics.centerY}px`,
          '--palazzo-front': `${metrics.frontAngle}deg`,
        } as React.CSSProperties
      }
    >
      <img
        className="sb-palazzo-cloth"
        src={asset(`${imageRoot}/tablecloth.jpg`)}
        alt=""
        aria-hidden="true"
      />
      <div className="sb-palazzo-shade" aria-hidden="true" />

      <div className="sb-palazzo-stage">
        <div
          ref={tableRef}
          className="sb-palazzo-table"
          onPointerDown={(event) => {
            if (event.button !== 0) return
            const state = motion.current
            cancelAnimationFrame(state.frame)
            state.frame = 0
            state.mode = 'drag'
            state.velocity = 0
            state.lastPointerAngle = pointerAngle(event.clientX, event.clientY)
            state.lastMove = performance.now()
            state.downX = event.clientX
            state.downY = event.clientY
            state.moved = false
            state.lastInput = performance.now()
            event.currentTarget.setPointerCapture(event.pointerId)
          }}
          onPointerMove={(event) => {
            const state = motion.current
            if (state.mode !== 'drag') return
            const nextPointerAngle = pointerAngle(event.clientX, event.clientY)
            const angleDelta = normalizeAngle(nextPointerAngle - state.lastPointerAngle)
            const now = performance.now()
            const seconds = Math.max(0.008, (now - state.lastMove) / 1000)
            state.lastPointerAngle = nextPointerAngle
            state.lastMove = now
            if (Math.hypot(event.clientX - state.downX, event.clientY - state.downY) > 6) {
              state.moved = true
            }
            applyAngle(angleRef.current + angleDelta)
            state.velocity = state.velocity * 0.6 + (angleDelta / seconds) * 0.4
            state.lastInput = now
          }}
          onPointerUp={(event) => {
            const state = motion.current
            if (state.mode !== 'drag') return
            try {
              event.currentTarget.releasePointerCapture(event.pointerId)
            } catch {
              // Pointer capture can already be released by the browser on touch cancellation.
            }
            state.lastInput = performance.now()
            if (!state.moved) {
              state.mode = 'idle'
              goToOffset(1)
              return
            }
            if (reducedMotionRef.current) {
              state.mode = 'idle'
              applyAngle(Math.round(angleRef.current / PALAZZO_STEP) * PALAZZO_STEP)
              return
            }
            state.velocity = Math.max(-900, Math.min(900, state.velocity))
            state.mode = 'coast'
            startAnimation()
          }}
          onPointerCancel={() => {
            const state = motion.current
            if (state.mode !== 'drag') return
            state.mode = 'spring'
            state.target = Math.round(angleRef.current / PALAZZO_STEP) * PALAZZO_STEP
            startAnimation()
          }}
          onWheel={(event) => {
            const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY) * 1.2
            if (!horizontal && !event.shiftKey) return
            const delta = horizontal ? event.deltaX : event.deltaY
            if (Math.abs(delta) < 4) return
            event.preventDefault()
            const now = performance.now()
            if (now < motion.current.lockUntil) return
            motion.current.lockUntil = now + 420
            goToOffset(delta > 0 ? 1 : -1)
          }}
        >
          <img
            className="sb-palazzo-tabletop"
            src={asset(`${imageRoot}/walnut-table.png`)}
            alt=""
            aria-hidden="true"
            draggable="false"
          />
          <div className="sb-palazzo-table-sheen" aria-hidden="true" />
          {courses.map((course, index) => (
            <div
              className="sb-palazzo-plate-orbit"
              key={course.image}
              style={{ '--plate-index': index } as React.CSSProperties}
            >
              <div
                ref={(node) => {
                  plateRefs.current[index] = node
                }}
                className="sb-palazzo-plate"
                style={{ '--plate-scale': index === active ? 1.26 : 1 } as React.CSSProperties}
              >
                <img
                  src={asset(`${imageRoot}/${course.image}`)}
                  alt={course.alt}
                  draggable="false"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sb-palazzo-copy" aria-live="polite">
        <div className="sb-palazzo-progress">
          <span>
            {copy.courseLabel} {active + 1} / {PALAZZO_COURSE_COUNT}
          </span>
          <div
            className="sb-palazzo-progress-steps"
            aria-label={`${active + 1} / ${courses.length}`}
          >
            {courses.map((course, index) => (
              <button
                type="button"
                key={course.image}
                className={index === active ? 'is-active' : ''}
                aria-current={index === active ? 'true' : undefined}
                aria-label={`${copy.goToLabel} ${index + 1}`}
                onClick={() => goToCourse(index)}
              />
            ))}
          </div>
        </div>
        <h2 key={`title-${active}`}>
          <CourseTitle title={activeCourse.title} />
        </h2>
        <p key={`note-${active}`}>{activeCourse.note}</p>
        <div className="sb-palazzo-actions">
          <a className="sb-palazzo-menu-button" href={`/${language}/menu`}>
            {copy.menuButton}
          </a>
        </div>
      </div>

      <div className="sb-palazzo-hint" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        {copy.hintLabel}
      </div>

      <div className="sb-palazzo-sr-controls">
        <button type="button" onClick={() => goToOffset(-1)}>
          {copy.previousLabel}
        </button>
        <button type="button" onClick={() => goToOffset(1)}>
          {copy.nextLabel}
        </button>
      </div>
    </section>
  )
}
