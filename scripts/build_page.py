#!/usr/bin/env python3
"""Generate site/index.html and the spread-placement block of site/assets/css/main.css (static, no-JS-needed markup).

Inputs: site/assets/media.json, tests/fixtures/copy.json, and the layout table below
(DESIGN-SYSTEM.md section 6). Run: python3 scripts/build_page.py
"""
import json
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "site"
media = {m["id"]: m for m in json.loads((SITE / "assets/media.json").read_text())}
copy = json.loads((ROOT / "tests/fixtures/copy.json").read_text())

DONATE = "https://torontohumanesociety.donorsupport.co/page/InMemory"
DOMAIN = "torontohumanesociety.donorsupport.co"
LABEL = "Make a donation in Eevee’s memory"
SITE_URL = "https://erfanym.github.io/EEvee_memory/"
TITLE = "In Loving Memory of Eevee"
DESC = "Eevee was the sweetest girl who brought us 12 years of happiness."  # the family's own words only
OG_ALT = "Eevee smiling in the snowy woods"

# Per print: tilt, tape colour, lead flag, then placements per breakpoint:
# ph (<=480, 20-col grid), tb (481-1023, 24-col): (column, row, extra css). dt (>=1024) comes from DT_LAYOUT.
# Spread order and tilts: DESIGN-SYSTEM section 6.
SPREADS = [
    ("s1", [
        ("37c83b77", -3.0, None, False, ("1/12", 1, ""), ("1/12", 1, "")),
        ("img_8394", 1.5, None, True, ("6/21", 2, "margin-top:-22px;"), ("11/25", 1, "margin-top:48px;")),
        ("img_4837", -1.5, None, False, ("1/12", 3, "margin-top:-22px;"), ("5/16", 2, "")),
    ]),
    ("s2", [
        ("ec73ecaf", -2.5, None, False, ("10/21", 1, ""), ("1/11", 1, "")),
        ("img_7207", 2.0, "sun", True, ("1/16", 2, "margin-top:-22px;"), ("10/24", 1, "margin-top:30px;")),
        ("img_0826", -1.0, None, False, ("10/21", 3, "margin-top:-22px;"), ("13/24", 2, "")),
    ]),
    ("s3", [
        ("img_2017", 2.5, None, False, ("1/12", 1, ""), ("1/12", 1, "")),
        ("b9e5276c", -1.5, None, True, ("8/21", 2, "margin-top:8px;"), ("13/25", "1/3", "")),
        ("b0eaddd4", 3.0, "sky", False, ("2/13", 3, "margin-top:8px;"), ("3/14", 2, "margin-top:24px;")),
    ]),
    ("s4", [
        ("img_6802", -2.0, None, False, ("1/11", 1, ""), ("1/10", 1, "")),
        ("img_5023", 1.5, "grass", False, ("10/21", 1, "margin-top:24px;"), ("11/22", 1, "margin-top:48px;")),
        ("img_4144", -3.0, None, False, ("2/13", 2, "margin-top:-22px;"), ("2/12", 2, "")),
        ("img_4973", 3.0, None, True, ("6/21", 3, "margin-top:-22px;"), ("11/24", 2, "margin-top:32px;")),
    ]),
    ("s5", [
        ("23983ab7", -2.0, None, False, ("1/14", 1, ""), ("1/10", 1, "")),
        ("232ed04c", 1.5, "sky", True, ("6/21", 2, "margin-top:-22px;"), ("10/25", 1, "align-self:center;")),
        ("0f88d984", 2.0, None, False, ("8/21", 3, "margin-top:8px;"), ("8/17", 2, "margin-top:24px;")),
    ]),
    ("s6", [
        ("img_3785", -2.5, None, False, ("1/12", 1, ""), ("1/13", 1, "")),
        ("img_3786", 2.0, "sun", False, ("10/21", 1, "margin-top:20px;"), ("13/25", 1, "")),
        ("c1a73628", -1.5, None, False, ("4/17", 2, "margin-top:8px;"), ("2/11", 2, "")),
        ("img_8788", 3.0, None, False, ("9/20", 3, "margin-top:8px;"), ("13/24", 2, "margin-top:40px;")),
    ]),
    ("s7", [
        ("img_1551", -2.0, "grass", False, ("1/12", 1, ""), ("1/12", 1, "")),
        ("img_7522", 2.5, None, False, ("10/21", 1, "margin-top:20px;"), ("13/24", 1, "margin-top:40px;")),
        ("20221006", -1.0, None, True, ("3/18", 2, "margin-top:-10px;"), ("6/20", 2, "margin-top:24px;")),
    ]),
]
# >=1024 (T1): one row per spread. kind "3" = three columns 1fr 1.25fr 1fr (lead in the middle, 1.25x);
# kind "4" = four across, lead widened to 1.2x by a negative inline margin. Per print: (column, margin-top px).
DT_LAYOUT = {
    "s1": ("3", [(1, 32), (2, 0), (3, 56)]),
    "s2": ("3", [(1, 48), (2, 0), (3, 16)]),
    "s3": ("3", [(1, 56), (2, 0), (3, 20)]),
    "s4": ("4", [(1, 28), (2, 8), (3, 32), (4, 0)]),
    "s5": ("3", [(1, 0), (2, 40), (3, 0)]),  # T7: the landscape print sits 40px lower than its two videos
    "s6": ("4", [(1, 0), (2, 28), (3, 12), (4, 32)]),
    "s7": ("3", [(1, 48), (3, 40), (2, 0)]),  # 20221006 (lead, last in the DOM) sits in the middle column
}
DT_GAP = {"3": 40, "4": 24}
DT_GAP_HI = {"3": 28, "4": 24}      # >=1600 (T8): spread content is the full 1320 wrap, lead 1.15x -> ~400/460px prints
DT_FR_HI = {"3": [1, 1.15, 1], "4": [1, 1, 1, 1]}
OVERLAP = {"img_7207": 28, "img_3786": 28}  # T7: px this print tucks over its left neighbour (never over a face)
DT_FR = {"3": [1, 1.25, 1], "4": [1, 1, 1, 1]}
LEAD4 = 1.2
PRINT_PAD_DT = 28  # 2 x 14px card padding at >=1024
WRAP_PX = {"lo": 1200, "hi": 1320}  # --wrap below / above 1600px
HERO = "img_8819"
HERO_TILT = -2.5


