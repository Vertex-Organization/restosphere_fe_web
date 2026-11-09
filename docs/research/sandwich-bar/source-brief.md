# The Sandwich Bar reference

Inspected 2026-11-09 from public HTTP page output, stylesheet and bounded component scripts. Original: https://www.thesandwichbar.nl/. The HTTP root serves Dutch content; `/en` serves English. Native browser inventory was unavailable in this environment; appearance and motion rules below come from the actual DOM, CSS, source asset files and declared animation options. A visual source screenshot comparison remains unverified.

## Source to local routes

| Source route | Local route | Page ownership |
| --- | --- | --- |
| `/`, `/nl`, `/en` | Same pathnames | Root App shell, shared navigation/footer, HomePage |
| `/menu`, `/nl/menu`, `/en/menu` | Same pathnames | MenuPage |
| `/catering`, `/nl/catering`, `/en/catering` | Same pathnames | CateringPage |
| `/privacy`, `/nl/privacy`, `/en/privacy` | Same pathnames | LegalPage |
| `/terms`, `/nl/terms`, `/en/terms` | Same pathnames | LegalPage |

The requested replacement replaces the previous restaurant interface. Framework: editable React/Vite implementation. Reference is Next with Tailwind, GSAP, Lenis, Sanity CMS content; original production scripts are evidence only and are not part of the local running app.

## Layout and type

- Colors: cream `#fdf4e5`, plum `#4d343f`, dark `#382628`, muted `#685d5e`.
- Poppins regular 400, medium 500, semibold 600, bold 700. Latin source WOFF2s are under `public/sites/sandwich-bar/fonts/`. Handwritten accent is actual `tomatoes.ttf`.
- Source breakpoints: sm 640, md 768, lg 1024px. Main maximum widths: 3xl 768, 5xl 1024, 6xl 1152, 7xl 1280px.
- Navigation fixed at top, z50; horizontal padding40px/top padding40px. Left social circles40px with20px vertical gaps, language chooser12px. Center logo top24px,width96 mobile/120 desktop. Right Menu/Catering pills use14px semibold with padding8px20px,12px gap; column mobile/row desktop. No hamburger is present in the source.
- Hero height130vh; `The Sandwichbar 04.webp`, object-fit cover, object-position center65%,20% black overlay. Heading 72px mobile/128 desktop,bold,uppercase,line-height1,letter-spacing-.05em,positioned x50%/y38%. Right description max320px,14px mobile/16 desktop, parent right40px/bottom35vh/padding40px.
- Hero polygon clip: `polygon(67% 92%,41% 94%,0% 100%,0% 0%,100% 0%,100% 97%,88% 93%)`.
- Slogan curved SVG viewBox 1440x442; section overlaps hero -22.95vw mobile/-16.95vw desktop. Stroke160px plum; text128px bold cream. Exact paths in `reference-69fac7ac254d9eca.js`.
- About: cream,padding-bottom80px; image width2/3 of max768 with5/3 ratio,crop center17%; copy max672px,18px,line-height1.625,paragraph gap24px. Draggable desktop mascot sticker right80/bottom40,width250px.
- Catering teaser: plum,vertical padding96px,max1152px,gap64px; image40% with3/5 aspect; copy60%; heading36 mobile/48 desktop,body18px.
- Photo strip: cream,vertical padding64 mobile/96 desktop,photos aspect2/3,height256 mobile/384 desktop,gap16 mobile/24 desktop.
- Full source semantic DOM, classes, inline styles and real text are in `en-dom.txt`/`nl-dom.txt`; same convention for route files.

## Source motion rules

- Navigation is fixed and does not change on scroll. Logo follows full-window normalized pointer coordinates, maximum24px horizontal/12px vertical, CSS transition `.6s cubic-bezier(.23,1,.32,1)`. Nav buttons follow35% of local pointer distance from center,`.4s power3.out`; pointer leave resets `.6s elastic.out(1,.4)`.
- One-time intro is stored as `sessionStorage.intro-seen`: plum panel,animated SVG delivery car,line across screen1.8s power2.in,car crosses2.2s power3.in; car tilt -7deg then0; panel exits x200%1.4s power3.inOut. Hero text reveals opacity0/y20 to opacity1/y0,1s power3.inOut with .2s stagger.
- Lenis smooth wheel duration1.2,easing `min(1,1.001-2**(-10*t))`.
- Hero photo/headline do not have a continuous scroll effect in the source component.
- Slogan textPath changes startOffset -50% to0% with section scroll from top at viewport bottom until bottom at viewport top,linear,scrub.5.
- PhotoMarquee duplicates26 photos and moves left continuously at45px per second; reduced-motion disables this loop. Recalculates after resize200ms debounce.
- SandwichSlider has3 panels and no wrapping. Each panel width equals viewport width. Arrow/dot click animates translateX to target panel in.7s power3.out. Mouse/touch drag,edge resistance.85,no inertia;15vw drag threshold moves one slide,otherwise returns current. First/last arrows disabled. Background path draws with scroll top80% to bottom20%,scrub1.5.
- About mascot supports pointer dragging with tilt from horizontal movement clamped±20deg; while held scales1.08,increases shadow,z999. Idle jiggle3.2s ease-in-out at initial rotation5deg,delay1.1s.
- Remaining member/video/location/footer structures are recorded in DOM references. Actual TikTok videos are downloaded locally rather than substituted still images.

## Assets and evidence

`asset-manifest.json` maps source URL to local file, HTTP content type,size,and decoded image dimensions/format. `extra-asset-manifest.json` maps menu PDFs,12 customer logos,3 videos,and Tomatoes font. Assets retain original filenames/folder structure; generated local PDF previews are separately named.

Important assets: `The Sandwichbar 04.webp` hero; `locatieshoot/the-sandwichbar-20.webp` about; `The Sandwichbar 02.webp` catering; `The Sandwichbar 07.webp` member backdrop; `The Sandwichbar - Vrijstaand 1.webp`/2/3 sandwich slides; `tsb1-location.webp`/`tsb2-location.webp` locations; `Mannetjes-broodje-beige.png` mascot; `movingcar.svg` intro; `footer-bg.svg` footer; `logo.jpeg` and `logo-white.jpeg` branding.

`menu.pdf` is the actual Sanity lunch menu PDF from the menu page; `drinkmenu.jpeg` is its right column. `menu-catering.pdf` is the catering menu. Catering logos are in `logos/`; original video files in `videos/`.

`en-messages.json` and `nl-messages.json` hold exact site translations. `en-page-data.json`/`nl-page-data.json` hold server-supplied homepage content and FAQ. Raw `*-source.html`,readable `*-dom.txt`,decoded `*-flight.txt`,`source.css`,and `reference-*.js` are reference material only.

External destinations retain actual source URLs: catering ordering platform,Piggy membership balance,Google Maps,Instagram,TikTok,mail/telephone links and developer credit. Local form handling must state its actual capability rather than claim a real order/request was sent.
