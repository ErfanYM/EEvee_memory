Round 2 · impeccable · viewports/engines tested: Chromium at 320x568, 375x812, 390x844, 768x1024, 1024x768, 1440x900, 1920x1080, 844x390 landscape (touch). WebKit: iPhone 13 portrait (390x844), iPhone 13 landscape, and desktop 1440x900. Also JS disabled at 390, reduced motion at 1440 and 390, and a keyboard pass at 1440.

Round-1 findings:
- I1 (landscape lightbox tiny): FIXED. At 844x390 touch the photo is now 275x366 (was 221x294), the close button (52px) sits top-right over the scrim and does not overlap the photo. Evidence: `.superpowers/shots/review-2/impeccable/lb-844.png`.
- I2 (`<video>` unnamed): FIXED. All four `<video>` elements carry an `aria-label` equal to the play-button label.
- I3 (play hit area under 72px): FIXED. All four measure 74x74 at every viewport, including WebKit.
- I4 (focus on a pending print shows an empty frame): FIXED. Tab to the 9th stop gives class `is-instant is-in`, opacity 1, transition 0s.
- I5 (landscape hero taller than the screen): FIXED. At 844x390 the hero print is 331px tall (about 85vh) and her face is on the first screen (`land-hero.png`).
- I6 (scrim alpha): FIXED. `--scrim` is now `rgba(36,24,16,.97)`.

No new blockers or should-fixes. Regression sweep:
- Desktop layout changes (T1–T3): 4-item spreads are four across at 1024, 1440 and 1920. S7 is one row of three with the lead in the middle. Paragraphs alternate columns. The donation column is centred in the wrap and the button and domain share its left edge. No orphan rows and no overlap onto faces at any of the three widths. Screenshots: `sh1024.jpg`, `sh1440a.jpg`, `sh1440b.jpg`, `sh1440c.jpg`, `sh1920.jpg`.
- No horizontal scroll anywhere (`scrollWidth == innerWidth` at every size in Chromium and WebKit; the WebKit landscape device is 750 wide and still equal). CLS 0 everywhere. No console or page errors. Every polaroid fully visible after scrolling (0 stuck-hidden). One stylesheet only, as P1 required.
- Tap targets: no button or link under 44px at any size (donate 56px, lightbox close 52px).
- Reduced motion at 1440: `document.getAnimations()` is 0, 0 hidden prints, static tilt kept. Keyboard ring is 3px solid `#1D4E89` on every print and the donate link.
- WebKit (iPhone 13): the lightbox opens, `overflow: hidden` holds, `history.back()` closes it, ArrowRight moves to the next photo, Esc returns focus to the same print. A video tap plays with sound (`muted: false`, `readyState 4`, native controls attached, no error).
- JS disabled: all 24 photos load (0 broken), all 4 video posters show via the `<noscript>` fallback `<img>` (217x374 each, no black box), no print is hidden, and the copy and donate link are intact (`nojs-video.png`, `nojs-end.png`).

[nit] With JS off, the four round play discs and all 20 photo buttons are inert but still look tappable. A tap does nothing, and the videos have no controls to fall back on — `.video__play`, `.polaroid__open` — Chromium `javaScriptEnabled:false`, `nojs-video.png`. Fix (optional): `html:not(.js) .video__play { display: none }` and `html:not(.js) .polaroid__open { cursor: default }`. Without JS the videos stay unplayable, which the spec accepts, so this is only about not showing a dead control.
[nit] The lightbox `<img class="lightbox__img">` in the always-present `<dialog>` has no `src` until first open. Not rendered, no visible effect, no a11y impact. Mentioned only because a naive broken-image scan flags it.

SIGN-OFF: yes
