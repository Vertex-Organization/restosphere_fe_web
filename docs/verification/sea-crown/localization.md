# Vietnamese interface

- Vietnamese is the default locale at `/` and `/vi`; legacy `/nl` paths display Vietnamese too.
- The language switch is VI / EN. The existing English alternative remains available.
- Navigation, home copy, slogan, labels, weekdays, status messages, catering form, email draft subject, menu accessibility text, legal pages, page titles and metadata are localized.
- The brand remains `The Sea's Crown`. Existing commercial details, addresses, prices, contact destinations, menu document files, layout and animation settings are retained.
- The original menu images and downloadable PDFs contain embedded text and remain in their original language.
- Local fonts support Vietnamese diacritics: Be Vietnam Pro and Dancing Script from the official Google Fonts repository, with their OFL license files included alongside the fonts. The brand heading retains Poppins.

Validation: production build passed. Server-rendered checks passed for the Vietnamese home, header, footer, menu, catering, privacy and terms pages, and the English home. All current and legacy route prefixes retain page transition handling. Font character coverage checks passed. Browser visual verification is unavailable in this session.

Font sources:
- https://github.com/google/fonts/tree/main/ofl/bevietnampro
- https://github.com/google/fonts/tree/main/ofl/dancingscript
