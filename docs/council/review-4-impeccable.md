Round 4 · impeccable · viewports/engines tested: Chromium only (host machine loaded). 1440x900 and 390x844. Scoped to I8 and E9 as asked; no other sweeps repeated.

Round-3 finding:
- I8 (focus ring hidden under an overlapping print): FIXED. Focused prints now compute `z-index: 6` and `outline: solid` (`main.css:159-160`). Screenshots show the full ring on all four sides for `ec73ecaf` and `img_3785` and `img_4144` at 1440, and for the video prints `0f88d984`, `b9e5276c` and `c1a73628` at 390 (`.superpowers/shots/review-4/impeccable/sheet.jpg`, `ring-1440-*.png`, `v390-*.png`). The overlapping neighbour no longer paints over the ring or the focused photo's edge. Hit-test sampling: no photo print has a ring sample point that lands on another print at 1440. The few remaining samples on video and `img_4973` prints at 390 (1 to 5 of 20) only mean a neighbour's box sits next to the ring. The screenshots show them painted below the focused print, so the ring is intact.

E9 (stretched tap target) checks:
- Accessible name unchanged: `.polaroid__open` labels still read "Open photo: <alt>". The video button label reads "Play video: <alt>" (the video's disc has no stretched `::after`, `position: static`). `.polaroid__open::after` is `position:absolute` with `inset: -pad -pad -pad-bottom` (-16/-16/-56 on the 1440 hero, -10/-10/-36 on a 390 print), so the target is the whole print frame and the button's name is unchanged.
- Focus order unchanged: at both widths the order is donate link first (wraps from the end), then `img_8819`, `37c83b77`, `img_8394`, `img_4837`, `ec73ecaf`, `img_7207`, `img_0826`, `img_2017`, `b9e5276c`, `b0eaddd4`, `img_6802`, `img_5023`, `img_4144`, `img_4973`, `23983ab7`, `232ed04c`, `0f88d984`, `img_3785`, `img_3786`, `c1a73628`, `img_8788`, `img_1551`, `img_7522`, `20221006`, then the donate link. This is DOM order and the same as round 3. Same sequence at 1440 and 390.
- Ring still around the whole print: yes, drawn on the level `<figure>` as before (see screenshots).
- No click stealing: at 1440 and 390, hit-testing a 5x3 grid of points over the donate link, meet-1, meet-2, memory-2, closing-0 and the h1 returned the element itself (or a child) for every point (0 of 15 stolen in all six, both widths). The stretched `::after` does not extend into any text or the donate button.

No new findings.
SIGN-OFF: yes
