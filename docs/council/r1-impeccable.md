# Round 1: Impeccable seat (UX, hierarchy, type, spacing, a11y, responsive)

Method: I opened `direction.html` card C and `flow-captions.html` in Playwright, and read the contact sheet and `media.json`. Findings that shaped this proposal:
- The mockup's orange `#E08A1E` on its cream background is **2.45:1**. It fails AA even as large text (needs 3:1), and white-on-orange button text fails too. The accent must go darker, and the bright orange becomes decoration only.
- The mockup's hero crop (wide, cropped to the nose) loses her face. The real hero is a 3:4 portrait and must stay portrait.
- The mockup uses dashed dividers, an all-caps tracked kicker ("MORE CHAPTERS...") and text set at about 11px. We drop all three.
- The photos are mostly 3:4. Two are outliers: `232ed04c` (4:3 landscape) and `20221006` (1600x3552, about 9:20). Both need explicit handling.

Colour strategy: **Committed**. Butter-yellow carries the page, a single burnt-amber carries every interactive and heading role, and the photos carry all the other colour. Warmth comes from the photos, the type and the sunny surface, not from a grey-beige paper tone.

## Palette tokens

Contrast ratios are computed, not guessed.

| Token | Hex | Role | Contrast |
|---|---|---|---|
| `--bg` | `#FFF4D6` | page ground (butter, a touch yellower than cream on purpose) | n/a |
| `--bg-band` | `#FFE8B8` | donation band and closing ground | n/a |
| `--ink` | `#3A2314` | body text | 13.4:1 on bg, 12.2:1 on band |
| `--ink-soft` | `#6B4A2E` | domain line, secondary text only | 7.25:1 on bg, 6.6:1 on band |
| `--heading` | `#8F4A00` | h1, h2 | 6.1:1 on bg |
| `--accent` | `#A64A08` | button fill, links | 5.3:1 on bg; white text on it is 5.8:1 |
| `--accent-hover` | `#8A3C04` | button hover and press | white on it is above 7:1 |
| `--sun` | `#F5A524` | decoration only (sun disc, tape, sparkle). Never text. | n/a |
| `--sky` | `#BFE0EE` | decoration only (washi tape, tilted background patches). Complements the golden coat. | n/a |
| `--paper` | `#FFFFFF` | polaroid frame | n/a |
| `--focus` | `#1D4E89` | 3px focus ring, offset 3px | above 7:1 on bg and band |
| `--scrim` | `rgba(30,17,8,.92)` | lightbox backdrop | n/a |
| `--shadow-polaroid` | `0 1px 2px rgb(58 35 20/.20), 0 10px 22px -8px rgb(58 35 20/.30)` | polaroid lift | n/a |

Rules:
- `--sun` and `--sky` never carry meaning. They are always `aria-hidden` or pure CSS.
- White on `--bg` is only 1.1:1, so the polaroid edge is defined by the shadow, not by colour. Do not drop the shadow.
- No gradient text, no side-stripe borders, no glass.
- The page has no dark mode. The scene is a friend opening a text-message link on a phone in daylight or indoor light, so a single warm-light theme is correct. Set `color-scheme: light`.

## Typography

Pair on a contrast axis: a soft serif for the two headings and the closing line, and a rounded sans for everything else.

- **Display:** Fraunces (OFL, Google Fonts or self-hosted variable woff2). Settings: weight 700, `opsz` 144, `SOFT` 100, `WONK` 0. It is friendly and a little bouncy, and clearly not SaaS.
- **Text:** Nunito (OFL, variable). Body 400, button 800. It is already in the mockup and is the "rounded friendly" brief.
- **No handwritten face.** There are no captions, and a script font on a heading would fight the polaroids. A script face may only appear as a decorative SVG mark, and I recommend none.
- Self-host two woff2 subsets (Latin) with `font-display: swap`. Metric-matched fallbacks: `Georgia` for Fraunces, `system-ui` for Nunito. Use `size-adjust` so there is no CLS.

