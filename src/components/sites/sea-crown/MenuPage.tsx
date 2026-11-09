import './MenuPage.css'
import type { Language } from './siteData'

type MenuPageProps = { language: Language }

const assetRoot = '/sites/sea-crown/menus/'

/**
 * Local text-based artwork keeps the existing document layout and allows
 * visitors to open the same seafood menu at full size.
 */
export default function MenuPage({ language }: MenuPageProps) {
  const english = language === 'en'

  return (
    <main id="main-content" className="sandwich-menu-page">
      <div className="sandwich-menu-heading">
        <h1>{english ? 'Our Seafood Menu' : 'Thực đơn hải sản'}</h1>
      </div>

      <section id="menu" className="sandwich-menu-documents" aria-label={english ? 'Food and drinks menu' : 'Thực đơn món ăn và đồ uống'}>
        <div className="sandwich-menu-document-grid">
          <a
            className="sandwich-menu-lunch-document"
            href={`${assetRoot}menu-${language}.svg`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={english ? 'View the seafood menu at full size' : 'Xem thực đơn hải sản ở kích thước đầy đủ'}
          >
            <img
              src={`${assetRoot}menu-${language}.svg`}
              width="1489"
              height="2106"
              alt={english
                ? "The Sea's Crown seafood menu: king crab, lobster, garlic prawns, crab, squid and dishes to share. Open to view at full size."
                : "Thực đơn hải sản The Sea's Crown: cua hoàng đế, tôm hùm, tôm sốt tỏi, cua, mực và món dùng chung. Mở để xem kích thước đầy đủ."}
            />
          </a>

          <a
            className="sandwich-menu-drink-document"
            href={`${assetRoot}drinks-${language}.svg`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={english ? 'Open the drinks menu at full size' : 'Mở thực đơn đồ uống ở kích thước đầy đủ'}
          >
            <img
              src={`${assetRoot}drinks-${language}.svg`}
              alt={english ? 'Drink menu' : 'Thực đơn đồ uống'}
              width="354"
              height="1280"
            />
          </a>
        </div>
      </section>
    </main>
  )
}
