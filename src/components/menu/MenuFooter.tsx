import { useEffect, useId, useRef, useState } from 'react'
import RestaurantBrand from '../ui/RestaurantBrand'
import './MenuFooter.css'

type MenuFooterProps = {
  onNotice?: (message: string) => void
}

const referenceOrigin = 'https://thepizzacompany.vn'
const menuAssets = '/sites/thepizzacompany-vn/menu/'

const aboutLinks = [
  ['Hệ thống nhà hàng', '/stores'],
  ['Câu chuyện thương hiệu', '/page/cau-chuyen-thuong-hieu'],
  ['Ưu đãi thành viên', '/page/uu-dai-thanh-vien'],
  ['Tin tức & Sự kiện', '/news'],
  ['Tuyển dụng', 'https://tuyendung.qsrvietnam.com/'],
]

const guideLinks = [
  ['Trung tâm trợ giúp', '/help'],
  ['Hướng dẫn mua hàng', '/page/huong-dan-mua-hang'],
  ['Chính sách giao hàng', '/page/chinh-sach-giao-hang'],
  ['Chính sách bảo mật', '/page/chinh-sach-bao-mat'],
  ['Điều khoản & Điều kiện', '/terms-and-conditions'],
]

const socialLinks = [
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/ThePIZZAcompanyVN',
    image: '617-tpciconsocialfooter48x48px-01-w32.avif',
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/thepizzacompanyvn.official/',
    image: '776-tpciconsocialfooter48x48pxartboard1copy3-w32.avif',
  },
  {
    name: 'Youtube',
    href: 'https://www.youtube.com/channel/UCU9rDz-zWZxeiVa-YSBlYkQ',
    image: '783-tpciconsocialfooter48x48pxartboard1copy5-w32.avif',
  },
]

function ReferenceLinks({ links }: { links: string[][] }) {
  return (
    <ul className="sc-footer-links">
      {links.map(([label, href]) => (
        <li key={href}>
          <a
            href={href.startsWith('https://') ? href : `${referenceOrigin}${href}`}
            target="_blank"
            rel="noopener noreferrer"
            title={`${label} — tham khảo The Pizza Company (mở tab mới)`}
          >
            {label}
          </a>
        </li>
      ))}
    </ul>
  )
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
  })
}

function SupportMark({ open }: { open: boolean }) {
  return (
    <svg width="110" height="110" viewBox="0 0 110 110" fill="none" aria-hidden="true">
      <circle cx="55" cy="55" r="34" fill="#A2D28B" />
      {open ? (
        <path d="m43.5 43.5 23 23m0-23-23 23" stroke="white" strokeWidth="3.3" />
      ) : (
        <>
          <path d="M73.2216 49.4439H72.499V49.2225C70.1661 41.167 62.6662 35.4987 54.2223 35.4987C45.7784 35.4987 38.2784 41.1648 35.9995 49.277V49.4983H35.2769C33.4995 49.4983 32.0542 50.9437 32.0542 52.721V56.165C32.0542 57.9423 33.4995 59.3877 35.2769 59.3877H35.9995V59.609C37.944 66.5535 43.7773 71.8313 50.8323 73.1096H50.943H50.9994C51.2208 73.9429 51.8892 74.5549 52.7767 74.5549H55.5545C56.6092 74.5549 57.4425 73.7216 57.4425 72.6669C57.4425 71.6123 56.6092 70.7789 55.5545 70.7789H52.7767C52.1105 70.7789 51.555 71.1674 51.2207 71.7229C51.1643 71.7229 51.1101 71.6665 51.0536 71.6665C44.6103 70.4447 39.222 65.5554 37.3881 59.2232V59.1667C37.6094 58.9454 37.7765 58.6676 37.7765 58.3334V50.5556C37.7765 50.2214 37.6094 49.9436 37.3881 49.7223C37.3881 49.7223 37.3881 49.6659 37.4445 49.6659C39.5561 42.1659 46.444 36.9448 54.2217 36.9448C61.9995 36.9448 68.944 42.1661 71.0556 49.6659L71.112 49.7223C70.8907 49.9437 70.7236 50.2214 70.7236 50.5556V58.3334C70.7236 58.9454 71.2227 59.3881 71.7783 59.3881H73.2236C75.0009 59.3881 76.4463 57.9427 76.4463 56.1654V52.7214C76.4441 50.8898 74.9988 49.4445 73.2214 49.4445L73.2216 49.4439Z" fill="#595959" />
          <path d="M54.2219 40.7225C46.6652 40.7225 40.5002 46.8336 40.5002 54.4442C40.5002 62.0008 46.6114 68.1658 54.2219 68.1658C56.5006 68.1658 58.6099 67.6103 60.5002 66.6663L68.7769 69.9432L65.6649 62.0548C67.1102 59.889 67.9436 57.2762 67.9436 54.4982C67.9436 46.8876 61.778 40.7225 54.2219 40.7225ZM49.1655 55.7769C48.4428 55.7769 47.833 55.1649 47.833 54.4445C47.833 53.7218 48.445 53.112 49.1655 53.112C49.8881 53.112 50.4979 53.724 50.4979 54.4445C50.5001 55.1672 49.8881 55.7769 49.1655 55.7769ZM54.2783 55.7769C53.5556 55.7769 52.9459 55.1649 52.9459 54.4445C52.9459 53.7218 53.5579 53.112 54.2783 53.112C55.001 53.112 55.6107 53.724 55.6107 54.4445C55.6107 55.1672 54.9987 55.7769 54.2783 55.7769ZM59.4432 55.7769C58.7206 55.7769 58.165 55.1649 58.165 54.4445C58.165 53.7218 58.7206 53.112 59.4432 53.112C60.1659 53.112 60.7757 53.724 60.7757 54.4445C60.7779 55.1672 60.1659 55.7769 59.4432 55.7769Z" fill="white" fillOpacity=".9" />
        </>
      )}
      <circle opacity=".8" cx="55" cy="55" r="44.5" stroke="#A2D28B" />
      <circle opacity=".9" cx="55" cy="55" r="39.5" stroke="#A2D28B" />
      <circle opacity=".4" cx="55" cy="55" r="49.5" stroke="#A2D28B" />
    </svg>
  )
}

