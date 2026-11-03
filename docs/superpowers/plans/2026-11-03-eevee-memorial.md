# Eevee Memorial Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a one-page memorial for Eevee in the "sunny scrapbook" style, using all 20 photos and 4 tap-to-play videos and the family's exact words, with a gentle donation invitation, deployed to GitHub Pages.

**Architecture:** A Python media pipeline turns the originals into web formats plus a `media.json` manifest. A three-seat design council (Sonnet subagents with the impeccable, Emil Kowalski and design-taste-frontend skills) agrees a design system that Opus writes up as binding. One Sonnet builder hand-writes a static `site/` (HTML/CSS/vanilla JS) against it. Playwright tests pin content, media, behaviour and layout, and the council then runs break-it rounds with playwright-skill until all three sign off.

**Tech Stack:** Python 3 + Pillow + `sips` + ffmpeg (media); static HTML/CSS/vanilla JS (site); `@playwright/test` on Node 20 (tests); GitHub Actions → GitHub Pages (deploy).

**Spec:** `docs/superpowers/specs/2026-11-03-eevee-memorial-design.md`. Executors read it in full, especially §4 (verbatim copy), §5 (media), §7 (council) and §8 (break-it loop).

**Orchestration:** Opus 5.5 (main session) orchestrates, writes `DESIGN-SYSTEM.md`, triages findings and owns final calls. Every implementer and reviewer subagent runs on **Sonnet 5.5** (`model: "sonnet"`).

## Global Constraints

- The family's copy in spec §4 is reproduced **character-for-character** (curly ’, "favourites", "her mama!"). No paragraph is split. The only added visible words are the button label `Make a donation in Eevee’s memory` and the domain `torontohumanesociety.donorsupport.co`.
- No captions under photos. No other visible words (no taglines, dates or footer credits).
- Donation URL is exactly `https://torontohumanesociety.donorsupport.co/page/InMemory`, opens in a new tab with `rel="noopener"`, and has no UTM.
- All 20 photos and all 4 videos appear exactly once. The hero is IMG_8819.
- Videos: `preload="none"`, poster shown, `playsinline`, play **with sound only after a tap**, never autoplay, only one plays at a time.
- Originals (`*.HEIC`, `*.MOV`, root `*.JPEG`) are never modified and never committed. All outputs are EXIF/GPS-stripped and upright.
- No framework, no build step for deploy. Vendored libs are loaded locally (no CDN JS). In-page URLs are relative. Only OG/Twitter tags use `https://erfanym.github.io/EEvee_memory/`.
- `lang="en-CA"`, `<title>In Loving Memory of Eevee</title>`, `h1` = "Meet Eevee", `h2` = "In Loving Memory of Eevee".
- Mobile Lighthouse: Performance ≥ 90, Accessibility 100, CLS < 0.05, LCP < 2.5 s. Initial load ≲ 1.5 MB.
- Respect `prefers-reduced-motion`. WCAG AA contrast. Everything keyboard-operable.
- Nothing is pushed to GitHub until Erfan approves the local version.

## Review Focus

1. **iOS Safari tap-to-play.** On WebKit, tapping a poster must start playback with sound inline, not jump to fullscreen or stay silent. Owned by Task 6 (WebKit project test).
2. **Tapping a second video while one plays.** The first pauses and the second plays. Owned by Task 6.
3. **The Android/browser back button while the lightbox is open** closes the lightbox instead of leaving the page. Owned by Task 7.
4. **A slow network, before images arrive.** No layout jump, and polaroid frames hold their size. Owned by Task 5 (CLS test under throttling).
5. **Phone landscape or rotation while the lightbox is open.** The image stays fully visible with no horizontal page scroll. Owned by Task 7.

---

## File Structure

