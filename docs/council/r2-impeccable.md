# Round 2: Impeccable seat (cross-critique)

Evidence: I read `r1-emil.md` and `r1-taste.md`. I looked at Taste's `shot-390.png` and `shot-1440.png`. I opened Emil's prototype in Chromium at 390 and 320: 0 console errors, no horizontal scroll at either width, polaroid buttons 166 to 217 px wide and 430 to 459 px tall (all well over any target minimum). Every contrast figure below is computed from the hex values in the proposals, not copied from them. Not tested: real touch devices, WebKit, Firefox.

## Adopt

From Taste:
- **Fixed palette discipline, one ink across every field.** `#2B2118` measures 11.0 to 12.5:1 on all four light fields (sky 11.6, meadow 11.0, blush 11.7, snow 12.5). Taste's "13.5:1" is slightly generous but passes AAA anyway.
- **Chapter fields as the divider.** A colour step replaces my sun-disc breaks and dashed rules. It carries the 6- and 7-item runs better than whitespace did. I still recommend capping it at 3 to 4 distinct fields (see Reject).
- **Zilla Slab as the one display face.** I concede Fraunces. The 1440 screenshot shows Zilla Slab 600 reads warm and unmistakably not SaaS. I will accept a single family if the council wants it (Zilla Slab 400 body at 18 to 21px is legible), but I do not require it.
- **A `--step-lead` size for meet-0, D1 and the closing paragraph.** That gives the hero a real first read and fixes hierarchy at the top. It is exactly the hierarchy move my R1 lacked.
- **The desktop hero** (h1 and lede left, print right) and **paragraph above a full-width spread** instead of text-beside-spread. Taste tested the 160px-print failure, so I drop my cols-4-to-9 alternating text shift.
- **Tape on at most 1 in 3 prints, filled flat shapes.** This is consistent with my one-per-spread cap.
- **Donation button in `--raincoat` with ink text.** It measures 8.9:1 and is the highest-attention element in the quiet room, which is correct.
- **Taste's spread plan** where it matches mine (S1 to S3, S6). The 3|6|7|7 run balance is acceptable.

From Emil:
- **Frequency gate:** keyboard actions (arrows, Esc, Space, seek) never animate. This is accessibility-positive.
- **WAAPI FLIP lightbox**, finger-tracked swipe with axis lock after 8px, the 22% or 0.11 px/ms commit threshold, swipe-down dismiss, and the 0.35 end-of-set friction. Reduced motion drops FLIP to a 120ms fade while the swipe still follows the finger. That is the right reduced-motion behaviour.
- **`history.pushState` for the lightbox**, with `replaceState` between photos.
- **Press feedback on `:active`**, `touch-action: manipulation`, hover only under `(hover:hover) and (pointer:fine)`, and the `.done` swap so the reveal timing cannot leak into press.
- **Shadow by pseudo-element opacity**, not `box-shadow` transitions.
- **Pause a playing video when under 10% visible.** I rejected this in R1, but Emil is right that sound from an off-screen video is surprising. I change my position and adopt it.
- **Video disc and `img.decode()` before the FLIP measure**, to avoid an aspect-ratio jump on the EXIF-corrected sources.
- **No `transition: all`, and `will-change` only on the active lightbox image.**

Both seats agree with my core calls: inline video, photos-only lightbox, native `<dialog>`, hover gated to fine pointers, tilt at 5° or below, and no visible new words.

## Reject (why)

