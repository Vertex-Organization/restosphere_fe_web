GATE: OPEN 9 (rounds used up)

Validated 12 November 2026, Asia/Ho_Chi_Minh. The final gate ran against the production build at `/manager`. A fresh unauthenticated browser correctly reached the login screen. It did not bypass authentication to inspect private screens. Authenticated verification used the real mock login in the separate browser QA script.

## Passing implementation checks

| Check | Result |
| --- | --- |
| `npm run build` | PASS — TypeScript project build and Vite production bundle |
| Targeted ESLint for Manager source | PASS — no errors or warnings |
| `node --test scripts/manager-rules.test.mjs` | PASS — 22 tests |
| Production browser QA | PASS — 15 Manager screens and 17 interactive flows, no runtime exceptions |
| Dashboard viewport QA | PASS — 1920×1080, 1440×900, 1366×768, 1024×768, 820×1180, 768×1024, 390×844, 320×844; no document overflow or broken dashboard image |
| Every other Manager page | PASS — screenshot and no document overflow at 1366×768 and 390×844 |
| Customer/Kitchen/Cashier entry smoke checks | PASS — Customer home renders; protected staff entries reach their existing login screens |
| Rendered login copy lint | PASS — 0 FAIL, 0 WARN, 53 words |
| Skill performance check, production login, three loads/width | 0 FAIL, 6 WARN across 1440px and 390px |

The browser flows cover role denial; login return path; reservation search/empty state; table reassignment with audit; approval; rejection; menu validation/create/edit/hide/delete; category create/delete; rejected overlapping shift; valid shift creation; incident resolution without order mutation; read notifications; invalid report range; CSV download; mobile navigation; logout and revoked access.

Screenshots were visually reviewed individually and with desktop/mobile contact sheets, including form validation and table reassignment dialogs. The 216px sidebar, 60px header, 22px desktop titles, compact table rows, restrained teal palette and contained table scrolling follow the operational brief.

## Every open gate finding

No formal waivers were submitted. No checker/kit file was changed, no content was hidden from the checker, and no headless-specific application behavior was introduced.

| # | Check / target | Reason retained |
| --- | --- | --- |
| 1 | `shader-lint` — `assets/index-PZMx51Su.js`, `this` | False identification of minified JavaScript as GLSL. The matching `value.substr(1, value.length - 3).split(":")` code is GSAP's existing `_parseObjectInString` easing parser (`node_modules/gsap/gsap-core.js`, around line 1401), inherited through the existing Customer entry bundle. Manager mounts no shader, effect or WebGL context. Performance measured zero contexts at load, bottom and peak. |
| 2 | `no-visual` — `div#root`, login | The real authentication form is an operational screen, not a software feature section. Decorative UI mockups/photos would add no login function. |
| 3 | `moment-none` — page | The brief forbids marketing hero/large decorative layouts and asks for practical daily operations UI. No scroll moment was added to the login/workspace. |
| 4 | `container-edges` — `div#root`, content margins | A centered 400px authentication form intentionally does not use a marketing `.wrap` with desktop 64–120px margins. |
| 5 | `container-edges` — `div#root > div.kds.m-login`, full-width shell | The authentication shell fills the viewport and centers its form. It is not an overflowing marketing content block. |
| 6 | `container-edges` — `.m-login-footer`, centered text | Small application identification is centered below the form; it does not share a marketing split-column baseline. |
| 7 | `container-edges` — `.m-login-demo > p`, inset fixture credentials | The explicit mock information is padded inside its form panel, as required to distinguish mock data from production. |
| 8 | `container-edges` — form heading/labels/inputs | The form fields have equal internal padding, rather than the marketing page's global `.wrap` edge. |
| 9 | `container` — page missing `.wrap` | The existing React staff application uses a compact sidebar/header workspace and a centered authentication form. Its dimensions follow the user's explicit prompt, not the marketing page starter. |