def span(col):
    a, b = (int(x) for x in col.split("/"))
    return b - a


def srcset(m, ext):
    return ", ".join(f"{p} {p.rsplit('-', 1)[1].split('.')[0]}w" for p in m["sources"][ext])


def picture(m, sizes, hero=False):
    """Hero: WebP only, eager, high priority, no decoding hint (P1). Others: real srcset/src in the markup (works
    without JS), native lazy loading at low priority so they never compete with the LCP image (R13)."""
    s = m["sources"]
    fallback = s["jpg"][1]
    if hero:
        return (
            "<picture>"
            f'<source type="image/webp" srcset="{srcset(m, "webp")}" sizes="{sizes}">'
            f'<img src="{fallback}" srcset="{srcset(m, "jpg")}" sizes="{sizes}" '
            f'width="{m["width"]}" height="{m["height"]}" alt="{escape(m["alt"], quote=True)}" loading="eager" fetchpriority="high" draggable="false">'
            "</picture>"
        )
    return (
        "<picture>"
        f'<source type="image/avif" srcset="{srcset(m, "avif")}" sizes="{sizes}">'
        f'<source type="image/webp" srcset="{srcset(m, "webp")}" sizes="{sizes}">'
        f'<img src="{fallback}" srcset="{srcset(m, "jpg")}" sizes="{sizes}" '
        f'width="{m["width"]}" height="{m["height"]}" alt="{escape(m["alt"], quote=True)}" loading="lazy" decoding="async" fetchpriority="low" draggable="false">'
        "</picture>"
    )