export function MenuFloatingSupport() {
  const [open, setOpen] = useState(false)
  const container = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return

    function closeOnOutside(event: PointerEvent) {
      if (event.target instanceof Node && !container.current?.contains(event.target)) setOpen(false)
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setOpen(false)
      trigger.current?.focus()
    }

    document.addEventListener('pointerdown', closeOnOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return (
    <div className="sc-footer-floating" ref={container}>
      {open && (
        <div className="sc-footer-support-panel" id={panelId}>
          <p>Tham khảo The Pizza Company</p>
          <a href="https://zalo.me/1800221084111714708" target="_blank" rel="noopener noreferrer" title="Zalo của The Pizza Company (mở tab mới)">
            <img src={`${menuAssets}521-TPC_ICON-SOCIAL-FOOTER_48x48px_Artboard-1-copy-w48.png`} alt="" width="24" height="24" />
            Zalo
          </a>
          <a href="https://www.facebook.com/messages/t/172827469460356" target="_blank" rel="noopener noreferrer" title="Messenger của The Pizza Company (mở tab mới)">
            <img src={`${menuAssets}430-TPC_ICON-SOCIAL-FOOTER_48x48px-01-w48.png`} alt="" width="24" height="24" />
            Messenger
          </a>
        </div>
      )}
      <button
        type="button"
        className="sc-footer-support-toggle"
        aria-label={open ? 'Đóng liên kết hỗ trợ tham khảo' : 'Mở liên kết hỗ trợ tham khảo'}
        aria-expanded={open}
        aria-controls={panelId}
        ref={trigger}
        onClick={() => setOpen(!open)}
      >
        <SupportMark open={open} />
      </button>
    </div>
  )
}

export default function MenuFooter({ onNotice }: MenuFooterProps) {
  const [contactNotice, setContactNotice] = useState('')

  function showContactNotice() {
    const message = "Thông tin liên hệ của The Sea's Crown đang được cập nhật."
    if (onNotice) onNotice(message)
    else setContactNotice(message)
  }

  return (
    <>
      <footer className="sc-menu-footer">
        <div className="sc-footer-ribbon" aria-hidden="true" />
        <div className="sc-footer-content">
          <div className="sc-menu-container">
            <div className="sc-footer-main">
              <div className="sc-footer-brand-column">
                <a className="sc-footer-brand-link" href="/menu/combo" aria-label="The Sea's Crown — thực đơn">
                  <RestaurantBrand />
                </a>
                <p className="sc-footer-restaurant-info">Thông tin nhà hàng đang cập nhật</p>
                <button className="sc-footer-back-top" type="button" aria-label="Trở về đầu trang" onClick={scrollToTop}>
                  <svg width="11" height="8" viewBox="0 0 11 8" fill="none" aria-hidden="true">
                    <path d="M10.2 6.6 6.24846 1.45565C5.78179.848116 5.01816.848116 4.55149 1.45565L.599976 6.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              <div className="sc-footer-menu-columns">
                <div className="sc-footer-column">
                  <h4>Giới thiệu</h4>
                  <ReferenceLinks links={aboutLinks} />
                </div>
                <div className="sc-footer-column">
                  <h4>Hướng dẫn</h4>
                  <ReferenceLinks links={guideLinks} />
                </div>
                <div className="sc-footer-column sc-footer-contact-column">
                  <h4>Hỗ trợ nhà hàng</h4>
                  <ul className="sc-footer-links">
                    <li><button type="button" onClick={showContactNotice}>Liên hệ</button></li>
                    <li><a href="/menu/combo">Thực đơn nhà hàng</a></li>
                    <li><a href="/auth/login?returnUrl=%2Fmenu%2Fcombo">Tài khoản thành viên</a></li>
                    <li><span>Thông tin liên hệ đang cập nhật</span></li>
                  </ul>
                  {contactNotice && <p className="sc-footer-contact-notice" role="status">{contactNotice}</p>}
                </div>
              </div>
            </div>
            <div className="sc-footer-bottom">
              <div className="sc-footer-copyright">
                <p>© 2026 The Sea's Crown. Đã đăng ký bản quyền.</p>
                <p className="sc-footer-reference-note">Liên kết hướng dẫn và mạng xã hội tham khảo từ The Pizza Company.</p>
              </div>
              <div className="sc-footer-social">
                <p>Liên kết tham khảo</p>
                <div className="sc-footer-social-links">
                  {socialLinks.map(({ name, href, image }) => (
                    <a key={name} href={href} target="_blank" rel="noopener noreferrer" title={`${name} của The Pizza Company (mở tab mới)`}>
                      <img src={`${menuAssets}${image}`} alt={name} width="24" height="24" loading="lazy" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <MenuFloatingSupport />
    </>
  )
}
