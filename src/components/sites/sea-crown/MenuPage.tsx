import { useEffect, useMemo, useState } from 'react'
import type { Allergen, Dish, DishTag, MenuGroup } from '../../../api/menu/types'
import { useMenuData } from '../../../hooks/useMenuData'
import { searchable } from '../../kitchen/format'
import { DishDialog } from './menu/DishDialog'
import { MenuIcon } from './menu/MenuIcons'
import { MenuRail } from './menu/MenuRail'
import {
  ALLERGEN_LABEL, ALLERGENS, COPY, PARTY_RANGE, PARTY_SIZES, SORT_ORDERS, TAG_LABEL, TAGS,
  type PartySize, type SortOrder,
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

/** One active filter, shown as a removable chip while the panel is closed. */
type ActiveFilter = { key: string; label: string; remove: Partial<FoodFilters> | ((f: FoodFilters) => Partial<FoodFilters>) }

export default function MenuPage({ language }: MenuPageProps) {
  const t = COPY[language]
  const { state, retry } = useMenuData()
  const [query, setQuery] = useState('')
  const [food, setFood] = useState<FoodFilters>(NO_FOOD_FILTERS)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)

  const data = state.status === 'ready' ? state.data : null
  const categories = useMemo(() => new Map(data?.categories.map((c) => [c.id, c])), [data])
  const groupOf = useMemo(() => (dish: Dish): MenuGroup => categories.get(dish.categoryId)?.group ?? 'food', [categories])
  const categoryName = useMemo(() => (dish: Dish) => categories.get(dish.categoryId)?.name[language], [categories, language])
  const foodCategories = data?.categories.filter((c) => c.group === 'food') ?? []

  const needle = searchable(query.trim())
  const listed = useMemo(() => (data?.dishes ?? []).filter((d) =>
    d.status !== 'DISCONTINUED'
    && (!needle || searchable(`${d.name[language]} ${d.name.vi} ${d.description[language]}`).includes(needle))), [data, needle, language])
  const foodDishes = useMemo(() => sortDishes(listed.filter((d) => groupOf(d) === 'food' && matchesFood(d, food)), food.sort), [listed, groupOf, food])
  const drinkDishes = useMemo(() => sortDishes(listed.filter((d) => groupOf(d) === 'drink'), 'suggested'), [listed, groupOf])

  const update = (patch: Partial<FoodFilters>) => setFood((current) => ({ ...current, ...patch }))
  const clear = () => { setQuery(''); setFood(NO_FOOD_FILTERS) }

  const active: ActiveFilter[] = [
    ...(food.category !== 'all' ? [{ key: 'category', label: categories.get(food.category)?.name[language] ?? food.category, remove: { category: 'all' } }] : []),
    ...food.tags.map((tag) => ({ key: `tag-${tag}`, label: TAG_LABEL[language][tag], remove: (f: FoodFilters) => ({ tags: f.tags.filter((x) => x !== tag) }) })),
    ...(food.party !== 'all' ? [{ key: 'party', label: t.partyLabel[food.party], remove: { party: 'all' as PartySize } }] : []),
    ...food.avoid.map((a) => ({ key: `avoid-${a}`, label: `${t.avoid}: ${ALLERGEN_LABEL[language][a]}`, remove: (f: FoodFilters) => ({ avoid: f.avoid.filter((x) => x !== a) }) })),
    ...(food.sort !== 'suggested' ? [{ key: 'sort', label: t.sortLabel[food.sort], remove: { sort: 'suggested' as SortOrder } }] : []),
    ...(food.hideSoldOut ? [{ key: 'sold-out', label: t.hideSoldOut, remove: { hideSoldOut: false } }] : []),
  ]
  const removeFilter = (filter: ActiveFilter) => setFood((current) => ({
    ...current,
    ...(typeof filter.remove === 'function' ? filter.remove(current) : filter.remove),
  }))

  // Escape closes the filter panel (the dish dialog handles its own Escape).
  useEffect(() => {
    if (!filtersOpen) return
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape' && !openId) setFiltersOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [filtersOpen, openId])

  const openDish = data?.dishes.find((d) => d.id === openId) ?? null
  const isDrink = (dish: Dish) => groupOf(dish) === 'drink'

  const clearButton = <button type="button" className="sb-pill menu-empty-action" onClick={clear}>{t.clear}</button>

  const filterButton = (
    <button
      type="button"
      className="menu-filter-toggle"
      aria-expanded={filtersOpen}
      aria-controls="menu-filter-panel"
      onClick={() => setFiltersOpen((open) => !open)}
    >
      <MenuIcon name="filter" size={16} />
      <span>{t.filters}</span>
      {active.length > 0 && <span className="menu-count">{active.length}</span>}
    </button>
  )

  const filterArea = (
    <>
      {filtersOpen && (
        <div id="menu-filter-panel" className="menu-filter-panel">
          <FilterGroup legend={t.category}>
            {[{ id: 'all', label: t.all }, ...foodCategories.map((c) => ({ id: c.id, label: c.name[language] }))].map(({ id, label }) => (
              <button key={id} type="button" className="menu-toggle" aria-pressed={food.category === id} onClick={() => update({ category: id })}>{label}</button>
            ))}
          </FilterGroup>
          <FilterGroup legend={t.features}>
            {TAGS.map((tag) => (
              <button key={tag} type="button" className="menu-toggle" aria-pressed={food.tags.includes(tag)} onClick={() => update({ tags: toggle(food.tags, tag) })}>
                {TAG_LABEL[language][tag]}
              </button>
            ))}
          </FilterGroup>
          <FilterGroup legend={t.party}>
            {PARTY_SIZES.map((size) => (
              <button key={size} type="button" className="menu-toggle" aria-pressed={food.party === size} onClick={() => update({ party: size })}>
                {t.partyLabel[size]}
              </button>
            ))}
          </FilterGroup>
          <FilterGroup legend={t.avoid}>
            {ALLERGENS.map((a) => (
              <button key={a} type="button" className="menu-toggle menu-toggle--avoid" aria-pressed={food.avoid.includes(a)} onClick={() => update({ avoid: toggle(food.avoid, a) })}>
                {ALLERGEN_LABEL[language][a]}
              </button>
            ))}
          </FilterGroup>
          <FilterGroup legend={t.sort}>
            {SORT_ORDERS.map((order) => (
              <button key={order} type="button" className="menu-toggle" aria-pressed={food.sort === order} onClick={() => update({ sort: order })}>
                {t.sortLabel[order]}
              </button>
            ))}
          </FilterGroup>
          <div className="menu-filter-panel-foot">
            <label className="menu-check">
              <input type="checkbox" checked={food.hideSoldOut} onChange={(e) => update({ hideSoldOut: e.target.checked })} />
              {t.hideSoldOut}
            </label>
            <span className="menu-filter-panel-buttons">
              {active.length > 0 && <button type="button" className="menu-link" onClick={() => setFood(NO_FOOD_FILTERS)}>{t.clear}</button>}
              <button type="button" className="sb-pill" onClick={() => setFiltersOpen(false)}>{t.close}</button>
            </span>
          </div>
        </div>
      )}
      {!filtersOpen && active.length > 0 && (
        <ul className="menu-active-filters">
          {active.map((filter) => (
            <li key={filter.key}>
              <button type="button" className="menu-active-chip" onClick={() => removeFilter(filter)} aria-label={t.removeFilter(filter.label)}>
                {filter.label}
                <MenuIcon name="close" size={12} />
              </button>
            </li>
          ))}
          <li><button type="button" className="menu-link" onClick={() => setFood(NO_FOOD_FILTERS)}>{t.clear}</button></li>
        </ul>
      )}
    </>
  )

  return (
    <main id="main-content" className="menu-page">
      <header className="menu-heading">
        <div className="menu-heading-inner">
          <span className="menu-eyebrow">{t.eyebrow}</span>
          <h1>{t.title}</h1>
          <p>{t.intro}</p>
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
          {data && (
            <nav className="menu-jump" aria-label={t.jumpTo}>
              <a href="#menu-food">{t.food} <span>{foodDishes.length}</span></a>
              <a href="#menu-drinks">{t.drinks} <span>{drinkDishes.length}</span></a>
            </nav>
          )}
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
          <MenuRail
            id="menu-food"
            title={t.food}
            variant="food"
            dishes={foodDishes}
            language={language}
            categoryOf={categoryName}
            actions={filterButton}
            empty={<div className="menu-empty"><p>{t.empty}</p>{clearButton}</div>}
            onOpen={setOpenId}
          >
            {filterArea}
          </MenuRail>

          <MenuRail
            id="menu-drinks"
            title={t.drinks}
            variant="drink"
            dishes={drinkDishes}
            language={language}
            empty={<div className="menu-empty"><p>{t.emptyDrinks}</p>{clearButton}</div>}
            onOpen={setOpenId}
          />

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

function FilterGroup({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="menu-filter-group">
      <legend>{legend}</legend>
      <div className="menu-filter-options">{children}</div>
    </fieldset>
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

function MenuSkeleton({ label }: { label: string }) {
  return (
    <div className="menu-rail" role="status" aria-label={label}>
      <div className="menu-track-wrap">
        <ul className="menu-track" aria-hidden="true">
          {Array.from({ length: 5 }, (_, i) => <li key={i} className="menu-card menu-card--food menu-card--skeleton" />)}
        </ul>
      </div>
    </div>
  )
}
