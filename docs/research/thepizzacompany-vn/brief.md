# The Pizza Company — login reference clone

Source observed: 2026-11-09. Existing app: React + TypeScript + Vite.

## Route and ownership

| Source | Local | Files |
| --- | --- | --- |
| `https://thepizzacompany.vn/auth/login?returnUrl=https%3A%2F%2Fthepizzacompany.vn%2F` | `/auth/login` with the same query | `src/pages/auth/LoginPage.tsx`, `LoginPage.css` |
| Local convenience entry | `/` | `src/App.tsx` |

- `src/components/auth/AuthHeader.tsx`: desktop header, source logo, location link, language menu.
- `src/components/auth/LoginForm.tsx`: controlled fields, validation, password visibility, submit feedback, source links.
- `public/sites/thepizzacompany-vn/`: local copies of the assets actually used by the page.
- `assets.json`: network URL to local asset mapping, original content types and byte sizes.
- `verification.json`: source/local geometry, viewports, browser checks and asset failures.

The existing `pages/auth` and `components/auth` conventions were retained. No new framework or router dependency was introduced.

## Observed page rules

1. Fixed, cover-sized, centered blurred background. Separate desktop/mobile images at 768px.
2. Desktop header appears at 1024px, height 80px. Three columns: location, 166px logo, language.
3. Main container caps at 1200px. Side padding 16px below 1280px.
4. Main padding 16px on small screens, 48px from 1024px. Back icon 32px / 48px, navigation font 17px / 24px.
5. Login card caps at 800px, radius 16px, white at 90% opacity, backdrop blur 60px, shadow `0 1px 10px rgba(0,0,0,.12)`.
6. Banner ratio 10:1, followed by the real repeating checker image at 16px height.
7. Form padding 16px mobile, 16px 24px tablet, 32px 24px desktop. Welcome and intro appear at 768px.
8. Poppins 400/500/600 and TPC Go Bold are the exact loaded WOFF2 files. Main text #262626, primary #4da648, hover #008556.
9. Inputs are 40px from 375px; below 375px they use 12px text and 37px height. Submit stays 40px.
10. Mobile has no desktop header or welcome copy. All five social icons remain visible in a 240px row.

## Interactions and boundaries

- Empty submit shows `Vui lòng nhập số điện thoại` and `Vui lòng nhập mật khẩu`.
- Invalid phone shows `Số điện thoại di động không hợp lệ`.
- Eye button changes password visibility without clearing the value; supports keyboard activation.
- Language menu opens/closes, closes on outside click or Escape, and supports arrow navigation.
- The source forgot-password action navigates to `/auth/forgot-password`; the original clone used outbound links for recovery and registration. The branded restaurant page now displays local feedback for these unavailable features.
- Successful account authentication, OTP recovery and provider OAuth require authentication services and are not implemented by this frontend reference. Local submit displays an explicit unavailable state and sends no credentials.
- Google, Facebook and Apple controls display local availability feedback. Restaurant-specific TapTap and QSR icons were removed. English is disabled until translated pages are available.
- The source location control opens a delivery/takeaway address modal. The single-branch restaurant instead displays its seafood category in this position.
- Logo and back use the restaurant's local homepage. `returnUrl` accepts only same-origin destinations.
- Local layout caps card width to available space at tablet widths, avoiding overflow from the source's fixed 800px tablet card.

## Verification and screenshots

`verify-clone.cjs` accepts an installed Playwright module directory as its first argument and uses the installed Chrome executable. Set `CLONE_ORIGIN` to verify another local server. It reuses saved source observations by default; `REFRESH_SOURCE=1` explicitly refreshes the historical reference.

Source and local screenshots are captured at the same viewport, after fonts, images and CSS background images load. Full-page evidence is captured after real wheel scrolling where necessary.

- [Desktop comparison — source left, local right](comparison-desktop.png)
- [Mobile comparison — source left, local right](comparison-mobile.png)
- Per-viewport captures: `source-<width>x<height>.png` and `local-<width>x<height>.png`.
- Production build and project lint are run separately.

## Restaurant branding

The restaurant name is **The Sea's Crown**. `src/components/ui/RestaurantBrand.tsx` renders the reusable text wordmark and crown/wave SVG for the header and login banner; `public/branding/the-seas-crown.svg` is the matching favicon. The page title, welcome copy and accessible labels use this name. Original source URLs remain in research documentation and asset provenance only; the live restaurant UI no longer navigates to the source website.

Source screenshots and the two comparison montages above document the original clone before restaurant branding. Current local screenshots and `verification.json` reflect the branded page.
