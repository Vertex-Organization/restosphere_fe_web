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

## Interactive menu photos

Pexels stand-ins for the interactive menu (`src/api/menu/mockData.ts`), stored in `public/sites/sea-crown/images/menu/`. License: https://www.pexels.com/license/. Replace them with the restaurant's own photographs before production.

Every photo follows one style so the rails read as a set: food is shot from above on a plate against a light surface (cropped 800 × 600), drinks are a single glass on a white background (cropped 600 × 600).

| Local file | Source |
| --- | --- |
| king-crab.jpg | https://www.pexels.com/photo/seafood-dish-with-crab-sticks-11161345/ |
| lobster.jpg | https://www.pexels.com/photo/fresh-cooked-lobster-on-white-plate-32895370/ |
| garlic-prawns.jpg | https://www.pexels.com/photo/cooked-food-on-the-plate-7111475/ |
| steamed-crab.jpg | https://www.pexels.com/photo/delicious-cooked-crabs-in-a-ceramic-bowl-36608306/ |
| grilled-shrimp.jpg | https://www.pexels.com/photo/seafood-on-plate-16482466/ |
| grilled-squid.jpg | https://www.pexels.com/photo/delicious-grilled-calamari-with-potatoes-33659839/ |
| steamed-squid.jpg | https://www.pexels.com/photo/top-view-of-a-soup-served-in-a-bowl-standing-on-the-table-25068078/ |
| grilled-fish.jpg | https://www.pexels.com/photo/cooked-fish-on-white-ceramic-plate-8696559/ |
| seafood-platter.jpg | https://www.pexels.com/photo/marine-products-and-boiled-corn-in-container-4597169/ |
| seafood-ceviche.jpg | https://www.pexels.com/photo/traditional-ecuadorian-seafood-ceviche-dish-38330325/ |
| seafood-rice.jpg | https://www.pexels.com/photo/delicious-seafood-fried-rice-in-artistic-bowl-31710625/ |
| noodles.jpg | https://www.pexels.com/photo/cooked-food-on-white-ceramic-plate-4518682/ |
| thai-pot.jpg | https://www.pexels.com/photo/soup-with-shrimps-in-a-bowl-and-vegetables-on-the-table-5424049/ |
| beef.jpg | https://www.pexels.com/photo/delicious-beef-stir-fry-with-vegetables-on-white-plate-34429575/ |
| chicken.jpg | https://www.pexels.com/photo/roasted-chicken-on-a-white-plate-6163330/ |
| iced-coffee.jpg | https://www.pexels.com/photo/refreshing-iced-coffee-with-milk-on-white-background-38519299/ |
| orange-juice.jpg | https://www.pexels.com/photo/delicious-fresh-orange-juice-6412586/ |
| lemonade.jpg | https://www.pexels.com/photo/a-close-up-shot-of-a-glass-of-lemonade-6411492/ |
| peach-tea.jpg | https://www.pexels.com/photo/a-clear-drinking-glass-with-brown-liquid-6176530/ |
| ginger-tea.jpg | https://www.pexels.com/photo/refreshing-lemon-ginger-tea-with-fresh-ingredients-36873287/ |
| water.jpg | https://www.pexels.com/photo/clear-drinking-glass-with-clear-liquid-10965842/ |
| beer.jpg | https://www.pexels.com/photo/a-mug-of-beer-in-close-up-shot-13031239/ |
