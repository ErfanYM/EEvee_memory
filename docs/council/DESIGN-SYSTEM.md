# DESIGN-SYSTEM: Eevee memorial page (binding)

Written by Opus from council rounds 1–2 (`r1-*`, `r2-*`). **This file is binding on the builder.** Where it is silent, follow the spec, then the seat docs in this priority: Impeccable for accessibility, Emil for interaction, Taste for visuals. Do not invent decorative elements.

**Idea:** Eevee's own photo album. Each chapter is an album page in a flat colour taken from her world (snow-sky, meadow, birthday-cake blush). White prints are laid on it, slightly tilted. One friendly slab typeface, the family's words, and nothing else.

---

## 1. Tokens (`:root` in `main.css`, these exact names)

```css
/* colour */
--ink:          #2B2118;  /* all text, headings included; ≥11:1 on every field */
--ink-soft:     #4A3B2E;  /* domain line only */
--card:         #FFFFFF;  /* print stock */
--field-sky:    #CFE0EA;
--field-meadow: #CFDDB8;
--field-blush:  #F3D9CF;
--berry:        #8F2A45;  /* donate button fill (white text 7.4:1), play triangle */
--berry-deep:   #74203A;  /* donate button hover/active */
--focus:        #1D4E89;  /* 3px ring, 3px offset, everywhere */
--tape-sun:     #F4B93A;  --tape-sky: #9CC3DB;  --tape-grass: #B5CC8C;
--scrim:        rgba(36, 24, 16, .97);
--print-edge:   0 1px 2px rgb(43 33 24 / .18);   /* hairline contact shadow, the ONLY resting shadow */
--print-float:  0 18px 40px -12px rgb(0 0 0 / .45); /* lightbox image only */

/* type */
--font: "Zilla Slab", "Zilla Slab Fallback", Georgia, serif;
--step-h1:    clamp(2.75rem, 1.6rem + 7vw, 6rem);       /* weight 600, lh .95, tracking -0.02em */
--step-h2:    clamp(2rem, 1.4rem + 2.6vw, 3.5rem);      /* 600, lh 1.05, tracking -0.015em */
--step-lead:  clamp(1.3rem, 1.12rem + .8vw, 1.75rem);   /* 500, lh 1.4 */
--step-body:  clamp(1.125rem, 1.05rem + .3vw, 1.3125rem);/* 400, lh 1.55 */
--step-small: 0.9375rem;                                  /* 15px min; domain line, 500 */

/* space */
--gutter:     clamp(20px, 5vw, 48px);
--wrap:       1200px;
--measure:    36ch;     /* body paragraphs */
--measure-lead: 30ch;
--chapter-pad: clamp(72px, 10vw, 140px);  /* vertical padding of each field */
--para-to-spread: clamp(40px, 6vw, 80px);
--spread-to-spread: clamp(48px, 8vw, 96px);
--print-pad: 10px; --print-pad-bottom: 36px;            /* ≥1024: 14px / 50px; hero 16px / 56px */
--radius-print: 2px; --radius-photo: 1px; --radius-pill: 999px; --radius-lightbox: 6px;

/* motion */
--ease-out:    cubic-bezier(.23, 1, .32, 1);
--ease-settle: cubic-bezier(.22, 1, .36, 1);   /* no overshoot */
--ease-sheet:  cubic-bezier(.32, .72, 0, 1);   /* lightbox FLIP */
```

`color-scheme: light`. No dark mode. `<meta name="theme-color" content="#CFE0EA">`. No gradients, glows, glass, backdrop blur, grain overlay, or decorative SVG marks (no suns, paws, hearts, waves, scribbles, dividers). The colour step between fields **is** the divider.

