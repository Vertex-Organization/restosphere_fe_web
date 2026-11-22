# Palazzo rotating table — source map

- Source: `https://palazzo.framer.website/` (opening rotating-table experience).
- Local routes: `/vi` and `/en`, first section (`#signature-table`).
- Existing Sea Crown header, intro, routes, and downstream page sections stay in place.
- The original Sea Crown signature-dish slider remains at `#seafood-specialties`.
- The previous seafood-photo hero and curved “Tươi ngon mỗi ngày” slogan were removed.

## Local ownership

- `src/components/sites/sea-crown/PalazzoTable.tsx`: content, drag/keyboard/wheel controls, inertia, snapping, autoplay, and accessibility.
- `src/components/sites/sea-crown/PalazzoTable.css`: desktop/mobile composition and reduced-motion behavior.
- `src/components/sites/sea-crown/palazzoTableMath.ts`: angle normalization, active-course selection, and responsive geometry.
- `public/sites/sea-crown/palazzo/`: locally hosted source imagery and fonts.
- `scripts/palazzo-table.test.mjs`: geometry and course-index regression tests.

The source and local result were visually checked at 1440 px desktop and 390 px phone layouts.
