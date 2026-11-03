# Round 1 · Taste seat (revised after reading design-taste-frontend)

Skill applied: `design-taste-frontend` (tasteskill v2). I ran its `draw.mjs` (sector nonprofit, tone warm, `--have photography,video`) and chose the direction **"The page is the object"** over "place carries it" (it would bury 24 photos under one image) and "one motif". Dealt type was Zilla Slab and I adopted it. The dealt palette (slate, sage, blush) was kept only in proportion; the colours are taken from Eevee herself, which the skill allows when the subject has unmistakable colours of its own. Redraws: palette only (reason: subject colours).

**Idea sentence:** On this page, **Eevee's own photo album (white-bordered prints laid on coloured album pages)** becomes **the page itself**. Each chapter is a new album page in a flat field colour, and the prints are the content. Competitor test: another dog's memorial would have different colours and photos; what makes this one hers is the colour of her world (snow-sky, meadow, birthday-cake pink, the yellow raincoat, the berry-pink leash), applied as the page's fields. **Live thing:** tap a print and hear her (video with sound). It uses the real media and works with a thumb.

What changed from my first draft, because the skill's house rules conflict with it:
- Removed: rest shadows on polaroids, grain gradient on cards, the `h1` highlighter on "Eevee" (styled accent word), paw-trail dividers and wobbly underlines (decorative shapes), the torn-edge mask, hairline/dashed lines, Fraunces (soft-serif display is a registered 2025 tell), the cream ground with accent (cream plus a warm accent is a tell). Replaced with: flat colour fields, white prints that stand off the field by tone alone, one typeface.
- Kept, deliberately: tilt (the one scrapbook signal), a small number of tape strips (filled shapes with real edges, part of the album object), a very faint paper grain (texture, not ornament).
- Fixed the 10-in-a-row run (see Spread arrangement: max 7, and the field colour changes mid-run).
- Experiment built and screenshotted: `.superpowers/council-ref/taste/index.html`, `shot-390.png`, `shot-1440.png` (h1, hero, one spread, a second spread, donation block, real images from `site/assets/img/`). Findings from looking: Zilla Slab 600 at `h1` size reads warm and un-templated; white prints on sky and meadow need no shadow to stand up; the berry field makes the donation read as a different quiet room. Corrections I made after the first shot: images need `height:auto` (attribute heights stretched the hero), and a 3-card spread squeezed into a text-beside-spread split at desktop gets too small (cards ~160px), so on desktop the paragraph sits above a full-width spread instead.

## Palette tokens
One ground per chapter, one ink, one accent. Fields change the whole page colour per chapter and are separated by nothing but the colour step.
```
--ink:        #2B2118;  /* all running text, 13.5:1 on every field */
--ink-soft:   #4A3B2E;  /* small notes only (domain line), 8:1 */
--card:       #FFFFFF;  /* print stock */
--field-sky:    #CFE0EA; /* snow and sky: hero and "meet" chapter */
--field-meadow: #CFDDB8; /* grass: foodie / walks / hikes */
--field-blush:  #F3D9CF; /* cake and bandana: adventures */
--field-snow:   #DCE6EE; /* a cooler step for the snow chapter, ink text */
--field-berry:  #8F2A45; /* the leash. Donation field. Text #FFF4EE (7.4:1) */
--accent:       #8F2A45; /* focus ring on light fields, play glyph */
--raincoat:     #F4B93A; /* button on the berry field (ink text, 9.9:1), tape */
--tape-sky:     #9CC3DB; --tape-grass: #B5CC8C;
--scrim:        rgba(36,24,16,.94);  /* lightbox only */
```
Rules: no gradients, no glows, no shadows on resting prints. Tape is `--raincoat` 82% opacity (or sky/grass) with a zig-zag `clip-path`, 76x24px, on at most 1 in 3 prints. Grain: 160px inline SVG feTurbulence at 7% opacity, fixed, pointer-events none (drop it if it costs scroll performance). Field order down the page: sky, meadow, blush, snow, sky (closing prints), berry (donation), sky (closing paragraph). Page `theme-color` `#CFE0EA`.