## 2. Typography
- **One family: Zilla Slab** (OFL), self-hosted woff2 with a Latin subset in `site/assets/fonts/`: 400, 500, 600. Italic is not used. `font-display: swap`. Preload the 400 and 600 files. Define a `"Zilla Slab Fallback"` `@font-face` on `local("Georgia")` with `size-adjust`/`ascent-override` tuned so the font swap causes no layout shift (CLS ≈ 0).
- h1 "Meet Eevee": `--step-h1`, `text-wrap: balance`. One line on phones (at 320 it is 44px, about 245px wide), and deliberately two lines (Meet / Eevee) in the desktop hero column. h2: `--step-h2`, balance.
- `--step-lead` applies to **meet-0, memory-0, closing-0**. Everything else uses `--step-body`. All text is left-aligned **except closing-0, which is centred**. Body max-width `--measure`, lead max-width `--measure-lead`. `text-wrap: pretty` on paragraphs.
- No eyebrows, no uppercase tracking, no orange or amber text. Headings are `--ink`.

## 3. Chapter fields (page order)
| Field | Contains |
|---|---|
| sky | h1, hero, meet-0, S1 |
| meadow | meet-1, S2, S3 |
| blush | meet-2, S4, S5 |
| sky | meet-3, S6, S7 |
| blush | h2, memory-0, memory-1, donate button + domain, memory-2 |
| sky | closing-0 (padding-bottom 160px; nothing after it, no footer) |

Each field is a full-bleed `<section>`. Content sits inside a `--wrap` container with `--gutter` side padding and `--chapter-pad` vertical padding.

## 4. Print (polaroid) component
```
<figure class="polaroid" data-media-id data-kind style="--tilt:-2.5deg; --w: …">
  <div class="polaroid__tilt">          ← rotation lives here (focus ring stays level)
    <button class="polaroid__open" …> or the video markup (spec DOM contract)
```
- White `--card` frame, padding `--print-pad` on the sides and top, `--print-pad-bottom` at the bottom (left blank), `--radius-print`, `--print-edge` shadow.
- **Native aspect ratio** from `media.json` (`aspect-ratio: w / h`, `img { width:100%; height:auto }`). Two exceptions: `20221006` uses a 3:4 window with `object-fit: cover; object-position: 50% 62%`, and videos use a 9:16 window. `232ed04c` stays landscape.
- Tilt is fixed per id (table in §6), max ±4°, and neighbours never tilt the same way. Tilt never applies to text or buttons.
- Tape: a static `::before` strip, 72×22px, with a zig-zag `clip-path`, at 85% opacity, rotated opposite to the print, on the top edge, never over a face. Only on the ids marked T in §6.
- Hover (only inside `@media (hover:hover) and (pointer:fine)`): `rotate(calc(var(--tilt) * .6)) translateY(-4px)`, 220ms `--ease-out`. The shadow does not change.
- Press (`:active`, all inputs): `scale(.97)`, 100ms in and 200ms out, `--ease-out`.
- Polaroid buttons: `-webkit-tap-highlight-color: transparent; touch-action: manipulation; -webkit-touch-callout: none; user-select: none`. Images get `draggable="false"`. Never use `touch-action: none` outside the lightbox stage.
- Accessible name: `aria-label="Open photo: <alt>"` plus `aria-haspopup="dialog"`. The spec DOM contract wins on exact markup.
- Never use `transition: all`, and never transition `box-shadow`.

## 5. Layout
**≤480.** Single column. Order: h1, hero print, meet-0 (the hero comes before the lede, so the first screen at 390×844 is h1 plus most of the hero). Hero print 78vw at -2.5°. Spreads are a staggered collage, not a grid: each spread has **one lead print at 64–70vw**. Other photos are **2-up at 46–50vw**, alternating left and right with about 10% horizontal overlap and a 16–24px vertical offset. **Videos are always single, 58–62vw.** Overlap never covers more than 15% of a neighbour or any face. `overflow-x: clip` on each spread *and* on `body`. Verify there is no horizontal scroll at 320.

**481–1023.** Text column centred. Hero: when ≥720px wide, h1 and meet-0 on the left with the hero print on the right; otherwise stacked as on phone. Spreads break out to `min(92vw, 760px)`. A 3-item spread is a loose 2+1, a 4-item spread is two staggered rows. Lead print about 1.25× the others.