The gate ran all three rounds. The final production bundle additionally exposed finding #1; its origin was verified read-only after the gate. The skill's instruction to stop fixes after `OPEN` was followed.

## Retained checker warnings

- `caption`: the login's small application identification below the form is treated as a visual caption; it is application identity, not an image description.
- `skip-link`: the login begins directly with form controls and has no navigation to skip. The authenticated workspace has a first-tab skip link to its main content.
- `share-meta`: private operations screens deliberately use `noindex,nofollow`; no social-card image or canonical marketing domain is claimed.
- `form-fields`: login has native required fields, autocomplete, a busy submit label and announced error messages; the marketing form status-line convention is not used. Real login success/error and sign-out are verified through the UI.
- Copy-lint warnings retained: none on the rendered login.

## Performance detail and retained warnings

Production login, median of three runs on this machine (CPU measurement, not field data):

| Metric | 1440px | 390px |
| --- | --- | --- |
| FCP | 580 ms | 520 ms |
| LCP | 580 ms | 540 ms |
| CLS | 0.000 | 0.000 |
| Blocking time | 54 ms | 13 ms |
| Broken requests | 0 | 0 |
| Peak WebGL contexts | 0 | 0 |

Each viewport retains three warnings: 617.4 KiB parsed JavaScript (the inherited Customer entry also loads shared animation code); 251.9 KiB font transfer (three compact Manager WOFF files plus the existing shell's original font); a 560px source logo displayed at 184px. There are no performance FAIL rows. Shared Customer architecture/assets were preserved as requested.

## Scope and remaining integration

- Manager data/authentication are mock adapters. Frontend checks shape the UI and simulate business validation; they are not production authorization. No operational Backend API contract was available or invented.
- Approval creates an audited authorization decision. The sending role still executes the allowed downstream cancellation/discount/invoice workflow. The mock does not pretend to update Kitchen/Cashier/Expo stores.
- No cost data means no profit estimate; missing per-item start/end timestamps mean no fabricated preparation/service average.
- Mock facts: all people, guests, reservations, prices, orders, payments, employee assignments and dates are fixtures; approval limit 500,000 đồng, late-order threshold 25 minutes, 12-hour daily shift limit and staffing minimums are fixture rules, not confirmed restaurant policy.
- Existing fixture image frames: `shrimp.jpg`, `crab.jpg`, `squid.jpg`, `seafood-rice.jpg`, `beef.jpg`, `hotpot.jpg`, `mushroom-hotpot.jpg`, `peach-tea.jpg`. Restaurant-approved menu records/images must replace these on API integration. No new stock photo search, coined name or client-media slot was needed.
- No `.example` marketing form address, canonical domain, public deployment or account-management feature was added.
- Browser QA covers the specified viewport set, not all browsers/devices. Customer/Kitchen/Cashier business workflows were preserved by leaving their code untouched and smoke-testing their entry routes; they were not fully re-tested.
- Skill gate/layout checks cover the unauthenticated login. Authenticated screens were reviewed by actual login and screenshot/UI assertions, because the skill's scripts do not provide a login flow. Full marketing section-rhythm and decorative-motion checks are inapplicable to the explicit no-hero operations brief.
- The gate's quick consistency run does not perform the full scroll-linked/reveal walks, hover-spill, hidden-visual, loop-pause, automatic form submission, reduced-motion interaction pass, dead-IntersectionObserver walk or hover-move pass. Real mock forms were exercised by the 17-flow browser script. Reduced-motion CSS is present, but a separate emulated reduced-motion browser pass was not run. The login has no top-level marketing sections, so its section-tile export also reports that limitation. Authenticated screenshots were captured separately.

Detailed local artifacts (ignored by Git): `.taste-skill/manager-shots/qa-results.json`, screenshots/contact sheets, `.taste-skill/manager-perf.json`, `.taste-skill/gate.json`, `.taste-skill/gate/consistency/report.json` and its rendered HTML. Tests and reports in `scripts/` and `docs/manager/` are part of the source handoff.