| Element | Size | Line height | Notes |
|---|---|---|---|
| h1 "Meet Eevee" | `clamp(2.75rem, 2rem + 4vw, 5rem)` (44px at 320, 80px at 1920) | 1.02 | `text-wrap: balance`, letter-spacing -0.01em, `--heading`. "Meet Eevee" at 44px is about 250px wide, which fits 280px usable. |
| h2 "In Loving Memory of Eevee" | `clamp(1.875rem, 1.4rem + 1.8vw, 3rem)` | 1.1 | `text-wrap: balance`. It wraps to 3 lines at 320, which is fine. |
| Body | `clamp(1.125rem, 1.05rem + 0.3vw, 1.3125rem)` (18 to 21px) | 1.6 | `text-wrap: pretty`, measure `max-width: 36rem` (about 60ch). Never below 18px. |
| Closing paragraph | `clamp(1.25rem, 1.1rem + 0.7vw, 1.625rem)` | 1.5 | Fraunces 400 italic, `--ink`. Centred, max 30rem. It is the emotional last beat. |
| Button | 1.125rem Nunito 800 | 1.2 | Letter-spacing 0, sentence case exactly as given. |
| Domain line | 0.9375rem (15px) Nunito 600 | 1.4 | `--ink-soft`, real selectable text. |

Hierarchy on one screen at 390 wide: h1 (about 50px) then the hero polaroid then 18px body. Nothing else competes. There are exactly two headings. The closing has none, so give it `<p>` plus `role` nothing special; do not fake a heading.

## Spacing & radii

4px base unit. Rhythm is deliberately uneven (tight within a spread, loose between sections), not a uniform 24px.

- Gutter: `clamp(20px, 5vw, 48px)`. The 20px floor leaves room for the tilt overhang (see Risks).
- Paragraph to paragraph: 24px. Heading to first paragraph: 20px.
- Paragraph to the spread that follows it: `clamp(32px, 6vw, 56px)`.
- Spread to the next text block: `clamp(56px, 10vw, 112px)`.
- Spread to spread (no text between): `clamp(48px, 8vw, 88px)`, plus a small decorative break (a 28px sun-disc SVG in `--sun`, `aria-hidden`, 0.9 opacity). No dashed rules.
- Donation band: padding block `clamp(64px, 12vw, 128px)`, full-bleed `--bg-band`, with a 24px wavy top edge via CSS mask (static, no animation).
- Polaroid gap inside a spread: negative margin overlaps are allowed up to 12% of width, but **no overlap may cover more than 15% of another photo's area**, and never on a face.
- Radii: polaroid frame 3px (real prints are nearly square-cornered). Photo window 1px. Video poster window 2px. Button 999px (pill). Lightbox image 4px. Focus ring follows the shape.
- Tap targets: 48x48px minimum (lightbox controls 52px on touch).

## Polaroid treatment

- Frame `--paper`, padding **10px sides and top, 34px bottom** at 320 to 480. Scale to 12px/42px at ≥1024. The chunky bottom edge stays without a caption: it is the polaroid signature, and it gives the shadow something to sit under.
- **Use each photo's native aspect ratio** inside the window, via `aspect-ratio: w/h` from `media.json`. Do not crop everything to one ratio (that cuts heads).
  - Exception A: `20221006` (about 9:20) is capped at 3:4 with `object-position: 50% 68%`, which holds her under the maple. It is the only crop, and the lightbox shows it in full.
  - Exception B: `232ed04c` (4:3 landscape) keeps its ratio. It becomes the one wide polaroid and adds rhythm.
  - Videos use a 9:16 window but are rendered at about 58% of the spread's width, so they never tower over the photos.
