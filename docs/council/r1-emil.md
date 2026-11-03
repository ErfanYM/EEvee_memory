# Round 1 · Emil seat (interaction feel and craft)

Lens: how it moves, how it answers a thumb, how native it feels. Method: viewed the contact sheet and the direction-C mockup, read `mobile-native`, `emil-design-eng`, `animate`, `review-animations`, `animation-performance` (SKILL.md files read directly), then built a throwaway experiment at `.superpowers/council-ref/emil/index.html` (polaroid reveal, press, hover, WAAPI FLIP lightbox, swipe, keyboard) and checked it with Playwright at 390 and 1440 (Chromium, headless, real photos). Not tested on a phone: gestures, iOS audio and rubber-banding still need hardware.

Core stance: this page is seen once, so it earns a little delight (the polaroids settling) but nothing is allowed to slow a thumb. Motion is only the polaroid being picked up and set down. Keyboard-initiated actions (arrows, Esc, Space) never animate, per the frequency gate. Only `transform` and `opacity` animate; no `transition: all` anywhere.

## Palette tokens
```
--paper:      #FFF6E0   page (sunny cream)
--paper-deep: #FBE9BF   section band / donation card
--card:       #FFFFFF   polaroid border
--ink:        #3B2A1A   body text (warm brown, ~12:1 on paper)
--ink-soft:   #6B5338   small text, domain line (5.6:1 on paper)
--sun:        #E08A1E   h1/h2 accent, large text only (3:1 on paper, not for body)
--sun-deep:   #B35F00   button fill and links (4.9:1 with white text)
--shadow:     rgba(59,42,26,.18)
--scrim:      rgba(30,20,10,.92)  lightbox
--focus:      #1F6FEB   2px ring + 2px offset, never removed
```
theme-color meta: `#FFF6E0`. No dark mode (the owner chose sunny; one scheme, `color-scheme: light`).

## Typography
- Text and headings: **Nunito** (OFL, self-host woff2 variable, latin subset, `font-display: swap`). Body 400, headings 800.
- Body: `clamp(1.0625rem, 1rem + .4vw, 1.25rem)`/1.65, max measure 36em, left aligned, `text-wrap: pretty`.
- h1 "Meet Eevee": `clamp(2.75rem, 2rem + 6vw, 5.5rem)`, 800, `--sun`, line-height 1, `text-wrap: balance`.
- h2: `clamp(1.75rem, 1.4rem + 2vw, 2.75rem)`, 800, `--ink`.
- No handwritten face (no captions exist; a script font would invite fake words). If Taste wants one, use only for a decorative SVG heart or paw, not text.
- Inputs: none on the page, so no 16px input risk. Buttons 1.0625rem.

## Spacing & radii
- 8px base: 4, 8, 12, 16, 24, 32, 48, 72, 112. Phone gutter 20px (16px at 320). Paragraph gap 24px. Paragraph-to-spread 40px; spread-to-paragraph 56px.
- Polaroid: border 10px sides/top, 36px bottom (blank, no caption: keeps the real polaroid ratio), radius 3px, inner photo radius 1px. Button radius 999px. Lightbox image radius 6px. Donation card radius 28px.

## Polaroid treatment
- Shadow rest: `0 1px 2px var(--shadow), 0 8px 18px -6px var(--shadow)`. The deeper hover shadow lives on an `::after` pseudo-element that fades in with `opacity` (never transition `box-shadow`: it repaints every frame).
- Tilts by index in the spread, from fixed tokens (not random, so layout is reproducible): `-5deg, 3deg, -2deg, 4.5deg, -3.5deg`. Max 5 deg; hero -3deg. Video polaroids use the smaller tilts (+-2) because they are the tap targets.
- Press (all inputs): `transform: rotate(var(--tilt)) scale(.97)`, 100ms in, released in 200ms, both `cubic-bezier(.23,1,.32,1)` (press is the deliberate beat, release snaps). Feedback is on `:active`, so it answers touch-down. Transitions, not keyframes, so a double-tap retargets instead of restarting.
- Hover (only `@media (hover:hover) and (pointer:fine)`): `rotate(calc(var(--tilt) * .4)) translateY(-4px) scale(1.02)`, shadow fades in via the pseudo-element, 220ms. The tilt straightens a little: the card is "picked up". Tilt is a CSS variable so hover and press compose.
- `-webkit-tap-highlight-color: transparent`, `touch-action: manipulation`, `-webkit-touch-callout: none` on polaroid buttons, images `draggable="false"`.
- Each polaroid is a `<button>` wrapping the `<picture>` (keyboard and screen reader operable), `aria-label` = alt-based "Open photo: ..." (labels are invisible).

