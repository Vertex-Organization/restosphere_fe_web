import { useEffect, useRef, useState } from 'react'
import RestaurantBrand from '../ui/RestaurantBrand'
import './MenuHeader.css'

type MenuHeaderProps = {
  onSearch: () => void
  onCart: () => void
  onMenu: () => void
  cartCount: number
  onNotice?: (message: string) => void
}

function ToolbarIcon({ type }: { type: 'search' | 'user' | 'cart' }) {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <path className="sc-header-icon-surface" d="M2 8C2 3.58172 5.58172 0 10 0H34C38.4183 0 42 3.58172 42 8V14C42 28.3594 30.3594 40 16 40H10C5.58172 40 2 36.4183 2 32V8Z" />
      {type === 'search' && <path d="M24.6725 22.6412L29 27M27 17C27 21.4183 23.4183 25 19 25C14.5817 25 11 21.4183 11 17C11 12.5817 14.5817 9 19 9C23.4183 9 27 12.5817 27 17Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />}
      {type === 'user' && <path d="M19.9998 8.36898C17.3403 8.36898 14.9329 9.44742 13.1895 11.1898C11.4471 12.9322 10.3688 15.3412 10.3688 18C10.3688 20.6588 11.4472 23.0677 13.1895 24.8102C14.932 26.5526 17.3401 27.631 19.9998 27.631C22.6595 27.631 25.0666 26.5526 26.81 24.8102C28.5524 23.0678 29.6308 20.6588 29.6308 18C29.6308 15.3405 28.5524 12.9323 26.81 11.1898C25.0676 9.44735 22.6595 8.36898 19.9998 8.36898ZM19.9998 19.3957C18.6406 19.3957 17.3848 19.827 16.3608 20.5597C15.3091 21.3119 14.5007 22.3841 14.0755 23.6328C13.9543 23.9902 13.5666 24.1818 13.2092 24.0606C12.8518 23.9394 12.6602 23.5517 12.7814 23.1943C13.2992 21.672 14.2858 20.3655 15.5693 19.4474C16.0996 19.0677 16.6807 18.7549 17.2992 18.5196C17.1032 18.377 16.9178 18.2192 16.7467 18.0481C15.9142 17.2157 15.3991 16.0659 15.3991 14.795C15.3991 13.5267 15.9142 12.3769 16.7467 11.5445L16.7493 11.5419C17.5818 10.7094 18.7315 10.1943 19.9998 10.1943C21.268 10.1943 22.4178 10.7094 23.2502 11.5419L23.2528 11.5445C24.0853 12.377 24.6004 13.5267 24.6004 14.795C24.6004 16.065 24.0853 17.2156 23.2528 18.0481L23.2118 18.0856C23.0514 18.2424 22.8794 18.3868 22.6985 18.5196C23.3179 18.754 23.8999 19.0677 24.4302 19.4474C25.7136 20.3654 26.7002 21.6729 27.2181 23.1943C27.3393 23.5517 27.1477 23.9394 26.7903 24.0606C26.4329 24.1818 26.0452 23.9902 25.924 23.6328C25.4989 22.3841 24.6896 21.3119 23.6387 20.5597C22.6147 19.8271 21.358 19.3957 19.9998 19.3957ZM22.286 12.5088C21.7013 11.925 20.8929 11.564 19.9998 11.564C19.1066 11.564 18.2984 11.925 17.7136 12.5088C17.1298 13.0935 16.7688 13.9018 16.7688 14.795C16.7688 15.6872 17.1307 16.4955 17.7154 17.0803C18.3 17.665 19.1084 18.0268 20.0006 18.0268C20.8777 18.0268 21.6726 17.6783 22.2546 17.1132L22.2849 17.0803C22.8696 16.4956 23.2315 15.6872 23.2315 14.795C23.2315 13.9019 22.8705 13.0936 22.2867 12.5088L22.286 12.5088ZM12.2219 10.2219C14.2121 8.2317 16.9625 7 20 7C23.0375 7 25.7878 8.23172 27.7781 10.2219C29.7683 12.213 31 14.9634 31 18C31 21.0373 29.7683 23.7878 27.7781 25.7781C25.7879 27.7684 23.0375 29 20 29C16.9625 29 14.2122 27.7683 12.2219 25.7781C10.2316 23.7879 9 21.0366 9 18C9 14.9627 10.2317 12.2122 12.2219 10.2219Z" fill="currentColor" />}
      {type === 'cart' && <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 28C16.5523 28 17 27.5523 17 27C17 26.4477 16.5523 26 16 26C15.4477 26 15 26.4477 15 27C15 27.5523 15.4477 28 16 28Z" /><path d="M27 28C27.5523 28 28 27.5523 28 27C28 26.4477 27.5523 26 27 26C26.4477 26 26 26.4477 26 27C26 27.5523 26.4477 28 27 28Z" /><path d="M10.05 8.05005H12.05L14.71 20.47C14.8076 20.9249 15.0607 21.3315 15.4258 21.6199C15.7908 21.9083 16.245 22.0604 16.71 22.05H26.49C26.9452 22.0493 27.3865 21.8933 27.7411 21.6079C28.0956 21.3224 28.3422 20.9246 28.4401 20.48L30.09 13.05H13.12" /></g>}
    </svg>
  )
}

export default function MenuHeader({ onSearch, onCart, cartCount, onNotice }: MenuHeaderProps) {
  const [compact, setCompact] = useState(() => window.scrollY > 44)
  const [languageOpen, setLanguageOpen] = useState(false)
  const languageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 44)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!languageOpen) return
    const onPointerDown = (event: PointerEvent) => {
      if (!languageRef.current?.contains(event.target as Node)) setLanguageOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLanguageOpen(false)
        languageRef.current?.querySelector('button')?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [languageOpen])

  return (
    <header className="sc-menu-header">
      <div className="sc-header-utility">
        <div className="sc-menu-container sc-header-utility-inner">
          <button type="button" className="sc-header-location" onClick={() => onNotice?.('Chưa có địa điểm nhà hàng được cấu hình.')}>
            <img src="/sites/thepizzacompany-vn/location.svg" width="20" height="24" alt="" />
            <span>Chọn địa điểm của bạn</span>
          </button>
          <div className="sc-header-utility-links">
            <button type="button" onClick={() => onNotice?.('Chưa có đơn hàng để tra cứu.')}>Kiểm tra đơn hàng</button>
            <span className="sc-header-divider" />
            <button type="button" onClick={() => onNotice?.('Tin tức của nhà hàng đang được cập nhật.')}>Tin tức</button>
            <span className="sc-header-divider" />
            <button type="button" onClick={() => onNotice?.('Thông tin nhà hàng đang được cập nhật.')}>Hệ thống cửa hàng</button>
            <span className="sc-header-divider" />
            <div className="sc-header-language" ref={languageRef}>
              <button type="button" aria-expanded={languageOpen} aria-label="Ngôn ngữ: Việt Nam" onClick={() => setLanguageOpen(!languageOpen)}>
                <img src="/sites/thepizzacompany-vn/flag-vn.svg" width="16" height="16" alt="" /> Việt Nam
              </button>
              {languageOpen && <div className="sc-header-language-options">
                <button type="button" onClick={() => setLanguageOpen(false)}><img src="/sites/thepizzacompany-vn/flag-vn.svg" width="16" height="16" alt="" /> Việt Nam <span aria-hidden="true">✓</span></button>
                <button type="button" disabled title="Bản tiếng Anh chưa được hỗ trợ"><img src="/sites/thepizzacompany-vn/flag-us.svg" width="16" height="16" alt="" /> English</button>
              </div>}
            </div>
          </div>
        </div>
      </div>
      <div className={`sc-header-nav${compact ? ' sc-header-nav-compact' : ''}`}>
        <div className="sc-menu-container sc-header-nav-inner">
          <div className="sc-header-nav-left">
            <nav className="sc-header-links" aria-label="Điều hướng chính"><a className="sc-header-home" href="/menu/combo">Trang chủ</a><a href="/menu/combo">Khuyến mãi</a></nav>
          </div>
          <a className="sc-header-brand" href="/menu/combo" aria-label="The Sea's Crown — Trang chủ"><RestaurantBrand /></a>
          <div className="sc-header-actions">
            <button type="button" className="sc-header-action" aria-label="Tìm kiếm món ăn" onClick={onSearch}><ToolbarIcon type="search" /></button>
            <a className="sc-header-action sc-header-account" href="/auth/login?returnUrl=%2Fmenu%2Fcombo" aria-label="Đăng nhập"><ToolbarIcon type="user" /></a>
            <button type="button" className="sc-header-action" aria-label={`Giỏ hàng${cartCount ? `, ${cartCount} món` : ''}`} onClick={onCart}>
              <ToolbarIcon type="cart" />
              {cartCount > 0 && <span className="sc-header-cart-count">{cartCount > 99 ? '99+' : cartCount}</span>}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
