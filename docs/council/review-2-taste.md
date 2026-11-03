Round 2 · taste · viewports/engines tested: Chromium at 320x568, 390x844, 768x1024, 1024x768, 1440x900, 1920x1080, 844x390 (slow scroll then full page; no console errors, scrollWidth == clientWidth everywhere, 0 `.is-pending` left) plus WebKit iPhone 13 (390 at DPR 3, full page, renders identically to Chromium, no horizontal scroll). Shots: `.superpowers/shots/review-2/taste/` (`d1440-0..3.png`, `d1920-0..3.png`, `p768.png`, `wk-a/b/c.png`, `cr-*-full.png`).

Round-1 verification
- T1 orphan/lopsided desktop rows: FIXED. S4 and S6 are four across with raised lead and offsets, S7 is a row of three with the maple lead in the middle at 1.2x, S1/S2/S3/S5 are clean rows. No orphans at 1024, 1440 or 1920 (`d1440-1.png`, `d1440-2.png`, `d1920-2.png`).
- T2 width use at ≥1440: FIXED, with a caveat (nit below). Wrap is wider (content ~1250px at 1920), hero print is ~520px, the album no longer looks like a small card in a big field. Spread prints still top out around 300 to 350px at 1920, not the 440px clamp.
- T3 alternating paragraph column and centred donation: FIXED. meet-1 left, meet-2 right (col 7), meet-3 left; the donation column is centred with text left-aligned and the button and domain on the same left edge. The alternation reads as a deliberate rhythm because each right-shifted paragraph sits directly over a full-width spread that bridges both halves (`d1440-1.png`). It would read as arbitrary only if the spread under it were narrower than the wrap, which it is not.
- T4 one text left edge at 481 to 1023: FIXED. At 768 the hero text and every paragraph share x=64 (`p768.png`).
- T5 tape on `img_7207` hidden at 390: FIXED. The sun-yellow tape is fully visible over the lead cake print in both Chromium and WebKit.
- T6 phone chapter pad 56px: FIXED. Colour between the last print and the next paragraph is visibly shorter at 390 (`wk-b.png`).

Fresh-eyes verdict: 390 and 320 are the strongest widths; the phone album is hand-laid and varied. 768 is good (hero stacked, 2+1 collages). 1440 and 1920 now use their width well and every field is symmetrical or deliberately alternated. The donation field is calm: blush field, centred 36ch column, the berry button is the only strong colour on it; the thank-you field closes the page with space. Nothing feels too wide: the 1250px content cap at 1920 leaves about 330px of blank field each side, which suits the spec.

Findings
[nit] Desktop rows are now very regular — ≥1024, S1/S2/S3/S5/S7 are all single straight rows of three at the same height, S4/S6 four across; every spread has the same shape, so the desktop loses some of the hand-laid feel the phone has — `d1440-0.png` to `d1440-3.png`. Optional, cheap variety: let one pair per row overlap by 24 to 32px (the S6 raincoat pair `img_3785`/`img_3786`, the S2 cake over `ec73ecaf`), raise the lead to 1.25x with ±48px offsets on S2 and S7, and let S5's landscape print sit 40px lower than its two videos. Not a blocker for the family.
[nit] At ≥1440 spread prints do not use the 440px clamp — 1440 and 1920, 3-up spreads (S1, S2, S3, S5, S7): prints are ~300px at 1440 and ~340px at 1920 inside the 1250px wrap, so the photos feel slightly small at 1920 relative to the hero. If wanted, allow 3-up prints up to 400px and lead 460px at ≥1600; keep 4-up at ~300px.
[nit] Body text at 1920 stays at 21px next to a 520px hero print; the paragraphs under S2/S4/S6 look small there (`d1920-0.png`). Optional: `--step-body` upper bound 1.5rem at ≥1600px.

SIGN-OFF: yes
