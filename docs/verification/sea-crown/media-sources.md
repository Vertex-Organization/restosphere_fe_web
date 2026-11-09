# Sea Crown media refresh

Scope: replace restaurant branding images, culinary photography and video; update the white/red/gold palette. Existing copy, menu documents, partner logos, links, routing, page structure, responsive grids and animation logic are retained.

Palette target: approximately 65% white (`#ffffff`), 25% red (`#b40000`, with `#870000` for darker states), 10% golden yellow (`#ffc400`) across interface surfaces and accents. Actual proportions vary by viewport and photography.

The transparent `logo.png` comes from the user-supplied `logoseacrown.jpg`, with background removal through Imagegen. The source attachment is not modified.

Downloaded stock media is served locally from `public/sites/sea-crown/`. Usage: [Pexels license](https://www.pexels.com/license/).

| Local file | Source |
| --- | --- |
| seafood-platter.jpg | https://www.pexels.com/photo/exquisite-seafood-platter-with-lobster-and-crab-33474027/ |
| king-crab.jpg | https://www.pexels.com/photo/photo-of-crab-legs-8642317/ |
| grilled-squid.jpg | https://www.pexels.com/photo/squid-being-barbecued-on-grill-3276125/ |
| garlic-prawns.jpg | https://www.pexels.com/photo/seafood-on-plate-16482466/ |
| lobster-dish.jpg | https://www.pexels.com/photo/a-lobster-on-a-plate-20150644/ |
| lobster-prawns.jpg | https://www.pexels.com/photo/close-up-shot-of-lobster-on-a-plate-7364105/ |
| crab.jpg | https://www.pexels.com/photo/hand-touching-cooked-crab-on-red-plate-26756805/ |
| seafood-ceviche.jpg | https://www.pexels.com/photo/delicious-seafood-platter-with-ceviche-36317351/ |
| seafood-feast.jpg | https://www.pexels.com/photo/delicious-lobster-and-gourmet-seafood-platter-36892029/ |
| boiled-lobster.jpg | https://www.pexels.com/photo/delicious-boiled-lobster-on-plate-in-restaurant-4553120/ |
| seafood-stir-fry.mp4 | https://www.pexels.com/video/cooking-seafood-stir-fry-8354426/ |
| prawn-plating.mp4 | https://www.pexels.com/video/shrimps-on-plates-5488002/ |
| seafood-cooking.mp4 | https://www.pexels.com/video/8354452/ |

Photo and logo inspection: `media-contact-sheet.jpg`, `logo-preview.jpg`. All three replacement videos contain 1920 × 1080 video tracks. Browser QA is unavailable because this session exposes no browser surface.

Validation passed: `npm run build`; `git diff --check`; 47 original media references resolve to existing replacements; all 14 media files appear in `dist`; 18 local page/media URLs return HTTP 200.