def fmt(x):
    return f"{x:g}"


def dt_sizes(sid, pid):
    """Rendered <img> width at >=1024: (calc() for 1024-1599, px for >=1600)."""
    kind, places = DT_LAYOUT[sid]
    items = dict(SPREADS_BY_ID[sid])
    order = [it[0] for it in SPREADS_BY_ID_LIST[sid]]
    col = places[order.index(pid)][0]
    gap = DT_GAP[kind]
    fr = DT_FR[kind][col - 1]
    n = 3 if kind == "3" else 4
    mult = LEAD4 if (kind == "4" and items[pid]) else 1
    sumfr = sum(DT_FR[kind])
    lo = f"calc((min(100vw, {WRAP_PX['lo']}px) - {96 + gap * (n - 1)}px) * {fmt(fr * mult)}/{fmt(sumfr)} - {PRINT_PAD_DT}px)"
    frh = DT_FR_HI[kind][col - 1]
    hi = round((WRAP_PX["hi"] - DT_GAP_HI[kind] * (n - 1)) * frh * mult / sum(DT_FR_HI[kind]) - PRINT_PAD_DT)
    return lo, hi


def sizes_for(sid, pid, ph, tb):
    lo, hi = dt_sizes(sid, pid)
    return (
        f"(min-width: 1600px) {hi}px, "
        f"(min-width: 1024px) {lo}, "
        f"(min-width: 481px) calc(min(92vw, 760px) * {span(tb)}/24 - 20px), "
        f"calc((100vw - 40px) * {span(ph)}/20 - 20px)"
    )


SPREADS_BY_ID_LIST = {sid: items for sid, items in SPREADS}
SPREADS_BY_ID = {sid: [(it[0], it[3]) for it in items] for sid, items in SPREADS}

PLAY_SVG = '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>'


def figure(item, index, sid):
    pid, tilt, tape, lead, ph, tb = item
    m = media[pid]
    cls = ["polaroid"]
    if m["kind"] == "video":
        cls.append("polaroid--video")
    if lead:
        cls.append("is-lead")
    if tape:
        cls.append(f"polaroid--tape-{tape}")
    ar = {"20221006": "3/4"}.get(pid, f"{m['width']}/{m['height']}")
    style = f"--tilt:{fmt(tilt)}deg;--ar:{ar};--i:{min(index, 3)}"
    if m["kind"] == "video":
        inner = (
            '<div class="polaroid__window">'
            f'<video preload="none" playsinline aria-label="Play video: {escape(m["alt"], quote=True)}" width="{m["width"]}" height="{m["height"]}" data-poster="{m["poster"]}">'
            f'<source src="{m["sources"]["mp4"]}" type="video/mp4"></video>'
            f'<noscript><img class="video__poster-fallback" src="{m["poster"]}" alt="" width="{m["width"]}" height="{m["height"]}"></noscript>'
            f'<button class="video__play" type="button" aria-label="Play video: {escape(m["alt"], quote=True)}">{PLAY_SVG}</button>'
            "</div>"
        )
    else:
        sz = sizes_for(sid, pid, ph[0], tb[0])
        inner = (
            f'<button class="polaroid__open" type="button" aria-haspopup="dialog" '
            f'aria-label="Open photo: {escape(m["alt"], quote=True)}">{picture(m, sz)}</button>'
        )
    return (
        f'<figure class="{" ".join(cls)}" data-media-id="{pid}" data-kind="{m["kind"]}" style="{style}">'
        f'<div class="polaroid__tilt">{inner}</div></figure>'
    )


def spread(sid, items):
    figs = "\n      ".join(figure(it, i, sid) for i, it in enumerate(items))
    return f'    <div class="spread spread--{sid}" data-count="{len(items)}">\n      {figs}\n    </div>'