## Layout ≤480 / 481–1023 / ≥1024
- **≤480**: single column, 20px gutter, text full width. Spreads are 2-column staggered: polaroids ~46vw wide, alternating left/right with -8px overlap and 12-20px vertical stagger, odd-one-out spans ~70vw centered. A 3-item spread is 2+1. Tilts keep overflow inside the gutter (`overflow-x: clip` on the spread, not on body). Hero polaroid 78vw, h1 above it.
- **481–1023**: text column 34em centered. Spreads break out to ~min(92vw, 760px), 3 columns, polaroids ~30%, staggered offsets (+0/+24/-8px). 4-5 item spreads: 3+2.
- **≥1024**: two-voice layout. Text column 34em; spreads sit in a wider 1120px container, polaroids ~240-280px wide, loosely overlapping like a table spread, `gap: -16px` overlaps via negative margins. Hero: h1 left over text, polaroid right (rotate -3deg), max 420px wide. At 1920 the page stays capped at 1200px content; extra width is plain paper.

## Spread arrangement (by media id)
Page order, every id once, 24 total, none over 5 items. Rebalanced so no paragraph is followed by a wall: items per gap run 3 / 6 / 8 / 6 (was 3 / 10 / 8 / 2), and spread sizes alternate 3, 3, 3, 4, 4, 4, 2 to vary the beat.

0. **Hero (with h1 "Meet Eevee")**: `img_8819`. Phone: 78vw polaroid, -3deg, under h1. Desktop: right of h1 and meet-0.
1. **After meet-0** (3): `37c83b77`, `img_8394`, `img_4837`. Phone: 2+1 (first two side by side, img_4837 centered wide). Desktop: loose row of 3.
2. **After meet-1 · foodie** (3): `ec73ecaf`, `img_0826`, `img_7207`. Phone: img_7207 (cake) large top-left, the other two stacked right. Desktop: cake centered and largest, others flanking.
3. **After meet-1 · walks** (3): `img_2017`, `b0eaddd4`, `b9e5276c` (video). Phone: 2+1, video last and centered. Desktop: row of 3, video right.
4. **After meet-2 · hikes and swimming** (4): `img_6802`, `img_4144`, `img_5023`, `img_4973`. Phone: 2x2 stagger. Desktop: 4 across with vertical offsets. (Moved from meet-1: "up for anything" fits it, and it halves the run after meet-1.)
5. **After meet-2 · adventures** (4): `232ed04c` (landscape), `20221006` (tall), `23983ab7` (video), `0f88d984` (video). Phone: landscape card full width, then tall beside a video, then the second video. Desktop: landscape wide top-left, tall right, videos beneath.
6. **After meet-3 · snow** (4): `img_3785`, `img_3786`, `img_8788`, `c1a73628` (video). Phone: raincoat pair side by side, 8788 and video below. Desktop: row of 4. (Moved from meet-2: it fills the thin end of the page and comes right before the thank-you.)
7. **After meet-3 · cozy** (2): `img_1551`, `img_7522`. Phone: two big cards slightly overlapped, last visual before the donation card. Desktop: two side by side.

Count check: 1+3+3+3+4+4+4+2 = 24 (20 photos, 4 videos). Meet-2 (8) is the heaviest gap, split by a text-less 56px break between spreads 4 and 5.

## Video interaction
- Poster polaroid with a centered play disc: 64px (visible), 72px tap area minimum 44px; white 92% disc, `--sun-deep` triangle (SVG, no text). Slight offset for optical centering of the triangle (+2px right).
- Tap = press scale .97 (100ms), then on click: video plays **inline in the polaroid** (not lightbox: lightbox is for photos, keeps one mental model, and iOS plays inline fine). Sound on, `playsinline`, `preload="none"` until first tap, then `src` set and `play()` called inside the click handler (required for sound on iOS).
- While playing: the disc fades out (150ms). Tap the video to pause/resume (single large target), disc returns as a pause/play glyph for 600ms then fades. No native controls bar by default; instead a thin 3px progress line along the bottom of the photo area (`transform: scaleX`, driven by `timeupdate`/rAF), and keyboard Space/Enter toggles, arrow keys seek 5s (a11y); keyboard-initiated changes are instant, no animation. Offer native `controls` as a fallback via keyboard focus: when the video receives keyboard focus, show `controls`.
- One at a time: starting a video pauses and resets the poster state of any other (no jump in layout; same box dimensions, `aspect-ratio: 9/16` fixed in advance).
- On end: returns to poster with disc as a replay glyph. Videos in a hidden tab or scrolled out of view (IntersectionObserver, <10% visible) pause quietly: sound from an off-screen video is wrong.
- Playing video polaroid straightens to 0deg over 240ms `cubic-bezier(.23,1,.32,1)` (a transition, so a quick pause/play retargets) and scales to 1.04 on phone so it feels "held up"; it does not leave the flow.
- Error / slow load: poster stays, disc shows a 1.2s spinner ring after 400ms of buffering only.

