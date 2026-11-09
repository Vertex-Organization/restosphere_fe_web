# Catering and legal source evidence

Sources: `https://www.thesandwichbar.nl/nl/catering`, `/en/catering`, `/privacy`, `/terms`. Direct HTTP HTML and stylesheet were saved locally. The shared navigation and footer are owned by the application shell.

| Source routes | Local component | Styling |
| --- | --- | --- |
| `/catering`, `/nl/catering`, `/en/catering` | `src/components/sites/sandwich-bar/CateringPage.tsx` | `CateringPage.css` |
| `/privacy`, `/nl/privacy`, `/en/privacy` | `src/components/sites/sandwich-bar/LegalPage.tsx` | `LegalPage.css` |
| `/terms`, `/nl/terms`, `/en/terms` | `src/components/sites/sandwich-bar/LegalPage.tsx` | `LegalPage.css` |

Catering section sequence: plum hero with copy + two independent upward photo streams, cream client logo grid, plum catering PDF, cream trial lunch form, shared footer. Hero container max 1280px, gap48px, 24px gutters, two equal columns at1024px+, h172px desktop/60px tablet/30px phone. Source mobile replaces the photo streams with a4:3 image preceding the text. Photo streams run28s/22s with12px gaps and2:3 photos, matching source `HeroImageSlider` declared values. Client grid is4columns ×2rows on desktop and3columns ×2rows at991px and below. Source logos rotate one cell every1.5s with.9s transition; local uses a deterministic rotating sequence and equivalent CSS entrance instead of random GSAP selection. Container max1152px. Menu PDF container max768px. Source form is2columns at640px+, side-by-side with heading at1024px+.

The actual one-page `menu-catering.pdf` was downloaded and rendered at2x into `public/sites/sandwich-bar/menu-catering-page-1.webp`. PDF preview inspected using `view_image`: cream background, complete menu and prices, no crop or missing blocks. The preview links to the original local PDF for native browser zoom/download/print. Raster display preserves the original PDF visual; webpage layout and content around it are editable React/CSS. Actual twelve client logos and eight photos are local assets.

All eight catering fields match source labels/types and are required. Date enforces at least the next Amsterdam calendar day. The production site posts to `/api/catering-form`; that service is not reproduced. Local submit validates fields, generates a draft `mailto:orders@thesandwichbar.nl` link, and tells the visitor nothing has been sent. Only clicking the generated link opens their email app for review. No data is submitted during implementation or checks.

Legal pages contain the source English text even when navigating from the Dutch language choice, as the source HTML does. Legal source does not render a footer. Main has96px top padding,16px horizontal gutters; text container max768px with64px vertical padding, h148px desktop/36px phone, h220px, body16px with1.625line-height.

Verification: TypeScript project build (`node node_modules/typescript/bin/tsc -b --pretty false`) passed after adding these components. Browser screenshot comparison remains unavailable because the supported CUA browser inventory contains no browsers; no screenshot similarity claim is made.
