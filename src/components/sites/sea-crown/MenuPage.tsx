import { useMemo, useState } from 'react'
import type { Allergen, Dish, DishTag, MenuCategory, MenuGroup } from '../../../api/menu/types'
import { useMenuData } from '../../../hooks/useMenuData'
import { searchable } from '../../kitchen/format'
import { DishCard } from './menu/DishCard'
import { DishDialog } from './menu/DishDialog'
import { MenuIcon } from './menu/MenuIcons'
import { MenuRail } from './menu/MenuRail'
import {
  ALLERGEN_LABEL, ALLERGENS, COPY, PARTY_RANGE, PARTY_SIZES, SORT_ORDERS, TAG_LABEL, TAGS,
  type PartySize, type SortOrder, type ViewMode,
} from './menu/menuCopy'
import './MenuPage.css'
import type { Language } from './siteData'

type MenuPageProps = { language: Language }

const assetRoot = '/sites/sea-crown/menus/'

const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value])

type FoodFilters = {
  category: string
  tags: DishTag[]
  party: PartySize
  avoid: Allergen[]
  sort: SortOrder
  hideSoldOut: boolean
}

const NO_FOOD_FILTERS: FoodFilters = { category: 'all', tags: [], party: 'all', avoid: [], sort: 'suggested', hideSoldOut: false }

