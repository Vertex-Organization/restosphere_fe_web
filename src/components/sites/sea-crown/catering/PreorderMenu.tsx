import { useEffect, useRef, useState } from 'react'
import type { Dish, MenuData, MenuGroup } from '../../../../api/menu/types'
import { searchable } from '../../../kitchen/format'
import { DishDialog } from '../menu/DishDialog'
import { formatPrice, TAG_LABEL } from '../menu/menuCopy'
import { MenuIcon } from '../menu/MenuIcons'
import '../MenuPage.css'
import type { Language } from '../siteData'
import {
  BOOKING_COPY, cartCount, cartTotal, formatMoney, formatQuantity, isSetApplied, PARTY_SETS, stepOf,
  type Cart, type PartySet,
} from './bookingCopy'

type PreorderMenuProps = {
  data: MenuData | null
  status: 'loading' | 'error' | 'ready'
  onRetry: () => void
  cart: Cart
  guests: number
  onChange: (dishId: string, quantity: number) => void
  onApplySet: (items: Cart, recommendedGuests: number) => void
  onClearCart: () => void
  language: Language
}

/** Dish picker on the catering page: curated party sets, search + category filter, dish modal, and +/- steppers. */
export function PreorderMenu({
  data, status, onRetry, cart, guests, onChange, onApplySet, onClearCart, language,
}: PreorderMenuProps) {
  const t = BOOKING_COPY[language]
  const [group, setGroup] = useState<MenuGroup>('food')
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [openSetId, setOpenSetId] = useState<string | null>(null)

  const categories = data?.categories.filter((c) => c.group === group) ?? []
  const groupIds = new Set(categories.map((c) => c.id))
  const needle = searchable(query.trim())

  const allAvailable = (data?.dishes ?? []).filter((d) => d.status !== 'DISCONTINUED')
  const dishes = allAvailable.filter((d) =>
    groupIds.has(d.categoryId)
    && (category === 'all' || d.categoryId === category)
    && (!needle || searchable(`${d.name[language]} ${d.name.vi} ${d.description[language]}`).includes(needle)),
  )

  const categoryGroupById = new Map(data?.categories.map((c) => [c.id, c.group]))
  const isDrink = (dish: Dish) => (categoryGroupById.get(dish.categoryId) ?? 'food') === 'drink'

  const chosenDishes = allAvailable.filter((d) => (cart[d.id] ?? 0) > 0)
  const count = cartCount(cart)
  const total = data ? cartTotal(cart, data.dishes) : 0
  const openDish = data?.dishes.find((d) => d.id === openId) ?? null
  const openSet = PARTY_SETS.find((s) => s.id === openSetId) ?? null

  const switchGroup = (next: MenuGroup) => {
    setGroup(next)
    setCategory('all')
  }

  return (
    <section id="catering-preorder" className="bk-preorder" aria-labelledby="bk-preorder-title">
      <div className="bk-preorder-container">
        <header className="bk-preorder-header">
          <div className="bk-preorder-title-wrap">
            <span className="bk-eyebrow">{t.eyebrow}</span>
            <h2 id="bk-preorder-title">{t.menuTitle}</h2>
          </div>
          <p>{t.menuIntro}</p>
        </header>

        {data && PARTY_SETS.length > 0 && (
          <div className="bk-sets" aria-labelledby="bk-sets-title">
            <div className="bk-sets-head">
              <span className="bk-eyebrow">{t.setsEyebrow}</span>
              <h3 id="bk-sets-title">{t.setsTitle}</h3>
            </div>
            <div className="bk-sets-grid">
              {PARTY_SETS.map((set) => (
                <PartySetCard
                  key={set.id}
                  set={set}
                  dishes={data.dishes}
                  applied={isSetApplied(cart, set.items)}
                  isDrink={isDrink}
                  language={language}
                  onOpen={() => setOpenSetId(set.id)}
                  onApply={() => onApplySet(set.items, set.guestRange[0])}
                />
              ))}
            </div>
          </div>
        )}

        <div className="bk-controls">
          <div className="bk-toolbar">
            <div className="bk-tabs" role="tablist" aria-label={t.menuTitle}>
              {(['food', 'drink'] as const).map((g) => (
                <button key={g} type="button" role="tab" aria-selected={group === g} onClick={() => switchGroup(g)}>
                  <MenuIcon name={g === 'food' ? 'dish' : 'cup'} size={16} />
                  <span>{g === 'food' ? t.food : t.drinks}</span>
                </button>
              ))}
            </div>

            <div className="bk-chips" role="group">
              {[{ id: 'all', label: t.all }, ...categories.map((c) => ({ id: c.id, label: c.name[language] }))].map(({ id, label }) => (
                <button key={id} type="button" className="bk-chip" aria-pressed={category === id} onClick={() => setCategory(id)}>{label}</button>
              ))}
            </div>

            <label className="bk-search">
              <MenuIcon name="search" size={18} />
              <input
                type="search"
                value={query}
                placeholder={t.searchPlaceholder}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button type="button" className="bk-search-clear" onClick={() => setQuery('')} aria-label={t.clearSearch}>
                  <MenuIcon name="close" size={15} />
                </button>
              )}
            </label>
          </div>
        </div>

        {status === 'loading' && <p className="bk-state" role="status">{t.loading}</p>}
        {status === 'error' && (
          <div className="bk-state" role="alert">
            <p>{t.error}</p>
            <button type="button" className="bk-link" onClick={onRetry}>{t.retry}</button>
          </div>
        )}

        {status === 'ready' && dishes.length === 0 && (
          <div className="bk-state" role="status">
            <p>{t.noSearchMatch}</p>
            {query && <button type="button" className="bk-link" onClick={() => setQuery('')}>{t.clearSearch}</button>}
          </div>
        )}

        <ul className={`bk-grid bk-grid--${group}`} role="tabpanel">
          {dishes.map((dish) => (
            <PreorderCard
              key={dish.id}
              dish={dish}
              quantity={cart[dish.id] ?? 0}
              onChange={onChange}
              onOpen={setOpenId}
              language={language}
            />
          ))}
        </ul>

        {count > 0 && data && (
          <div className="bk-cart-bar" role="status">
            <div className="bk-cart-info">
              <div className="bk-cart-thumbs" aria-hidden="true">
                {chosenDishes.slice(0, 4).map((d) => (
                  <span key={d.id} className="bk-cart-thumb">
                    {d.imageUrl ? <img src={d.imageUrl} alt="" /> : <MenuIcon name="dish" size={14} />}
                  </span>
                ))}
                {chosenDishes.length > 4 && <span className="bk-cart-thumb bk-cart-thumb--more">+{chosenDishes.length - 4}</span>}
              </div>
              <div className="bk-cart-text">
                <strong>{t.selected(count)} · {formatMoney(total, language)}</strong>
                <span>{t.perGuest(formatMoney(Math.round(total / Math.max(1, guests)), language))}</span>
              </div>
            </div>
            <div className="bk-cart-actions">
              <button type="button" className="bk-cart-reset" onClick={onClearCart}>{t.clearCart}</button>
              <a href="#catering-booking" className="bk-cart-cta">{t.toBooking} →</a>
            </div>
          </div>
        )}
      </div>

      <PartySetDialog
        set={openSet}
        dishes={data?.dishes ?? []}
        applied={openSet ? isSetApplied(cart, openSet.items) : false}
        isDrink={isDrink}
        language={language}
        onApply={() => {
          if (openSet) {
            onApplySet(openSet.items, openSet.guestRange[0])
            setOpenSetId(null)
          }
        }}
        onClose={() => setOpenSetId(null)}
      />

      <DishDialog
        dish={openDish}
        dishes={data?.dishes ?? []}
        isDrink={isDrink}
        language={language}
        onSelect={setOpenId}
        onClose={() => setOpenId(null)}
      />
    </section>
  )
}