**≥1024.** *(Round 1 amendments T1–T3: 4-item spreads go four across; S7 is one row of three with the lead centred; prints clamp up to 440px at ≥1440; `--wrap: 1320px` at ≥1600; paragraphs alternate columns (meet-1 left, meet-2 right, meet-3 left); the donation column is centred in the wrap.)* Hero in two columns (5fr text / 6fr print). The print is at most 470px wide, tilted +2.5°, and the h1 is two lines. Every other chapter puts the **paragraph above a full-width spread** (never text beside a spread). Spreads are loose rows, prints 260–380px wide, lead print 1.2×. Prints get vertical offsets of ±40px and slight overlaps. Content is capped at `--wrap`, while fields run edge to edge at 1920.

## 6. Spread arrangement (final: 24 ids, each exactly once)
Runs between paragraphs: 3 / 6 / 7 / 7. Lead print = **L**. Tape = **T**.

| Spread | After | Items in order (tilt) |
|---|---|---|
| Hero | h1 | `img_8819` (−2.5°; desktop +2.5°), no tape, never hidden, `fetchpriority="high"` |
| S1 | meet-0 | `37c83b77` (−3°), `img_8394` **L** (+1.5°), `img_4837` (−1.5°) |
| S2 | meet-1 | `ec73ecaf` (−2.5°), `img_7207` **L T-sun** (+2°), `img_0826` (−1°) |
| S3 | meet-1 (after S2) | `img_2017` (+2.5°), `b9e5276c` **video L** (−1.5°), `b0eaddd4` **T-sky** (+3°) |
| S4 | meet-2 | `img_6802` (−2°, smallest; a quiet beat), `img_5023` **T-grass** (+1.5°), `img_4144` (−3°), `img_4973` **L** (+3°) |
| S5 | meet-2 (after S4) | `23983ab7` **video** (−2°), `232ed04c` **L landscape T-sky** (+1.5°), `0f88d984` **video** (+2°) |
| S6 | meet-3 | `img_3785` (−2.5°), `img_3786` **T-sun** (+2°), `c1a73628` **video** (−1.5°), `img_8788` (+3°) |
| S7 | meet-3 (after S6) | `img_1551` **T-grass** (−2°), `img_7522` (+2.5°), `20221006` **L** (−1°) |

Composition notes: in S2 the cake is the biggest print, centred on desktop. In S5 the two videos flank the landscape print on desktop; on phone the order is video, landscape lead, video. In S6 the two raincoat photos are a near-touching pair of the same size. S7 is calm and large, an exhale before the donation field. The two raincoat photos are the only pair allowed to be the same size and adjacent.

## 7. Video
- Inline, inside its print. **Never in the lightbox.** It follows the spec DOM contract: `preload="none"`, `playsinline`, a poster, no `autoplay`, no `muted`, `aspect-ratio: 9/16`.
- Play button: 64px visible white disc (92% opacity) with a 1px `rgb(0 0 0/.2)` ring, a `--berry` SVG triangle nudged 2px right for optical centring, a hit area of at least 72px, and the `--focus` ring.
- Tap: call `video.play()` **synchronously in the click handler** (nothing awaited before it). Attach native `controls` for everyone on first play. The disc fades out over 150ms. The print straightens to 0° and scales 1.03 over 240ms `--ease-out`.
- One at a time: on `play`, pause the others and return them to their poster state and tilt. Also pause when a playing video is less than 10% visible (IntersectionObserver) or when the lightbox opens. On `ended`, return to the poster with the disc showing and the tilt restored.
- If buffering lasts more than 400ms (`waiting`), the disc shows a 24px `--berry` ring spinner. On `error`, keep the poster and turn the disc into a retry glyph. No text.

