# Asset and source organisation

- Active React components and styles are now in `src/components/sites/sea-crown/`. All application imports use this directory.
- Active public assets are grouped under `public/sites/sea-crown/`: `images`, `videos`, `fonts`, `logos`, `illustrations`, `menus`.
- Removed the old asset resolver aliases; components now reference descriptive filenames directly.
- Preserved five fonts, twelve partner logos and the intro illustration from the old public directory, with SHA-256 verification. Font filenames now describe their family and weight.
- Removed 60 unused source-brand assets (24,120,033 bytes), including old food photos, videos, logos, document previews/PDFs and unused font subsets.
- The old source directory was moved; the old public directory was deleted after verifying every required asset at its new location.

Validation passed: server-rendered checks for both languages and all page components; 43 unique runtime asset paths, including partner logos created dynamically and font URLs; production build after removal; all 45 retained asset/license files match the final build byte for byte. Original animation settings, layouts and content are preserved.

The file-level migration and removal inventory is in `asset-cleanup.json`.
