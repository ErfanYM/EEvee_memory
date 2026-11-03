#!/usr/bin/env python3
"""Turn originals in the project root into web assets + site/assets/media.json.
Idempotent; only reads originals."""
import json, subprocess, sys, tempfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

sys.path.insert(0, str(Path(__file__).resolve().parent))
from media_config import MEDIA, WIDTHS, OG_SOURCE

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "site"
IMG = SITE / "assets" / "img"
VID = SITE / "assets" / "video"
FFMPEG = "/opt/homebrew/bin/ffmpeg"


def slug(name):
    return Path(name).stem[:8].lower()


def load_upright(path: Path) -> Image.Image:
    """Decode (HEIC via sips) and return an upright RGB image with no metadata."""
    src = path
    tmp = None
    if path.suffix.lower() == ".heic":
        tmp = tempfile.TemporaryDirectory()
        src = Path(tmp.name) / "d.png"
        subprocess.run(["sips", "-s", "format", "png", str(path), "--out", str(src)],
                       check=True, capture_output=True)
    im = Image.open(src)
    im.load()
    # sips PNG may keep the EXIF orientation or may have baked it in; exif_transpose
    # only rotates if an Orientation tag remains, so it is safe in both cases.
    im = ImageOps.exif_transpose(im).convert("RGB")
    clean = Image.new("RGB", im.size)
    clean.paste(im)
    if tmp:
        tmp.cleanup()
    return clean


def save_set(im: Image.Image, stem: str, widths):
    out = {"avif": [], "webp": [], "jpg": []}
    for w in widths:
        h = round(im.height * w / im.width)
        r = im.resize((w, h), Image.LANCZOS) if w != im.width else im
        for ext, kw in (("avif", dict(quality=55)), ("webp", dict(quality=78, method=6)),
                        ("jpg", dict(quality=82, progressive=True, optimize=True))):
            name = f"{stem}-{w}.{ext}"
            fmt = {"jpg": "JPEG"}.get(ext, ext.upper())
            r.save(IMG / name, fmt, **kw)
            if ext == "webp" and w == 960:  # keep 960 webp under 240 KB for very detailed photos
                while (IMG / name).stat().st_size > 240_000 and kw["quality"] > 20:
                    kw["quality"] -= 5
                    r.save(IMG / name, fmt, **kw)
            out[ext].append(f"assets/img/{name}")
    return out


def photo(entry):
    pid = slug(entry["file"])
    im = load_upright(ROOT / entry["file"])
    widths = sorted({min(w, im.width) for w in WIDTHS})
    sources = save_set(im, pid, widths)
    w, h = Image.open(SITE / sources["jpg"][-1]).size
    return dict(id=pid, kind="photo", group=entry["group"], alt=entry["alt"],
                width=w, height=h, sources=sources, poster=None), im


def video(entry):
    pid = slug(entry["file"])
    src = ROOT / entry["file"]
    mp4 = VID / f"{pid}.mp4"
    # ffmpeg autorotates using the display matrix and drops it from output.
    subprocess.run([FFMPEG, "-y", "-v", "error", "-i", str(src),
                    "-vf", "scale=720:1280,setsar=1", "-c:v", "libx264", "-profile:v", "high",
                    "-crf", "23", "-maxrate", "3M", "-bufsize", "6M", "-pix_fmt", "yuv420p",
                    "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart",
                    "-map_metadata", "-1", "-metadata:s:v", "rotate=0", str(mp4)], check=True)
    # poster from the encoded mp4 (already upright)
    png = IMG / f"{pid}-poster-tmp.png"
    subprocess.run([FFMPEG, "-y", "-v", "error", "-ss", str(entry.get("poster_time", 1.0)),
                    "-i", str(mp4), "-frames:v", "1", str(png)], check=True)
    im = Image.open(png).convert("RGB")
    im.load()
    png.unlink()
    pim = im.resize((540, 960), Image.LANCZOS)
    pim.save(IMG / f"{pid}-poster-960.webp", "WEBP", quality=80, method=6)
    pim.save(IMG / f"{pid}-poster-960.jpg", "JPEG", quality=82, progressive=True, optimize=True)
    return dict(id=pid, kind="video", group=entry["group"], alt=entry["alt"], width=720, height=1280,
                sources={"mp4": f"assets/video/{pid}.mp4"},
                poster=f"assets/img/{pid}-poster-960.webp"), pim


def og(im: Image.Image):
    w, h = im.size  # portrait; face upper-middle
    ch = round(w * 630 / 1200)
    top = max(0, min(h - ch, round(h * 0.38 - ch / 2)))
    c = im.crop((0, top, w, top + ch)).resize((1200, 630), Image.LANCZOS)
    c.save(SITE / "assets" / "og.jpg", "JPEG", quality=85, optimize=True, progressive=True)


def contact_sheet(items):
    cols, tw, th, lab = 6, 260, 346, 34
    rows = -(-len(items) // cols)
    sheet = Image.new("RGB", (cols * tw, rows * (th + lab)), (30, 30, 30))
    d = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 16)
    except OSError:
        font = ImageFont.load_default()
    for i, (m, im) in enumerate(items):
        x, y = (i % cols) * tw, (i // cols) * (th + lab)
        t = ImageOps.contain(im, (tw - 6, th - 6))
        sheet.paste(t, (x + (tw - t.width) // 2, y + (th - t.height) // 2))
        if m["kind"] == "video":
            cx, cy = x + 30, y + 30
            d.ellipse((cx - 20, cy - 20, cx + 20, cy + 20), fill=(0, 0, 0))
            d.polygon([(cx - 6, cy - 11), (cx - 6, cy + 11), (cx + 12, cy)], fill=(255, 255, 255))
        d.text((x + 6, y + th + 2), m["id"], fill=(255, 255, 255), font=font)
        d.text((x + 6, y + th + 17), m["group"] + (" [video]" if m["kind"] == "video" else ""),
               fill=(255, 210, 120), font=font)
    out = ROOT / "docs" / "council"
    out.mkdir(parents=True, exist_ok=True)
    sheet.save(out / "contact-sheet.jpg", "JPEG", quality=88)


def main():
    IMG.mkdir(parents=True, exist_ok=True)
    VID.mkdir(parents=True, exist_ok=True)
    manifest, thumbs, og_im = [], [], None
    for e in MEDIA:
        m, im = (photo if e["kind"] == "photo" else video)(e)
        manifest.append(m)
        thumbs.append((m, im.copy() if m["kind"] == "photo" and im.width < 400 else
                       ImageOps.contain(im, (520, 700))))
        if e["file"] == OG_SOURCE:
            og_im = im
        print("ok", m["id"])
    og(og_im)
    contact_sheet(thumbs)
    (SITE / "assets" / "media.json").write_text(json.dumps(manifest, indent=2) + "\n")


if __name__ == "__main__":
    main()