## 8. Lightbox (photos only; 20 in DOM order)
- Native `<dialog>` opened with `showModal()`. Its `aria-label` is the current photo's alt text. Focus goes to the close button. On close, focus returns to the polaroid of the **current** photo, which is scrolled into view without smooth scrolling. A visually hidden `aria-live="polite"` region announces "N of 20". There is no visible counter or caption.
- Image: the plain photo (no print frame), `object-fit: contain`, max `calc(100vw - 24px)` × `calc(100dvh - 96px - safe-area)`, `--radius-lightbox`, `--print-float`. Show the 960w source first, swap to 1600w once it is decoded, and preload the neighbours at 960w.
- Open is a WAAPI FLIP from the print's image rect and tilt (measured after `img.decode()`): 280ms `--ease-sheet`, while the scrim fades in over 220ms `--ease-out`. The origin print gets `visibility:hidden` while the lightbox is open. Close is the reverse FLIP from the current transform, 220ms. If the origin is off-screen, close with a 160ms fade instead.
- Swipe: pointer events with `setPointerCapture`. Ignore extra touches. Lock the axis after 8px. The image follows the finger 1:1 by writing `style.transform` on the image. Commit at ≥22% of width **or** (velocity >0.25 px/ms and travel ≥40px). *(Round 1, E4.)* **Stop at the ends** with 0.35 friction and a 260ms spring back. Swipe down dismisses at >110px or the same velocity, and the scrim opacity follows the drag distance. The stage uses `touch-action: pinch-zoom` (JS handles the pans).
- Keyboard: ←/→ swap the photo instantly, Esc closes instantly. **Keyboard actions never animate.**
- Controls: close at the top right, 48px (52px on coarse pointers), safe-area aware. Prev/next buttons are shown only under `(hover:hover) and (pointer:fine)`, but are always focusable and become visible on focus. Labels are "Close", "Previous photo" and "Next photo". At the ends they get `aria-disabled="true"`.
- History: `pushState({lb:id})` on open, `replaceState` while navigating, `popstate` closes, and X/Esc call `history.back()`. A refresh with `state.lb` present must not leave a dead state; ignore it on load.
- Scroll lock: `overflow:hidden` on `html`, `overscroll-behavior: contain` on the dialog, `scrollbar-gutter: stable`. Add a `position:fixed` body fallback **only** if a WebKit test shows a scroll leak.
- Reduced motion: no FLIP. Open and close are a 120ms opacity fade. The swipe still tracks the finger, and commits snap into place.

## 9. Motion
Only `transform` and `opacity` animate. **Text never moves.** No paragraph or h1 reveal, no parallax, no scroll-linked effects, no looping motion.
- **Print settle (the one signature move):** an inline `<script>` in `<head>` adds `.js` to `<html>` before first paint. `motion.js` then marks **only below-the-fold** prints as `.is-pending`. The hero and anything in the viewport at init are never hidden. An IntersectionObserver (threshold .15, once) swaps `.is-pending` for `.is-in`. Starting state: `opacity:0; transform: translateY(18px) rotate(calc(var(--tilt) + 3deg)) scale(.96)`. Transition to rest: opacity 320ms `--ease-out`, transform 480ms `--ease-settle`. Stagger 60ms within a spread, max 4 steps. About 700ms after the reveal, add `.is-done`, which restores the hover and press transitions. **Failsafe:** if `IntersectionObserver` is missing, reveal everything immediately. If the observer has not delivered its initial callback within 2500ms, it is broken, so reveal everything. On `beforeprint`, reveal everything. A working observer is never overridden by a timer; otherwise visitors who scroll later would lose the settle. *(Amended by Opus after Task 8 review, Ruling R12.)*
- Press, hover and video timings are as in §4 and §7. The donate button only changes colour on hover/press (150ms), with no movement.
- `prefers-reduced-motion: reduce`: no translate, rotate or scale transitions. The reveal becomes a 200ms opacity fade. Hover lift is off. **Static tilts stay** (they are not motion). Press feedback remains as a colour or opacity change.

## 10. Donation section (blush field)
Order: h2 "In Loving Memory of Eevee", memory-0 (lead), memory-1, **then the button and domain**, then memory-2. memory-1 says "the link below", and memory-2 then reads as the release.
- Button: `<a class="donate">` exactly per the spec contract. `--berry` fill, white 600 text, pill, min-height 56px, padding 14px 28px, `text-wrap: balance`. At ≤480 it is full width up to 22rem; above that it is auto width. It is **level and not inside a print**: no tilt, no tape, no icon, no pulse, never sticky. Hover and active use `--berry-deep`. Focus uses the `--focus` ring. A visually hidden `<span class="sr-only"> (opens in a new tab)</span>` sits inside the link; it is an accessibility string, the same class of text as alt.
- Domain line: plain text, not a link, 12px below the button. `--step-small`, `--ink-soft`, left-aligned with the button.
- On desktop, memory text and button stay in a single left column at `--measure`. The right side is left empty; the field colour carries it. Do not add a print here. All 24 media are already placed.