```
.gitignore                      originals, .superpowers/, node_modules/, test-results/, playwright-report/
package.json                    devDeps: @playwright/test, serve; scripts: serve, test
playwright.config.ts            projects: chromium, webkit, firefox, mobile-safari (iPhone 13), mobile-chrome (Pixel 7)
scripts/prepare_media.py        originals → site/assets/{img,video} + site/assets/media.json + contact sheet
scripts/media_config.py         per-file metadata: id, group, alt, poster time (single source of truth)
tests/test_prepare_media.py     pytest for the pipeline
tests/fixtures/copy.json        spec §4 paragraphs verbatim
tests/e2e/content.spec.ts       verbatim copy, headings, donate link
tests/e2e/media.spec.ts         all media once, upright, lazy loading
tests/e2e/layout.spec.ts        viewports, no horizontal scroll, CLS
tests/e2e/video.spec.ts         tap-to-play behaviour
tests/e2e/lightbox.spec.ts      lightbox behaviour
tests/e2e/meta.spec.ts          head tags, reduced motion
site/index.html
site/assets/css/main.css        tokens from DESIGN-SYSTEM.md + layout
site/assets/js/video.js         tap-to-play controller
site/assets/js/lightbox.js      lightbox
site/assets/js/motion.js        reveal-on-scroll (reduced-motion aware)
site/assets/fonts/              self-hosted woff2
site/assets/{img,video}/        pipeline output (committed)
site/assets/og.jpg, favicon.*
docs/council/                   r1-*, r2-*, review-N-*, DESIGN-SYSTEM.md
.github/workflows/pages.yml
```

---

### Task 1: Repo, tooling and skill setup

**Files:**
- Create: `.gitignore`, `package.json`, `playwright.config.ts`, `tests/fixtures/copy.json`

**Interfaces:**
- Produces: `npm run serve` (serves `site/` on `http://localhost:4173`), `npm test` (Playwright, with `webServer` pointing at serve), and `tests/fixtures/copy.json` = `{ "meet": [p1,p2,p3,p4], "memory": [p1,p2,p3], "closing": [p1] }` with strings copied verbatim from spec §4.

- [ ] **Step 1:** `git init -b main` in `/Users/erfan/Desktop/projects/Eeve_website`, then `git remote add origin https://github.com/ErfanYM/EEvee_memory.git`. Do not push.
- [ ] **Step 2:** Write `.gitignore` with `*.HEIC`, `*.MOV`, `/*.JPEG`, `.superpowers/`, `node_modules/`, `test-results/`, `playwright-report/`, `__pycache__/`. Verify with `git status --porcelain`: no original media is listed.
- [ ] **Step 3:** Install tools: `brew install ffmpeg`, `npm i -D @playwright/test serve`, `npx playwright install chromium webkit firefox`, `npx skills@latest add emilkowalski/skills` (installs or updates the Emil skills). Verify `ffmpeg -version` and `npx playwright --version`.
- [ ] **Step 4:** Write `tests/fixtures/copy.json` by copying the 8 paragraphs from spec §4. Verify: `python3 -c "import json;d=json.load(open('tests/fixtures/copy.json'));print(sum(map(len,d.values())))"` prints `8`, and `grep -c '’' tests/fixtures/copy.json` is ≥ 7. Straight `'` must not appear inside the paragraphs.
- [ ] **Step 5:** Commit: `chore: repo setup, tooling, verbatim copy fixture`

### Task 2: Media pipeline

**Files:**
- Create: `scripts/media_config.py`, `scripts/prepare_media.py`, `tests/test_prepare_media.py`

**Interfaces:**
- Produces `site/assets/media.json`: a list of objects
  `{ "id": str, "kind": "photo"|"video", "group": "hero"|"meet"|"foodie"|"walks"|"hikes"|"adventures"|"snow"|"cozy", "alt": str, "width": int, "height": int, "sources": {"avif": [..], "webp": [..], "jpg": [..]} | {"mp4": str}, "poster": str|null }`.
  Photo source entries are `"assets/img/<id>-<w>.<ext>"` for w ∈ {480, 960, 1600} (capped at the original width). Videos are `"assets/video/<id>.mp4"` + poster `"assets/img/<id>-poster-960.{webp,jpg}"`.
- `id` = lowercase slug of the original stem's first 8 chars (e.g. `img_8819`, `b0eaddd4`). Groups and alts follow the spec §5 tables. `media_config.py` holds them as `MEDIA: list[dict]` keyed by original filename.
- Also writes `docs/council/contact-sheet.jpg` (all 24 items with ids) and `site/assets/og.jpg` (1200×630 from IMG_8819).

- [ ] **Step 1: Write failing tests** in `tests/test_prepare_media.py`:
  - `test_manifest_has_20_photos_4_videos`: counts by kind == (20, 4), and ids are unique.
  - `test_every_original_is_mapped`: the set of original filenames in the project root == the keys of `MEDIA`.
  - `test_outputs_upright`: for `b0eaddd4` and `ec73ecaf`, the 960 JPEG has height > width (they are portrait once EXIF is applied), and every manifest photo's width/height ratio matches its output file.
  - `test_no_exif_or_gps`: every output JPEG has `Image.getexif()` empty, or at least no tags 274 (Orientation) or 34853 (GPS).
  - `test_videos_h264_aac_faststart`: `ffprobe` shows video codec `h264`, audio `aac`, height 1280 and width 720, and the `moov` atom comes before `mdat` (e.g. via `ffprobe -v trace` ordering, or by reading the first atoms).
  - `test_sizes`: each MP4 is < 25 MB, total MP4 is < 16 MB, and each 960 photo is < 250 KB in webp.
