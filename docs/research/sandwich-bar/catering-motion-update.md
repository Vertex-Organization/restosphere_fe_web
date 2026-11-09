# Catering motion update

Read-only source evidence: `reference-ba26c377bbddf25c.js`, modules `HeroImageSlider` and `LogoWall`; exact grid geometry comes from `.logo-wall*` rules in `source.css`. The implementation uses editable React components and GSAP; no original production bundle is loaded by the app.

## Hero streams

- Both columns move upward linearly and repeat without reversing. Odd photos 01/03/05/07 repeat every 28 seconds; even photos 02/04/06/08 every 22 seconds.
- The second column has a static `margin-top:-50%`; it is a phase/layout offset, not a reversed direction.
- Each group repeats twice. The loop distance is the sum of the first four rendered image heights plus four 12px gaps, including the seam between groups.
- Replaced the CSS percentage loop with measured GSAP loops using the declared source durations/easing. Resize recomputes distance while retaining progress. Stable image arrays prevent an unrelated form update from restarting the hero.
- Mobile below 1024px uses the source's static photo. Reduced motion disables both streams; breakpoint/preference changes are handled live.

## Logo wall

- Source has 16 slots, with eight visible in a four-column/two-row grid; below/equal 991px six are visible in three columns/two rows.
- Initial logos are shuffled. Slot visitation is one shuffled permutation, repeated; the replacement queue is shuffled separately and replenished from the real logo collection.
- Every 1.5 seconds one slot changes. Both logos coexist during the 0.9-second `expo.inOut` transition: old logo moves to `yPercent:-50`/opacity0, new logo starts `yPercent:50`/opacity0 and moves to0/opacity1. This replaces the former deterministic rotation and instant outgoing-image replacement.
- Slot size, target dimensions66.66% width/40% height, grayscale and multiply blend match the source. Incoming transforms/opacity/visibility are cleared after settling.
- Playback pauses outside the viewport and while the document is hidden. Responsive slot-count changes rebuild the distribution. Reduced motion renders a static wall. Timelines, tweens, observers and media/visibility listeners are removed on unmount.

The catering request form and its email-draft workflow are unchanged. Browser-level source/local motion comparison is unavailable in this environment; timings, directions and states are matched to the source's declared animation options.

Validation: `npm run build` passed. A direct GSAP timeline check confirmed the zero-duration callback timeline with `repeatDelay:1.5` swaps at0,1.5,3seconds as intended. The build reports the existing large-chunk advisory; no TypeScript or production-build errors occurred.
