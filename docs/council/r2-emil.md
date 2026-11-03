# Round 2 · Emil seat: cross-critique

Read: `r1-impeccable.md`, `r1-taste.md`, and Taste's `shot-390.png` (also re-read my own r1 against both). Looked at the 390 screenshot: white prints on sky and meadow separate fine without a shadow, the berry donation field does read as a quieter room, and the tilts look natural. My critique is about motion and touch only; palette, type and colour fields are left to the other two seats except where they touch interaction.

## Adopt

From Impeccable:
1. **Native `controls` after first play** for videos. I proposed a custom 3px progress line plus tap-to-pause; native controls give seek, volume, fullscreen and the spec's "pause, seek, volume" for free and are the most reliable on iOS. So I drop the custom progress line and tap-to-pause (it would fight the native control bar). Keep the 150ms disc fade and the straighten.
2. **Do not auto-pause a playing video when it scrolls off-screen.** A friend may listen while scrolling. I proposed IntersectionObserver auto-pause; withdrawn. Only pause on another video starting or on lightbox open.
3. **Video spreads never put two videos adjacent** (their S-E order: video, photo, video). One-at-a-time audio plus adjacent thumbs invites a mis-tap that cuts the first clip.
4. **Rotation on an inner wrapper, press/hover on the button.** The focus ring stays axis-aligned and readable; the two transforms compose without fighting `--tilt`. I adopt this in my polaroid spec.
5. **Lightbox details:** `<dialog>` with `aria-label` from alt, focus close button on open, restore focus to the *current* photo's polaroid (not the one first tapped) with non-smooth scroll-into-view, stop at the ends (no loop) with rubber-band instead of a disabled button for touch, `aria-live` "3 of 20" visually hidden, preload the two neighbours at 960w, `history.pushState` for the back gesture.
6. **Default state is fully visible.** The reveal enhancement is added only by script and never leaves content hidden if JS or the observer fails.
7. **48px tap targets, 52px lightbox controls on touch.** I had 44; their number is better.
8. **Donation order** (D1, D2, button + domain, then D3) because D2 says "the link below" and D3 then reads as a release. Motion-neutral but right for the feel of the section.
9. **Button press .98 and shared press token** across polaroid, play disc and donate button (mine was .97 on polaroid; .98 on the small controls is fine, keep .97 on the large polaroid).

From Taste:
1. **Field colour steps are instant and static.** Nothing animates the background between chapters (no scroll-linked colour fades). This keeps the page cheap to scroll and keeps motion confined to prints.
2. **Overshoot settle on prints only** (`cubic-bezier(.34,1.3,.64,1)`), about 6%. Close to my `.2,1.25,.4,1`; either works. I will take Taste's, it was tuned against real prints. A playful page can afford one small overshoot; nothing else bounces.
3. **Video tap straightens to 0deg and scales to ~1.03, controls appear at the same moment.** Matches my own; I use 240ms and my `--ease-out`, not 300ms.
4. **No resting shadow on prints.** For me that deletes the hover shadow layer entirely: hover is just straighten-and-lift, which is fewer things to animate and kills the pseudo-element. (Impeccable needs the shadow for white-on-yellow edge definition; that is their call, but if Opus keeps a rest shadow, keep my pseudo-element opacity swap, never a `box-shadow` transition.)
5. **Tape as static clip-path shapes** is fine: never animated, no layout cost.
6. **Hero visible immediately, `h1` never animates** (LCP).

## Reject (why)

From Impeccable:
1. **CSS scroll-driven `animation-timeline: view()` for the reveal.** It is scrubbed, not one-shot: scroll back up and the print un-settles; scroll fast with a finger and the motion tracks the thumb, which feels jittery and unlike a print being set down. Support is also uneven (Safari came late), so phones would differ. Use an IntersectionObserver one-shot (CSS transition on a class). Their instinct (default visible, no hidden blanks) is kept.
2. **Lightbox open as `scale(.96)` plus fade.** Loses the spatial link. FLIP from the tapped print (my 280ms/220ms) tells the eye where the photo came from and where it goes on close. The experiment ran at 390 and 1440 and felt immediate (about 90% done at 110ms).
3. **Lightbox scrim open 200ms *linear*.** Linear is for constant motion; use ease-out 220ms. Exit 160ms is fine.
4. **Swipe threshold of 48px fixed.** A distance-only threshold makes quick flicks fail on a wide phone and slow drags commit on a narrow one. Keep 22% of width OR velocity over 0.11 px/ms.
5. **`position:fixed` on body for the iOS scroll leak as the default.** With `showModal()` plus `overflow:hidden` it is usually unnecessary and the fixed-body hack makes the page jump when the URL bar changes and on restore. Make it a fallback only after a WebKit test shows a leak.
6. **Arrow-key 24px translate cross-fade between photos.** Keyboard-initiated actions do not animate. Arrows swap instantly. (The swipe path keeps its slide, since that is direct manipulation.)
7. **Fraunces-style 520ms reveal on every settle with 70ms stagger.** Over my 60ms; stagger of 30-80ms is the rule, keep 60ms and max 4 steps.

