import { useEffect, useRef } from 'react'
import type { Body, Mouse } from 'matter-js'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './FooterPlayground.css'

gsap.registerPlugin(ScrollTrigger)

const LOGO_SOURCES = ['/sites/sandwich-bar/logo.jpeg', '/sites/sandwich-bar/logo-white.jpeg']
type LogoCircle = { body: Body; radius: number; image: HTMLImageElement }
type MouseHandlers = Mouse & Record<'mousemove' | 'mousedown' | 'mouseup' | 'mousewheel', EventListener>

/** The original footer uses Matter circles with its two logo images as textures. */
export function FooterPlayground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const footer = canvas?.closest('footer')
    if (!canvas || !footer) return
    let disposed = false
    let disposeScene: (() => void) | undefined

    const initialize = async () => {
      const [{ default: Matter }, images] = await Promise.all([import('matter-js'), Promise.all(LOGO_SOURCES.map(source => new Promise<HTMLImageElement>(resolve => {
        const image = new Image()
        image.onload = image.onerror = () => resolve(image)
        image.src = source
      })))])
      if (disposed) return

      const { Engine, Render, Runner, Bodies, Body, Composite, Events, Mouse, MouseConstraint, Query } = Matter
      const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
      const engine = Engine.create()
      const runner = Runner.create()
      let width = Math.max(1, Math.round(footer.clientWidth))
      let height = Math.max(1, Math.round(footer.clientHeight))
      let started = false
      let circles: LogoCircle[] = []
      let walls: Body[] = []
      const render = Render.create({ canvas, engine, options: {
        width, height, pixelRatio: window.devicePixelRatio || 1,
        background: 'transparent', wireframes: false,
      } })
      const mouse = Mouse.create(canvas)
      mouse.pixelRatio = window.devicePixelRatio || 1
      const mouseHandlers = mouse as MouseHandlers
      const mouseConstraint = MouseConstraint.create(engine, {
        mouse, constraint: { stiffness: .2, render: { visible: false } },
      })
      Composite.add(engine.world, mouseConstraint)
      render.mouse = mouse
      // Matter's wheel handler only prevents scrolling. Wheel scrolling continues
      // through Lenis; the same MouseConstraint still handles mouse/touch dragging.
      canvas.removeEventListener('wheel', mouseHandlers.mousewheel)

      const createScene = () => {
        mouse.button = -1
        mouseConstraint.constraint.bodyB = null
        canvas.dataset.dragging = 'false'
        for (const circle of circles) Composite.remove(engine.world, circle.body)
        for (const wall of walls) Composite.remove(engine.world, wall)
        const invisible = { isStatic: true, render: { visible: false } }
        walls = [
          Bodies.rectangle(width / 2, height + 25, width + 400, 50, invisible),
          Bodies.rectangle(-25, height / 2, 50, height * 4, invisible),
          Bodies.rectangle(width + 25, height / 2, 50, height * 4, invisible),
        ]
        Composite.add(engine.world, walls)
        const mobile = width < 768
        const radiusBase = mobile ? 30 : 58
        const count = mobile ? Math.max(12, Math.floor(width / 60)) : Math.max(8, Math.floor(width / 110))
        const staticColumns = Math.max(1, Math.floor(width / (radiusBase * 2 + 24)))
        circles = Array.from({ length: count }, (_, index) => {
          const radius = radiusBase + Math.random() * 20 - 10
          const x = motion.matches ? (index % staticColumns + .5) * width / staticColumns : radius + Math.random() * (width - radius * 2)
          const y = motion.matches ? height - radius - Math.floor(index / staticColumns) * (radiusBase * 2 + 24) : -2 * radius - 2.6 * radius * index
          const body = Bodies.circle(x, y, radius, {
            restitution: .5, friction: .08, frictionAir: .01, density: .002,
            isStatic: motion.matches,
            render: { fillStyle: 'transparent', strokeStyle: 'transparent', lineWidth: 0 },
          })
          Composite.add(engine.world, body)
          return { body, radius, image: images[index % images.length] }
        })
        Engine.clear(engine)
      }

      const drawTextures = () => {
        const context = render.context
        for (const { body, radius, image } of circles) {
          context.save()
          context.translate(body.position.x, body.position.y)
          context.rotate(body.angle)
          context.beginPath()
          context.arc(0, 0, radius, 0, Math.PI * 2)
          context.fillStyle = '#fdf4e5'
          context.fill()
          context.save()
          context.clip()
          if (image.complete && image.naturalWidth) context.drawImage(image, -radius, -radius, radius * 2, radius * 2)
          context.restore()
          context.beginPath()
          context.arc(0, 0, radius, 0, Math.PI * 2)
          context.strokeStyle = '#4d343f'
          context.lineWidth = 4
          context.stroke()
          context.restore()
        }
      }
      Events.on(render, 'afterRender', drawTextures)
      const start = () => {
        started = true
        if (!motion.matches) Runner.run(runner, engine)
      }
      const scrollTrigger = ScrollTrigger.create({ trigger: footer, start: 'top 90%', once: true, onEnter: start })
      const updateMotion = () => {
        Runner.stop(runner)
        Render.stop(render)
        createScene()
        if (motion.matches) Render.world(render)
        else {
          Render.run(render)
          if (started) Runner.run(runner, engine)
        }
      }
      const resize = () => {
        const nextWidth = Math.max(1, Math.round(footer.clientWidth))
        const nextHeight = Math.max(1, Math.round(footer.clientHeight))
        if (nextWidth === width && nextHeight === height) return
        const widthChanged = nextWidth !== width
        const oldHeight = height
        width = nextWidth
        height = nextHeight
        Render.setSize(render, width, height)
        Render.setPixelRatio(render, window.devicePixelRatio || 1)
        mouse.pixelRatio = window.devicePixelRatio || 1
        if (widthChanged || motion.matches) createScene()
        else {
          // Font/media settling may change footer height without a viewport change.
          // Keep the settled pile against the new floor instead of dropping again.
          for (const { body } of circles) Body.translate(body, { x: 0, y: height - oldHeight })
          Body.setPosition(walls[0], { x: width / 2, y: height + 25 })
          for (const wall of walls.slice(1)) {
            Body.scale(wall, 1, height / oldHeight)
            Body.setPosition(wall, { x: wall.position.x, y: height / 2 })
          }
        }
        Render.world(render)
        scrollTrigger.refresh()
      }
      const hover = () => { canvas.dataset.hovering = Query.point(circles.map(circle => circle.body), mouse.position).length ? 'true' : 'false' }
      const beginDrag = () => { canvas.dataset.dragging = 'true' }
      const endDrag = () => { canvas.dataset.dragging = 'false' }
      Events.on(mouseConstraint, 'startdrag', beginDrag)
      Events.on(mouseConstraint, 'enddrag', endDrag)
      canvas.addEventListener('mousemove', hover)
      window.addEventListener('mouseup', mouseHandlers.mouseup, { passive: true })
      window.addEventListener('touchend', mouseHandlers.mouseup, { passive: false })
      motion.addEventListener('change', updateMotion)
      const resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(footer)
      createScene()
      if (motion.matches) Render.world(render)
      else Render.run(render)

      disposeScene = () => {
        scrollTrigger.kill()
        resizeObserver.disconnect()
        motion.removeEventListener('change', updateMotion)
        canvas.removeEventListener('mousemove', hover)
        window.removeEventListener('mouseup', mouseHandlers.mouseup)
        window.removeEventListener('touchend', mouseHandlers.mouseup)
        for (const [event, handler] of [
          ['mousemove', mouseHandlers.mousemove], ['mousedown', mouseHandlers.mousedown],
          ['mouseup', mouseHandlers.mouseup], ['wheel', mouseHandlers.mousewheel],
          ['touchmove', mouseHandlers.mousemove], ['touchstart', mouseHandlers.mousedown],
          ['touchend', mouseHandlers.mouseup],
        ] as const) canvas.removeEventListener(event, handler)
        Events.off(render, 'afterRender', drawTextures)
        Events.off(mouseConstraint, 'startdrag', beginDrag)
        Events.off(mouseConstraint, 'enddrag', endDrag)
        Mouse.clearSourceEvents(mouse)
        Runner.stop(runner)
        Render.stop(render)
        Composite.clear(engine.world, false)
        Engine.clear(engine)
        render.textures = {}
        render.context.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
    void initialize()
    return () => { disposed = true; disposeScene?.() }
  }, [])

  return <canvas ref={canvasRef} className="sb-footer-physics" aria-hidden="true" />
}

export default FooterPlayground
