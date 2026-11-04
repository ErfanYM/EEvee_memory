Round 6 · impeccable · closing section only (DESIGN-SYSTEM §12) · Chromium at 320x568, 375x812, 390x844, 640x450 (200% zoom proxy), 768x1024, 1440x900, 844x390 landscape. Screenshots: `.superpowers/shots/review-6/impeccable/close-*.png`, `sheet.jpg`.

Measured per width (text column width, characters per line, font size):
- 320: 144px, about 17ch, 18px, 10 lines.
- 375: 185px, about 21ch, 18px.
- 390: 194px, about 22ch, 18px.
- 640: 230px, about 21ch, 23px, 11 lines.
- 768: 330px, about 29ch, 24px.
- 1440: 363px, about 27ch, 28px.
- 844x390: 334px, about 28ch, 24.7px.

[should-fix] At 481–767 px (including 200% zoom of a 1280 desktop, which is 640 css px) the print takes its full 320px first and leaves the text a 230px column of about 21 characters at 23px, so "Thank you for remembering Eevee" breaks into 11 short lines and the farewell reads as a narrow ribbon beside a big photo — `main.css:250` `grid-template-columns: minmax(200px, 320px) minmax(0, 30ch)` — measured at 640x450: print 320 wide, text 230 wide, `close-640x450.png`. Fix: in the `@media (min-width: 481px)` block use `grid-template-columns: minmax(160px, 38%) minmax(0, 30ch)` and restore the 320px cap only from 1024 up: `@media (min-width: 1024px) { .closing { grid-template-columns: 320px minmax(0, 30ch); } }`. At 640 that gives about a 215px print and a 330px (28ch) text column; at 768 about 255px print and 330px text.
[nit] At 320 the column is 144px (about 17 characters) and the second line is a single word ("remembering" sits alone), with 10 lines in total. Size is already the minimum allowed (18px, equal to body), so widen the text instead — `main.css:243` `minmax(120px, 40%)` at ≤480. Fix: `@media (max-width: 480px) { .closing { grid-template-columns: minmax(96px, 34%) minmax(0, 1fr); column-gap: 14px; } .farewell { margin-left: -4px; } .closing .copy { text-wrap: pretty; } }`. That gives about 170px (20 to 21ch) at 320 and 200px at 390. The print stays readable at 96px.
[nit] At 844x390 landscape the print is 320x456, taller than the 390px screen, so on a phone turned sideways the print is cropped at the bottom edge of the viewport. Fix: `@media (max-height: 500px) and (orientation: landscape) { .closing { grid-template-columns: minmax(160px, 240px) minmax(0, 30ch); } }` (the print becomes about 342px tall).
[nit] Alt text and reading order. The DOM order is print then text, matching the visual order (print left). A screen reader announces "Eevee smiling up at the camera in the snowy woods" immediately before the family's thank-you, a second description of the hero photo the listener heard at the top of the page. For a farewell I would rather let the words come first. Fix (either): give the farewell `<img>` `alt=""` (it duplicates the hero and carries no new information), keeping the DOM order; or if the owner wants it announced, keep the alt and leave the order. I would pick `alt=""`. Not a blocker either way.

Checked and OK:
- Size: text is 18px at ≤480, equal to body (18px), and the lead size (23 to 28px) above that, so never below body. Weight 500.
- Contrast: `--ink` `#2B2118` on the sky field, 11.6:1.
- Left-aligned, 0 elements focusable inside `.closing` (`a,button,[tabindex]` count is 0), and the last Tab stops are the donate link, then `20221006`, then `img_7522`, so there is no stop on the print. `pointer-events:none`.
- No horizontal scroll (`scrollWidth == innerWidth` at all seven sizes) and CLS 0 at every size.
- The print sits left of the text at every width as requested. The 40% print column at ≤480 and the 320px print at 768 to 1440 are vertically centred with the text, and at 1440 the pair is centred in the field.
SIGN-OFF: no
