Round 3 · taste · viewports/engines tested: Chromium at 390x844, 1024x768, 1440x900, 1920x1080 (slow scroll then full page; no console errors, scrollWidth == clientWidth at all four, 0 `.is-pending` left). WebKit was clean in round 2 and no CSS affecting it changed in the areas I verified this round, so I did not repeat it. Shots: `.superpowers/shots/review-3/taste/` (`cr-1440-p0..3.png`, `cr-1920-p0..3.png`, `cr-1024-p0..2.png`, `cr-390-p0..3.png`).

Round-2 verification
- T7 desktop hand-laid variety: FIXED. S2: the cake print (`img_7207`, 1.25x lead, yellow tape) overlaps `ec73ecaf` by about 28px and sits 48px lower than its neighbours; the overlap lands on that print's far right edge (tail and floor), nowhere near her face, and the lead stays on top (`cr-1440-p0.png`). S6: `img_3786` overlaps `img_3785`'s right edge over plain snow, both faces clear, the video sits lower (`cr-1440-p2.png`). S5: the landscape print `232ed04c` sits visibly lower than the two videos (`cr-1440-p1.png`). S7: maple lead 1.2x raised in the middle, antlers and rug prints offset, no overlap. The 4-up spreads (S4, S6) keep touching edges but no covered subject. No overlap covers a face at 1024, 1440 or 1920.
- T8 bigger 3-up prints at ≥1600: FIXED. At 1920 the 3-up prints are about 410px and the lead about 450px, 4-up stay about 300px; the album now sits comfortably in the 1920 field (`cr-1920-p0.png`, `cr-1920-p2.png`).
- T9 body 1.4rem at ≥1600: FIXED. Paragraphs under the spreads read at a size that matches the print scale; lead and h1 unchanged. Slightly larger body now sits closer to the lead size (about 22px vs 28px); distinct enough.
- Field-tinted placeholders (E8): FIXED. No grey boxes seen while scrolling at any width; the lazy prints load into field-coloured windows.

Fresh-eyes whole-page pass
- 390: hero lands (h1 plus most of the print), the lead-print stagger and 2-up overlaps read as a hand-laid pile, the tape on the cake print is visible, videos are single and centred, the donation field is calm with a full-width berry button, the thank-you ends the page with room. Nothing regressed.
- 1024: alternating columns, four-across S4 and offset rows all fit without clipping; the S6 gap between the overlapped pair and the video is a touch wider than elsewhere but reads as rhythm.
- 1440 and 1920: the desktop now feels hand-laid instead of ruled: varied heights, three deliberate overlaps, lead prints that actually lead. Alternating text columns (left, right, left) read as intentional. The centred donation column is the quiet room it should be. No orphan rows, no dead zones, no template tells (no shadows beyond the hairline contact edge, no ornaments, one typeface, flat field colours).

Findings
[nit] At 1024 the S6 raincoat pair overlap leaves a larger gap before the video print than between the other prints in that row (`cr-1024-p1.png`, last row). Optional: reduce the row gap by about 16px at 1024 to 1279 so the four prints read evenly. No action needed for sign-off.

No blockers, no should-fixes.

SIGN-OFF: yes
