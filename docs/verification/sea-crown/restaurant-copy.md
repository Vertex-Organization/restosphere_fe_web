# Seafood restaurant copy

Updated both Vietnamese and English marketing copy for The Sea's Crown: hero, introduction, seafood slider, event catering, membership, FAQ, footer, service description and metadata.

- The three slider dishes now match their images: king crab, lobster, garlic prawns.
- The catering form requests an event consultation rather than advertising a free sandwich lunch. Existing fields, validation and user-sent email workflow remain intact.
- Removed sandwich references, merchandise rewards and fixed loyalty conversion claims from public copy.
- Existing contact details, addresses, routes, page containers, responsive rules and animation logic are retained.
- Native SVG seafood, drink and event menus now replace the old sandwich document previews and links. Each document opens at full size. Original files remain stored; the new menus contain no invented prices.
- Six self-contained menus include embedded Vietnamese fonts. Edit their source copy in `scripts/generate-seafood-menus.mjs` and regenerate with `node scripts/generate-seafood-menus.mjs`.

Validation: production build passed; server-rendered copy and menu-link checks passed for four components in both languages; slider and FAQ item counts remain unchanged. Vietnamese and English menu artwork was rendered and visually inspected. Browser verification is unavailable in this session.