- **Taste: a full-bleed berry `#8F2A45` donation field, as a design choice (not a contrast failure).** It passes: cream `#FFF4EE` on berry is 7.5:1 and the raincoat button on berry is 4.6:1 as a non-text boundary. But it is the most saturated, darkest block on the page, and the brief says "a quiet invitation, not a fundraising page" and "celebratory, not sombre". A deep wine block that arrives after four pastel fields is the loudest moment on the page and reads as a solemn or "urgent" block. If it must stay a dark room, desaturate it (a cocoa or dusk-plum around `#4A2A3A`) and keep the page's calm. My preference remains Taste's own named alternative: `--field-blush` with a berry button. I rank blush above berry for tone, and I would not block berry.
- **Taste: six field colours.** Sky, meadow, blush, snow, berry and a return to sky is a lot of hue changes over about 24 images, and the photos are already saturated (yellow raincoat, blue pool, pink cake). Merge to **three**: sky for chapters one and two, meadow for the middle, and one donation field. Colour steps should mark real chapter changes only.
- **Taste: the tilted white "letter print" holding the donate button and domain line.** A rotated container around the only control on the page makes the focus ring, hit area and screen-magnifier tracking worse for no gain, and it makes the one important button look like decoration. **Keep the button and the domain line level (0°) and not inside a print.**
- **Taste: `--ease-settle` with 6% overshoot.** That is a bounce, and the skill's rule is no bounce or elastic. 6% is subtle, but I want the plain strong ease-out for everything. Emil's `--settle` ease-out curve is the better choice here.
- **Taste: paragraph fade-and-rise for every paragraph.** Reading text should never move. Photos can settle, but paragraphs and the h1 should be static. This is also a legibility issue for anyone scrolling quickly.
- **Taste: h1 up to 9.5rem (152px).** It breaks the 6rem display ceiling and shouts. Cap it at 5.5rem (Emil's value) or 6rem.
- **Taste: no shadows at all.** White on field measures only 1.27 to 1.43:1 (sky 1.35, meadow 1.43, blush 1.34, snow 1.27). A print edge is not a WCAG-required boundary, since the photo is the content, but on Taste's own admission snow is the weak pairing. Use Taste's fix (darken snow to `#C9D9E6`), or keep one hairline contact shadow `0 1px 2px rgb(43 33 24/.2)` on all prints. I rank this as a nit, not a blocker.
- **Taste: faint fixed full-screen grain layer.** It is a compositor cost on low-end Android and gives nothing a viewer can perceive on a phone. Drop it.
- **Emil: `--sun` `#E08A1E` for the h1 (and "large text only").** See Hard objections. Use `#8F4A00`.
- **Emil: no native `controls`, only a 3px progress line plus keyboard seeking.** See Hard objections.
- **Emil: Nunito 800 for headings, with an orange h1.** Fine in spirit but flat next to Taste's slab. It loses the "made for this dog" character. Adopt Taste's display face.
- **Emil: a visible-on-focus `controls` fallback.** A UI that appears only when the video has keyboard focus is a hidden state. Attach controls on first play for everyone.
- **Both: a centred closing paragraph larger than lead.** Fine as written. No change.

## Hard objections

These would fail AA or real usability if shipped as written.

1. **Emil's `--sun` `#E08A1E` as h1 and h2 colour: 2.49:1 on `#FFF6E0` and 2.24:1 on the `--paper-deep` donation card.** His own text claims "3:1". It fails even the large-text threshold (3:1). Replace it with `#8F4A00`, which is 6.1:1 on a butter ground, or Taste's ink.
2. **Emil's `--sun-deep` `#B35F00` as link and body-adjacent colour: 4.28:1 on paper.** It fails 4.5:1 for normal text. It passes only as a button fill with white text (4.61:1, a slim pass). Use `#A64A08` (white on it is 5.8:1; on butter 5.3:1) for any text use.
3. **Emil's video has no pointer-operable seek or volume.** The 3px progress line is a display, not a control. The spec requires "native controls or a custom control that still exposes pause, seek and volume". Keyboard-only `controls` does not satisfy touch or mouse users, and a 5-second seek via arrow keys is invisible to everyone else. **Attach native `controls` on first play.** Native controls cost nothing and give fullscreen, scrub and volume.
4. **Emil's lightbox `touch-action: none` on the stage** (while his doc says "pinch-zoom is not disabled anywhere"). Those two statements conflict. `none` blocks the browser's pinch zoom inside the lightbox and fails WCAG 1.4.4/1.4.10 intent for a photo viewer. Use `touch-action: pinch-zoom` (the JS handles pans) and test on iOS.
5. **Taste's focus ring on the berry field.** If the 3px ring is `--accent` (`#8F2A45`) it is **1.0:1** against the berry field (invisible). The ink ring `#2B2118` is only **1.94:1** on berry, which fails the 3:1 non-text minimum. Taste's R1 only specifies ink for the button on the white print. If the button moves out of the print (my recommendation), the ring on berry must be cream `#FFF4EE` (**7.5:1** on berry). On blush or sky, `--accent` is 6.0:1 and fine.
6. **Taste's `--step-small` at `.8125rem` (13px) for the domain line, and Emil's `.875rem` (14px).** This line is the page's only trust cue about where the money goes. Below 15px it is hard to read on a phone in daylight. **Set it to 15px minimum**, in `--ink` or `--ink-soft` (10.7:1 on white, 6.7:1 on paper).
7. **Taste's h1 `clamp(3.4rem, 17vw, 9.5rem)` at 320.** 17vw is 54px. "Meet Eevee" in a 600-weight slab at that size estimates about 280px wide with tight tracking, against 280px of usable width at a 20px gutter. That is a clipping or wrap risk. Taste flagged it too. Test at 320 and clamp at about 15vw or lower. Also, a long single-word wrap would break "Meet Eevee" awkwardly, so use `text-wrap: balance` and allow a two-line `Meet / Eevee` at 320 on purpose.
8. **Reveal gating in both proposals** (Emil's IntersectionObserver `opacity:0`, Taste's paragraph fade). Both say content is visible without JS, which is right, but `.js`-gated `opacity: 0` is still how a hidden tab, a fast scroll past the observer, or a blocked script ships a blank section. Required: apply the hidden start state only inside `@supports (animation-timeline: view())` (CSS only), or add a 2-second JS failsafe that force-reveals everything. Never rely on an observer firing.
9. **Emil's 5° tilt and Taste's -4° with overlap** are fine for vestibular comfort because the tilt is static. The reveal's `rotate(tilt + 3deg)` rotation entry is the only rotating motion. With `prefers-reduced-motion` both proposals correctly drop translate and rotate. Confirm in the build that the *static tilt stays* (it is not motion) and that no entry animation runs for reduced-motion users. No objection beyond that.
10. **Lightbox close button 44px (both).** This passes WCAG 2.2 AA (24px minimum) but is below my 48px and below the platform guidance for iOS bottom-edge reach. Raise it to 48px on touch. This is a should-fix, not a blocker.
11. **Spread runs of 6 to 8 items** (both seats keep meet-1 at 6, meet-2 at 7 or 8, meet-3 at 6 or 7). This is a UX risk (scroll fatigue), not an accessibility failure. It is acceptable only if each run changes composition and at least one non-photo beat (a video) falls mid-run. Both plans do that.
