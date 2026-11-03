# Round 2 · Taste seat, cross-critique

Read: `r1-impeccable.md`, `r1-emil.md`, and opened Emil's prototype (`.superpowers/council-ref/emil/index.html`) at 390px. Observations from that screenshot: the prints are uniform, same width, same height, stacked in a rigid two-column ladder with almost no overlap, and the photos look vertically stretched (an `img` height attribute with no `height:auto`, the same bug I hit). It proves the lightbox and press feel, but it reads as a photo catalogue, not a hand-laid album. Fix is in Adopt.

## Adopt
From **Emil**
- Everything in the lightbox: WAAPI FLIP from the tapped print, `cubic-bezier(.32,.72,0,1)` 280ms open / 220ms close, keyboard actions 0ms, swipe with axis lock, velocity commit, swipe-down dismiss, `history.pushState` for the back gesture. My r1 lightbox was thinner; his is better and I defer to it.
- Press feedback on `:active` (scale .97, 100ms in, 200ms out), hover only under `(hover:hover) and (pointer:fine)`, tilt as a CSS variable so hover and press compose.
- Videos pause when they scroll under 10% visible (his IntersectionObserver rule). Impeccable says never auto-pause on scroll; I side with Emil, since sound from an off-screen video is worse than an interrupted listen.
- The playing video print straightens to 0deg, as in my r1 as well.
- Tap targets and `-webkit-tap-highlight-color: transparent` base list from mobile-native.

From **Impeccable**
- Native aspect ratio per photo from `media.json`, with `20221006` the only crop (3:4, `object-position: 50% 68%`) and `232ed04c` the one landscape print. Better than my 4:5-for-all; the hero must stay portrait. I take the 3:4 window.
- Spread/run balance and the observation that meet-2 and meet-3 are heavy: their 3|6|8|6 matches Emil's; mine is 3|6|7|7 and I keep mine only because it is a point lighter on one run.
- `<dialog>` for the lightbox, 20 polaroid `<button>`s with distinct alt text, the rotation on an inner wrapper so the focus ring stays axis-aligned, no visible counter, an `aria-live` position for screen readers only.
- The reading-order point: donation D2 says "the link below", so the button follows D2 and D3 ("no pressure") comes after the button. I had the button after all three paragraphs. Impeccable is right; it also makes D3 the release valve.
- Contrast discipline: do not use a mid-tone as running text or as text on a coloured field below 4.5:1; my tokens already computed.
- Headline sizing: `text-wrap: balance`, h1 not above two lines.
- Focus ring in a colour that is not part of the palette hue family (`#1D4E89`), 3px, 3px offset. Better than my plain ink ring on yellow.

