# RestoSphere Manager Web

Kind: software — restaurant operations workspace, not a marketing website.
Design: client palette (`#166B63`, `#F4F7F6`, `#18343B`), local Be Vietnam Pro, existing staff primitives. The brief explicitly overrides the skill's hero, full-screen sections, palette/font deal, effects, moments, large type, sample-label prohibition and marketing form rules. These would obstruct a dense, authenticated operations application. No hero, effect, scene, decorative photographs or marketing footer was added.
Voice: Vietnamese operational terminology; short descriptive headings, explicit actions, specific validation messages; no invented business claims. All operational records and named people are mock fixtures.

## Source audit and integration

- Existing stack: React 19 + Vite + TypeScript; no routing library or test runner dependency added.
- `App.tsx` keeps Customer, Kitchen and Cashier dispatch intact and lazy-loads Manager only under `/manager`.
- Routing reuses the existing `pushState`/`popstate` history store and `KitchenLink`.
- UI reuses the staff tokens in `kitchen.css`, existing line icons, `BrandLogo`, `Badge`, native `Dialog` and `DishThumb`. Manager layout/styles are scoped under `.m-*` / `.m-app`.
- Customer files, Kitchen/Cashier business logic, existing auth endpoints, package dependencies and global styles were not rewritten.
- Existing generic authentication exposes ADMIN/MANAGER/STAFF, but has no operational permission contract. Kitchen and Cashier already have isolated mock staff sessions. Manager follows that established pattern with an explicit mock label.

## Implemented routes

| Route | Behavior |
| --- | --- |
| `/manager` | Four compact KPIs, table/area status, priority alerts, pending approvals, upcoming reservations, recent audited activity |
| `/manager/operations` | Read-only monitoring of tables, reservations, orders/kitchen and payments, with detail navigation |
| `/manager/reservations` | Search, date/status filters, details/history, table reassignment with capacity/availability/time-overlap checks and mandatory reason |
| `/manager/tables` | Area/status filters, table details, active session and bookings, guarded layout updates |
| `/manager/orders` | Search/status/late filters, original order item prices, additional ordering rounds, read-only progress |
| `/manager/kitchen` | Per-item progress, quantity, notes, chef and wait time; no PREPARING/READY/SERVED mutation controls |
| `/manager/employees` | Operational employee profiles, department/search filter, area assignment, today's shifts |
| `/manager/shifts` | Seven-day compact schedule, previous/next week, create/edit, employee assignment, overlap/inactive/daily-hours validation, understaffing warning |
| `/manager/menu` | Table with small existing dish images; search/category/status filter; create/edit price, image URL, description, availability and visibility; delete only unreferenced dishes |
| `/manager/menu/categories` | Create/edit/show/hide/order; delete only when no menu items reference the category |
| `/manager/approvals` | Search/type/status filters, details, approve/reject with reason, limit/self-review/duplicate checks and processing history |
| `/manager/reports` | Date/shift/payment filters, settled revenue, one small chart, daily table, best sellers, activity definitions, CSV export |
| `/manager/incidents` | Search/status/severity filters, assignment/progress/notes, resolve and audit; no automatic Order/Bill changes |
| `/manager/notifications` | Read/unread filters, mark individual/all read, navigation to the related record |
| `/manager/profile` | Manager identity, shifts, approval limit and logout; no system administration |
| `/manager/login` | Explicit mock sign-in, protected return URL and role denial |

## Data and business rules

`src/api/manager/types.ts` defines normalized operational data and commands. `service.ts` is the replacement boundary for a future HTTP adapter; `rules.ts` validates transactions independently of the components. The service retrieves the current mock actor rather than accepting UI-supplied permission claims.

One Manager store drives dashboard counts and every detail page. The mock adapter persists in `localStorage` under `restosphere.manager.data.v1`, propagates same-origin tab changes via storage events, uses Web Locks when available and rejects stale revisions. Login is per-tab in `sessionStorage` under `restosphere.manager.session.v1`.

- Occupied/cleaning tables and tables with live reservations cannot be freely reconfigured or made available.
- Reassignment requires an available table, enough seats, no overlapping booking and an audit reason.
- Shifts cannot overlap for a person, include an employee on leave/inactive, end before they start, or exceed the **mock assumption** of 12 hours per person per day. A staffing minimum is editable per shift; short staffing produces a warning.
- Menu changes retain original order item name/price snapshots. Menu/category deletion preserves references; a referenced dish must be hidden rather than deleted.
- Decisions require permission, a pending request, a different sender, the assigned monetary limit and a reason. A decision is an authorization record for the sending department; it does not silently execute a cancellation, discount or invoice adjustment.
- Resolving an incident does not change order, item, bill or payment states.
- Revenue includes only completed payment records, using Vietnam business dates. Failed/pending payments are excluded. Item sales are labeled before bill-level discounts. Profit and timing averages are not invented when cost/timestamp data is unavailable.

