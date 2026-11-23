import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { formatCount } from './format'

export interface SelectOption<T extends string> {
  value: T
  label: string
  count?: number
}

interface Props<T extends string> {
  value: T
  options: readonly SelectOption<T>[]
  onChange: (value: T) => void
  buttonLabel: string
  listLabel: string
  disabled?: boolean
  block?: boolean
}

export function SelectMenu<T extends string>({
  value,
  options,
  onChange,
  buttonLabel,
  listLabel,
  disabled = false,
  block = false,
}: Props<T>) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [position, setPosition] = useState({ left: 0, top: 0, width: 0 })
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const prefix = useId()
  const optionId = (index: number) => `${prefix}-option-${index}`
  const current = options.find((option) => option.value === value) ?? options[0]

  const close = (refocus: boolean) => {
    setOpen(false)
    if (refocus) button.current?.focus()
  }

  const openMenu = () => {
    const rect = button.current?.getBoundingClientRect()
    if (rect) setPosition({ left: rect.left, top: rect.bottom + 4, width: rect.width })
    setActive(
      Math.max(
        0,
        options.findIndex((option) => option.value === value),
      ),
    )
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    list.current?.focus()
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    const dismiss = () => setOpen(false)
    document.addEventListener('pointerdown', onPointer)
    window.addEventListener('resize', dismiss)
    window.addEventListener('scroll', dismiss, true)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('resize', dismiss)
      window.removeEventListener('scroll', dismiss, true)
    }
  }, [open])

  const choose = (next: T) => {
    onChange(next)
    close(true)
  }

  const onListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const last = options.length - 1
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setActive((index) => Math.min(last, index + 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        setActive((index) => Math.max(0, index - 1))
        break
      case 'Home':
        event.preventDefault()
        setActive(0)
        break
      case 'End':
        event.preventDefault()
        setActive(last)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        choose(options[active].value)
        break
      case 'Escape':
        event.preventDefault()
        close(true)
        break
      case 'Tab':
        setOpen(false)
        break
    }
  }

  const onButtonKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      openMenu()
    }
  }

  return (
    <div className={block ? 'k-choice k-choice--block' : 'k-choice'} ref={root}>
      <button
        ref={button}
        type="button"
        className="k-chip k-choice-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        aria-label={`${buttonLabel}: ${current.label}`}
        onClick={() => (open ? close(false) : openMenu())}
        onKeyDown={onButtonKeyDown}
      >
        {current.label}
        <span className="k-choice-caret" aria-hidden="true" />
      </button>
      {open && (
        <ul
          ref={list}
          className="k-choice-menu"
          role="listbox"
          tabIndex={-1}
          aria-label={listLabel}
          aria-activedescendant={optionId(active)}
          style={{ left: position.left, top: position.top, minWidth: position.width || undefined }}
          onKeyDown={onListKeyDown}
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              id={optionId(index)}
              role="option"
              aria-selected={option.value === value}
              className={`k-choice-option${index === active ? ' k-choice-option--active' : ''}`}
              onPointerEnter={() => setActive(index)}
              onClick={() => choose(option.value)}
            >
              <span>{option.label}</span>
              {option.count !== undefined && (
                <small className="k-count">{formatCount(option.count)}</small>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
