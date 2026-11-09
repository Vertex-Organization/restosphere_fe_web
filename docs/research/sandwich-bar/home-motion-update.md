# Homepage motion refinement

Source evidence: `reference-69fac7ac254d9eca.js` (hero, slogan, marquee,
Draggable slider, pointer-reactive sticker and TikTok InertiaPlugin), plus
`reference-e13779006ae5df75.js` (FAQ). Reference scripts remain research files;
none are loaded into the application.

- Curved slogan now uses GSAP ScrollTrigger from `top bottom` to `bottom top`,
  linear, scrub0.5, startOffset-50% to0%. Text repeats four times as source.
- Decorative paths use actual measured path lengths and32px round strokes,
  scrub1.5 from `top80%` to `bottom20%`, including reverse scroll. The earlier
 3px approximation was incorrect.
- Image marquee measures half the rendered duplicated track; duration is
  distance/45, linear repeat. It recalculates after a200ms resize debounce.
- Sandwich slider uses actual GSAP Draggable: type x, bounds at first/last,
  edgeResistance0.85, no inertia,15vw threshold. Arrows/dots/drag settle in
 0.7s power3.out. Active-tween transforms no longer fight CSS transitions.
- About sticker tracks incremental horizontal pointer motion as a tilt of
 1.2x clamped±20deg, scales1.08 and deepens shadow while held, z999 until
 400ms after release; idle motion retains original3.2s jiggle.
- TikTok cards now react to pointer speed and entry angle through actual
 InertiaPlugin: x/y velocity clamp±1080, rotation clamp±60, resistance200,
 end0. The former constant rotate/scale hover has been removed.
- FAQ matches source single-open behavior, with300ms height and plus fade.
- Hero no longer reveals before the loading overlay. The shell owns initial
 hiding and dispatches `sandwich:page-enter` with reason `intro`; homepage
 handles1s power3.inOut,0.2s stagger for title/subtitle/button. Route h1 reveal
 is handled by the shared transition shell and does not get a second tween.

Motion effects clean up triggers, Draggable instances, tweens, resize handlers,
hover handlers and timers when unmounted. Scroll and hover effects respond to
prefers-reduced-motion through matchMedia; direct controls remain usable.

Validation: `npx tsc -b` passed after these changes. Static source audit confirms
no competing CSS transform animation on GSAP-controlled slider/marquee/video
cards. No browser surface is available in this session, so these declared
motion rules have not been visually compared desktop/mobile.