## Lightbox
Built and checked in the experiment; WAAPI (`element.animate`), not rAF or a library: it runs off the main thread, retargets from the current transform, and needs no dependency.
- Photos only. `<dialog>.showModal()` gives focus trap, Esc, inert background. Focus returns to the tapped polaroid.
- **Open (FLIP, 280ms, `cubic-bezier(.32,.72,0,1)`)**: after `img.decode()`, measure the polaroid image rect, animate the lightbox image from `translate(dx,dy) scale(s) rotate(tilt)` to `none`; scrim fades 220ms ease-out. The origin polaroid is `visibility:hidden` while open so there is no double image. Observed at 1440 and 390: the strong curve is ~90% done by 110ms, so it reads as instant response with a soft landing. Not animating from scale(0): it starts at the real card size and tilt.
- **Close by tap or X**: reverse FLIP, 220ms, same curve (exit faster than enter), from the image's *current* computed transform, so a close mid-open does not jump. Origin off-screen: 160ms fade only.
- **Esc, arrow keys**: no animation at all (keyboard gate). Arrow = swap `src`, scrim stays. Esc = `close()` immediately.
- **Swipe horizontal**: pointer events with `setPointerCapture`, extra touches ignored while a drag is live, axis lock after 8px. Image follows the finger 1:1 by writing `style.transform` on the image itself (no CSS variable on a parent). Commit at 22% of width or velocity > 0.11 px/ms (Emil's flick threshold; a quick flick should be enough). Outgoing slides off 180ms, incoming enters from the same side (translateX 60px + opacity, 240ms, `cubic-bezier(.23,1,.32,1)`). At first/last photo apply 0.35 friction, spring back 260ms.
- **Swipe down**: image follows with scale to .9 at 320px and the scrim opacity tied to distance. Dismiss at > 110px or velocity > 0.11 px/ms, slide off 200ms; otherwise return 260ms ease-out from the current position.
- **Back button**: `history.pushState` on open, `popstate` closes; swiping between photos uses `replaceState`; X/Esc call `history.back()`. (Not in the experiment; must be tested on Android and iOS edge-swipe.)
- Layout: stage `max-width: calc(100vw - 24px)`, `max-height: calc(100dvh - 96px - safe-area insets)`; the experiment first filled the viewport edge to edge at 1440, which looked cramped, so the 96px vertical reserve and rounded 6px corners stay. Close button 44px, top-right, safe-area aware. Prev/next arrow buttons only under `(hover:hover) and (pointer:fine)`. No visible counter (no new words).
- `touch-action: none` on the stage only. Scroll lock via `overflow:hidden` on `html` plus `overscroll-behavior: contain` on the dialog. Pinch-zoom is not disabled anywhere.
- Reduced motion: scrim 120ms fade, no FLIP; swipes still track the finger (direct manipulation), commits snap.

## Motion spec
Tokens: `--ease-out: cubic-bezier(.23,1,.32,1)`, `--ease-sheet: cubic-bezier(.32,.72,0,1)`, `--settle: cubic-bezier(.2,1.25,.4,1)` (reveal only, a small playful overshoot). `--ease-in-out` unused; no `ease-in` anywhere.
| What | Duration | Curve | Notes |
|---|---|---|---|
| Press scale | 100ms in / 200ms out | ease-out | `:active`, all inputs |
| Hover lift | 220ms | ease-out | hover-capable only; shadow via pseudo opacity |
| Lightbox open / close | 280 / 220ms | ease-sheet | WAAPI FLIP |
| Lightbox slide commit / return | 180-240 / 260ms | ease-out | from current transform |
| Scrim | 220ms | ease-out | opacity |
| Video disc fade | 150ms | ease-out | |
| Entry reveal | 320 opacity / 480 transform | ease-out / settle | once per card, see below |
| Keyboard actions | 0ms | none | arrows, Esc, Space, seek |
- **Entry reveal (once per card, decorative, rare tier)**: IntersectionObserver at 15% visible, polaroid goes from `translateY(18px) rotate(tilt + 3deg) scale(.96); opacity 0` to rest: opacity 320ms plain ease-out, transform 480ms `--settle`. Over 300ms on purpose: one-shot, never blocks a tap, the polaroid has to feel set down. Stagger 60ms per card, max 4 steps. Tuned from the experiment: with the strong ease-out on opacity the cards looked fully visible at 80ms, so opacity uses a gentler curve than transform. Gotcha: after the reveal finishes, swap the transition back to the 200ms press/hover transition (a `.done` class after ~700ms), or the 480ms reveal timing leaks into hover and press. It starts from scale .96 and opacity 0, not from scale 0. Applied only with JS present (`.js` class on html); no-JS content is fully visible. Cards above the fold at load do not wait for the observer. LCP: the hero image never animates opacity.
- Animate only `transform` and `opacity`. Shadows by pseudo-element opacity. `will-change: transform` only on the lightbox image during a gesture, not on polaroids (add it only if a 1px shift or dropped frames are actually seen). Predetermined motion is CSS/WAAPI so it stays smooth while images decode.
- `prefers-reduced-motion: reduce`: gentler, not zero. Reveal becomes a 200ms opacity fade (no transform), hover lift off, lightbox open/close a 120ms opacity fade, swipe still follows the finger, slides snap.
- Not animating: text, h1, donation button hover (colour change only, 150ms), scroll position, page load.
- Mobile-native base: `viewport-fit=cover`, `-webkit-tap-highlight-color: transparent`, `touch-action: manipulation` on buttons, `100svh` only for the hero if any min-height is used, hover under `(hover:hover) and (pointer:fine)`, `user-select:none` on polaroid buttons and the play disc only (never on paragraphs), `text-size-adjust:100%`, safe-area padding on the lightbox close and bottom edge, root `overscroll-behavior` left default (document scroll with refresh welcome).

## Donation section
- One quiet card, `--paper-deep` background, radius 28px, padding 32/24px, **no polaroids inside, no tilt, no motion on reveal beyond the standard 520ms rise**. h2 above the three paragraphs, whole and unchanged.
- Button: `--sun-deep` fill, white text 1.0625rem/800, height 52px, padding 0 28px, pill. Press: scale .97, 120ms. Hover (fine pointer): fill darkens to `#9A5000`, 150ms. No arrow animation, no pulse, no sticky bar.
- Domain `torontohumanesociety.donorsupport.co` in 0.875rem `--ink-soft` directly below, left-aligned with the button, selectable (it is content). Link `target="_blank" rel="noopener"`.
- Placement: the h2 section follows spread 7 (after meet-3), then the closing paragraph, no heading, separated by 56px. Emotional beat order: photos, quiet card, thank-you.

## Risks
- **Video audio on iOS**: `play()` must run synchronously in the click handler; any await before it can lose the gesture and silently fail. Test on real hardware.
- **Lightbox FLIP and sideways EXIF** images: measure after decode; wrong aspect on the pre-oriented source causes a jump.
- **Back-button integration** is easy to get wrong with multiple opens; test open, swipe x3, back, forward, deep refresh (a refresh with `state.lb` must not leave a dead state).
- **Tilted overflow** on 320px creates horizontal scroll; use `overflow-x: clip` on spreads and test 320x568.
- **Entry reveal vs LCP/CLS**: the hero is excluded; reserve space with `aspect-ratio` so nothing shifts.
- **Hover transform on touch devices that report hover (iPad trackpad)**: handled by capability queries.
- **Play-disc over poster contrast**: white disc on any poster works; if the poster is bright snow, disc needs the 20% shadow ring.
- **Verification limits**: the experiment ran in headless Chromium at 390 and 1440 only. Swipe velocity, momentum feel, iOS rubber-banding and audio need a real phone, and WebKit/Firefox are unchecked. Play it at 2-5x duration and look again with fresh eyes before locking numbers.
- **Reveal transition leaking into hover/press** if the `.done` swap is forgotten.
- **Likely disagreements**: Impeccable may want a visible lightbox counter and play labels (both add words, forbidden); Taste may want a bolder collage (>5 deg tilt) and a handwritten face; both may resist moving the hikes spread away from meet-1.