This mock store does **not** synchronize with the Kitchen mock, Cashier mock, Expo app or a database. In production, Backend is authoritative and must implement authenticated branch-scoped reads, permission checks, validation, atomic revision/idempotency checks, audited decisions and downstream workflows. No operational endpoint paths are claimed to exist.

## Local access

Run `npm run dev`, then open `/manager`.

- Manager fixture: `manager` / `Manager@123`.
- Role denial fixture: `cashier` / `Manager@123`.
- The login and workspace visibly identify mock data. Credentials are fixtures, not real accounts.
- No Admin functions, role assignment, password reset or technical configuration are exposed.

## Verification

- `node --test scripts/manager-rules.test.mjs`: pure-domain tests, with no extra dependency.
- `node scripts/manager-browser-qa.mjs`: a dedicated headless Chrome/profile, real login and forms, screenshots and UI assertions. It never alters the user's browser profile. See `.taste-skill/manager-shots/qa-results.json`.
- Final production build: TypeScript and Vite passed. Targeted ESLint for every new Manager source file passed.
- Final domain pass: 22 tests passed, including permissions, revisions, duplicate decisions, booking capacity/conflicts, shift conflicts, calendar validity, historical price preservation and reference protection.
- Final browser pass on the production build: 15 Manager screens, 17 interactive flows, no runtime exception. Also smoke-tested Customer home and Kitchen/Cashier login entry routes. This is a regression smoke check, not a full re-test of their business flows.
- Dashboard viewport review: 1920×1080, 1440×900, 1366×768, 1024×768, 820×1180, 768×1024, 390×844 and 320×844. Every other Manager page checked at 1366×768 and 390×844. No document-level horizontal overflow; wide tables use a contained scroll region.
- Desktop sizing: 216px sidebar, 60px header, 22px page title. Phone: 56px header and 20px title. Tables, buttons and forms share the staff visual language.

## Assets and skill scope

Uses the existing `/kitchen/restosphere-logo-560.png` and `/kitchen/menu/*.jpg` fixtures. Vietnamese/Latin WOFF subsets made from the project's existing Be Vietnam Pro fonts total 123,684 bytes; their original SIL OFL license is retained in `public/manager/fonts/OFL.txt`. No dependency or network download was added for the conversion. The existing application shell still loads one original font, reported separately by the performance checker.

No new stock photograph, coined brand, generated artwork, `.example` mail form, customer-facing marketing page or canonical domain was needed. Existing dish photos are fixture thumbnails; replace them and fixture menu data with approved restaurant data when integrating Backend. Broken user-provided dish image URLs have an in-frame neutral fallback.

The skill's marketing-oriented gate results and any remaining verification limits are recorded in `VALIDATION.md`. Authenticated functional and viewport checks use actual login, not an auth bypass or checker-specific rendering.

## Phase/file handoff

| Phase | Files / result |
| --- | --- |
| Audit | Existing `App.tsx`, auth/client, Kitchen/Cashier routes, providers, layouts, primitives and tokens reviewed; no new frontend source |
| Foundation | `routes/managerRouter.ts`, `layouts/ManagerLayout.tsx`, `hooks/manager/ManagerDataProvider.tsx`, `api/manager/*`, `pages/manager/ManagerApp.tsx`; additive dispatch in `App.tsx` |
| Core | Dashboard, Operations, Reservations, Tables, Orders and KitchenMonitor pages; shared `components/manager/OrderDetail.tsx` |
| Management | Employees, Shifts, Menu and MenuCategories pages; command rules and audit transactions |
| Decisions | Approvals, Incidents and Notifications pages; Profile/login/logout and role guard |
| Analytics | Reports page, date/shift/payment filters, one compact chart, data table, best sellers/activity and CSV |
| Polish | Scoped `components/manager/manager.css`, shared `ui.tsx`, Vietnamese fonts, responsive navigation, keyboard/dialog/error states |
| Validation | `scripts/manager-rules.test.mjs`, `scripts/manager-browser-qa.mjs`, production build, targeted lint, screenshots and skill gate/performance reports |

All operational reads/writes and authentication in this handoff remain on the explicitly labeled mock adapter. Backend authorization and cross-role synchronization remain integration work.
