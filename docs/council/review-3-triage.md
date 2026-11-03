# Round 3 triage (Opus)

Sign-offs: Taste **yes** (0/0/1), Impeccable **no** (0/1/1), Emil **no** (0/1/0). All round-2 items were verified FIXED.

## Accepted
| ID | Sev | Fix (binding) |
|---|---|---|
| I8 | should-fix | A focused print rises above its neighbours so its focus ring is fully visible. Use `.spread .polaroid:has(:focus-visible)` and a `:focus-within` fallback, both with `z-index: 6` (above the tape and overlap layers). Test: focus `ec73ecaf` at 1440 with the keyboard; `elementFromPoint` at its ring's overlapped edge returns the figure or its descendant. |
| E9 | should-fix | The whole print is the tap target. **Photos:** a stretched-target pseudo-element on `.polaroid__open` (`::after { content:''; position:absolute; inset: calc(-1 * var(--print-pad)) … covering the frame incl. the bottom margin }`), positioned against `.polaroid__tilt`, so a tap on the white frame opens the lightbox. No JS delegate is needed. **Videos:** before first play, a click anywhere on the print (frame or poster) starts playback through the same synchronous `start()` path (a figure-level delegate is fine). After playback starts, the frame must not intercept the native controls. `cursor:pointer` goes on the whole print. Tests: clicking the bottom white margin of a photo print opens the lightbox; clicking the bottom margin of a video print (before play) plays it; after play, clicking the native controls area does not restart it. |

## Rejected / no action
| Item | Reason |
|---|---|
| Taste nit: the gap between the S6 pair and the video at 1024 is slightly wide | Within tolerance, and caused by the 28px overlap. Not worth another layout pass. |
| Impeccable nit | See review-3-impeccable.md. Polish only, no user-facing defect. |
| WebKit E5 not re-verified (sandbox stall) | It passed in round 2 and in the suite's mobile-safari project. The real-phone check goes on Erfan's list. |
