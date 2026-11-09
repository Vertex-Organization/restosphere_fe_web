import { useEffect, useMemo, useRef, useState } from 'react'
import MenuHeader from '../../components/menu/MenuHeader'
import MenuHero from '../../components/menu/MenuHero'
import MenuFooter from '../../components/menu/MenuFooter'
import MenuCard from '../../components/menu/MenuCards'
import MenuCategoryBar from '../../components/menu/MenuCategoryBar'
import MenuItemDialog from '../../components/menu/MenuItemDialog'
import MenuOverlay from '../../components/menu/MenuOverlay'
import RestaurantBrand from '../../components/ui/RestaurantBrand'
import { allMenuItems, heroSlides, menuCategories, menuSections } from '../../components/menu/menuData'
import type { MenuItem } from '../../components/menu/menuTypes'
import './ComboMenuPage.css'

interface CartLine {
  id: string
  itemId: string
  name: string
  image: string
  selection: string
  quantity: number
  unitPrice: number
}

const money = (value: number) => `${new Intl.NumberFormat('vi-VN').format(value)}đ`
const normalize = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')

function SectionHeading({ name, group = false }: { name: string; group?: boolean }) {
  const content = <><span className="sc-heading-mark" aria-hidden="true"><RestaurantBrand /></span>{group ? <h3>{name}</h3> : <h2>{name}</h2>}</>
  return <div className={group ? 'sc-group-heading' : 'sc-section-heading'}>{group ? content : <><span className="sc-heading-wave" aria-hidden="true" />{content}<span className="sc-heading-wave" aria-hidden="true" /></>}</div>
}