- Tilt: from a fixed set per slot, in degrees: `-3.5, 2.5, -1.5, 3, -2.5, 1.5, -4, 2`. The maximum is ±4°. Never apply a tilt to text or buttons. Within a spread, no two neighbours tilt the same way.
- Tape: optional 64x22px strip in `--sky` or `--sun` at 70% opacity, rotated opposite to the card, on at most **one polaroid per spread** and never over a face. Pure CSS pseudo-element.
- Shadow: `--shadow-polaroid`. A pressed state drops to `0 1px 2px` only.
- Markup: each polaroid is a real `<button type="button">` wrapping the `<picture>`. The accessible name comes from the `alt` text in `media.json`. Do not add an extra "view larger" label (that would be adding words for sighted users, and screen readers get "button, <alt>"). Use `aria-haspopup="dialog"`.
- Rotation sits on an inner wrapper, not on the button, so the focus ring stays axis-aligned and readable.

## Layout ≤480 / 481–1023 / ≥1024

**≤480 (design target 320 to 430)**
- A single text column with a 20px gutter. The h1 sits at the top left-aligned, then the hero polaroid (about 78% of the viewport width, tilted -2.5°, centred slightly right), then paragraph 1. DOM order is h1, hero figure, p, which keeps the reading order honest.
- First-viewport check at 390x844: h1 plus most of the hero are visible. A hint of paragraph 1 may peek, which invites scroll without any arrow or label.
- Spreads: a 2-column staggered collage. Items are 56 to 64% of the width, alternate left and right with 8 to 14% overlap, and each is offset down by 12 to 20px from its partner. A lone video or an odd item is centred, at 60%.
- No horizontal scroll at 320. Set `overflow-x: clip` on `body` as a belt-and-braces measure, and verify with a 320 screenshot.

**481–1023**
- Text column centred at 36rem. Spreads break out to `min(92vw, 44rem)` and use a 6-column grid: pairs and trios, with 3-photo spreads laid out as 2 over 1. A 4-item spread is 2x2, with the second row offset by half a column.
- The hero is centred, about 22rem wide, with the h1 above it.
- Donation band: text column 34rem, centred.

**≥1024**
- A 12-column grid, max width 1160px, centred. Text stays at 36 to 38rem (never wider, because the measure matters more than filling space).
- Hero: two columns. Left (5 cols): h1, then paragraph 1, vertically centred. Right (6 cols): the hero polaroid at about 30rem wide, tilted 2.5°. DOM order is unchanged (h1, figure, p) and the grid places the figure in the right column.
- Text blocks sit in cols 4 to 9, alternating to cols 3 to 8 and 5 to 10 on successive paragraphs. The shift is small and is a rhythm cue, not a zigzag.
- Spreads use the full width: 3 to 5 polaroids in a single loose row or two rows with vertical offsets and deliberate overlap. Polaroids are 14 to 18rem wide at 1920 and never above 20rem, so photos stay crisp.
- Donation band: centred single column, 36rem, big breathing room.

## Spread arrangement (by media id)

Page order. Spreads sit between whole paragraphs. I balanced the counts to **3 | 6 | 8 | 6** items, so no single gap is a wall. Where two spreads follow one paragraph they are separated by the sun-disc break. Every spread has ≤5 items and mixes poses, scales and tilts.

**Top.** h1 "Meet Eevee", then
1. `img_8819` (hero, large, tilted -2.5°). It sits with the h1, followed by paragraph meet-0.

**Spread A, after meet-0** (loving, friendly). 3 items:
2. `37c83b77`, 3. `img_8394`, 4. `img_4837`.
- Phone: stagger L, R, L. `img_8394` (the "proud" one) is largest. Overlap about 10%.
- Desktop: a single row of 3, with the middle one raised 28px and the first and last tilted outward.

**Spread B, after meet-1** (foodie). 3 items:
5. `ec73ecaf`, 6. `img_0826`, 7. `img_7207` (birthday cake, centred and largest, tilted +2°).
- Phone: cake first in a pair row, then one below. Desktop: 3 in a row with the cake centred and raised.

