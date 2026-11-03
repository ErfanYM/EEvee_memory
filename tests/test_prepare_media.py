import json, subprocess, sys
from pathlib import Path
import pytest
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
from media_config import MEDIA  # noqa: E402

SITE = ROOT / "site"
MANIFEST = SITE / "assets" / "media.json"


@pytest.fixture(scope="module")
def manifest():
    assert MANIFEST.exists(), "run scripts/prepare_media.py first"
    return json.loads(MANIFEST.read_text())


def test_manifest_has_20_photos_4_videos(manifest):
    kinds = [m["kind"] for m in manifest]
    assert (kinds.count("photo"), kinds.count("video")) == (20, 4)
    ids = [m["id"] for m in manifest]
    assert len(set(ids)) == len(ids)


def test_every_original_is_mapped():
    exts = {".heic", ".jpeg", ".jpg", ".mov"}
    found = {p.name for p in ROOT.iterdir() if p.is_file() and p.suffix.lower() in exts}
    assert found == {m["file"] for m in MEDIA}


def test_outputs_upright(manifest):
    byid = {m["id"]: m for m in manifest}
    for i in ("b0eaddd4", "ec73ecaf"):
        w, h = Image.open(SITE / byid[i]["sources"]["jpg"][1]).size
        assert h > w, i
    for m in manifest:
        if m["kind"] != "photo":
            continue
        w, h = Image.open(SITE / m["sources"]["jpg"][-1]).size
        assert (w, h) == (m["width"], m["height"]), m["id"]


def test_no_exif_or_gps(manifest):
    for m in manifest:
        if m["kind"] != "photo":
            continue
        for p in m["sources"]["jpg"]:
            ex = Image.open(SITE / p).getexif()
            assert 274 not in ex and 34853 not in ex, p
    og = Image.open(SITE / "assets" / "og.jpg")
    assert og.size == (1200, 630) and not og.getexif()


def probe(path):
    out = subprocess.check_output(["ffprobe", "-v", "error", "-show_streams", "-of", "json", str(path)])
    return json.loads(out)["streams"]


def test_videos_h264_aac_faststart(manifest):
    vids = [m for m in manifest if m["kind"] == "video"]
    for m in vids:
        p = SITE / m["sources"]["mp4"]
        streams = probe(p)
        v = next(s for s in streams if s["codec_type"] == "video")
        a = next(s for s in streams if s["codec_type"] == "audio")
        assert v["codec_name"] == "h264" and a["codec_name"] == "aac"
        assert (v["width"], v["height"]) == (720, 1280)
        assert not any("rotation" in sd or sd.get("side_data_type") == "Display Matrix"
                       for sd in v.get("side_data_list", []))
        data = p.read_bytes()[:65536]
        assert 0 <= data.find(b"moov") < data.find(b"mdat") or data.find(b"mdat") == -1
        assert data.find(b"moov") != -1
        for ext in ("webp", "jpg"):
            assert (SITE / m["poster"].replace("webp", ext)).exists()


def test_sizes(manifest):
    total = 0
    for m in manifest:
        if m["kind"] == "video":
            s = (SITE / m["sources"]["mp4"]).stat().st_size
            assert s < 25e6
            total += s
        else:
            assert (SITE / m["sources"]["webp"][1]).stat().st_size < 250_000, m["id"]
    assert total < 16e6
    assert (SITE / "assets" / "og.jpg").stat().st_size < 200_000