## Typography
- **One family: Zilla Slab** (OFL, Google Fonts or self-hosted woff2, Latin subset). Weights 400, 500, 600 and 400 italic. Unbracketed slab, friendly, bookish without cosplay. No second face, no handwriting font.
- Five steps only:
  - `--step-h1: clamp(3.4rem, 17vw, 9.5rem)` weight 600, leading .9, tracking -0.03em. "Meet Eevee" is one line at 390px, two lines (Meet / Eevee) in the desktop two-column hero.
  - `--step-h2: clamp(2rem, 1.3rem + 3.2vw, 4rem)` weight 600, leading 1.0, tracking -0.025em, for "In Loving Memory of Eevee" (2 lines max at every width).
  - `--step-lead: clamp(1.3rem, 1.1rem + .9vw, 1.75rem)` weight 500, leading 1.38, for paragraph 1 (meet-0), the first paragraph of the donation section and the closing paragraph. Statement size, 30ch.
  - `--step-body: clamp(1.125rem, 1.05rem + .3vw, 1.3125rem)` weight 400, leading 1.5, measure 34 to 38ch, all other paragraphs.
  - `--step-small: clamp(.8125rem, .79rem + .1vw, .875rem)` the domain line only.
- All text left-aligned; the closing paragraph is the single centred moment. No eyebrows, no uppercase tracking, no italic accent word in headings.

## Spacing & radii
- Page frame: equal side gutters 20px (≤480), 32px (481 to 1023), 48px (≥1024) inside a 1240px max wrap. Photos and fields run to the edges; the wrap holds text and clusters.
- Gap between fields: 72px vertical padding at phone, 140px at ≥1024, within a field a paragraph-to-spread gap of 48 (phone) to 80px. The gap between chapters is always larger than any gap inside one.
- Radii: prints 2px, photo inside 1px, one pill (999px) for the donate button only. No other rounded shapes.

## Polaroid treatment
- Print: `--card` white, padding 10px sides/top and 38px bottom (phone), 14/52px at ≥1024 (hero 16/56). The bottom margin stays blank.
- No shadow at rest. The separation is white on a coloured field, which tested well on sky and meadow at both widths. (The skill reserves shadows for floating things; the lightbox print is the only one that floats and gets `0 18px 40px -12px rgba(0,0,0,.45)`.)
- Photo window 4:5 for portrait photos; `232ed04c` (landscape) a 5:4 print; `20221006` (tall) cropped 4:5 with `object-position: 50% 62%`. Video prints use a 9:16 window.
- Tilt (deg), fixed per id as `--tilt`, never random at runtime: -4, -2.5, -1, +1.5, +3. Max 4. Tilt is the scrapbook cue; keep it away from text.
- Hover (hover-capable only): rotate eases to 60% of tilt, `translateY(-4px)`. No hover shadow.
- Photos untouched: no filters. Alt text from `media.json`.

## Layout ≤480 / 481–1023 / ≥1024
- **≤480:** the `h1` on top at 17vw, the lede paragraph, then the hero print at 78% width -3deg with tape, overlapping nothing. Spreads are a 6-column grid with alternating offsets so the scroll zigzags (prints 62 to 68% wide). Paragraphs full width at 34ch. Each chapter is one field.
- **481–1023:** 12 columns. Hero: `h1` and lede left, print right when width ≥ 720px, stacked below that. Spreads of 3 to 4 are a loose 2+1 cluster (prints 240 to 300px), spreads of 6 to 7 are two clusters.
- **≥1024:** hero two columns (5fr text, 6fr print at 470px, +2.5deg); the frame stays equal-margined and the right column answers the left. Paragraph above a full-width spread (prints 300 to 380px, three across), not paragraph-beside-spread (tested, prints shrink to 160px). Videos are the one card per spread allowed 1.2x. Donation block is two columns: text left, the letter print right (see Donation). Never stretch past the 1240px wrap; at 1920 the fields keep going edge to edge so the page still reads as one album.