**Spread C, after meet-1, after the sun-disc break** (walks). 3 items:
8. `img_2017`, 9. `b9e5276c` (VIDEO, centre), 10. `b0eaddd4`.
- Phone: photo, video centred at 58%, photo. Desktop: the video in the middle at the same height as the photos, the photos flanking at a slight tilt.

**Spread D, after meet-2** (up for anything: hikes, swim). 4 items:
11. `img_6802`, 12. `img_4144`, 13. `img_5023`, 14. `img_4973`.
- Phone: 2x2 stagger, with `img_4973` (the pool jump, the most energetic) last and larger. Desktop: 4 in a row, or 2 over 2 at 1024 to 1279.

**Spread E, after meet-2, after the break** (adventures). 4 items:
15. `232ed04c` (landscape, wide, first), 16. `23983ab7` (VIDEO), 17. `20221006` (tall), 18. `0f88d984` (VIDEO).
- The two videos are not adjacent: a video, a photo, a video. Phone: wide polaroid full-width at about 82%, then the video and the tall photo as a pair, then the second video centred at 58%. Desktop: wide polaroid left, the tall one right, with the two videos in a second row flanking.

**Spread F, after meet-3** (lucky, loving nature: snow). 4 items:
19. `img_3785`, 20. `img_3786`, 21. `c1a73628` (VIDEO), 22. `img_8788`.
- Phone: the two yellow-raincoat photos as a tilted pair, then the video centred at 58%, then `img_8788`. Desktop: a row of 4 with the video third.

**Spread G, after meet-3, after the break** (cozy, closing the photos). 2 items:
23. `img_1551` (Christmas), 24. `img_7522`.
- Phone: a pair that overlaps by 12%. Desktop: a pair, larger (up to 20rem), centred. A quiet, intimate end before the donation band.

Count check: 1 + 3 + 3 + 3 + 4 + 4 + 4 + 2 = 24, all unique. The 4 videos are `b9e5276c`, `23983ab7`, `0f88d984`, `c1a73628` and the 20 photos are the rest. The lightbox set is the 20 photos only.

## Video interaction

- A video is a polaroid with a 9:16 poster window. The poster is an `<img>`, so there is no black box. The video element is `preload="none"`, `playsinline`, no `autoplay`, no `muted`, with `poster`. Reserve space with `aspect-ratio: 9/16` so there is no layout shift.
- Overlay: a 72px circular play button (white `#FFFFFF` disc, `--ink` triangle, 2px `--ink` ring at 40% so it holds 3:1 over any poster). It is a real `<button>` with `aria-label="Play video of Eevee carrying a stick"` and so on (per-video labels from `media.json`). Visible focus ring `--focus`.
- Tap the button or the poster: the overlay fades out (150ms), `video.play()` is called with sound, and **native `controls` are attached on first play**. This gives seek, volume and fullscreen for free, which matches the spec's "native controls or equivalent". The tap is a user gesture, so sound is allowed on iOS and Android.
- One at a time: on `play`, pause every other video and restore its poster overlay. A pause or end does not remove controls. On `ended`, rewind to 0 and restore the overlay so a second tap replays.
- Videos play **inline, not in the lightbox**. Reason: the page is a scroll of tiles, one tap plays, and a second modal for 5-second clips doubles the taps. Fullscreen remains available via native controls. Opening a video in a modal would break "tap, hear her" and the lightbox's photo-only arrow flow.
- Failure state: if `error` fires, keep the poster, swap the overlay icon for a retry (the same button, an arrow glyph), and still show no text. Never show a spinner-only state for more than 400ms. Show a small ring spinner on the overlay while `waiting`.
- A video leaving the viewport while playing keeps playing. We never auto-pause on scroll (a friend may be listening while scrolling), except that opening the lightbox pauses the video.

## Lightbox