- [ ] **Step 2:** Run `python3 -m pytest tests/test_prepare_media.py -v`. Expected: FAIL (no manifest).
- [ ] **Step 3: Implement `prepare_media.py`.**
  - Photos: decode HEIC via `sips -s format png` to a temp file, then Pillow `ImageOps.exif_transpose`. Save without EXIF to AVIF (Pillow ≥ 11 supports AVIF; if it's unavailable, skip AVIF and record it), WebP q≈78 and JPEG q≈82 progressive.
  - Videos: `ffmpeg -i in.MOV -vf "scale=720:1280" -c:v libx264 -profile:v high -crf 23 -maxrate 3M -bufsize 6M -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart -map_metadata -1`. Take the poster at `poster_time` from config (default 1.0 s).
  - The script is idempotent and only reads the originals.
- [ ] **Step 4:** Run the pipeline, then the tests. Expected: PASS. **Opus visually checks `docs/council/contact-sheet.jpg`**: every photo upright, and posters not blurry.
- [ ] **Step 5:** Commit: `feat: media pipeline and optimized assets`

### Task 3: Design council, rounds 1 and 2 (Opus orchestrates; 3 Sonnet seats)

**Files:**
- Create: `docs/council/r1-impeccable.md`, `r1-emil.md`, `r1-taste.md`, `r2-*.md` (same seats)

**Interfaces:**
- Consumes: spec, `media.json`, `contact-sheet.jpg`, and the direction-C mockup at `.superpowers/brainstorm/*/content/direction.html` and `flow-captions.html`.
- Produces: six council documents. Each r1 doc has these exact headings: `Palette tokens`, `Typography`, `Spacing & radii`, `Polaroid treatment`, `Layout ≤480 / 481–1023 / ≥1024`, `Spread arrangement (by media id)`, `Video interaction`, `Lightbox`, `Motion spec`, `Donation section`, `Risks`.

- [ ] **Step 1:** Dispatch 3 Sonnet subagents **in parallel**. Seat prompts: (a) "Load skill `impeccable`…", (b) "Load skills `emil-design-eng`, `animate`, `review-animations`…", (c) "Load skill `design-taste-frontend`…". Each reads the spec, may use `playwright-skill:playwright-skill` to view the mockups, and writes `r1-<seat>.md` with the headings above. Each must place every one of the 24 ids exactly once, with no spread over 5 items.
- [ ] **Step 2:** Verify: all three files exist and contain all 11 headings, and each lists 24 unique ids (grep check).
- [ ] **Step 3:** Dispatch the 3 seats again in parallel. Each reads the other two r1 docs and writes `r2-<seat>.md` with `Adopt`, `Reject (why)` and `Hard objections`.
- [ ] **Step 4:** Commit: `docs: design council rounds 1-2`

### Task 4: DESIGN-SYSTEM.md (Opus)

**Files:**
- Create: `docs/council/DESIGN-SYSTEM.md`

**Interfaces:**
- Produces a binding document: CSS custom-property names and values (`--color-*`, `--font-*`, `--space-*`, `--radius-*`, `--shadow-polaroid`, `--ease-*`, `--dur-*`); font files and weights; breakpoints; the polaroid component spec (border widths, tilt set, shadow, hover/press lift); the final spread table (id → spread → order → tilt); video and lightbox interaction decisions; motion spec with reduced-motion fallback; and the donation section treatment. It ends with a "Rulings" table (point → winning seat → reason).

- [ ] **Step 1:** Write it from r1 + r2. Every disputed point gets a ruling.
- [ ] **Step 2:** Verify: the spread table has 24 unique ids, no spread exceeds 5, and IMG_8819 is the hero.
- [ ] **Step 3:** Commit: `docs: binding design system`

### Task 5: Page structure, copy, spreads and layout

**Files:**
- Create: `site/index.html`, `site/assets/css/main.css`, `site/assets/js/motion.js`, `site/assets/fonts/*`, `tests/e2e/content.spec.ts`, `tests/e2e/media.spec.ts`, `tests/e2e/layout.spec.ts`

**Interfaces:**
- Consumes: `DESIGN-SYSTEM.md` (binding), `media.json`, `copy.json`.
- Produces DOM contract used by later tasks and tests:
  - each paragraph is `<p data-copy="meet-0">` … `meet-3`, `memory-0..2`, `closing-0`
  - each photo is `<figure class="polaroid" data-media-id="<id>" data-kind="photo"><button class="polaroid__open" aria-label="Open photo: <alt>"><picture>…</picture></button></figure>`
  - each video is `<figure class="polaroid polaroid--video" data-media-id="<id>" data-kind="video"><video preload="none" playsinline poster="…"><source src="…mp4" type="video/mp4"></video><button class="video__play" aria-label="Play video: <alt>"></button></figure>`
  - the donate link is `<a class="donate" href="…" target="_blank" rel="noopener">Make a donation in Eevee’s memory</a>`

- [ ] **Step 1: Write failing tests.**
  - `content.spec`: for each key in `copy.json`, `[data-copy=key]` innerText (whitespace-collapsed) `===` the fixture string. `h1` text is `Meet Eevee`, the single `h2` is `In Loving Memory of Eevee`. The donate link has the exact href, target `_blank` and rel containing `noopener`. A visible-text audit: the page's full innerText minus all fixture strings, headings, button label and domain is empty (after whitespace trim).
  - `media.spec`: `[data-media-id]` count is 24, the set equals the `media.json` ids, and each appears once. The hero `img` is not lazy, and every other `img` has `loading="lazy"`. Every `img` has non-empty alt, and every `img`/`video` has width and height attributes.
  - `layout.spec`: for viewports 320×568, 375×812, 390×844, 768×1024, 1024×768, 1440×900, 1920×1080 and 844×390, `document.documentElement.scrollWidth <= innerWidth`, and no `.polaroid` overflows the viewport horizontally. CLS after a full scroll under CDP throttling (Slow 3G, Chromium only) is < 0.05.
- [ ] **Step 2:** Run `npx playwright test content media layout`. Expected: FAIL.
- [ ] **Step 3: Implement** `index.html` + `main.css` using the design-system tokens, plus `motion.js`: `initReveal(): void` (IntersectionObserver adds `.is-in` and does nothing under reduced motion). Fonts are self-hosted woff2, with the text font preloaded.
- [ ] **Step 4:** Run the tests. Expected: PASS on all 5 projects.
- [ ] **Step 5:** Commit: `feat: page structure, verbatim copy, scrapbook spreads`

### Task 6: Tap-to-play videos

**Files:**
- Create: `site/assets/js/video.js`, `tests/e2e/video.spec.ts`

**Interfaces:**
- Produces `initVideos(root: Document): void`. Clicking `.video__play` (or the poster) calls `video.play()` unmuted, sets `controls`, hides the button and pauses any other playing video. On `ended`, it returns to the poster and play-button state. Keyboard Enter/Space on the button works.

- [ ] **Step 1: Write failing tests** (run on chromium, webkit and mobile-safari):
  - `no video has autoplay or muted attributes, and readyState is 0 before interaction (preload none)`
  - `tap plays with sound`: click → `paused === false`, `muted === false`, `volume > 0`
  - `only one plays`: play A, then play B → A.paused is true
  - `ended resets`: set `currentTime = duration - 0.1` → after ended, the play button is visible again
  - `keyboard`: focus the button, press Enter → it plays
  - `webkit inline`: on webkit/mobile-safari, after the tap `document.fullscreenElement` is null and the video bounding box stays inside its figure
- [ ] **Step 2:** Run. Expected: FAIL. **Step 3:** Implement. **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Commit: `feat: tap-to-play videos with sound, one at a time`

### Task 7: Lightbox

**Files:**
- Create: `site/assets/js/lightbox.js`, `tests/e2e/lightbox.spec.ts`

**Interfaces:**
- Produces `initLightbox(root: Document): void`. It opens on `.polaroid__open` click and shows the 1600w image of that id. The order is all 20 photos in DOM order. Arrows and swipe navigate (wrapping, or stopping at the ends, as DESIGN-SYSTEM rules). Close happens via Esc, the close button, a backdrop tap, swipe-down or browser back (a `history.pushState` entry is added on open and consumed on close). It is an `role="dialog"` `aria-modal="true"` element with a focus trap, focus returns to the trigger, and body scroll is locked while open. Video handling follows DESIGN-SYSTEM.md.

- [ ] **Step 1: Write failing tests:**
  - `opens on click and shows matching image`; `ArrowRight x19 visits all 20 ids`; `Escape closes and focus returns to trigger`
  - `browser back closes lightbox and stays on page`: open → `page.goBack()` → dialog hidden, URL unchanged, page scroll position restored
  - `swipe` (mobile projects): a touch drag left moves to the next id
  - `landscape`: at 844×390 with the dialog open, the image box fits within the viewport and `scrollWidth <= innerWidth`
  - `body scroll locked`: wheel while open → `window.scrollY` unchanged
- [ ] **Step 2:** Run. FAIL. **Step 3:** Implement (vendoring a small lib is allowed only if DESIGN-SYSTEM.md says so). **Step 4:** Run. PASS.
- [ ] **Step 5:** Commit: `feat: photo lightbox`

### Task 8: Head, meta, link preview, reduced motion

**Files:**
- Modify: `site/index.html` (`<head>`)
- Create: `site/assets/favicon.svg` (+ `apple-touch-icon.png` 180×180), `tests/e2e/meta.spec.ts`

- [ ] **Step 1: Write failing tests:** title equals `In Loving Memory of Eevee`; `html[lang=en-CA]`; `og:title`, `og:description`, `og:image` = `https://erfanym.github.io/EEvee_memory/assets/og.jpg`, `og:url`, `twitter:card=summary_large_image`, `theme-color`, and a favicon link present. Under `reducedMotion: 'reduce'`, every `.polaroid` has computed `transition-duration` of `0s`, or no transform animation, after reveal. Zero console errors on load across all projects.
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS.
- [ ] **Step 5:** Commit: `feat: meta, link preview, favicon, reduced motion`

### Task 9: Break-it loop (council reviews, Opus triages, builder fixes)

**Files:**
- Create: `docs/council/review-<N>-<seat>.md` and screenshots in `docs/council/shots/<N>/`
- Modify: whatever the fixes touch

- [ ] **Step 1:** `npm run serve`. Dispatch the 3 seats in parallel (Sonnet), each with its skill **plus `playwright-skill:playwright-skill`**, to attack the page per spec §8 from its own lens. Each takes screenshots at all §8 viewports. Each review lists findings as `[blocker|should-fix|nit] <what> — <where> — <repro>` and ends with `SIGN-OFF: yes|no`.
- [ ] **Step 2:** Run `npx playwright test` plus Lighthouse mobile (`npx lighthouse http://localhost:4173 --preset=perf --form-factor=mobile --output=json`, then Accessibility). Add the scores to the round's notes.
- [ ] **Step 3:** Opus triages into `docs/council/review-<N>-triage.md` (accept or reject, each with a reason).
- [ ] **Step 4:** The Sonnet builder fixes accepted blockers and should-fixes. Any finding that is a testable regression gets a Playwright test first. Run the full suite: PASS.
- [ ] **Step 5:** Commit: `fix: review round N`. Repeat from Step 1 until there are 0 blockers, all three seats sign off, and the Lighthouse targets are met. If round 4 still has blockers, Opus decides and records what's outstanding for Erfan.

### Task 10: Erfan's review

- [ ] **Step 1:** Serve on the LAN (`npx serve site -l tcp://0.0.0.0:4173`). Give Erfan the local URL plus the Mac's LAN IP for his phone, and include the round summaries and final screenshots.
- [ ] **Step 2:** Apply his change requests through the Task 9 loop (a mini round). His approval is required before Task 11.

### Task 11: Deploy to GitHub Pages

**Files:**
- Create: `.github/workflows/pages.yml` (uses `actions/configure-pages`, `actions/upload-pages-artifact` with `path: site`, `actions/deploy-pages`; triggered on push to `main`; permissions `pages: write`, `id-token: write`)

- [ ] **Step 1:** Write the workflow. Enable Pages with source "GitHub Actions": `gh api -X POST repos/ErfanYM/EEvee_memory/pages -f build_type=workflow`.
- [ ] **Step 2:** Confirm with Erfan, then `git push -u origin main`.
- [ ] **Step 3:** Verify: `gh run watch` succeeds. `curl -sI https://erfanym.github.io/EEvee_memory/` returns 200, and one asset of each type returns 200. Run `npx playwright test` against the live URL (`BASE_URL` env override in the config): PASS.
- [ ] **Step 4:** Hand Erfan the link.
