import type { CSSProperties } from 'react'
import type { Dish } from '../../../../api/menu/types'
import type { Language } from '../siteData'
import { MenuIcon } from './MenuIcons'
import { COPY, formatPrice, TAG_LABEL } from './menuCopy'

type DishCardProps = {
  dish: Dish
  language: Language
  index: number
  variant: 'food' | 'drink'
  /** Second copy rendered for the endless rail: hidden from assistive tech and focus. */
  copy?: boolean
  onOpen: (id: string) => void
}

/** One item in the menu (used in both category grid and horizontal rail). */
export function DishCard({ dish, language, index, variant, copy = false, onOpen }: DishCardProps) {
  const t = COPY[language]
  const soldOut = dish.status === 'SOLD_OUT'
  const style = { '--i': Math.min(index, 6) } as CSSProperties

  return (
    <li
      className={`menu-card menu-card--${variant}${soldOut ? ' is-sold-out' : ''}`}
      style={style}
      aria-hidden={copy || undefined}
      data-copy-start={copy && index === 0 ? '' : undefined}
    >
      {/* The copy stays clickable (it is what's on screen half the time) but out of the tab order. */}
      <button
        type="button"
        className="menu-card-button"
        onClick={() => onOpen(dish.id)}
        aria-haspopup="dialog"
        tabIndex={copy ? -1 : undefined}
      >
        <span className="menu-card-media">
          {dish.imageUrl
            ? <img src={dish.imageUrl} alt="" loading="lazy" decoding="async" width={variant === 'food' ? 800 : 600} height={600} />
            : <span className="menu-card-placeholder"><MenuIcon name={variant === 'drink' ? 'cup' : 'dish'} size={36} /></span>}
          {soldOut && <span className="menu-card-flag">{t.soldOut}</span>}
        </span>

        <span className="menu-card-body">
          <span className="menu-card-head">
            <span className="menu-card-name">{dish.name[language]}</span>
            <span className="menu-card-price">{formatPrice(dish, language)}</span>
          </span>

          {dish.description[language] && (
            <span className="menu-card-desc">{dish.description[language]}</span>
          )}

          {(variant === 'food' && (dish.serves || dish.tags.length > 0)) && (
            <span className="menu-card-meta">
              {dish.serves && (
                <span className="menu-card-serves">
                  <MenuIcon name="people" size={14} />
                  {t.serves(...dish.serves)}
                </span>
              )}
              {dish.tags.length > 0 && (
                <span className="menu-card-tags">
                  {dish.tags.map((tag) => (
                    <span key={tag} className={`menu-chip menu-chip--${tag}`}>
                      {TAG_LABEL[language][tag]}
                    </span>
                  ))}
                </span>
              )}
            </span>
          )}
        </span>
      </button>
    </li>
  )
}