def p(key, lead=False):
    g, i = key.split("-")
    text = copy[g][int(i)]
    return f'<p class="copy{" copy--lead" if lead else ""}" data-copy="{key}">{escape(text, quote=False)}</p>'


hm = media[HERO]
# Rendered <img> widths: print width minus 32px card padding (see main.css .hero .polaroid).
HERO_SIZES = "(min-width: 1440px) 488px, (min-width: 1024px) 438px, calc(min(78vw, 440px) - 32px)"
HERO_PRELOAD = (
    f'<link rel="preload" as="image" type="image/webp" fetchpriority="high" imagesrcset="{srcset(hm, "webp")}" '
    f'imagesizes="{HERO_SIZES}">'
)
hero_fig = (
    f'<figure class="polaroid polaroid--hero" data-media-id="{HERO}" data-kind="photo" '
    f'style="--tilt:{fmt(HERO_TILT)}deg;--ar:{hm["width"]}/{hm["height"]};--i:0">'
    f'<div class="polaroid__tilt"><button class="polaroid__open" type="button" aria-haspopup="dialog" '
    f'aria-label="Open photo: {escape(hm["alt"], quote=True)}">'
    + picture(hm, HERO_SIZES, hero=True)
    + "</button></div></figure>"
)

# Farewell print (DESIGN-SYSTEM section 12): hero photo once more, NOT a .polaroid / [data-media-id] / lightbox item.
farewell_fig = (
    f'<div class="farewell" style="--ar:{hm["width"]}/{hm["height"]}">'
    + picture(hm, "(min-width: 481px) 288px, 34vw").replace('fetchpriority="low" ', "").replace(escape(hm["alt"], quote=True), "")
    + "</div>"
)

S = {sid: spread(sid, items) for sid, items in SPREADS}

html = f"""<!doctype html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{TITLE}</title>
<meta name="description" content="{DESC}">
<meta name="theme-color" content="#CFE0EA">
<meta name="color-scheme" content="light">
<meta property="og:type" content="website">
<meta property="og:title" content="{TITLE}">
<meta property="og:description" content="{DESC}">
<meta property="og:url" content="{SITE_URL}">
<meta property="og:image" content="{SITE_URL}assets/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{OG_ALT}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{TITLE}">
<meta name="twitter:description" content="{DESC}">
<meta name="twitter:image" content="{SITE_URL}assets/og.jpg">
<meta name="twitter:image:alt" content="{OG_ALT}">
<link rel="icon" href="assets/favicon-32.png" type="image/png" sizes="32x32">
<link rel="icon" href="assets/favicon-192.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
<link rel="preload" href="assets/fonts/zilla-slab-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/zilla-slab-latin-600-normal.woff2" as="font" type="font/woff2" crossorigin>
<script>document.documentElement.classList.add('js')</script>
{HERO_PRELOAD}
<link rel="stylesheet" href="assets/css/main.css">
<script type="module" src="assets/js/main.js"></script>
</head>
<body>
<main>
  <section class="field field--sky field--first">
    <div class="wrap">
      <div class="hero">
        <h1>Meet Eevee</h1>
        {hero_fig}
        {p("meet-0", True)}
      </div>
{S["s1"]}
    </div>
  </section>

  <section class="field field--meadow">
    <div class="wrap">
      {p("meet-1")}
{S["s2"]}
{S["s3"]}
    </div>
  </section>

  <section class="field field--blush">
    <div class="wrap">
      {p("meet-2")}
{S["s4"]}
{S["s5"]}
    </div>
  </section>

  <section class="field field--sky">
    <div class="wrap">
      {p("meet-3")}
{S["s6"]}
{S["s7"]}
    </div>
  </section>

  <section class="field field--blush field--donate">
    <div class="wrap">
      <h2>In Loving Memory of Eevee</h2>
      {p("memory-0", True)}
      {p("memory-1")}
      <a class="donate" href="{DONATE}" target="_blank" rel="noopener">{LABEL}<span class="sr-only"> (opens in a new tab)</span></a>
      <p class="domain">{DOMAIN}</p>
      {p("memory-2")}
    </div>
  </section>

  <section class="field field--sky field--closing">
    <div class="wrap closing">
      {farewell_fig}
      {p("closing-0", True)}
    </div>
  </section>
</main>
<dialog class="lightbox" aria-label="Photo">
  <div class="lightbox__scrim"></div>
  <div class="lightbox__stage"><picture><source type="image/avif"><source type="image/webp"><img class="lightbox__img" alt="" draggable="false"></picture></div>
  <button class="lightbox__btn lightbox__close" type="button" aria-label="Close"><svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 4l12 12M16 4L4 16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none"/></svg></button>
  <button class="lightbox__btn lightbox__prev" type="button" aria-label="Previous photo"><svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4L6.5 10l6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg></button>
  <button class="lightbox__btn lightbox__next" type="button" aria-label="Next photo"><svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M7.5 4l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg></button>
  <p class="lightbox__live sr-only" aria-live="polite"></p>
</dialog>
</body>
</html>
"""
(SITE / "index.html").write_text(html)

