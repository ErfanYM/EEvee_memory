# Eevee Memorial Page — Design

Date: 2026-11-03
Owner: Erfan (building it for a friend — Eevee's family)
Brain / orchestrator: Opus 5.5 (main session). Builders & reviewers: Sonnet 5.5 subagents.

---

## 1. Intent — why this page exists

Eevee, a golden retriever, passed away after 12 years with her family. Her mama (Erfan's friend) wants one page she can text to friends that does two things, in this order:

1. **Remember Eevee.** Celebrate who she was through her family's words and all of her photos and videos. The page should leave people smiling, not just sad.
2. **Gently invite a donation** in her memory to Toronto Humane Society, which the family has donated to themselves. There is explicitly *no pressure*. Looking through her photos counts just as much as donating.

Success means a friend opens the link on their phone in a group chat, scrolls through Eevee's life, smiles, taps a video and hears her, and comes away knowing about the donation without feeling asked for money.

## 2. Goals, non-goals, anti-goals

**Goals**
- One page with a single scroll from top to bottom, excellent on phones first and also on desktop.
- Uses **all 20 photos and all 4 videos**.
- Videos play smoothly on every common browser (iOS Safari, Android Chrome, desktop Chrome/Firefox/Safari/Edge).
- Opens fast on mobile data.
- Shares nicely in a chat app, with a link preview showing Eevee's photo and title.

**Non-goals**
- No comments, guestbook, forms, accounts, analytics or backend. Friends contact the family by text as usual.
- No navigation menu or multiple pages.
- No CMS. The content is fixed.

**Anti-goals (a failure even if it "works")**
- **Changing any of the family's words.** See §4. This is the hardest rule.
- Feeling like a fundraising page: no progress bars, guilt copy, pop-ups or a sticky "DONATE" bar.
- Feeling sombre or grey. The family asked people to "think of her with a smile."
- Generic template or "AI-made" aesthetics.
- Videos that autoplay, play muted, or show a black box before loading.
- Photos that show up sideways (see §6.1, a real trap in this media set).

## 3. Decisions made with Erfan

| Decision | Choice |
|---|---|
| Visual direction | **C · Sunny scrapbook.** Bright, warm, playful, with tilted white-bordered polaroid photos. |
| Captions under photos | **None.** Photos only. The only visible words are the family's. |
| Videos | **Tap to play, with sound.** No autoplay, no muted loops. |
| Messages / donation confirmations | Friends text the family. Nothing on the page collects input. |
| Hosting | Erfan's GitHub repo `ErfanYM/EEvee_memory` (public, currently empty) → GitHub Pages. Expected URL: `https://erfanym.github.io/EEvee_memory/` |
| Showing Erfan | Only after the 3 design agents have tried to break it and signed off (§8). |

## 4. Content — VERBATIM, do not edit

Every character below is used exactly as written, including curly apostrophes (’), British/Canadian spelling ("favourites"), commas and the exclamation mark. Do not fix grammar, change punctuation, add or remove words, or "improve" anything. The design may only decide **where** paragraphs sit and how they look. **A paragraph is never split**, and photos go *between* paragraphs.

### Section 1 — heading: `Meet Eevee`

> Eevee was the sweetest girl who brought us 12 years of happiness 💛. She was loving, loyal and incredibly friendly with people. She absolutely loved human company and was always happy to be around us!

> She was also a big foodie, just like her mama! Chicken and bread were definitely among her favourites. She enjoyed her morning walks with grandma, going for hikes, swimming and joining us on little adventures.

> One of the things we loved most about Eevee was how she was always up for anything. It didn’t matter where we were going or whether she knew the destination. She was always excited and ready to come along. She was happy just being part of whatever we were doing!

> We feel incredibly lucky to have had Eevee in our lives. We will always remember her loving nature, her enthusiasm for life and all the happiness she brought us!

### Section 2 — heading: `In Loving Memory of Eevee`

> In memory of Eevee, we’ve chosen to support Toronto Humane Society and its work helping animals in need.

> If you’d like to make a donation in Eevee’s memory, you can do so through the link below. If you do decide to donate, I’d really appreciate it if you let me know!

> Of course, there’s absolutely no pressure to donate. Taking a moment to remember Eevee, look through her photos or share a favourite memory of her would mean just as much to me.

Donation link: `https://torontohumanesociety.donorsupport.co/page/InMemory?tributeHonoree=Eevee` (FundraiseUp URL API: pre-fills the "Dedicate this donation" box with "Eevee"; owner request 2026-11-05)

### Section 3 — closing (no heading)

> Thank you for remembering Eevee. We hope you’ll think of her with a smile. She will forever be a part of our family and always hold a special place in our hearts.

### Sign-off (owner-supplied, 2026-11-05)

At the very end of the page: `With love,` / `The Li Family 💛`

### Words the page needs that the family didn't write (Opus's calls, kept to a minimum)
- **Donate button label:** `Make a donation in Eevee’s memory`, taken from her own sentence. Below the button, show the plain domain `torontohumanesociety.donorsupport.co` in small text so people can see where it goes. The link opens in a new tab with `rel="noopener"`.
- **Browser tab / link preview title:** `In Loving Memory of Eevee` (her heading).
- **Image `alt` text:** short plain descriptions such as "Eevee with her 10th birthday cake". Screen readers need these, but they are never shown visually.
- **Video play buttons:** an accessible label like "Play video of Eevee carrying a stick". The visible play button is an icon only.
- No other visible words. No captions, dates, taglines or "made with love" footer.

## 5. Media inventory and starting arrangement

Source files sit in the project root (`/Users/erfan/Desktop/projects/Eeve_website/`). **The originals are never modified and never committed** (the repo is public and they total ~71 MB). Only optimized versions go in the site.

### 5.1 Photos (20). All portrait except where noted.
| File | What's in it | Starting placement |
|---|---|---|
| IMG_8819.JPEG | Big happy close-up face in snowy woods | **Hero**, top of page |
| 37C83B77-…JPEG | Smiling on a town street, bandana | After paragraph 1 (loving, friendly) |
| IMG_8394.JPEG | Sitting proudly in light snow (1080×1350) | After paragraph 1 |
| IMG_4837.HEIC | Lying in grass with a chew, blue sky | After paragraph 1 |
| EC73ECAF-…HEIC | Looking up beside a cup/bowl (**stored sideways**) | After paragraph 2, foodie |
| IMG_0826.HEIC | Licking her lips on a picnic table | After paragraph 2, foodie |
| IMG_7207.HEIC | With her **10th birthday cake** | After paragraph 2, foodie |
| IMG_2017.JPEG | Walking on a sidewalk | After paragraph 2, walks with grandma |
| B0EADDD4-…HEIC | Lying on paving stones, town street (**stored sideways**) | After paragraph 2, walks |
| IMG_6802.HEIC | Small in the distance on a forest trail | After paragraph 2, hikes |
| IMG_4144.HEIC | Sitting on a stone block in a park | After paragraph 2, hikes |
| IMG_5023.HEIC | Sunset over a big field | After paragraph 2, hikes |
| 232ed04c-…JPEG | Running toward camera across a field (**landscape** 1599×1200) | After paragraph 2, adventures |
| 20221006_141347.JPEG | Under an autumn maple (tall 1816×4032) | After paragraph 2, adventures |
| IMG_4973.JPEG | Jumping into a paddling pool | After paragraph 2, swimming |
| IMG_3785.HEIC | Snow, yellow raincoat, facing camera | After paragraph 3, up for anything |
| IMG_3786.HEIC | Snow, yellow raincoat, side profile | After paragraph 3 |
| IMG_8788.JPEG | Exploring snowy woods | After paragraph 3 |
| IMG_1551.HEIC | Christmas, antlers, green toy | After paragraph 4, lucky / loving nature |
| IMG_7522.HEIC | Cozy on a fluffy rug | After paragraph 4 |

### 5.2 Videos (4). All iPhone HEVC (`hvc1`), 1080×1920 portrait (via a rotation flag), ~30 fps, with audio.
| File | Length | What happens | Starting placement |
|---|---|---|---|
| 23983AB7-…MOV | 16.4 s | Stick in mouth on the grass, walking along | Paragraph 2 group, adventures |
| 0F88D984-…MOV | 6.8 s | Carrying a big stick at a playground | Paragraph 2 group, adventures |
| B9E5276C-…MOV | 5.5 s | Trotting along a wet park path | Paragraph 2 group, walks |
| C1A73628-…MOV | 5.2 s | Snow walk in her yellow raincoat | Paragraph 3 group, snow |

The design council (§7) may rearrange this table, but every file must appear exactly once and the hero must be a happy face.

### 5.3 Rhythm (Opus's call)
The tables above are a **starting arrangement, not a literal layout**. Paragraph 2 alone would otherwise be followed by ~12 photos and 3 videos, which is a wall of images. To fix this:
- Photo groups appear as **scrapbook "spreads"**: clusters of 2–5 polaroids/videos laid out together. Each spread follows the paragraph whose theme it illustrates.
- The paragraph 2 material is split into **consecutive themed spreads** (foodie → walks with grandma → hikes & swimming), each with its own composition. The council may move adventure and stick-video material to after paragraph 3 ("always up for anything"), which fits it equally well. **Aim for no spread larger than ~5 items**, with roughly even visual weight across the page.
- Paragraphs themselves stay whole and are never split.

### 5.4 Top of page (Opus's call)
Hero photo (IMG_8819) as a large tilted polaroid, with the **`h1` "Meet Eevee"** directly above or beside it (council's choice), followed by paragraph 1. "In Loving Memory of Eevee" is an `h2` for the donation section. The closing section has no heading. The browser tab/OG title stays "In Loving Memory of Eevee". No other visible words are added at the top.

## 6. How it gets built (technical)

### 6.1 Media pipeline: a reproducible script, `scripts/prepare-media.*`
- **Orientation trap:** `B0EADDD4` and `EC73ECAF` carry EXIF Orientation = 6 and render sideways if the tag is ignored. The pipeline must apply EXIF orientation (e.g. Pillow `ImageOps.exif_transpose`, or decode via `sips`) and then **strip all metadata**, including GPS location, before output. Verify every output visually on a contact sheet.
- HEIC decoding: macOS `sips` works here. Pillow is installed; `pillow-heif` is optional.
- Photo outputs: **AVIF + WebP + JPEG fallback** via `<picture>`, at widths of about 480 / 960 / 1600 px, with explicit `width`/`height` to prevent layout shift. A tiny blurred or dominant-colour placeholder is optional.
- Video outputs: **H.264 (High profile) MP4 + AAC audio only** (no HEVC/AV1 variants), 720×1280 portrait (rotation baked in), `-movflags +faststart`, target ~2–3 Mbps. Plus a **poster JPEG/WebP** taken from a nice frame (not frame 0 if it's blurry). ~8–12 MB total is a *target*, not a hard cap. Quality wins if it's slightly over, and each file must stay under 25 MB.
- Requires `ffmpeg` (Homebrew is present at `/opt/homebrew/bin/brew`, so run `brew install ffmpeg`). Fallback: macOS's built-in `avconvert` (verified present) can export H.264, and `sips` (verified working) for HEIC. Node v20 / npx are available for Playwright.
- A link-preview image: 1200×630 crop of a happy photo (IMG_8819 suggested).

### 6.2 Page
- **Plain static site: HTML + CSS + a small amount of vanilla JS. No framework and no build step needed to deploy.** Small vendored libraries are allowed if the council justifies them (e.g. a lightbox), loaded from local files, not a CDN.
- Fonts: self-hosted or Google Fonts with `display=swap`. The council picks, within direction C: a rounded/friendly text face, with a handwritten face used sparingly (with no captions, it may appear only in decorative marks, or not at all).
- Images `loading="lazy"` except the hero. Videos `preload="none"` with poster, `playsinline`, native controls (or a custom control that still exposes pause, seek and volume), and only one video playing at a time.
- **Lightbox:** tapping a photo opens it full screen. Swipe / arrow keys go between photos, and Esc / swipe-down / close button exits. Focus is trapped and restored. Videos may open in it too or play inline. The council decides.
- Motion: gentle and short (polaroids settling into place, slight lift on hover/press). Fully respects `prefers-reduced-motion`. No scroll-jacking.
- Accessibility: WCAG AA contrast, real headings (`h1` "Meet Eevee"? the council decides heading levels), keyboard-operable everything, visible focus, `lang="en-CA"`.
- Meta: `<title>`, description, Open Graph + Twitter card tags with absolute URLs to the preview image, theme-color, favicon (paw or Eevee's face).
- Performance targets on mobile Lighthouse: Performance ≥ 90, Accessibility 100, CLS < 0.05, LCP < 2.5 s. Initial page weight (before any scrolling or video tap) ≲ 1.5 MB.

### 6.3 Repository layout (suggested)
```
site/                 ← everything that gets deployed
  index.html
  assets/{css,js,fonts,img,video}/
scripts/prepare-media.(py|sh)
docs/superpowers/specs/…   ← this doc
docs/council/…              ← design council minutes (§7)
.github/workflows/pages.yml ← deploy site/ to GitHub Pages
.gitignore                  ← originals (*.HEIC, *.MOV, root *.JPEG), .superpowers/, node_modules/, test output
```

### 6.3a URLs (Opus's call)
- No custom domain. All in-page asset URLs are **relative** so the site works both locally and under the `/EEvee_memory/` sub-path.
- Open Graph / Twitter image and `og:url` use the absolute `https://erfanym.github.io/EEvee_memory/...` URL. These are the only absolute URLs, kept in one place in `<head>`.
- The donation link is used **exactly** as given, with no UTM or tracking parameters.
- The public repo was flagged to Erfan and he continued with it. The media is metadata-stripped, and the originals are not committed.

### 6.4 Deploy
- `git init`, connect to `https://github.com/ErfanYM/EEvee_memory.git` (gh CLI is already logged in as ErfanYM with `repo` scope).
- GitHub Actions workflow publishes `site/` to Pages.
- **Nothing is pushed until Erfan has seen and approved the final local version.** Pushing is outward-facing.

## 7. The design council: three skill agents at one table

Three Sonnet 5.5 subagents, each carrying a different design skill, decide the design system together. Opus chairs, breaks ties and owns the final call.

| Seat | Skill(s) loaded | Lens |
|---|---|---|
| **Impeccable** | `impeccable` (`~/.claude/skills/impeccable`) | UX, hierarchy, typography, spacing, accessibility, responsive behaviour, anti-patterns |
| **Emil** | Emil Kowalski skills, installed/updated first via `npx skills@latest add emilkowalski/skills` (already present: `emil-design-eng`, `animate`, `review-animations`, `improve-animations`, …) | Motion, interaction feel, the lightbox and video interactions, polish |
| **Taste** | `design-taste-frontend` (from Leonxlnx/taste-skill) | Aesthetic quality, avoiding generic/AI look, the "would a great designer ship this" bar |

All three also use **`playwright-skill`** so they look at the real page instead of guessing.

**Phase order (who owns what):** Opus orchestrates the whole process. The **implementation plan has these phases in order:** (0) tool setup + media pipeline, (1) council rounds 1–2, (2) Opus writes `DESIGN-SYSTEM.md`, (3) the build, (4) the break-it loop, (5) Erfan's review, (6) deploy. Once `DESIGN-SYSTEM.md` exists it is **binding** on the builder, and it settles everything §9 leaves open. The builder does not reinvent those choices. The council sees real media (the converted photos and posters from phase 0), not guesses.

**Protocol (subagents can't chat live, so the "table" is a shared folder, `docs/council/`):**
1. **Round 1, proposals (in parallel).** Each seat reads this spec, looks at the media contact sheet, and writes `docs/council/r1-<seat>.md` covering palette tokens, type scale and fonts, spacing, polaroid treatment, layout per breakpoint (≤480, 481–1023, ≥1024), photo arrangement per section, video and lightbox interaction, motion spec, and the donation section treatment.
2. **Round 2, cross-critique (in parallel).** Each seat reads the other two and writes `r2-<seat>.md`: what to adopt, what to reject and why, plus their remaining hard objections.
3. **Synthesis (Opus).** Opus writes `docs/council/DESIGN-SYSTEM.md`, the single binding source of tokens and decisions, and records which seat won each disputed point and why.
4. **Build (one Sonnet builder).** A single implementer builds `site/` from `DESIGN-SYSTEM.md` plus this spec. One builder avoids merge conflicts on a one-page site. The media pipeline runs first.

## 8. Break-it loop (before Erfan sees anything)

Repeat until the exit condition is met:
1. Serve `site/` locally.
2. **All three seats in parallel** use playwright-skill to attack the page, each from their own lens, and write `docs/council/review-N-<seat>.md` with screenshots. Minimum checks:
   - Viewports 320×568, 375×812, 390×844, 768×1024, 1024×768, 1440×900, 1920×1080, plus phone landscape
   - Chromium, WebKit and Firefox engines
   - All 4 videos play with sound after a tap, only one plays at a time, and the poster shows before tapping
   - Lightbox: open, swipe/arrows through all 20 photos, Esc, focus return, no body scroll leak
   - No photo is sideways. Every one of the 20 photos and 4 videos is present exactly once
   - **Verbatim text check:** a script diffs the rendered text of each paragraph against §4, and any difference is a blocker
   - Keyboard-only pass, `prefers-reduced-motion`, 200% zoom, slow-3G throttled load, no horizontal scroll, no console errors, no layout shift
   - Donate link goes to the exact URL in a new tab
   - Lighthouse mobile scores against §6.2 targets
   - Taste pass: does it feel like a warm scrapbook made for *this* dog, not a template?
3. Opus triages findings into **blocker / should-fix / nit** and rejects bad suggestions with a reason.
4. The builder fixes blockers and should-fixes.
5. **Exit** when a round produces zero blockers and all three seats sign off. If round 4 still has blockers, Opus decides what ships and tells Erfan what's outstanding.

Then Erfan reviews locally (desktop + phone over LAN), requests changes, and only after his OK do we push and enable Pages.

## 9. Left to the builder / council
Exact palette values, fonts, polaroid tilt angles, grid arrangement per breakpoint, motion curves, the lightbox implementation, whether videos open in the lightbox or play inline, heading levels, favicon design, and the poster frame choice. All of these must stay inside direction C and the rules above.
