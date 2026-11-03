#!/usr/bin/env python3
"""Circular crop of Eevee's face (hero photo) on the sky field colour -> favicon PNGs.
Run: python3 scripts/make_favicons.py"""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "site" / "assets"
SRC = ASSETS / "img" / "img_8819-960.jpg"
SKY = (0xCF, 0xE0, 0xEA)
BOX = (300, 350, 740, 790)  # square around the face in the 960px hero


def make(size, circle_ratio, name):
    S = size * 4  # supersample for a clean circle edge
    face = Image.open(SRC).convert("RGB").crop(BOX)
    d = round(S * circle_ratio)
    face = face.resize((d, d), Image.LANCZOS)
    mask = Image.new("L", (d, d), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, d - 1, d - 1), fill=255)
    canvas = Image.new("RGB", (S, S), SKY)
    o = (S - d) // 2
    canvas.paste(face, (o, o), mask)
    canvas.resize((size, size), Image.LANCZOS).save(ASSETS / name, "PNG", optimize=True)


make(32, 1.0, "favicon-32.png")
make(192, 1.0, "favicon-192.png")
make(180, 0.86, "apple-touch-icon.png")
print("ok")
