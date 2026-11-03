# Round 2 triage (Opus)

Sign-offs: Taste **yes** (0/0/3), Impeccable **yes** (0/0/2), Emil **no** (0/1/1). All round-1 items were verified FIXED by their seats. Full suite: 404 passed, 0 failed. Lighthouse mobile: Perf 97, a11y 100, LCP median 2.6s (Ruling R14: re-measure live).

The owner asked for "best taste", so cheap polish nits are taken as well. They go to one fix batch.

## Accepted
| ID | Sev | Fix (binding) |
|---|---|---|
| E7 | should-fix | Video posters never show as an empty box. Keep the poster IO, and after `load`, once idle (`requestIdleCallback` with a `setTimeout` fallback, timeout 3000), set `poster` on all four videos. Test: with poster requests delayed, jump-scroll to a video 4s after load and assert `video.poster` is already set. |
| E8 | nit | `.polaroid__window` placeholder background uses the containing field's colour mixed toward white (e.g. `color-mix(in srgb, currentField 70%, white)` via a `--field` custom property set per section), not `#E9E4DE`. |
| I7 | nit | No-JS: `html:not(.js) .video__play { display:none }` and `html:not(.js) .polaroid__open { cursor:default }`. |
| T7 | nit | Desktop (≥1024) hand-laid variety while staying orphan-free: the S6 raincoat pair (`img_3785`/`img_3786`) overlaps by 28px; in S2 the cake (`img_7207`) overlaps `ec73ecaf` by 28px; the lead is 1.25× with ±48px vertical offsets in S2 and S7; S5's landscape print sits 40px lower than its two videos. Overlap must never cover a face (check screenshots). The overlapped print's z-index is below the lead. |
| T8 | nit | At ≥1600, 3-up spread prints go up to 400px and the lead up to 460px. 4-up stays at about 300px. |
| T9 | nit | At ≥1600, `--step-body` upper bound is 1.4rem (lead and h1 unchanged). |

## Rejected / no action
| Item | Reason |
|---|---|
| Impeccable: src-less lightbox `<img>` | No rendering or a11y effect, as the seat notes. Adding a placeholder src would cost a request. |