export default function MenuPage({ language }: MenuPageProps) {
  const t = COPY[language]
  const { state, retry } = useMenuData()
  const [query, setQuery] = useState('')
  const [food, setFood] = useState<FoodFilters>(NO_FOOD_FILTERS)
  const [drinkCategory, setDrinkCategory] = useState('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [openId, setOpenId] = useState<string | null>(null)

  const data = state.status === 'ready' ? state.data : null
  const groupOf = useMemo(() => {
    const groups = new Map(data?.categories.map((c) => [c.id, c.group]))
    return (dish: Dish): MenuGroup => groups.get(dish.categoryId) ?? 'food'
  }, [data])
  const categoriesIn = (group: MenuGroup) => data?.categories.filter((c) => c.group === group) ?? []

  const needle = searchable(query.trim())
  // Memoised so a re-render (e.g. opening a dish) does not reset the rails' scroll.
  const listed = useMemo(() => (data?.dishes ?? []).filter((d) =>
    d.status !== 'DISCONTINUED'
    && (!needle || searchable(`${d.name[language]} ${d.name.vi} ${d.description[language]}`).includes(needle))), [data, needle, language])
  const foodDishes = useMemo(() => sortDishes(listed.filter((d) => groupOf(d) === 'food' && matchesFood(d, food)), food.sort), [listed, groupOf, food])
  const drinkDishes = useMemo(() => sortDishes(listed.filter((d) =>
    groupOf(d) === 'drink' && (drinkCategory === 'all' || d.categoryId === drinkCategory)), 'suggested'), [listed, groupOf, drinkCategory])

  const extraFilters = food.tags.length + food.avoid.length + (food.party !== 'all' ? 1 : 0) + (food.sort !== 'suggested' ? 1 : 0) + (food.hideSoldOut ? 1 : 0)
  const filtered = !!needle || food.category !== 'all' || extraFilters > 0 || drinkCategory !== 'all'
  const clear = () => { setQuery(''); setFood(NO_FOOD_FILTERS); setDrinkCategory('all') }
  const update = (patch: Partial<FoodFilters>) => setFood((current) => ({ ...current, ...patch }))

  const openDish = data?.dishes.find((d) => d.id === openId) ?? null
  const isDrink = (dish: Dish) => groupOf(dish) === 'drink'

  const foodFilterControls = (
    <div className="menu-filter-bar">
      <div className="menu-filter-bar-row">
        <CategoryChips categories={categoriesIn('food')} value={food.category} language={language} onChange={(category) => update({ category })} />
        <details className="menu-more">
          <summary>
            <MenuIcon name="filter" size={16} />
            <span>{t.moreFilters}</span>
            {extraFilters > 0 && <span className="menu-count">{extraFilters}</span>}
          </summary>
          <div className="menu-more-panel">
            <fieldset>
              <legend>{t.features}</legend>
              {TAGS.map((tag) => (
                <button key={tag} type="button" className="menu-toggle" aria-pressed={food.tags.includes(tag)} onClick={() => update({ tags: toggle(food.tags, tag) })}>
                  {TAG_LABEL[language][tag]}
                </button>
              ))}
            </fieldset>
            <fieldset>
              <legend>{t.party}</legend>
              {PARTY_SIZES.map((size) => (
                <button key={size} type="button" className="menu-toggle" aria-pressed={food.party === size} onClick={() => update({ party: size })}>
                  {t.partyLabel[size]}
                </button>
              ))}
            </fieldset>
            <fieldset>
              <legend>{t.avoid}</legend>
              {ALLERGENS.map((a) => (
                <button key={a} type="button" className="menu-toggle menu-toggle--avoid" aria-pressed={food.avoid.includes(a)} onClick={() => update({ avoid: toggle(food.avoid, a) })}>
                  {ALLERGEN_LABEL[language][a]}
                </button>
              ))}
            </fieldset>
            <fieldset>
              <legend>{t.sort}</legend>
              {SORT_ORDERS.map((order) => (
                <button key={order} type="button" className="menu-toggle" aria-pressed={food.sort === order} onClick={() => update({ sort: order })}>
                  {t.sortLabel[order]}
                </button>
              ))}
              <label className="menu-check">
                <input type="checkbox" checked={food.hideSoldOut} onChange={(e) => update({ hideSoldOut: e.target.checked })} />
                {t.hideSoldOut}
              </label>
            </fieldset>
          </div>
        </details>
      </div>
    </div>
  )

  const drinkFilterControls = (
    <div className="menu-filter-bar">
      <CategoryChips categories={categoriesIn('drink')} value={drinkCategory} language={language} onChange={setDrinkCategory} />
    </div>
  )

  return (
    <main id="main-content" className="menu-page">
      <header className="menu-heading">
        <div className="menu-heading-inner">
          <span className="menu-eyebrow">{t.eyebrow}</span>
          <h1>{t.title}</h1>
          <p>{t.intro}</p>
          <div className="menu-heading-tools">
            <label className="menu-search">
              <MenuIcon name="search" />
              <span className="menu-visually-hidden">{t.search}</span>
              <input type="search" value={query} placeholder={t.searchPlaceholder} onChange={(e) => setQuery(e.target.value)} />
              {query && (
                <button type="button" className="menu-search-clear" onClick={() => setQuery('')} aria-label={t.clear}>
                  <MenuIcon name="close" size={14} />
                </button>
              )}
            </label>
            <div className="menu-view-switch" role="group">
              <button
                type="button"
                className="menu-view-btn"
                aria-pressed={viewMode === 'grid'}
                onClick={() => setViewMode('grid')}
              >
                <MenuIcon name="grid" size={15} />
                <span>{t.viewGrid}</span>
              </button>
              <button
                type="button"
                className="menu-view-btn"
                aria-pressed={viewMode === 'rail'}
                onClick={() => setViewMode('rail')}
              >
                <MenuIcon name="rail" size={15} />
                <span>{t.viewRail}</span>
              </button>
            </div>
            {filtered && <button type="button" className="menu-link" onClick={clear}>{t.clear}</button>}
          </div>
        </div>
      </header>

      {state.status === 'loading' && <MenuSkeleton label={t.loading} />}
      {state.status === 'error' && (
        <div className="menu-state" role="alert">
          <p>{t.error}</p>
          <button type="button" className="sb-pill" onClick={retry}>{t.retry}</button>
        </div>
      )}

      {data && (
        <>
          {viewMode === 'grid' ? (
            <>
              <CategorySectionGroup
                id="menu-food"
                title={t.food}
                variant="food"
                categories={categoriesIn('food')}
                dishes={foodDishes}
                selectedCategory={food.category}
                language={language}
                onOpen={setOpenId}
              >
                {foodFilterControls}
              </CategorySectionGroup>

              <CategorySectionGroup
                id="menu-drinks"
                title={t.drinks}
                variant="drink"
                categories={categoriesIn('drink')}
                dishes={drinkDishes}
                selectedCategory={drinkCategory}
                language={language}
                onOpen={setOpenId}
              >
                {drinkFilterControls}
              </CategorySectionGroup>
            </>
          ) : (
            <>
              <MenuRail id="menu-food" title={t.food} variant="food" dishes={foodDishes} language={language} speed={28} paused={!!openDish} onOpen={setOpenId}>
                {foodFilterControls}
              </MenuRail>

              <MenuRail id="menu-drinks" title={t.drinks} variant="drink" dishes={drinkDishes} language={language} speed={22} paused={!!openDish} onOpen={setOpenId}>
                {drinkFilterControls}
              </MenuRail>
            </>
          )}

          <footer className="menu-notes">
            <p>{t.priceNote}</p>
            <p>{t.allergyNote}</p>
            <p className="menu-print">
              {t.print}:{' '}
              <a href={`${assetRoot}menu-${language}.svg`} target="_blank" rel="noopener noreferrer">{t.printMenu}</a>
              {' · '}
              <a href={`${assetRoot}drinks-${language}.svg`} target="_blank" rel="noopener noreferrer">{t.printDrinks}</a>
            </p>
          </footer>
        </>
      )}

      <DishDialog dish={openDish} dishes={data?.dishes ?? []} isDrink={isDrink} language={language} onSelect={setOpenId} onClose={() => setOpenId(null)} />
    </main>
  )
}

function matchesFood(dish: Dish, filters: FoodFilters) {
  if (filters.category !== 'all' && dish.categoryId !== filters.category) return false
  if (!filters.tags.every((tag) => dish.tags.includes(tag))) return false
  if (dish.allergens.some((a) => filters.avoid.includes(a))) return false
  if (filters.hideSoldOut && dish.status === 'SOLD_OUT') return false
  if (filters.party !== 'all' && dish.serves) {
    const [min, max] = PARTY_RANGE[filters.party]
    if (dish.serves[1] < min || dish.serves[0] > max) return false
  }
  return true
}

/** Sold-out items always go last; otherwise keep menu order or sort by price. */
function sortDishes(dishes: Dish[], order: SortOrder) {
  const soldOut = (d: Dish) => (d.status === 'SOLD_OUT' ? 1 : 0)
  const price = (a: Dish, b: Dish) => (order === 'price-asc' ? a.price - b.price : order === 'price-desc' ? b.price - a.price : 0)
  return [...dishes].sort((a, b) => soldOut(a) - soldOut(b) || price(a, b))
}

type CategoryChipsProps = { categories: MenuCategory[]; value: string; language: Language; onChange: (id: string) => void }

function CategoryChips({ categories, value, language, onChange }: CategoryChipsProps) {
  return (
    <div className="menu-chip-scroll" role="group">
      {[{ id: 'all', label: COPY[language].all }, ...categories.map((c) => ({ id: c.id, label: c.name[language] }))].map(({ id, label }) => (
        <button key={id} type="button" className="menu-toggle" aria-pressed={value === id} onClick={() => onChange(id)}>{label}</button>
      ))}
    </div>
  )
}

type CategorySectionGroupProps = {
  id: string
  title: string
  variant: 'food' | 'drink'
  categories: MenuCategory[]
  dishes: Dish[]
  selectedCategory: string
  language: Language
  children?: React.ReactNode
  onOpen: (id: string) => void
}

function CategorySectionGroup({
  id,
  title,
  variant,
  categories,
  dishes,
  selectedCategory,
  language,
  children,
  onOpen,
}: CategorySectionGroupProps) {
  const t = COPY[language]
  const chapters = (selectedCategory === 'all' ? categories : categories.filter((c) => c.id === selectedCategory))
    .map((cat) => ({
      category: cat,
      items: dishes.filter((d) => d.categoryId === cat.id),
    }))
    .filter((chapter) => chapter.items.length > 0)

  return (
    <section id={id} className={`menu-section menu-section--${variant}`} aria-labelledby={`${id}-title`}>
      <header className="menu-rail-header">
        <div className="menu-rail-title-wrap">
          <h2 id={`${id}-title`}>{title}</h2>
          <span className="menu-rail-count">{t.count(dishes.length)}</span>
        </div>
      </header>
      {children}

      {dishes.length > 0 ? (
        <div className="menu-chapters">
          {chapters.map(({ category, items }) => (
            <div key={category.id} className="menu-chapter">
              <header className="menu-chapter-header">
                <div className="menu-chapter-title-line">
                  <h3>{category.name[language]}</h3>
                  <span className="menu-chapter-rule" aria-hidden="true" />
                  <span className="menu-chapter-count">{t.count(items.length)}</span>
                </div>
                {category.description && (
                  <p className="menu-chapter-desc">{category.description[language]}</p>
                )}
              </header>

              <ul className={`menu-grid menu-grid--${variant}`}>
                {items.map((dish, index) => (
                  <DishCard
                    key={dish.id}
                    dish={dish}
                    language={language}
                    index={index}
                    variant={variant}
                    onOpen={onOpen}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p className="menu-empty">{t.empty}</p>
      )}
    </section>
  )
}

function MenuSkeleton({ label }: { label: string }) {
  return (
    <div className="menu-section" role="status" aria-label={label}>
      <ul className="menu-grid menu-grid--food" aria-hidden="true">
        {Array.from({ length: 3 }, (_, i) => <li key={i} className="menu-card menu-card--food menu-card--skeleton" />)}
      </ul>
    </div>
  )
}
