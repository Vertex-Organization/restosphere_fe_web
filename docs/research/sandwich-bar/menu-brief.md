# Menu page reference

- Source routes: `/nl/menu` and `/en/menu`; local routes preserve these paths.
- Ownership: `src/components/sites/sandwich-bar/MenuPage.tsx` and `MenuPage.css`.
- Shared navigation, fonts, and footer belong to the application shell.
- Evidence: saved source HTML, `menu-nl-dom.txt`, `menu-en-dom.txt`, `source.css`, and read-only inspection of the menu component and its PDF renderer.

The source uses a cream main background with 96px top padding. The heading wrapper has a maximum width of 896px and padding of 32px vertically and 16px horizontally. The title is `Ons Menu` in Dutch and `Our Menu` in English, Poppins 700, 36px/40px below 768px and 48px/48px at wider viewports. Its bottom margin is 16px.

The document section has 48px vertical padding and 16px side padding. Inside is a 1024px maximum-width flex layout with 24px gaps, stacked below 768px. At desktop the lunch menu receives two thirds of the available space and the drinks menu one third. Both have 16px rounded corners and a large soft shadow.

The lunch menu is an actual PDF document on the original site; the source renders every page into a canvas at device pixel density. It has one page, 595.5 × 842.25 PDF points. There are no category tabs, filters, page buttons, zoom controls, or other visible controls in that renderer. The original drinks image is 354 × 1280 pixels and is intentionally very tall.

Local media:

- `menu.pdf`: downloaded from the original Sanity CDN URL recorded in the asset manifest.
- `menu-page-1.png`: a 1489 × 2106 render of that same document, generated with PDFium. This is document media, not a screenshot of the website.
- `drinkmenu.jpeg`: the original drinks image.

The lunch document image opens the local PDF in a new tab for native zoom, print, and download. The drinks image opens its original local file at full size. Local imagery was visually reviewed. Browser comparison is pending because the provided browser inventory is empty and Chrome/IAB creation reports unavailable.