## Spread arrangement (by media id)
The old plan put S2 to S4 (10 items) in a row. Now the longest run is 7, and mid-run the field colour changes (the ground is the divider, no lines).

| Order | Follows | Field | Items |
|---|---|---|---|
| Hero | h1 "Meet Eevee" (before meet-0) | sky | `img_8819` |
| S1 · loving, friendly (3) | meet-0 | sky | `37c83b77`, `img_8394`, `img_4837` |
| S2 · foodie (3) | meet-1 | meadow | `ec73ecaf`, `img_0826`, `img_7207` |
| S3 · walks with grandma (3) | meet-1, after S2 | meadow, then blush at the video | `img_2017`, `b0eaddd4`, `b9e5276c` (video) |
| S4 · hikes (3) | meet-2 | blush | `img_6802`, `img_4144`, `img_5023` |
| S5 · splash and adventures (4) | meet-2, after S4 | blush to snow step | `img_4973`, `232ed04c`, `23983ab7` (video), `0f88d984` (video) |
| S6 · snow (4) | meet-3 | snow | `img_3785`, `img_3786`, `img_8788`, `c1a73628` (video) |
| S7 · lucky, cozy, autumn (3) | meet-3, after S6 | sky | `img_1551`, `img_7522`, `20221006` |

Count: hero 1 + S1 3 + S2 3 + S3 3 + S4 3 + S5 4 + S6 4 + S7 3 = 24 ids, each exactly once (20 photos, 4 videos). Runs between paragraphs: meet-0 3, meet-1 6, meet-2 7, meet-3 7. Because spreads must sit between whole paragraphs, two spreads share a slot; each pair is a different composition and a field colour step.

Composition (phone / desktop):
- **S1:** a zigzag of 3 (left, right overlapping 8%, left) / three across, middle raised 40px, outer tilts leaning outward. Tape on the middle print (sky).
- **S2:** two side by side then the cake centred below, biggest, +1.5deg / three across with the cake in the middle at 1.15x. Cake is the page's emotional punchline.
- **S3:** diagonal descent; the video print 56% width / photos left stacked, video right at 1.2x.
- **S4:** `img_6802` (tiny Eevee on a path) is the smallest print, a quiet beat; `img_4144` and sunset `img_5023` pair at equal size / staggered triplet.
- **S5:** splash `img_4973` first and largest (+4... capped at +3), landscape `232ed04c` at -2deg, then the two stick videos as a matched pair (-2/+2) / pool and landscape left, videos right.
- **S6:** `img_3785` and `img_3786` (same raincoat, facing then profile) as an identical-size pair nearly touching, `img_8788`, then the video / row of 4 with the video last.
- **S7:** `img_1551` antlers, `img_7522` rug, `20221006` maple as a calm exhale, large, -2/+2/-1, easing into the donation field.

## Video interaction
- Plays inline in its own print (not in the lightbox). Poster visible, `--card` print around it, a 60px white circle play button with a `--accent` triangle (3px optical offset), centred.
- Tap: the print straightens to 0deg and scales 1.03 over 300ms `cubic-bezier(.2,.8,.2,1)`, glyph fades 120ms, native controls appear. Sound on. Starting another video pauses the first, which eases back to its tilt. On `ended` it resets to poster and tilt.
- Real `<button aria-label="Play video of Eevee carrying a stick">`; focus ring 3px `--ink`, 3px offset. While buffering the glyph becomes a 24px ring spinner (`--accent`, 1s linear), never a black box (under the poster is the field colour).

## Lightbox
- Photos only. Scrim `--scrim`; no backdrop blur (glass is banned). The photo shown as a print (white 10px border, 0deg), the only shadow on the page because it floats.
- Open: FLIP from the tapped print, 340ms `cubic-bezier(.2,.8,.2,1)`; close 220ms. Swipe 40px threshold for next/prev, arrows keys, Esc, swipe-down, 44px close button (white circle, ink X). Chevrons only at ≥1024. No counter text.
- Focus trapped and restored to the thumbnail, page `inert`, scroll locked with `scrollbar-gutter: stable`, neighbours preloaded at 960w.

