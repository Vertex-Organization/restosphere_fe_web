import { useEffect, useId, useRef, useState } from 'react'
import type { FormEvent, MouseEvent } from 'react'
import type { MenuItem } from './menuTypes'
import './MenuItemDialog.css'

interface MenuItemDialogProps {
  item: MenuItem | null
  onClose: () => void
  onAdd: (item: MenuItem, quantity: number, selectionLabel: string, totalPrice: number) => void
}

const money = (value: number) => `${new Intl.NumberFormat('vi-VN').format(value)}đ`
const searchText = (value: string) => value.toLocaleLowerCase('vi-VN').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')

export default function MenuItemDialog(props: MenuItemDialogProps) {
  return props.item ? <ItemDetails key={props.item.id} {...props} item={props.item} /> : null
}

function ItemDetails({ item, onClose, onAdd }: Omit<MenuItemDialogProps, 'item'> & { item: MenuItem }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const id = useId()
  const [variantId, setVariantId] = useState(item.variants[0]?.id ?? '')
  const [selected, setSelected] = useState<Record<string, string[]>>({})
  const [queries, setQueries] = useState<Record<string, string>>({})
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({})
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const dialog = dialogRef.current
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    dialog?.showModal()
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      dialog?.close()
      document.body.style.overflow = previousOverflow
      previousFocus?.focus({ preventScroll: true })
    }
  }, [])

  const variant = item.variants.find((entry) => entry.id === variantId)
  const additions = item.options.reduce((total, group) => total + (selected[group.id] ?? [])
    .reduce((sum, choiceId) => sum + (group.choices.find((choice) => choice.id === choiceId)?.priceDelta ?? 0), 0), 0)
  const totalPrice = ((variant?.price ?? item.price) + additions) * quantity

  function selectChoice(groupId: string, choiceId: string, maximum: number) {
    setSelected((previous) => {
      const current = previous[groupId] ?? []
      const next = maximum === 1 ? [choiceId] : current.includes(choiceId)
        ? current.filter((value) => value !== choiceId)
        : current.length < maximum ? [...current, choiceId] : current
      return { ...previous, [groupId]: next }
    })
    setError('')
  }

  function changeChoiceQuantity(groupId: string, choiceId: string, change: number, maximum: number) {
    setSelected((previous) => {
      const current = previous[groupId] ?? []
      const index = current.indexOf(choiceId)
      const next = change > 0 && current.length < maximum ? [...current, choiceId]
        : change < 0 && index !== -1 ? current.filter((_, position) => position !== index) : current
      return { ...previous, [groupId]: next }
    })
    setError('')
  }

  function addToCart(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const missing = item.options.find((group) => (selected[group.id]?.length ?? 0) < (group.minSelections ?? (group.required ? 1 : 0)))
    if (missing) {
      const minimum = missing.minSelections ?? 1
      setError(`Vui lòng chọn ${minimum > 1 ? `đủ ${minimum} lựa chọn cho ` : ''}${missing.name.toLocaleLowerCase('vi-VN')} trước khi thêm vào giỏ hàng.`)
      const field = dialogRef.current?.querySelector<HTMLElement>(`[data-option-group="${missing.id}"]`)
      field?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      field?.querySelector<HTMLElement>('input:not([disabled]), button:not([disabled])')?.focus({ preventScroll: true })
      return
    }
    const details = [
      variant?.name,
      ...item.options.map((group) => {
        const choices = group.choices.filter((choice) => selected[group.id]?.includes(choice.id))
        return choices.length ? `${group.name}: ${choices.map((choice) => {
          const count = selected[group.id].filter((value) => value === choice.id).length
          return `${count > 1 ? `${count} × ` : ''}${choice.name}`
        }).join(', ')}` : ''
      }),
      note.trim() ? `Ghi chú: ${note.trim()}` : '',
    ].filter(Boolean).join(' · ')
    onAdd(item, quantity, details, totalPrice)
    onClose()
  }

  function closeBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target !== event.currentTarget) return
    const rect = event.currentTarget.getBoundingClientRect()
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      className={`sc-item-dialog${item.kind === 'combo' ? ' sc-item-dialog--combo' : ''}`}
      aria-labelledby={`${id}-heading`}
      aria-describedby={`${id}-name`}
      onKeyDownCapture={(event) => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); onClose() } }}
      onCancel={(event) => { event.preventDefault(); onClose() }}
      onClick={closeBackdrop}
    >
      <header className="sc-item-dialog__header">
        <h2 id={`${id}-heading`}>Chi tiết {item.kind === 'combo' ? 'combo' : 'sản phẩm'}</h2>
        <button ref={closeRef} className="sc-item-dialog__close" type="button" aria-label="Đóng chi tiết món" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M15 5 5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </header>
      <form className="sc-item-dialog__form" onSubmit={addToCart} noValidate>
        <div className="sc-item-dialog__scroll">
          <div className="sc-item-dialog__layout">
            <div className="sc-item-dialog__image"><img src={item.image} alt={item.name} /></div>
            <div className="sc-item-dialog__details">
              <h3 id={`${id}-name`}>{item.name}</h3>
              {item.description && <p className="sc-item-dialog__description">{item.description}</p>}
              {item.tags.length > 0 && <div className="sc-item-dialog__tags">{item.tags.map((tag) => <img key={tag.name} src={tag.image} title={tag.name} alt={tag.name} />)}</div>}
              {item.variants.length > 0 && (
                <fieldset className="sc-item-dialog__group">
                  <legend>Chọn kích thước / loại</legend>
                  <div className="sc-item-dialog__variants">
                    {item.variants.map((entry) => (
                      <label key={entry.id} className={`sc-item-dialog__variant${entry.id === variantId ? ' is-selected' : ''}`}>
                        <input type="radio" name={`${id}-variant`} value={entry.id} checked={entry.id === variantId} onChange={() => setVariantId(entry.id)} />
                        <span>{entry.name}</span><small>{money(entry.price)}</small>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}
              {item.options.map((group, index) => {
                const hasImages = group.choices.some((choice) => choice.image)
                const values = selected[group.id] ?? []
                const minimum = group.minSelections ?? (group.required ? 1 : 0)
                const repeated = group.allowDuplicates && group.maxSelections > 1
                const largeGroup = group.choices.length > 24
                const query = queries[group.id] ?? ''
                const filteredChoices = group.choices.filter((choice) => searchText(choice.name).includes(searchText(query)))
                const visibleChoices = largeGroup && !query ? filteredChoices.slice(0, visibleCounts[group.id] ?? 12) : filteredChoices
                return (
                  <fieldset key={group.id} data-option-group={group.id} className="sc-item-dialog__group">
                    <legend>
                      {item.kind === 'combo' && <span className="sc-item-dialog__step">{index + 1}</span>}
                      {group.name}
                      <small>
                        {minimum > 0 ? 'Bắt buộc' : 'Tùy chọn'} · Chọn {minimum === group.maxSelections ? group.maxSelections : `tối đa ${group.maxSelections}`}
                        <span className="sc-item-dialog__selected-count" aria-live="polite">Đã chọn {values.length}/{group.maxSelections}</span>
                      </small>
                    </legend>
                    {largeGroup && <div className="sc-item-dialog__choice-search">
                      <input type="search" aria-label={`Tìm lựa chọn trong ${group.name}`} placeholder="Tìm món, kích thước hoặc đế bánh" value={query} onChange={(event) => setQueries((previous) => ({ ...previous, [group.id]: event.target.value }))} />
                      {values.length > 0 && <p>Đã chọn: {group.choices.filter((choice) => values.includes(choice.id)).map((choice) => choice.name).join(', ')}</p>}
                    </div>}
                    <div className={hasImages ? 'sc-item-dialog__choices' : 'sc-item-dialog__choices sc-item-dialog__choices--plain'}>
                      {visibleChoices.map((choice) => {
                        const isSelected = values.includes(choice.id)
                        const disabled = group.maxSelections > 1 && !isSelected && values.length >= group.maxSelections
                        if (repeated) {
                          const count = values.filter((value) => value === choice.id).length
                          return <div key={choice.id} data-choice-id={choice.id} className={`sc-item-dialog__choice sc-item-dialog__choice--quantity${isSelected ? ' is-selected' : ''}`}>
                            {choice.image && <img src={choice.image} alt="" loading="lazy" />}
                            <span className="sc-item-dialog__choice-name">{choice.name}</span>
                            <span className="sc-item-dialog__choice-price">{choice.priceDelta ? `+ ${money(choice.priceDelta)}` : '0đ'}</span>
                            <div className="sc-item-dialog__choice-counter" role="group" aria-label={`Số lượng ${choice.name}`}>
                              <button type="button" aria-label={`Giảm ${choice.name}`} disabled={count === 0} onClick={() => changeChoiceQuantity(group.id, choice.id, -1, group.maxSelections)}>−</button>
                              <span aria-live="polite">{count}</span>
                              <button type="button" aria-label={`Thêm ${choice.name}`} disabled={values.length >= group.maxSelections} onClick={() => changeChoiceQuantity(group.id, choice.id, 1, group.maxSelections)}>+</button>
                            </div>
                          </div>
                        }
                        return (
                          <label key={choice.id} data-choice-id={choice.id} className={`sc-item-dialog__choice${isSelected ? ' is-selected' : ''}${disabled ? ' is-disabled' : ''}`}>
                            <input
                              type={group.maxSelections === 1 ? 'radio' : 'checkbox'}
                              name={`${id}-${group.id}`}
                              value={choice.id}
                              checked={isSelected}
                              disabled={disabled}
                              onChange={() => selectChoice(group.id, choice.id, group.maxSelections)}
                            />
                            {choice.image && <img src={choice.image} alt="" loading="lazy" />}
                            <span className="sc-item-dialog__choice-name">{choice.name}</span>
                            <span className="sc-item-dialog__choice-price">{choice.priceDelta ? `+ ${money(choice.priceDelta)}` : '0đ'}</span>
                            <span className="sc-item-dialog__check" aria-hidden="true">{isSelected ? '✓' : '+'}</span>
                          </label>
                        )
                      })}
                    </div>
                    {visibleChoices.length === 0 && <p className="sc-item-dialog__empty-options">Không tìm thấy lựa chọn phù hợp.</p>}
                    {largeGroup && !query && filteredChoices.length > visibleChoices.length && <button className="sc-item-dialog__more-choices" type="button" onClick={() => setVisibleCounts((previous) => ({ ...previous, [group.id]: (previous[group.id] ?? 12) + 12 }))}>Xem thêm lựa chọn ({filteredChoices.length - visibleChoices.length})</button>}
                  </fieldset>
                )
              })}
              <div className="sc-item-dialog__note">
                <label htmlFor={`${id}-note`}>Ghi chú <span>{note.length}/41</span></label>
                <textarea id={`${id}-note`} maxLength={41} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Nhập ghi chú của bạn" rows={3} />
              </div>
            </div>
          </div>
        </div>
        {error && <p className="sc-item-dialog__error" role="alert">{error}</p>}
        <footer className="sc-item-dialog__footer">
          <strong className="sc-item-dialog__total" aria-live="polite">{money(totalPrice)}</strong>
          <div className="sc-item-dialog__quantity" role="group" aria-label="Số lượng">
            <button type="button" aria-label="Giảm số lượng" disabled={quantity === 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button>
            <input aria-label="Số lượng món" type="number" min={1} max={99} value={quantity} onChange={(event) => setQuantity(Math.max(1, Math.min(99, Math.trunc(Number(event.target.value)) || 1)))} />
            <button type="button" aria-label="Tăng số lượng" disabled={quantity === 99} onClick={() => setQuantity((value) => Math.min(99, value + 1))}>+</button>
          </div>
          <button type="submit" className="sc-item-dialog__add">Thêm vào giỏ hàng</button>
        </footer>
      </form>
    </dialog>
  )
}