type PartySetCardProps = {
  set: PartySet
  dishes: Dish[]
  applied: boolean
  isDrink: (dish: Dish) => boolean
  language: Language
  onOpen: () => void
  onApply: () => void
}

function PartySetCard({ set, dishes, applied, isDrink, language, onOpen, onApply }: PartySetCardProps) {
  const t = BOOKING_COPY[language]
  const setPrice = cartTotal(set.items, dishes)
  const avgGuests = Math.round((set.guestRange[0] + set.guestRange[1]) / 2)
  const perGuestPrice = formatMoney(Math.round(setPrice / avgGuests), language)
  const resolvedItems = Object.entries(set.items)
    .map(([dishId, qty]) => {
      const dish = dishes.find((d) => d.id === dishId)
      return dish ? { dish, qty } : null
    })
    .filter((entry): entry is { dish: Dish; qty: number } => entry !== null)
  const previewItems = resolvedItems.slice(0, 3)
  const remainingCount = Math.max(0, resolvedItems.length - previewItems.length)

  return (
    <article className={`bk-set-card${applied ? ' is-applied' : ''}`}>
      <button type="button" className="bk-set-card-main" onClick={onOpen} aria-haspopup="dialog">
        <span className="bk-set-badges">
          <span className="bk-set-badge">{set.badge[language]}</span>
          <span className="bk-set-guests">
            <MenuIcon name="people" size={13} />
            {set.guestsLabel[language]}
          </span>
        </span>

        <span className="bk-set-name">{set.name[language]}</span>
        <span className="bk-set-desc">{set.description[language]}</span>

        <ul className="bk-set-preview-list" aria-label={t.setIncludes}>
          {previewItems.map(({ dish, qty }) => (
            <li key={dish.id} className="bk-set-preview-item">
              <span className={`bk-set-preview-thumb${isDrink(dish) ? ' is-drink' : ''}`}>
                {dish.imageUrl
                  ? <img src={dish.imageUrl} alt="" width="40" height="40" loading="lazy" />
                  : <MenuIcon name={isDrink(dish) ? 'cup' : 'dish'} size={18} />}
              </span>
              <span className="bk-set-preview-name">{dish.name[language]}</span>
              <strong className="bk-set-preview-qty">×{formatQuantity(dish, qty, language)}</strong>
            </li>
          ))}
        </ul>

        {remainingCount > 0 && (
          <span className="bk-set-more">{t.moreDishes(remainingCount)} →</span>
        )}
      </button>

      <div className="bk-set-footer">
        <div className="bk-set-pricing">
          <strong>{formatMoney(setPrice, language)}</strong>
          <span>{t.perGuest(perGuestPrice)}</span>
        </div>
        <button type="button" className={`bk-set-btn${applied ? ' is-active' : ''}`} onClick={onApply}>
          {applied ? `✓ ${t.appliedSet}` : `+ ${t.applySet}`}
        </button>
      </div>
    </article>
  )
}