## 11. Head and performance
Hero `<img>`: `loading="eager" fetchpriority="high"`. Every other img gets `loading="lazy" decoding="async"`. Use `<picture>` with AVIF → WebP → JPEG. Each spread print gets a `sizes` value derived from its layout width per breakpoint, so phones fetch 480/960 and never 1600. Load only CSS and three small JS modules (`motion.js`, `video.js`, `lightbox.js`) with `type="module"`. No libraries.

## Rulings (disputed points)
| Point | Ruling | Seat followed | Why |
|---|---|---|---|
| Palette | Chapter fields (sky/meadow/blush), ink text | Taste | Colours from Eevee's world; cream+orange is the generic default the owner moved away from |
| Number of fields | 3 hues, 6 fields | Impeccable (cap) | Six distinct hues were busy next to saturated photos |
| Heading colour | `--ink`, not orange/amber | Taste + Impeccable | Emil's `#E08A1E` fails AA at 2.49:1 |
| Typeface | Zilla Slab only | Taste (Impeccable conceded) | Warm, not SaaS, one family = cleaner |
| h1 size | max 6rem | Impeccable | Taste's 9.5rem shouted; 320px fit risk |
| Resting shadow | hairline contact only | Impeccable (nit) vs Taste | Defines white print edges on the pale fields at near-zero visual cost |
| Grain overlay | none | Emil + Impeccable | Fixed-layer compositing cost on Android, imperceptible on phones |
| Decorative marks | none | Taste | Read as stock "warmth" |
| Paragraph reveal | none, text static | Emil + Impeccable | Never make people wait to read the family's words |
| Reveal mechanism | IO one-shot + head-script + failsafe | Emil + Impeccable's failsafe | `view()` scrubs and is uneven on Safari; failsafe prevents blank sections |
| Settle curve | no overshoot | Impeccable | Memorial calm; bounce banned by their skill |
| Tilt max | 4° | Taste + Impeccable | 5° tipped toward chaos |
| Video placement | inline, never lightbox | all three | One tap → hear her |
| Video controls | native on first play | Impeccable (Emil conceded) | Seek/volume/fullscreen for everyone; most reliable on iOS |
| Pause off-screen | yes, <10% visible | Emil + Taste (Impeccable conceded) | Sound from an unseen video is surprising |
| Lightbox open | FLIP 280/220 | Emil | Keeps the spatial link; tested |
| Lightbox frame | plain image | Emil | Maximum photo size on phone |
| Lightbox ends | stop with friction | Impeccable + Emil | Finite set, clear |
| Lightbox touch-action | pinch-zoom | Impeccable | `none` blocked zoom, contradicting Emil's own note |
| Swipe threshold | 22% or 0.25 px/ms (and at least 40px) | Emil | Distance-only fails across phone widths |
| Phone spreads | lead print + staggered 2-up, videos single | Taste (Q1) | Avoids both a monotonous column and a catalogue grid |
| Videos adjacent | never | Impeccable | Prevents mis-taps cutting a clip |
| Donation field | blush, not berry | Taste withdrew berry; Impeccable | "Quiet invitation" |
| Button in tilted print | no, level button | Emil + Impeccable | Blur, skewed focus ring, decorates the one real action |
| Button colour | berry with white text | Taste r2 | 7.4:1, ties to her leash; raincoat yellow kept for tape |
| Button position | after memory-1 | Impeccable | "the link below" |
| Domain size | 15px | Impeccable | Trust cue must be readable |
| Close button | 48/52px | Impeccable | Platform reach |
| Run balance | 3/6/7/7, 20221006 to S7 | Taste | Shortest max run; videos never adjacent |

## Round 1 build notes (fix-1)
- One stylesheet: spread placements are generated into the marked block at the end of `main.css`.
- Hero: WebP-only `<picture>` with a matching `<link rel=preload as=image>`, extra 560w tier, no `decoding` hint. Below-the-fold pictures keep their URLs in `data-*` and `lazy.js` releases them (on-screen prints at once, the rest after `load`). Video posters load the same way.
- Lightbox opens from the origin print's `currentSrc`, then upgrades to 960w and 1600w after decode.