export default function ComboMenuPage() {
  const [activeCategory, setActiveCategory] = useState(() => window.location.pathname.split('/')[2] || 'combo')
  const [activeTag, setActiveTag] = useState(() => new URLSearchParams(window.location.search).get('tag') || '')
  const [activeGroups, setActiveGroups] = useState<Record<string, string>>({})
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set())
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [overlay, setOverlay] = useState<'search' | 'cart' | null>(null)
  const [campaign, setCampaign] = useState<{ name: string; image: string; description: string } | null>(null)
  const [cart, setCart] = useState<CartLine[]>([])
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')
  const [checkoutNotice, setCheckoutNotice] = useState('')
  const contentRef = useRef<HTMLDivElement>(null)

  const sections = useMemo(() => activeTag ? menuSections.map((section) => ({ ...section, groups: section.groups.map((group) => ({ ...group, items: group.items.filter((item) => item.tags.some((tag) => tag.slug === activeTag)) })).filter((group) => group.items.length) })).filter((section) => section.groups.length) : menuSections, [activeTag])
  const results = useMemo(() => allMenuItems.filter((item) => normalize(`${item.name} ${item.description}`).includes(normalize(search.trim()))).slice(0, 30), [search])
  const cartCount = cart.reduce((total, line) => total + line.quantity, 0)
  const cartTotal = cart.reduce((total, line) => total + line.quantity * line.unitPrice, 0)

  useEffect(() => {
    const previous = document.title
    document.title = "Combo, khuyến mãi | The Sea's Crown"
    return () => { document.title = previous }
  }, [])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 6000)
    return () => window.clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    const restore = () => {
      const tag = new URLSearchParams(window.location.search).get('tag') || ''
      setActiveTag(tag)
      const id = tag || window.location.pathname.split('/')[2] || 'combo'
      setActiveCategory(id)
      if (!tag && id !== 'combo') (document.getElementById(`sc-section-${id}`) || document.getElementById(`sc-group-${id}`))?.scrollIntoView({ behavior: 'instant', block: 'start' })
    }
    window.addEventListener('popstate', restore)
    let cancelled = false
    document.fonts.ready.then(() => { if (!cancelled) restore() })
    return () => { cancelled = true; window.removeEventListener('popstate', restore) }
  }, [])

  useEffect(() => {
    if (activeTag) return
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
      if (visible) {
        const id = visible.target.id.replace('sc-section-', '')
        setActiveCategory(id === 'pizza' && window.location.pathname.endsWith('/pizza-caro') ? 'pizza-caro' : id)
      }
    }, { rootMargin: '-180px 0px -65% 0px', threshold: 0 })
    contentRef.current?.querySelectorAll('[data-menu-section]').forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [activeTag, sections])

  function chooseCategory(category: { id: string; tag?: string }) {
    setActiveCategory(category.id)
    setActiveTag(category.tag || '')
    if (category.tag) setActiveGroups({})
    const parent = menuSections.find((section) => section.groups.some((group) => group.id === category.id))
    if (parent && parent.id !== category.id) setActiveGroups((previous) => ({ ...previous, [parent.id]: '' }))
    const url = category.tag ? `/menu/combo?tag=${category.tag}` : `/menu/${category.id}`
    if (`${window.location.pathname}${window.location.search}` !== url) window.history.pushState(null, '', url)
    requestAnimationFrame(() => {
      if (category.tag) contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      else (document.getElementById(`sc-section-${category.id}`) || document.getElementById(`sc-group-${category.id}`))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  function favorite(id: string) {
    setFavorites((previous) => { const next = new Set(previous); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }

  function addToCart(item: MenuItem, quantity: number, selection: string, totalPrice: number) {
    const unitPrice = Math.round(totalPrice / quantity)
    setCart((previous) => {
      const found = previous.find((line) => line.itemId === item.id && line.selection === selection && line.unitPrice === unitPrice)
      return found ? previous.map((line) => line.id === found.id ? { ...line, quantity: Math.min(99, line.quantity + quantity) } : line) : [...previous, { id: crypto.randomUUID(), itemId: item.id, name: item.name, image: item.image, selection, unitPrice, quantity }]
    })
    setNotice(`Đã thêm ${quantity} ${item.name} vào giỏ hàng.`)
  }

  function openCampaign(id: string) {
    const group = menuSections[0].groups.find((entry) => entry.id === id)
    if (group?.banner) setCampaign({ name: group.name, image: group.banner, description: group.description || 'Khám phá các combo trong chương trình bên dưới.' })
    else { chooseCategory({ id: 'combo' }); setNotice('Xem các chương trình và combo trong thực đơn bên dưới.') }
  }

  return (
    <div className="sc-menu-page">
      <div className="sc-menu-background" aria-hidden="true" />
      <MenuHeader onSearch={() => setOverlay('search')} onCart={() => { setCheckoutNotice(''); setOverlay('cart') }} onMenu={() => contentRef.current?.scrollIntoView({ behavior: 'smooth' })} cartCount={cartCount} onNotice={setNotice} />
      <MenuHero slides={heroSlides} onSelect={openCampaign} />
      <div className="sc-category-spacer" aria-hidden="true" />
      <MenuCategoryBar categories={menuCategories} active={activeCategory} onSelect={chooseCategory} />

      <main className="sc-menu-container sc-menu-content" ref={contentRef}>
        <h1 className="sc-visually-hidden">Thực đơn The Sea's Crown</h1>
        {activeTag && <div className="sc-filter-summary"><span>{menuCategories.find((category) => category.tag === activeTag)?.name}</span><button type="button" onClick={() => chooseCategory({ id: 'combo' })}>Xem tất cả món</button></div>}
        {sections.map((section) => (
          <section key={section.id} id={`sc-section-${section.id}`} data-menu-section className="sc-menu-section" aria-label={section.name}>
            <SectionHeading name={section.name} />
            <div className="sc-group-tabs" role="group" aria-label={`Nhóm ${section.name}`}>
              <button type="button" aria-pressed={!activeGroups[section.id]} onClick={() => setActiveGroups((previous) => ({ ...previous, [section.id]: '' }))}>Tất cả</button>
              {section.groups.map((group) => <button key={group.id} type="button" aria-pressed={activeGroups[section.id] === group.id} onClick={() => setActiveGroups((previous) => ({ ...previous, [section.id]: group.id }))}>{group.name}</button>)}
            </div>
            {section.banner && <img className="sc-section-banner" src={section.banner} width="1200" height="200" alt={section.name} loading="lazy" />}
            <div className="sc-menu-groups">
              {section.groups.filter((group) => !activeGroups[section.id] || activeGroups[section.id] === group.id).map((group) => (
                <div key={group.id} id={`sc-group-${group.id}`} className="sc-menu-group">
                  <SectionHeading group name={group.name} />
                  {group.banner && <div className="sc-campaign-banner"><img src={group.banner} width="1200" height="200" alt={group.name} loading="lazy" /><button type="button" onClick={() => openCampaign(group.id)}>Xem chi tiết</button></div>}
                  <div className={`sc-food-grid${section.id === 'combo' ? ' sc-food-grid--combos' : ''}`}>
                    {group.items.map((item) => <MenuCard key={item.id} item={item} favorite={favorites.has(item.id)} onFavorite={() => favorite(item.id)} onSelect={() => setSelectedItem(item)} />)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
        {!sections.length && <p className="sc-empty-state">Hiện chưa có món trong nhóm này.</p>}
      </main>

      <MenuFooter onNotice={setNotice} />
      <MenuItemDialog item={selectedItem} onClose={() => setSelectedItem(null)} onAdd={addToCart} />

      {overlay === 'search' && <MenuOverlay title="Tìm món ngon" onClose={() => setOverlay(null)}>
        <label className="sc-search-label" htmlFor="sc-menu-search">Tên món hoặc nguyên liệu</label>
        <input autoFocus className="sc-menu-search" id="sc-menu-search" type="search" placeholder="Bạn muốn tìm món gì?" value={search} onChange={(event) => setSearch(event.target.value)} />
        <p className="sc-search-count">{results.length} món được tìm thấy{results.length === 30 ? ' (hiển thị tối đa 30 món)' : ''}</p>
        <div className="sc-search-results">{results.map((item) => <button key={item.id} type="button" onClick={() => { setOverlay(null); setSelectedItem(item) }}><img src={item.image} alt="" width="64" height="64" /><span>{item.name}<small>{money(item.price)}</small></span><span aria-hidden="true">›</span></button>)}</div>
        {!results.length && <p className="sc-empty-state">Không tìm thấy món phù hợp. Bạn thử tên món khác nhé.</p>}
      </MenuOverlay>}

      {overlay === 'cart' && <MenuOverlay title="Giỏ hàng của bạn" onClose={() => setOverlay(null)}>
        {!cart.length ? <div className="sc-empty-state"><p>Giỏ hàng của bạn đang trống.</p><button className="sc-menu-primary" type="button" onClick={() => setOverlay(null)}>Khám phá thực đơn</button></div> : <>
          <div className="sc-cart-lines">{cart.map((line) => <article key={line.id} className="sc-cart-line"><img src={line.image} alt="" width="84" height="84" /><div><h3>{line.name}</h3>{line.selection && <p>{line.selection}</p>}<strong>{money(line.unitPrice * line.quantity)}</strong><div className="sc-cart-quantity"><button type="button" aria-label={`Giảm số lượng ${line.name}`} disabled={line.quantity === 1} onClick={() => setCart((previous) => previous.map((entry) => entry.id === line.id ? { ...entry, quantity: entry.quantity - 1 } : entry))}>−</button><span>{line.quantity}</span><button type="button" aria-label={`Tăng số lượng ${line.name}`} disabled={line.quantity === 99} onClick={() => setCart((previous) => previous.map((entry) => entry.id === line.id ? { ...entry, quantity: entry.quantity + 1 } : entry))}>+</button><button type="button" className="sc-cart-remove" onClick={() => setCart((previous) => previous.filter((entry) => entry.id !== line.id))}>Xóa</button></div></div></article>)}</div>
          <div className="sc-cart-total"><span>Tạm tính</span><strong>{money(cartTotal)}</strong></div>
          <p className="sc-cart-note">Giỏ hàng minh họa, chưa gửi đơn đến nhà hàng.</p>
          <button className="sc-menu-primary" type="button" onClick={() => setCheckoutNotice('Đặt món trực tuyến hiện chưa khả dụng. Vui lòng liên hệ nhà hàng để được hỗ trợ.')}>Tiếp tục đặt hàng</button>
          {checkoutNotice && <p className="sc-cart-note" role="status">{checkoutNotice}</p>}
        </>}
      </MenuOverlay>}

      {campaign && <MenuOverlay title={campaign.name} onClose={() => setCampaign(null)}><img className="sc-campaign-detail-image" src={campaign.image} alt={campaign.name} /><p className="sc-campaign-description">{campaign.description}</p><button className="sc-menu-primary" type="button" onClick={() => { setCampaign(null); chooseCategory({ id: 'combo' }) }}>Xem combo trong thực đơn</button></MenuOverlay>}
      {notice && <div className="sc-menu-notice" role="status"><span>{notice}</span><button type="button" aria-label="Đóng thông báo" onClick={() => setNotice('')}>×</button></div>}
    </div>
  )
}