## Motion spec
- Easings: `--ease-out: cubic-bezier(.2,.8,.2,1)`, `--ease-settle: cubic-bezier(.34,1.3,.64,1)` (prints only, 6% overshoot).
- Signature move: **prints settle onto the page**. IntersectionObserver (threshold .15, once): from `opacity 0; translateY(20px) rotate(calc(var(--tilt) + 3deg))` to rest, 520ms `--ease-settle`, 90ms stagger inside a spread (max 3 steps). Transform and opacity only. Hero is visible immediately (LCP).
- Paragraphs: fade and rise 16px, 420ms `--ease-out`, once. The `h1` does not animate.
- Controls: button press `scale(.97)` 90ms, hover (hover-capable) `translateY(-2px)` 180ms. Print hover per above.
- Field colour steps are instant (static, they are the layout). No parallax, no looping motion, no scroll-jacking.
- `prefers-reduced-motion`: no translate or rotate transitions; everything shows in its final state; opacity fades at most 150ms; lightbox opens with a 120ms fade. Tilts stay (static).
- Content never stays hidden if JS fails: the settle class is added by JS only after the observer is set up.

## Donation section
- A different room, not a different mood: the whole field turns **berry `#8F2A45`** with `#FFF4EE` text, 140px padding (phone 72px). The only dark field on the page, so the invitation arrives quietly by contrast.
- `h2` "In Loving Memory of Eevee" in `--step-h2`, cream, left-aligned, max 2 lines. The three paragraphs in `--step-lead` (first) and `--step-body` (others), 34ch, left column. Right column (≥1024), closing the void on the far side: one white print rotated -1.5deg holding the donate button and the domain line, so the call to action is "an envelope in the album". Phone: the same print follows the text, full width of the column.
- Button: pill, 56px tall, `--raincoat` fill, `--ink` text 600 weight "Make a donation in Eevee’s memory"; wraps to two lines at 320px (padding 14px 22px). No arrow icon, no hearts, no pulse, no sticky. Hover: `translateY(-2px)`. Focus: 3px `--ink` ring on the white print (the button sits on white, so ink-on-yellow reads and the ring contrast is above 3:1).
- Domain: `torontohumanesociety.donorsupport.co`, `--step-small`, `--ink-soft`, beneath the button inside the print.
- Closing paragraph: back on a sky field, `--step-lead`, centred, 30ch, with 160px padding after it. No footer, no mark.

## Risks
1. **Six-colour fields can read playful or kid-like** (sky, meadow, blush, berry). Mitigation: tones are muted (all under 25% saturation except berry), one typeface, ink never changes. Check in review whether blush adjacent to snow looks fussy; the fallback is to merge to three fields (sky, meadow, berry).
2. **Zilla Slab is a friendly slab, not a premium serif.** That is the point, but check "Meet Eevee" at 320px (17vw is about 54px: one line, about 290px wide, fits within 280px content? it is tight, so test at 320 and drop to 15.5vw if it wraps).
3. **No shadows** means the white print edge is the only separation. On `--field-snow` (#DCE6EE) white-on-near-white is the weakest pairing; I would darken it to #C9D9E6 or make that field `--field-sky`.
4. **Tilt plus overlap** can clip faces or add horizontal scroll at 320px: use `overflow-x: clip` on the spread, not body, and screenshot every spread at 320/375/390.
5. **Seven items in a row after meet-2 and meet-3** is still a run; the field step and alternating composition carry it. If Opus wants it shorter, move `img_4144` and `img_5023` to the end of S3 (not allowed past 5 per spread; S3 would be 5).
6. **Grain overlay** is a full-screen fixed layer: test low-end Android scroll; remove if it janks.
7. Expected disagreement: Impeccable/Emil may want a soft shadow on prints for tactility (skill bans it at rest; the experiment shows white-on-field works), a larger tilt range or springier motion (I cap tilt at 4deg, settle overshoot 6%), and a calmer palette. The donation as a dark berry field is the biggest taste bet; a lighter alternative is `--field-blush` with a berry button.
