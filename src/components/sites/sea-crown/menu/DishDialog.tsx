import { useEffect, useRef } from 'react'
import type { Dish } from '../../../../api/menu/types'
import type { Language } from '../siteData'
import { MenuIcon } from './MenuIcons'
import { ALLERGEN_LABEL, COPY, formatPrice, TAG_LABEL } from './menuCopy'

type DishDialogProps = {
  dish: Dish | null
  dishes: Dish[]
  isDrink: (dish: Dish) => boolean
  language: Language
  onSelect: (id: string) => void
  onClose: () => void
}

/**
 * Dish details in a native modal dialog: a bottom sheet on phones, a centred
 * panel on wider screens. `data-lenis-prevent` lets the panel scroll natively
 * instead of Lenis scrolling the page behind it.
 */
export function DishDialog({
  dish,
  dishes,
  isDrink,
  language,
  onSelect,
  onClose,
}: DishDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const body = useRef<HTMLDivElement>(null)
  const t = COPY[language]

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (dish && !element.open) element.showModal()
    if (!dish && element.open) element.close()
  }, [dish])

  // Start a newly selected dish (e.g. from "Goes well with") at the top.
  useEffect(() => {
    body.current?.scrollTo({ top: 0 })
  }, [dish?.id])

  const pairs =
    dish?.pairsWith
      ?.map((id) => dishes.find((d) => d.id === id))
      .filter((d): d is Dish => !!d && d.status !== 'DISCONTINUED') ?? []

  return (
    <dialog
      ref={dialog}
      className="menu-dialog"
      aria-labelledby="menu-dialog-title"
      data-lenis-prevent
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      {dish && (
        <div className="menu-dialog-panel" ref={body}>
          <button
            type="button"
            className="menu-dialog-close"
            onClick={onClose}
            aria-label={t.close}
          >
            <MenuIcon name="close" size={20} />
          </button>

          {dish.imageUrl ? (
            <img
              className={`menu-dialog-image${isDrink(dish) ? ' menu-dialog-image--drink' : ''}`}
              src={dish.imageUrl}
              alt=""
              width="800"
              height="600"
            />
          ) : (
            <span className="menu-dialog-image menu-dialog-image--empty">
              <MenuIcon name={isDrink(dish) ? 'cup' : 'dish'} size={48} />
            </span>
          )}

          <div className="menu-dialog-content">
            {dish.tags.length > 0 && (
              <p className="menu-card-tags">
                {dish.tags.map((tag) => (
                  <span key={tag} className={`menu-chip menu-chip--${tag}`}>
                    {TAG_LABEL[language][tag]}
                  </span>
                ))}
              </p>
            )}
            <div className="menu-dialog-head">
              <h2 id="menu-dialog-title">{dish.name[language]}</h2>
              <p className="menu-dialog-price">
                <span>{formatPrice(dish, language)}</span>
                {dish.serves && (
                  <span className="menu-card-serves">
                    <MenuIcon name="people" size={16} />
                    {t.serves(...dish.serves)}
                  </span>
                )}
              </p>
            </div>

            {dish.status === 'SOLD_OUT' && (
              <p className="menu-dialog-alert" role="status">
                {t.soldOutNote}
              </p>
            )}

            <p className="menu-dialog-desc">{dish.description[language]}</p>

            {!!dish.spiceLevel && (
              <section className="menu-dialog-section">
                <h3>{t.spice}</h3>
                <p className="menu-spice" aria-label={`${t.spice}: ${dish.spiceLevel}/3`}>
                  {[1, 2, 3].map((n) => (
                    <span key={n} className={n <= dish.spiceLevel! ? 'is-on' : undefined}>
                      <MenuIcon name="chili" size={18} />
                    </span>
                  ))}
                </p>
              </section>
            )}

            {dish.preparations && dish.preparations.length > 0 && (
              <section className="menu-dialog-section">
                <h3>{t.preparations}</h3>
                <ul className="menu-dialog-list">
                  {dish.preparations.map((p) => (
                    <li key={p.vi} className="menu-chip menu-chip--outline">
                      {p[language]}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="menu-dialog-section">
              <h3>{t.allergens}</h3>
              {dish.allergens.length ? (
                <ul className="menu-dialog-list">
                  {dish.allergens.map((a) => (
                    <li key={a} className="menu-chip menu-chip--outline">
                      {ALLERGEN_LABEL[language][a]}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="menu-muted">{t.noAllergens}</p>
              )}
            </section>

            {pairs.length > 0 && (
              <section className="menu-dialog-section">
                <h3>{t.pairs}</h3>
                <ul className="menu-pairs">
                  {pairs.map((p) => (
                    <li key={p.id}>
                      <button type="button" onClick={() => onSelect(p.id)}>
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt="" width="56" height="56" loading="lazy" />
                        ) : (
                          <span className="menu-pairs-icon">
                            <MenuIcon name={isDrink(p) ? 'cup' : 'dish'} />
                          </span>
                        )}
                        <span>
                          <span className="menu-pairs-name">{p.name[language]}</span>
                          <span className="menu-muted">
                            {p.status === 'SOLD_OUT' ? t.soldOut : formatPrice(p, language)}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <p className="menu-dialog-note">{t.allergyNote}</p>
          </div>
        </div>
      )}
    </dialog>
  )
}
