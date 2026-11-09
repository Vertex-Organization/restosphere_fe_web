import type { MenuItem } from './menuTypes'

const money = (value: number) => `${new Intl.NumberFormat('vi-VN').format(value)}đ`

function Heart({ filled }: { filled: boolean }) {
  return <svg width="22" height="20" viewBox="0 0 22 20" fill={filled ? 'currentColor' : 'none'} aria-hidden="true"><path d="M11.62 19.0987C11.28 19.2187 10.72 19.2187 10.38 19.0987C7.48 18.1087 1 13.9787 1 6.97867C1 3.88867 3.49 1.38867 6.56 1.38867C8.38 1.38867 9.99 2.26867 11 3.62867C12.01 2.26867 13.63 1.38867 15.44 1.38867C18.51 1.38867 21 3.88867 21 6.97867C21 13.9787 14.52 18.1087 11.62 19.0987Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

export function PlusIcon() {
  return <svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><circle cx="20" cy="20" r="20" fill="currentColor" /><path d="M20 12.5v15M12.5 20h15" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" /></svg>
}

export default function MenuCard({ item, favorite, onFavorite, onSelect }: {
  item: MenuItem
  favorite: boolean
  onFavorite: () => void
  onSelect: () => void
}) {
  return (
    <article className={`sc-food-card sc-food-card--${item.kind}`}>
      <button className="sc-food-picture" type="button" onClick={onSelect} aria-label={`Xem ${item.name}`}>
        <img src={item.image} alt={item.name} loading="lazy" width={item.kind === 'combo' ? 590 : 320} height={item.kind === 'combo' ? 332 : 320} />
      </button>
      <button className={`sc-favorite${favorite ? ' is-favorite' : ''}`} type="button" aria-label={`${favorite ? 'Bỏ yêu thích' : 'Yêu thích'} ${item.name}`} aria-pressed={favorite} onClick={onFavorite}><Heart filled={favorite} /></button>
      <div className="sc-food-copy">
        <div>
          <h3><button type="button" onClick={onSelect}>{item.name}</button></h3>
          {item.kind === 'product' && item.description && <p className="sc-food-description">{item.description}</p>}
          {!!item.tags.length && <div className="sc-food-tags">{item.tags.map((tag) => <img key={tag.name} src={tag.image} width="24" height="24" alt={tag.name} loading="lazy" />)}</div>}
        </div>
        <div className="sc-food-bottom">
          <div><p className="sc-price-label">Chỉ từ</p><p className="sc-food-price">{money(item.price)}</p></div>
          <button className="sc-add-food" type="button" aria-label={`Thêm ${item.name}`} onClick={onSelect}><PlusIcon /></button>
        </div>
      </div>
    </article>
  )
}