# ---- spreads rules, merged into main.css between markers (one stylesheet request) ----
BEGIN = "/* BEGIN GENERATED SPREADS (scripts/build_page.py, do not edit by hand) */"
END = "/* END GENERATED SPREADS */"
css = [BEGIN]
for idx, (name, mq) in enumerate([("ph", None), ("tb", "(min-width: 481px)")]):
    rules = []
    for sid, items in SPREADS:
        for it in items:
            col, row, extra = it[4 + idx]
            sel = f'.polaroid[data-media-id="{it[0]}"]'
            rules.append(f"{sel}{{grid-column:{col.replace('/', ' / ')};grid-row:{str(row).replace('/', ' / ')};margin:0;{extra}}}")
    body = "\n".join(rules)
    css.append(f"@media {mq} {{\n{body}\n}}" if mq else body)
def dt_rules(hi):
    rules = []
    gaps, frs = (DT_GAP_HI, DT_FR_HI) if hi else (DT_GAP, DT_FR)
    for sid, items in SPREADS:
        kind, places = DT_LAYOUT[sid]
        tpl = " ".join(f"{f:g}fr" for f in frs[kind])
        rules.append(f".spread--{sid}{{grid-template-columns:{tpl};column-gap:{gaps[kind]}px;}}")
        for it, (col, mt) in zip(items, places):
            extra = ""
            if kind == "4" and it[3]:
                extra += "margin-inline:-10%;"
            if it[0] in OVERLAP:
                extra += f"left:-{gaps[kind] + OVERLAP[it[0]]}px;"
            if hi:
                # only what differs from the >=1024 rule; the overlap shift depends on the gap
                if it[0] not in OVERLAP:
                    continue
                rules.append(f'.polaroid[data-media-id="{it[0]}"]{{{extra}}}')
            else:
                rules.append(f'.polaroid[data-media-id="{it[0]}"]{{grid-column:{col};grid-row:1;align-self:start;margin:0;margin-top:{mt}px;{extra}}}')
    return rules


css.append("@media (min-width: 1024px) {\n" + "\n".join(dt_rules(False)) + "\n}")
css.append("@media (min-width: 1600px) {\n" + "\n".join(dt_rules(True)) + "\n}")
css.append(END)
main = SITE / "assets/css/main.css"
text = main.read_text()
block = "\n".join(css) + "\n"
if BEGIN in text:
    a, b = text.index(BEGIN), text.index(END) + len(END) + 1
    text = text[:a] + block + text[b:]
else:
    text = text.rstrip("\n") + "\n\n" + block
main.write_text(text)
legacy = SITE / "assets/css/spreads.css"
if legacy.exists():
    legacy.unlink()
print("ok", len(html))
