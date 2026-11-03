#!/usr/bin/env python3
"""Generate site/index.html and site/assets/css/spreads.css (static, no-JS-needed markup).

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
DESC = "A page to remember Eevee, our sweet golden retriever, with her photos and videos."

# Per print: tilt, tape colour, lead flag, then placements per breakpoint:
# ph (<=480, 20-col grid), tb (481-1023, 24-col), dt (>=1024, 24-col): (column, row, extra css)
# Spread order and tilts: DESIGN-SYSTEM section 6.
SPREADS = [
    ("s1", [
        ("37c83b77", -3.0, None, False, ("1/12", 1, ""), ("1/12", 1, ""), ("1/8", 1, "margin-top:40px;")),
        ("img_8394", 1.5, None, True, ("6/21", 2, "margin-top:-22px;"), ("11/25", 1, "margin-top:48px;"), ("8/16", 1, "margin-left:-14px;")),
        ("img_4837", -1.5, None, False, ("1/12", 3, "margin-top:-22px;"), ("5/16", 2, ""), ("17/24", 1, "margin-top:70px;")),
    ]),
    ("s2", [
        ("ec73ecaf", -2.5, None, False, ("10/21", 1, ""), ("1/11", 1, ""), ("2/9", 1, "margin-top:50px;")),
        ("img_7207", 2.0, "sun", True, ("1/16", 2, "margin-top:-22px;"), ("10/24", 1, "margin-top:30px;"), ("9/17", 1, "")),
        ("img_0826", -1.0, None, False, ("10/21", 3, "margin-top:-22px;"), ("13/24", 2, ""), ("18/25", 1, "margin-top:20px;")),
    ]),
    ("s3", [
        ("img_2017", 2.5, None, False, ("1/12", 1, ""), ("1/12", 1, ""), ("1/8", 1, "margin-top:90px;")),
        ("b9e5276c", -1.5, None, True, ("8/21", 2, "margin-top:8px;"), ("13/25", "1/3", ""), ("9/17", 1, "")),
        ("b0eaddd4", 3.0, "sky", False, ("2/13", 3, "margin-top:8px;"), ("3/14", 2, "margin-top:24px;"), ("18/25", 1, "margin-top:20px;")),
    ]),
    ("s4", [
        ("img_6802", -2.0, None, False, ("1/11", 1, ""), ("1/10", 1, ""), ("2/8", 1, "")),
        ("img_5023", 1.5, "grass", False, ("10/21", 1, "margin-top:24px;"), ("11/22", 1, "margin-top:48px;"), ("9/16", 1, "margin-top:50px;")),
        ("img_4144", -3.0, None, False, ("2/13", 2, "margin-top:-22px;"), ("2/12", 2, ""), ("5/12", 2, "")),
        ("img_4973", 3.0, None, True, ("6/21", 3, "margin-top:-22px;"), ("11/24", 2, "margin-top:32px;"), ("14/22", 2, "margin-top:40px;")),
    ]),
    ("s5", [
        ("23983ab7", -2.0, None, False, ("1/14", 1, ""), ("1/10", 1, ""), ("2/8", 1, "margin-top:20px;")),
        ("232ed04c", 1.5, "sky", True, ("6/21", 2, "margin-top:-22px;"), ("10/25", 1, "align-self:center;"), ("9/17", 1, "margin-top:110px;")),
        ("0f88d984", 2.0, None, False, ("8/21", 3, "margin-top:8px;"), ("8/17", 2, "margin-top:24px;"), ("18/24", 1, "margin-top:60px;")),
    ]),
    ("s6", [
        ("img_3785", -2.5, None, False, ("1/12", 1, ""), ("1/13", 1, ""), ("2/9", 1, "")),
        ("img_3786", 2.0, "sun", False, ("10/21", 1, "margin-top:20px;"), ("13/25", 1, ""), ("9/16", 1, "margin-left:-10px;margin-top:30px;")),
        ("c1a73628", -1.5, None, False, ("4/17", 2, "margin-top:8px;"), ("2/11", 2, ""), ("18/24", 1, "margin-top:10px;")),
        ("img_8788", 3.0, None, False, ("9/20", 3, "margin-top:8px;"), ("13/24", 2, "margin-top:40px;"), ("12/19", 2, "")),
    ]),
    ("s7", [
        ("img_1551", -2.0, "grass", False, ("1/12", 1, ""), ("1/12", 1, ""), ("2/9", 1, "")),
        ("img_7522", 2.5, None, False, ("10/21", 1, "margin-top:20px;"), ("13/24", 1, "margin-top:40px;"), ("10/17", 1, "margin-top:50px;")),
        ("20221006", -1.0, None, True, ("3/18", 2, "margin-top:-10px;"), ("6/20", 2, "margin-top:24px;"), ("9/17", 2, "")),
    ]),
]
HERO = "img_8819"
HERO_TILT = -2.5


def span(col):
    a, b = (int(x) for x in col.split("/"))
    return b - a


def srcset(m, ext):
    return ", ".join(f"{p} {p.rsplit('-', 1)[1].split('.')[0]}w" for p in m["sources"][ext])


def picture(m, sizes, hero=False):
    s = m["sources"]
    fallback = s["jpg"][1]
    lazy = 'fetchpriority="high"' if hero else 'loading="lazy" decoding="async"'
    if hero:
        lazy = 'loading="eager" decoding="async" fetchpriority="high"'
    return (
        "<picture>"
        f'<source type="image/avif" srcset="{srcset(m, "avif")}" sizes="{sizes}">'
        f'<source type="image/webp" srcset="{srcset(m, "webp")}" sizes="{sizes}">'
        f'<img src="{fallback}" srcset="{srcset(m, "jpg")}" sizes="{sizes}" '
        f'width="{m["width"]}" height="{m["height"]}" alt="{escape(m["alt"], quote=True)}" {lazy} draggable="false">'
        "</picture>"
    )


def fmt(x):
    return f"{x:g}"


def sizes_for(ph, tb, dt):
    return (
        f"(min-width: 1024px) calc(min(100vw - 96px, 1104px) * {span(dt)}/24), "
        f"(min-width: 481px) calc(min(92vw, 760px) * {span(tb)}/24), "
        f"calc((100vw - 40px) * {span(ph)}/20)"
    )


PLAY_SVG = '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>'


def figure(item, index, hero=False):
    pid, tilt, tape, lead, ph, tb, dt = item
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
            f'<video preload="none" playsinline width="{m["width"]}" height="{m["height"]}" poster="{m["poster"]}">'
            f'<source src="{m["sources"]["mp4"]}" type="video/mp4"></video>'
            f'<button class="video__play" type="button" aria-label="Play video: {escape(m["alt"], quote=True)}">{PLAY_SVG}</button>'
            "</div>"
        )
    else:
        sz = sizes_for(ph[0], tb[0], dt[0])
        inner = (
            f'<button class="polaroid__open" type="button" aria-haspopup="dialog" '
            f'aria-label="Open photo: {escape(m["alt"], quote=True)}">{picture(m, sz)}</button>'
        )
    return (
        f'<figure class="{" ".join(cls)}" data-media-id="{pid}" data-kind="{m["kind"]}" style="{style}">'
        f'<div class="polaroid__tilt">{inner}</div></figure>'
    )


def spread(sid, items):
    figs = "\n      ".join(figure(it, i) for i, it in enumerate(items))
    return f'    <div class="spread spread--{sid}" data-count="{len(items)}">\n      {figs}\n    </div>'


def p(key, lead=False):
    g, i = key.split("-")
    text = copy[g][int(i)]
    return f'<p class="copy{" copy--lead" if lead else ""}" data-copy="{key}">{escape(text, quote=False)}</p>'


hero_item = (HERO, HERO_TILT, None, False, ("1/2", 1, ""), ("1/2", 1, ""), ("1/2", 1, ""))
hm = media[HERO]
hero_fig = (
    f'<figure class="polaroid polaroid--hero" data-media-id="{HERO}" data-kind="photo" '
    f'style="--tilt:{fmt(HERO_TILT)}deg;--ar:{hm["width"]}/{hm["height"]};--i:0">'
    f'<div class="polaroid__tilt"><button class="polaroid__open" type="button" aria-haspopup="dialog" '
    f'aria-label="Open photo: {escape(hm["alt"], quote=True)}">'
    + picture(hm, "(min-width: 1024px) 470px, (min-width: 720px) 45vw, min(78vw, 440px)", hero=True)
    + "</button></div></figure>"
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
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{TITLE}">
<meta name="twitter:description" content="{DESC}">
<meta name="twitter:image" content="{SITE_URL}assets/og.jpg">
<link rel="icon" href="assets/favicon.png" type="image/png">
<link rel="preload" href="assets/fonts/zilla-slab-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/zilla-slab-latin-600-normal.woff2" as="font" type="font/woff2" crossorigin>
<script>document.documentElement.classList.add('js')</script>
<link rel="stylesheet" href="assets/css/main.css">
<link rel="stylesheet" href="assets/css/spreads.css">
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
    <div class="wrap">
      {p("closing-0", True)}
    </div>
  </section>
</main>
</body>
</html>
"""
(SITE / "index.html").write_text(html)

# ---- spreads.css ----
css = ["/* GENERATED by scripts/build_page.py from the layout table. Do not edit by hand. */"]
bps = [("ph", None), ("tb", "(min-width: 481px)"), ("dt", "(min-width: 1024px)")]
for idx, (name, mq) in enumerate(bps):
    rules = []
    for sid, items in SPREADS:
        for it in items:
            col, row, extra = it[4 + idx]
            r = row if isinstance(row, str) else f"{row}"
            sel = f'.polaroid[data-media-id="{it[0]}"]'
            reset = "margin:0;" if idx else "margin:0;"
            rules.append(f"{sel}{{grid-column:{col.replace('/', ' / ')};grid-row:{r.replace('/', ' / ')};{reset}{extra}}}")
    body = "\n".join(rules)
    css.append(f"@media {mq} {{\n{body}\n}}" if mq else body)
(SITE / "assets/css/spreads.css").write_text("\n".join(css) + "\n")
print("ok", len(html))
