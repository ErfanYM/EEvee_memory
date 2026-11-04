Round 6 (closing only) · taste · viewports/engines tested: Chromium at 320x568, 375x812, 390x844, 768x1024, 1440x900, 1920x1080 (scrolled to the end each time; no horizontal scroll, 0 `.is-pending`). Shots: `.superpowers/shots/review-6/taste/` (`phones.png` is 320 | 375 | 390 side by side, `end-768.png`, `end-1440.png`, `end-1920.png`).

Measured: closing field height 486 / 432 / 432 / 693 / 756 / 756px at 320 / 375 / 390 / 768 / 1440 / 1920. Copy font 18px at ≤480, 24px at 768, 28px at ≥1440. Copy column is 144px wide at 320, 185px at 375, 194px at 390.

Does the farewell land? Yes. The same snowy-woods smile that opened the page now closes it, so the page bookends; the print sits beside the family's thank-you rather than under a heading, and at 768 to 1920 it reads as "turn the page, there she is". At 1440 and 1920 the pair is balanced (print about 320px, copy about 360 to 390px, centred on the wrap). The tilt of -2deg echoes the phone hero and keeps the album feel. No tape is correct (the closing is not an album item).

Answers
1. Phone split: keep 40% (the current `minmax(120px, 40%) 1fr`, gap 16px). The hero is a tight close-up, so her face is still readable at 120 to 143px of frame (about 52 to 64px of face at 320 to 390, `phones.png`). Going to 44 to 46% would take the copy column to about 175px at 390 and 135px at 320, which is 14 to 17 characters per line with a ragged right edge; that costs more than the extra 12px of face gains. 17px body would break the 18px floor from the design system. No change to the split.
2. Settle: yes, it should settle in like the others, and the design system (§12) already says it should. It is currently static (`.farewell` is not a `.polaroid`, so `motion.js` never observes it). The farewell is the one moment a visitor has finished reading and is standing still, so it deserves the same quiet arrival, once.
3. Vertical balance: at ≥481 the copy is centred against the whole print including its blank 56px bottom margin, so the text sits about 28px below her face line (`end-1440.png`: text centre at y≈512, photo centre at y≈490). At ≤480 the offset is about 12px. Minor; see nit below.
4. Field and bottom padding: top 56px (phone) or 140px (desktop) and bottom 160px read as a deliberate landing; the group sits slightly high on phone (216 of 432px), which is right for a last screen with nothing after it. Leave 160px.

Findings
[should-fix] The farewell print does not settle in (DESIGN-SYSTEM §12 says it applies like any print) — all widths, `.farewell picture`, `site/assets/css/main.css` closing block and `motion.js` — it appears at rest with no arrival while every other print settles. Exact fix: make `motion.js` also observe `.farewell` with threshold `.4` and the same failsafe, then
```
.js .farewell.is-pending picture { opacity: 0; transform: translateY(16px) rotate(-5deg); }
.js .farewell.is-in picture { opacity: 1; transform: rotate(-2deg);
  transition: opacity 420ms var(--ease-out) 120ms, transform 560ms var(--ease-settle) 120ms; }
@media (prefers-reduced-motion: reduce) {
  .js .farewell.is-pending picture { transform: rotate(-2deg); }
  .js .farewell.is-in picture { transition: opacity 200ms linear 0ms; }
}
```
The copy next to it must not animate (family words are static). The print must stay visible if JS or IO fails (same failsafe as the others), and it is hidden only while below the fold at init.
[nit] Copy sits slightly low against her face — ≥481: `.closing .copy { padding-bottom: 48px; }` (about half the print's 56px blank bottom, so the text centres on the photo window); ≤480: `padding-bottom: 20px` (half the 24px blank bottom). Keep `align-items: center`.
[nit] At 768 the print and copy fill nearly the full width and the print's tilted corner comes to 36px from the edge (`end-768.png`); fine, but if cramped, use `minmax(200px, 280px)` for 481 to 1023 so the pair gets 20px more air on each side.

SIGN-OFF: no (one small fix: the settle; the rest is already good enough to ship)