From Taste:
1. **Fading and rising every paragraph (420ms, 16px).** It is the family's words; moving text makes people wait to read, and a paragraph that arrives late on a slow phone reads as a bug. Text is static. Only prints move.
2. **Lightbox open of 340ms.** Over the 300ms UI ceiling for something opened often; use 280ms open and 220ms close.
3. **Swipe threshold of 40px.** Same reason as above; use proportion plus velocity.
4. **Lightbox showing the photo inside a white 10px print border.** On a phone the border eats about 20px of a 390px screen and the lightbox is the one place the photo should be as big as possible. Plain image with 6px radius. (A print frame is a good idea on desktop only, so I could accept it at ≥1024 if Opus wants the album feel; the FLIP would then morph the whole print.)
5. **Staggering at 90ms** (3 steps). Same as above: 60ms.
6. **Video tap easing `cubic-bezier(.2,.8,.2,1)`.** Too weak for a deliberate move; use `cubic-bezier(.23,1,.32,1)`.
7. **Hover on the donate button as `translateY(-2px)`.** Fine on a mouse, but on a quiet invitation the button should only darken; no movement. Colour change 150ms.

## Hard objections

1. **Donate button inside a rotated print (Taste).** Text inside a `rotate(-1.5deg)` ancestor renders with subpixel blur on many screens, the focus ring is skewed, and the tap target is a rotated rectangle. It also puts a "scrapbook decoration" around the one real action. Keep the button unrotated: if the print idea stays, tilt only a decorative backing print behind a flat button, or drop the tilt in the donation field entirely. This is the one place motion and tilt stop.
2. **Fixed full-screen grain overlay (Taste).** A `position:fixed` SVG-noise layer forces extra compositing and repaints over every scroll frame; on a mid-range Android it costs frames across the whole page, and the whole page is scroll. Taste flagged it themself. Hard requirement: drop it, or bake the grain into the field backgrounds as static `background-image` (no fixed layer).
3. **Reveal flash (both, via a late JS class).** If the `.js` class or the hidden state is applied after first paint, below-fold prints flash visible then snap to hidden. The class must be set by an inline script in `<head>` before first paint, and elements already in the viewport at setup must not be hidden. Hero and first spread never wait for the observer. The settle transition must be replaced by the 200ms press/hover transition once finished, or the 480ms timing leaks into taps.
4. **Hover and press on prints through any `transition: all` or box-shadow.** Reviewed both docs: neither writes it, keep it that way. Enforce in the build with a grep for `transition: all` and `box-shadow` inside any `transition`.
5. **Swipe and scroll conflict.** The lightbox stage must be `touch-action: none`, but only the stage. Thumbnails stay `touch-action: manipulation` so the page scrolls normally with a thumb that starts on a print. Neither doc says so; if a print is `touch-action: none` the page cannot be scrolled from a print and the phone will feel stuck.
6. **Videos: `play()` must run synchronously in the tap handler.** Impeccable's flow (fade, then play) is fine only if `play()` is not awaited behind the fade. Anything async before `play()` can lose the gesture on iOS and the video silently stays silent. Test on a real iPhone.
7. **Reduced motion must not remove the lightbox's finger-tracking** (both docs say swipe still works; keep it) and must keep a visible tap state on prints (colour or the 200ms press), otherwise nothing responds.
8. **Any hover transform must sit inside `@media (hover:hover) and (pointer:fine)`**; Taste's "print hover" and "button hover" lines should be written that way in the final system so a tapped print never sticks lifted on an iPhone.
9. **Unverified on devices.** None of the three seats has run this on a phone. The final round-4 review needs at least one real iOS pass for: video sound, lightbox swipe feel, back button, rubber-band.
