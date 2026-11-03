# Round 1 triage (Opus)

Inputs: `review-1-taste.md` (0 blockers / 3 should-fix / 4 nits), `review-1-impeccable.md` (0/2/5), `review-1-emil.md` (0/3/4), plus Lighthouse mobile (local): Performance **86** (target ≥90), Accessibility 100, Best Practices 100, SEO 100. LCP 4.1s (target <2.5s; 89% of it is *render delay* on the hero), CLS 0, TBT 0, 783 KiB. Render-blocking CSS ~460ms (two stylesheets). Responsive images waste 328 KiB (e.g. `img_8394-960`, `img_8819-960`, `img_7207-960` served where smaller would do).

All accepted items go to the builder as ONE fix batch. IDs are referenced in commits and tests.

## Accepted

| ID | Sev | Source | Fix (binding) |
|---|---|---|---|
| P1 | blocker | Lighthouse | **Hero LCP under 2.5s on Lighthouse mobile.** Render delay dominates, likely AVIF decode under 4× CPU throttle and/or two render-blocking stylesheets. Required: (a) merge `spreads.css` into `main.css` (one stylesheet) or inline the critical CSS for the first field; (b) add `<link rel="preload" as="image" imagesrcset=… imagesizes=… type="image/webp" fetchpriority="high">` for the hero, and serve the hero **WebP first** (drop AVIF for the hero only; it decodes faster on low-end CPUs); (c) the hero `img` uses `decoding="sync"` or omits `decoding`. Measure and iterate until Lighthouse mobile Performance ≥90 and LCP <2.5s locally. Record the before and after numbers. |
| P2 | should-fix | Lighthouse | Correct `sizes` for every print, matching the real rendered widths per breakpoint (2-up phone ≈ 46–50vw, lead 64–70vw, desktop ≈ 260–440px). The lazy images must stop pulling 960w where 480w suffices. Verify that Lighthouse "uses-responsive-images" passes or is <50 KiB. |
| T1 | should-fix | Taste | Desktop ≥1024: no orphan or lopsided rows. 4-item spreads (S4, S6) go **four across** (`repeat(4,1fr)`), vertical offsets ±32px, lead raised. S7 is one row of three with `20221006` (lead) in the middle at 1.2×. Check every spread at 1024, 1440 and 1920 for orphans. |
| T2 | should-fix | Taste | Width use at ≥1440: print width clamp up to 440px (lead 1.2×); `--wrap: 1320px` at ≥1600px; hero print about 520px at ≥1440. Text sizes unchanged. |
| T3 | should-fix | Taste | ≥1024, paragraph above the spread, but **alternate the column**: meet-1 left (cols 1–5), meet-2 right (cols 7–12), meet-3 left. The donation field centres its single 36ch column in the wrap (`margin-inline:auto`, text stays left-aligned, button and domain share that left edge). Closing stays centred. |
| T4 | nit | Taste | 481–1023: one consistent text left edge. Use a centred 36rem column for every paragraph *and* the hero text, with the hero stacked when <720px. |
| T5 | nit | Taste | Tape on `img_7207` is hidden under the previous print at 390. Raise that print's z-index above its neighbour (or apply that to whichever print carries tape). |
| T6 | nit | Taste | Phone `--chapter-pad` is 56px at ≤480. |
| I1 | should-fix | Impeccable + Emil | Short screens (`max-height: 500px`): the lightbox stage's vertical padding/reserve is `max(12px, safe-area)`, so the photo is about 360px tall at 844×390. The close button stays top-right over the scrim. |
| I2 | should-fix | Impeccable | Each `<video>` gets an `aria-label` equal to its play-button label text (from the generator). |
| I3 | nit | Impeccable | `.video__play` hit area at least 72×72 (the disc stays 64px). |
| I4 | nit | Impeccable | `motion.js`: a `focusin` on a pending print reveals it instantly (no transition). |
| I5 | nit | Impeccable | Landscape phone (`orientation: landscape` and `max-height: 500px`): the hero print is no taller than about 85vh, so her face is on the first screen. |
| I6 | nit | Impeccable | Lightbox scrim alpha .97. |
| E1 | should-fix | Emil | The lightbox never waits on the network. Seed the lightbox image from the origin print's `currentSrc` (clear `<source>` srcsets), start the FLIP and scrim immediately, then upgrade to 960w and later 1600w after decode. |
| E2 | should-fix | Emil | Video tap: add `is-buffering` immediately on tap (the spinner replaces the glyph, with no fade-out and pop-back) and remove it on `playing`. Hide the disc only for `.is-playing:not(.is-buffering)`. `.video__play:active::before { transform: scale(.92) }`, 100ms in and 200ms out, `--ease-out`. |
| E3 | should-fix | Emil | Swipe commit flash: in `swap()` set `img.style.opacity='0'` before `a.cancel()`, then after decode start the entrance with `fill:'backwards'` and clear the inline opacity in the same tick. |
| E4 | nit | Emil | `COMMIT_VEL = 0.25`, `MIN_COMMIT_PX = 40` (the 22% distance rule stays). The DESIGN-SYSTEM is updated to match. |
| E5 | nit | Emil | On `ended` only, call `v.load()` so the poster returns. A scroll-away pause keeps its position. |
| E6 | nit | Emil | popstate: if the lightbox is not open and `history.state?.lb` is set, call `history.replaceState(null,'')` (no dead forward entry). |

## Rejected / no action
| Source | Item | Reason |
|---|---|---|
| Impeccable nit | Focus ring floats a few px off a tilted card's corners | The seat itself asks for no change. A level ring is the DESIGN-SYSTEM §4 choice. |
| Taste nit | h1 6.5rem at 1920 | Optional and only if needed. T2 keeps text sizes, so the h1 stays at 6rem. |
| Emil nit | iPhone-hardware checks (press, rubber-band, pinch then swipe, silent switch) | Can't be verified here. They go on the list for Erfan's real-phone review (Task 10). |
