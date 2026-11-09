import { useEffect, useRef, useState } from 'react'

interface Category {
  id: string
  name: string
  icon: string
  tag?: string
}

export default function MenuCategoryBar({ categories, active, onSelect }: {
  categories: Category[]
  active: string
  onSelect: (category: Category) => void
}) {
  const stripRef = useRef<HTMLDivElement>(null)
  const shellRef = useRef<HTMLElement>(null)
  const [edges, setEdges] = useState({ left: false, right: true })
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    const update = () => setStuck((shellRef.current?.getBoundingClientRect().top ?? Infinity) <= (window.innerWidth >= 1024 ? 64 : 50) + 1)
    const frame = requestAnimationFrame(update)
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  }, [])

  useEffect(() => {
    const strip = stripRef.current
    if (!strip) return
    function update() {
      if (strip) setEdges({ left: strip.scrollLeft > 2, right: strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 2 })
    }
    const observer = new ResizeObserver(update)
    observer.observe(strip)
    strip.addEventListener('scroll', update, { passive: true })
    return () => { observer.disconnect(); strip.removeEventListener('scroll', update) }
  }, [])

  useEffect(() => {
    const strip = stripRef.current
    const selected = strip?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')
    if (!strip || !selected) return
    const left = selected.offsetLeft
    if (left < strip.scrollLeft || left + selected.offsetWidth > strip.scrollLeft + strip.clientWidth) {
      strip.scrollTo({ left: Math.max(0, left - strip.clientWidth / 2 + selected.offsetWidth / 2), behavior: 'smooth' })
    }
  }, [active])

  return (
    <nav ref={shellRef} className={`sc-category-shell${stuck ? ' is-stuck' : ''}`} aria-label="Danh mục thực đơn">
      <div className="sc-menu-container sc-category-container">
        <div ref={stripRef} className="sc-category-strip">
          {categories.map((category) => (
            <button key={category.id} className="sc-category" type="button" aria-pressed={active === category.id} onClick={() => onSelect(category)}>
              <span className="sc-category-icon"><img src={category.icon} alt="" width="50" height="50" /></span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
        {edges.left && <button className="sc-category-arrow sc-category-arrow--previous" type="button" aria-label="Danh mục trước" onClick={() => stripRef.current?.scrollBy({ left: -420, behavior: 'smooth' })}><img src="/sites/thepizzacompany-vn/menu/user_carousel.svg" alt="" width="40" height="32" /></button>}
        {edges.right && <button className="sc-category-arrow sc-category-arrow--next" type="button" aria-label="Danh mục tiếp theo" onClick={() => stripRef.current?.scrollBy({ left: 420, behavior: 'smooth' })}><img src="/sites/thepizzacompany-vn/menu/user_carousel.svg" alt="" width="40" height="32" /></button>}
      </div>
    </nav>
  )
}
