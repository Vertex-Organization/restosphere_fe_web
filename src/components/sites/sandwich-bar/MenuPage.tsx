import './MenuPage.css'

type MenuPageProps = { language: 'nl' | 'en' }

const assetRoot = '/sites/sandwich-bar/'

/**
 * The original menu is a one-page PDF, displayed as a canvas on the source site.
 * This image is a local, high-resolution render of that same document. Keeping
 * the original PDF available also lets visitors zoom in or print it on mobile.
 */
export default function MenuPage({ language }: MenuPageProps) {
  const english = language === 'en'

  return (
    <main id="main-content" className="sandwich-menu-page">
      <div className="sandwich-menu-heading">
        <h1>{english ? 'Our Menu' : 'Ons Menu'}</h1>
      </div>

      <section id="menu" className="sandwich-menu-documents" aria-label={english ? 'Food and drinks menu' : 'Eten en drinken'}>
        <div className="sandwich-menu-document-grid">
          <a
            className="sandwich-menu-lunch-document"
            href={`${assetRoot}menu.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={english ? 'Open the complete sandwich menu as a PDF' : 'Open de volledige broodjeskaart als PDF'}
          >
            <img
              src={`${assetRoot}menu-page-1.png`}
              width="1489"
              height="2106"
              alt={english
                ? 'The Sandwich Bar menu: specials, warm sandwiches, back to basic, toasties, all day breakfast and add-ons. Open the PDF to enlarge or print.'
                : 'The Sandwich Bar menukaart: specials, warme broodjes, back to basic, tosti’s, ontbijt en extra’s. Open de PDF om te vergroten of af te drukken.'}
            />
          </a>

          <a
            className="sandwich-menu-drink-document"
            href={`${assetRoot}drinkmenu.jpeg`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={english ? 'Open the drinks menu at full size' : 'Open de drankenkaart op volledig formaat'}
          >
            <img
              src={`${assetRoot}drinkmenu.jpeg`}
              alt="Drink menu"
              width="354"
              height="1280"
            />
          </a>
        </div>
      </section>
    </main>
  )
}