## Reject (why)
- **Fraunces + Nunito pairing (Impeccable) and Nunito-only (Emil).** Nunito in orange on a butter/cream ground is exactly the mockup the owner called "less elegant", and the skill I carry lists soft-serif display and yellow-cream grounds as registered generated-page tells. Neither seat's palette (butter + burnt amber, or sunny cream + orange `#E08A1E`) is a decision; it is the category default. I keep one family (Zilla Slab) and per-chapter colour fields from Eevee's own world.
- **Soft drop shadow on every print (both seats).** It is what makes the page look like a template scrapbook widget. White prints on coloured fields stand off by tone; I tested it at 390 and 1440 and they hold. A shadow stays only on the lightbox print, which floats. If the council insists, take Impeccable's two-layer shadow, never Emil's hover shadow-on-pseudo-element growth, and never both.
- **Sun-disc SVG breaks and a wavy top edge on the donation band (Impeccable); sun/heart/paw marks (Emil's hedge).** Decorative shapes and mask edges are what make a page read as "AI warm". The field colour change is the divider.
- **Donation as a rounded 28px card on cream (Emil).** Card-in-cream is the stock "callout box". See the donation answer below.
- **Tilt up to 5deg and a springy `--settle` overshoot on every print (Emil).** Fine as a one-time settle, but cap tilt at 4deg (Impeccable's number) and the overshoot at 6% (mine). Anything bigger tips from album into chaos on a page for a memorial.
- **A visible-only-on-keyboard hint, play labels, "3 of 20" (flagged by Emil as Impeccable's wish).** Agree with Emil: no visible counter. A screen-reader-only count is fine.
- **Tape on at most one print per spread (Impeccable) vs none (Emil).** Keep tape, but fewer: 1 in 3 across the page, never in the first three prints a visitor sees, so the hero is clean.
- **Emil's "no native controls, 3px progress line" video control.** Fine in principle, but the spec explicitly allows native controls and iOS fullscreen/volume matter for a four-clip page. Use native `controls` after first play (Impeccable); keep Emil's straightening, disc fade and buffering ring.

## Question 1: should phone spreads go 2-up?
Yes, mostly. My 390px experiment (one print per row at 62 to 68% width) makes a long, monotonous column, and the spec's goal is that the page feels like scrubbing through a pile of photos. All three seats now agree on a staggered 2-up. My position, specific:
- **Default 2-up**: prints 48 to 52vw (about 190px at 390), alternating left/right, 10% overlap, vertical offset 16 to 24px, mixed tilts. A 3-spread is 2 + 1.
- **But not as a uniform ladder** (Emil's prototype reads like a contact sheet): every spread has one "lead" print at 64 to 70vw and, if there are four or more, the rest are 2-up beside or under it. Videos are always single, 58 to 62vw (a 9:16 print at 48vw would be a thumbnail you cannot hear).
- Check at 320: 2-up prints are 154px; faces still read in every photo except `img_6802` (tiny dog in a trail), which is meant to be a small beat anyway.
- Do not squash all spreads to the same tidy rhythm: hero 1-up, S1 lead plus pair, cake lead, video lead, etc. as in my r1 arrangement.

## Question 2: is the berry donation field too heavy?
Yes. A full-bleed deep `#8F2A45` is the heaviest object on the whole page. It makes the donation the loudest colour event, which is the opposite of "quiet invitation" and nudges toward a campaign banner. I withdraw it as the field.
Change to: a soft **blush field `#F3D9CF`** (the next-warmest of the chapter colours, no surprise), ink text, and the berry used only for the button (`#8F2A45`, white text 7.4:1) sitting on a white print. The visitor still feels the page change room, but by a tone step and the print, not by a dark wall. Keep the white letter print tilted -1.5deg at the right; remove nothing else. Do not add the wavy edge or sun disc. The closing paragraph returns to the sky field. Yellow raincoat stays for tape only, not the button.

## Hard objections
1. **Orange or amber headings on cream/butter, anywhere.** Whether it is Emil's `#E08A1E` or Impeccable's `#8F4A00`, this is the generated look and the exact thing the owner wanted lifted off. A heading in warm brown on a colour field is fine. I will object in review if the built page's first screen is cream-plus-orange.
2. **One uniform print size and straight rows at phone width** (the pattern in Emil's prototype). It would read as "a gallery grid with a rotate on it". Needs a lead print per spread and a real overlap.
3. **Decorative marks (suns, hearts, paws, waves, scribbles) used to say "warm".** For a memorial of a specific dog they read as stock. The warmth is Eevee: her photos at full size, her colours as the fields, one friendly slab.
4. **The donation presented as a distinct boxed callout with a loud colour.** Quiet invitation means the same print language and a calm field; the pressure-release paragraph D3 stays visible directly under the button.
5. **Stretched or wrongly-cropped photos** (Emil's prototype shows it). Faces are the whole point; every print uses the native ratio, `height:auto`, no 4:5 force-crop except `20221006`.
6. **Hero not the largest print with the h1 beside or above it on the first screen.** At 390 the first screen must be h1 plus most of the hero. If text above the hero pushes it below the fold, it fails (my experiment put the lede above the hero; I'd now place the lede below it).
