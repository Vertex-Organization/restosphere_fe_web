import { useEffect, useRef, useState } from 'react'
import RestaurantBrand from '../ui/RestaurantBrand'

const assets = '/sites/thepizzacompany-vn'

export default function AuthHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const languageRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!menuOpen) return

    function closeOnOutsideClick(event: PointerEvent) {
      if (!languageRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [menuOpen])

  return (
    <header className="pc-header">
      <div className="pc-container pc-header-inner">
        <div className="pc-location">
          <img src={`${assets}/location.svg`} width="20" height="24" alt="" />
          <span>Nhà hàng hải sản</span>
        </div>

        <a className="pc-logo" href="/" aria-label="Trang chủ The Sea's Crown">
          <RestaurantBrand />
        </a>

        <div className="pc-language" ref={languageRef}>
          <button
            ref={triggerRef}
            type="button"
            className="pc-language-trigger"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-controls="pc-language-menu"
            onClick={() => setMenuOpen(!menuOpen)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault()
                setMenuOpen(true)
                requestAnimationFrame(() => {
                  languageRef.current?.querySelector<HTMLElement>('[role="menuitem"]:not(:disabled)')?.focus()
                })
              }
            }}
          >
            <img src={`${assets}/flag-vn.svg`} width="16" height="16" alt="" />
            <span>Việt Nam</span>
          </button>

          {menuOpen && (
            <div
              id="pc-language-menu"
              className="pc-language-menu"
              role="menu"
              aria-label="Ngôn ngữ"
              onKeyDown={(event) => {
                if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
                event.preventDefault()
                const items = [...event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled)')]
                const current = items.indexOf(document.activeElement as HTMLElement)
                const next = (current + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length
                items[next]?.focus()
              }}
            >
              <button
                type="button"
                className="pc-language-option is-selected"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false)
                  triggerRef.current?.focus()
                }}
              >
                <img src={`${assets}/flag-vn.svg`} width="16" height="16" alt="" />
                Việt Nam
              </button>
              <button className="pc-language-option" type="button" role="menuitem" disabled title="Giao diện tiếng Anh chưa khả dụng">
                <img src={`${assets}/flag-us.svg`} width="16" height="16" alt="" />
                English
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