- Use a native `<dialog>` opened with `showModal()`. It provides a focus trap, `Esc`, the top layer and `inert` background for free. Set `aria-label` to the photo's alt text and keep `aria-modal` implicit.
- Contents: a full-viewport `--scrim` backdrop, the photo as `<picture>` at `object-fit: contain`, max `100dvw x 100dvh` minus 16px padding, the 1600w source, and a 4px radius. There is no polaroid frame and no caption (no new words).
- Controls (all real buttons with 52px targets on touch, SVG icons, `aria-label`s of "Close", "Previous photo", "Next photo"): close top-right, prev and next centred on the left and right edges. Arrow buttons are hidden at ≤480 (swipe is the gesture) but remain focusable and visible on keyboard focus. Controls get a 3:1 `--paper` icon on a `rgba(30,17,8,.55)` disc.
- Navigation: left and right arrow keys, swipe left and right (pointer events, threshold 48px, velocity-aware), tap prev and next. Swipe down more than 96px closes with the image following the finger. Loop around at both ends, or stop at the ends? **Stop at the ends**, and disable the end button (`aria-disabled`), so people know the set is finite (20 photos).
- Announce position with an `aria-live="polite"` region: "3 of 20" is announced to screen readers only (visually hidden), so the sighted view stays wordless. Keep that count out of the visible UI.
- Focus: on open, focus the close button. On close, restore focus to the originating polaroid button (store the reference; if the user navigated, restore to the *current* photo's polaroid and scroll it into view without smooth scrolling).
- Scroll lock: `html { overflow: hidden }` plus `overscroll-behavior: contain` on the dialog. Fix the iOS rubber-band leak by setting `position: fixed` on `body` with the saved `scrollY` and restoring it on close. Test it on WebKit.
- Preload only the two neighbours' 960w sources. Use a `srcset` with `sizes="100vw"`. Show a low-res 480w while the 1600w loads, with no spinner.
- Back button: push a history state on open so the Android and iOS back gesture closes the lightbox instead of leaving the page. Keep this small and well tested.

## Motion spec

Principle: motion is a small welcome, never a gate. **Default state is fully visible**, and the enhancement is progressive.

- **Settle-in (polaroids):** from `translateY(14px) rotate(tilt+2deg)` to `tilt`. Duration **520ms**, `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out-quint-ish). Stagger 70ms within a spread, maximum 4 steps. Fire once. Drive it with CSS scroll-driven `animation-timeline: view()` inside `@supports (animation-timeline: view())`, with `animation-range: entry 0% entry 45%`. Browsers without support just show the final state. No JS-toggled `opacity: 0` anywhere, so a hidden tab can never ship a blank section.
- **Opacity:** the polaroid starts at opacity 0.001 equivalents only inside the supports block, and animates to 1 at the same time. Without that block opacity is always 1.
- **Hover lift** (`@media (hover: hover) and (pointer: fine)` only, so no sticky hover on touch): `translateY(-4px) rotate(tilt*0.6)`, shadow deepens. 200ms, `cubic-bezier(0.22, 1, 0.36, 1)`.
- **Press:** `scale(0.98)`, 100ms ease-out. Applies to the polaroid, the play button and the donate button.
- **Lightbox open:** backdrop fade 200ms linear, image `scale(0.96) -> 1` and fade 240ms `cubic-bezier(0.22, 1, 0.36, 1)`. **Close:** 160ms fade out. Prev and next cross-fade 180ms plus a 24px translate in the swipe direction. Closing from a swipe-down follows the finger, then flings out at 160ms.
- **Play overlay fade:** 150ms.
- Only `transform` and `opacity` are animated. No layout properties, no `will-change` except on the active lightbox image.
- Banned: parallax, scroll-jacking, bounce or elastic curves, looping idle wiggle, confetti, cursor effects.
- **Reduced motion** (`prefers-reduced-motion: reduce`): remove all translate, rotate-in and scale. The settle-in becomes a 150ms opacity crossfade or is dropped entirely (the polaroids are visible by default). Hover lift is removed (the shadow darkens only). Lightbox open and close is a 120ms opacity fade. Swipe still works. Never autoplay anything regardless.

## Donation section

A quiet invitation. It differs from the memory section by **ground and stillness, not by louder UI**.

- A full-bleed `--bg-band` with a wavy top edge. There are no polaroids, no tilt, no tape inside it. It reads as the room going calm.
- Order (family words verbatim, whole): h2, paragraph D1 ("In memory of Eevee, we've chosen to support..."), paragraph D2 ("If you'd like to make a donation...through the link below..."), **then the button and the domain line**, then paragraph D3 ("Of course, there's absolutely no pressure..."). Reason: D2 says "the link below", so the link must follow it. D3 after the button then lets the visitor off the hook, which is exactly the family's tone. Alternative if the council prefers: the button after D3. I rank it second, because the "no pressure" line then reads as an apology before the ask rather than a release after it.
- Button: `<a class="btn" href="https://torontohumanesociety.donorsupport.co/page/InMemory" target="_blank" rel="noopener">`. Fill `--accent`, white text 5.8:1, pill, height 56px, padding 0 28px. At ≤480 it is full width up to 22rem and centred, with the label allowed to wrap to 2 lines (do not truncate it, and use `text-wrap: balance`). At ≥481 it is auto width. No icon, no arrow, no glow, no pulse, no sticky.
- Hover: the fill darkens to `--accent-hover`. Focus: 3px `--focus` ring at 3px offset. Press: `scale(0.98)`.
- Screen readers should know the link opens a new tab. Use a visually hidden `<span>` "(opens in a new tab)". It is the only extra text and it is not visible. Flag to Opus: that is an accessibility string, same class as alt text.
- Domain line `torontohumanesociety.donorsupport.co` sits 12px under the button, centred, 15px `--ink-soft`, as plain text (not a second link, so there are no duplicate tab stops).
- Closing paragraph: after the band's content, 72px gap, centred Fraunces italic in `--ink`, then one small `--sun` sun-disc SVG (`aria-hidden`, 32px) beneath it as the last thing on the page. No footer.
- No progress bar, no urgency, no counters, no sticky bar, no second CTA anywhere else on the page.

## Risks

1. **Tilt overhang causing horizontal scroll at 320.** A 4° tilt on a 70%-wide card overhangs a few px. Mitigation: the 20px gutter floor, `overflow-x: clip` on `body`, and a 320x568 screenshot in the break-it loop.
2. **Orange-on-cream temptation.** The mockup accent is 2.45:1. Anyone who "restores the original orange" for headings or the button breaks AA. The token table is the guardrail.
3. **Cropping faces.** One shared aspect ratio would decapitate the tall `20221006` and the landscape `232ed04c`. Native ratios plus the single capped exception avoid it. The hero must stay portrait.
4. **A wall of images between paragraphs.** The 3|6|8|6 balance, sun-disc breaks and alternating densities soften it, but meet-2 still carries 8 items. If it feels long in review, move Spread D's `img_4973` into Spread G or trim breaks. Do not move paragraphs.
5. **Reveal animation gating content.** Use only the `@supports` scroll-driven version and never JS `opacity:0`, or slow-3G and hidden tabs show blanks.
6. **iOS Safari lightbox scroll leak and the dialog top layer.** Needs a real WebKit test, as does the history-state back gesture.
7. **Video on iOS:** HEVC must be pre-converted to H.264 (spec). Verify that `controls` appear after the first tap and that sound plays. Verify that low-power mode does not block `play()`.
8. **Accessible names:** the 20 polaroid buttons all read "button, <alt>". Keep `alt` distinct (several photos are similar snow and street shots). Check no two are identical.
9. **Font-swap CLS** with Fraunces display at 80px. The metric-matched fallback and `size-adjust` are required.
10. **Fraunces at heavy weight can read "boutique".** If the council finds it too precious, the fallback is Nunito 900 for headings (the mockup's choice), keeping the same sizes and colours.