type PartySetDialogProps = {
  set: PartySet | null
  dishes: Dish[]
  applied: boolean
  isDrink: (dish: Dish) => boolean
  language: Language
  onApply: () => void
  onClose: () => void
}

function PartySetDialog({ set, dishes, applied, isDrink, language, onApply, onClose }: PartySetDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const t = BOOKING_COPY[language]

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (set && !element.open) element.showModal()
    if (!set && element.open) element.close()
  }, [set])

  const resolvedItems = set
    ? Object.entries(set.items)
        .map(([dishId, qty]) => {
          const dish = dishes.find((d) => d.id === dishId)
          return dish ? { dish, qty } : null
        })
        .filter((entry): entry is { dish: Dish; qty: number } => entry !== null)
    : []

  const setPrice = set ? cartTotal(set.items, dishes) : 0
  const avgGuests = set ? Math.round((set.guestRange[0] + set.guestRange[1]) / 2) : 1
  const perGuestPrice = formatMoney(Math.round(setPrice / avgGuests), language)

  return (
    <dialog
      ref={dialog}
      className="menu-dialog bk-set-dialog"
      aria-labelledby="bk-set-dialog-title"
      data-lenis-prevent
      onClose={onClose}
      onClick={(event) => { if (event.target === event.currentTarget) onClose() }}
    >
      {set && (
        <div className="menu-dialog-panel bk-set-dialog-panel">
          <div className="bk-set-dialog-head">
            <div className="bk-set-badges">
              <span className="bk-set-badge">{set.badge[language]}</span>
              <span className="bk-set-guests">
                <MenuIcon name="people" size={14} />
                {set.guestsLabel[language]}
              </span>
            </div>
            <button type="button" className="bk-set-dialog-close" onClick={onClose} aria-label={t.close}>
              <MenuIcon name="close" size={18} />
            </button>
          </div>

          <div className="bk-set-dialog-body">
            <h2 id="bk-set-dialog-title">{set.name[language]}</h2>
            <p className="bk-set-dialog-desc">{set.description[language]}</p>

            <h3 className="bk-set-dialog-subtitle">
              {t.setIncludes} ({resolvedItems.length})
            </h3>

            <ul className="bk-set-dialog-list">
              {resolvedItems.map(({ dish, qty }) => (
                <li key={dish.id} className="bk-set-dialog-item">
                  <span className={`bk-set-dialog-thumb${isDrink(dish) ? ' is-drink' : ''}`}>
                    {dish.imageUrl
                      ? <img src={dish.imageUrl} alt="" width="60" height="60" loading="lazy" />
                      : <MenuIcon name={isDrink(dish) ? 'cup' : 'dish'} size={22} />}
                  </span>

                  <span className="bk-set-dialog-info">
                    <strong>{dish.name[language]}</strong>
                    <span>{formatPrice(dish, language)}</span>
                  </span>

                  <span className="bk-set-dialog-qty">
                    <em>× {formatQuantity(dish, qty, language)}</em>
                    <strong>{formatMoney(dish.price * qty, language)}</strong>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bk-set-dialog-footer">
            <div className="bk-set-dialog-total">
              <span>{t.estimate} ({t.perGuest(perGuestPrice)})</span>
              <strong>{formatMoney(setPrice, language)}</strong>
            </div>
            <button type="button" className="sb-catering-submit bk-set-dialog-apply" onClick={onApply}>
              {applied ? `✓ ${t.appliedSet}` : `+ ${t.applySet}`}
            </button>
          </div>
        </div>
      )}
    </dialog>
  )
}

type PreorderCardProps = {
  dish: Dish
  quantity: number
  onChange: (dishId: string, quantity: number) => void
  onOpen: (dishId: string) => void
  language: Language
}

function PreorderCard({ dish, quantity, onChange, onOpen, language }: PreorderCardProps) {
  const t = BOOKING_COPY[language]
  const soldOut = dish.status === 'SOLD_OUT'
  const step = stepOf(dish)
  const name = dish.name[language]
  const primaryTag = dish.tags.includes('signature') ? 'signature' : dish.tags[0]

  return (
    <li className={`bk-card${quantity ? ' is-selected' : ''}${soldOut ? ' is-sold-out' : ''}`}>
      <button
        type="button"
        className="bk-card-preview"
        onClick={() => onOpen(dish.id)}
        aria-label={`${t.viewDetails}: ${name}`}
      >
        <span className="bk-card-media">
          {dish.imageUrl ? <img src={dish.imageUrl} alt="" loading="lazy" decoding="async" /> : <MenuIcon name="dish" size={36} />}
          {soldOut && <span className="bk-card-flag">{t.soldOut}</span>}
          {!soldOut && primaryTag && (
            <span className="bk-card-tags">
              <span className={`menu-chip menu-chip--${primaryTag}`}>{TAG_LABEL[language][primaryTag]}</span>
            </span>
          )}
          {quantity > 0 && (
            <span className="bk-card-qty-badge" aria-hidden="true">
              ✓ {formatQuantity(dish, quantity, language)}
            </span>
          )}
        </span>
      </button>

      <span className="bk-card-body">
        <span className="bk-card-head">
          <button type="button" className="bk-card-title-btn" onClick={() => onOpen(dish.id)}>
            <span className="bk-card-name">{name}</span>
          </button>
          {dish.serves && (
            <span className="bk-card-serves">
              <MenuIcon name="people" size={14} />
              {t.serves(...dish.serves)}
            </span>
          )}
        </span>

        <span className="bk-card-desc">{dish.description[language]}</span>

        <span className="bk-card-footer">
          <span className="bk-card-price">{formatPrice(dish, language)}</span>

          {soldOut
            ? <span className="bk-card-unavailable">{t.soldOut}</span>
            : quantity
              ? (
                <span className="bk-stepper">
                  <button type="button" onClick={() => onChange(dish.id, quantity - step)} aria-label={`${t.remove}: ${name}`}>−</button>
                  <output aria-live="polite">{formatQuantity(dish, quantity, language)}</output>
                  <button type="button" onClick={() => onChange(dish.id, quantity + step)} aria-label={`${t.add}: ${name}`}>+</button>
                </span>
              )
              : <button type="button" className="bk-add" onClick={() => onChange(dish.id, step)}>+ {t.add}</button>}
        </span>
      </span>
    </li>
  )
}
