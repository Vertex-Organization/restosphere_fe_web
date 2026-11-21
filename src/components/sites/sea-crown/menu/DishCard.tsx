import type { CSSProperties } from 'react'
import type { Dish } from '../../../../api/menu/types'
import type { Language } from '../siteData'
import { MenuIcon } from './MenuIcons'
import { COPY, formatPrice } from './menuCopy'

type DishCardProps = {
  dish: Dish
  language: Language
  index: number
  variant: 'food' | 'drink'
  /** Category name shown above the dish name. */
  category?: string
  onOpen: (id: string) => void
}

/** One item in a menu rail. */
export function DishCard({ dish, language, index, variant, category, onOpen }: DishCardProps) {
  const t = COPY[language]
  const soldOut = dish.status === 'SOLD_OUT'
  const style = { '--i': Math.min(index, 6) } as CSSProperties

  return (
    <li className={`menu-card menu-card--${variant}${soldOut ? ' is-sold-out' : ''}`} style={style}>
      <button
        type="button"
        className="menu-card-button"
        onClick={() => onOpen(dish.id)}
        aria-haspopup="dialog"
      >
        <span className="menu-card-media">
          {dish.imageUrl ? (
            <img
              src={dish.imageUrl}
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
              width={variant === 'food' ? 800 : 600}
              height={600}
            />
          ) : (
            <span className="menu-card-placeholder">
              <MenuIcon name={variant === 'drink' ? 'cup' : 'dish'} size={36} />
            </span>
          )}
          {soldOut && <span className="menu-card-flag">{t.soldOut}</span>}
        </span>

        <span className="menu-card-body">
          {category && <span className="menu-card-category">{category}</span>}
          <span className="menu-card-head">
            <span className="menu-card-name">{dish.name[language]}</span>
            <span className="menu-card-price">{formatPrice(dish, language)}</span>
          </span>

          {dish.description[language] && (
            <span className="menu-card-desc">{dish.description[language]}</span>
          )}
        </span>
      </button>
    </li>
  )
}
