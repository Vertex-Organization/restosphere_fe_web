# Footer motion update

Source: https://www.thesandwichbar.nl/; recorded component evidence in
`reference-e13779006ae5df75.js`, module327506. Routes remain homepage and
Catering in both language variants. Component ownership:
`src/components/sites/sandwich-bar/FooterPlayground.tsx` and `.css`.

The previous handwritten circle solver has been replaced with Matter.js0.20.0,
the source physics engine. The implementation is editable React code, not a
production bundle. The engine uses default gravity (y1,scale.001) and its native
circle collision/rotation solver, Runner and MouseConstraint.

Matched declarations:

- Desktop radius58±10px; mobile radius30±10px, breakpoint768px.
- Count desktop max(8,floor(width/110)); mobile max(12,floor(width/60)).
- Random x inside the scene; spawn y=-2r-2.6r*index.
- Restitution.5, friction.08, air friction.01 and density.002.
- Invisible floor at y=height+25, thickness50,width+400. Side walls at x=-25
  and width+25, thickness50,height4*sceneHeight.
- Alternating actual `logo.jpeg`/`logo-white.jpeg` files, circular clip,
  cream fallback fill,4px plum outline, image rotation follows Matter body.
- Render at devicePixelRatio, transparent canvas across the entire footer.
- ScrollTrigger starts the Runner once when footer top reaches90% viewport.
- Native Matter MouseConstraint with stiffness.2 and invisible constraint.

The canvas stays behind the existing z1 footer links. Cleanup stops both
animation loops, kills ScrollTrigger, disconnects ResizeObserver, removes
native Mouse handlers and events, and clears engine/world. An asynchronous
image load after unmount cannot create an orphan engine. Width changes rebuild
the scene for the new responsive geometry; height changes move the settled pile
to the new floor. Reduced-motion shows static logo rows without running physics.

Small deliberate input correction: Matter's preventDefault-only wheel listener
is removed so Lenis can keep scrolling over the footer; mouse/touch dragging
still uses the same source constraint. Window release handlers prevent a drag
from staying held when the pointer leaves the canvas.

Checks performed:

- `npx tsc --noEmit -p tsconfig.app.json` passed.
- Pure Matter engine simulation ran3600 frames at60Hz with source parameters
  for390px/12circles and1440px/13circles. Positions stayed finite and within
  floor/side walls; maximum final speed.0132/.0040 respectively.
- Original logo assets were already validated locally in the asset manifest.

No rendered desktop/mobile or pointer comparison was possible: the available
UI browser inventory is empty. The physics engine and declared source options
now match; the random initial positions and real input timing naturally vary.
The earlier hand-solver approximation note is superseded by this update.
