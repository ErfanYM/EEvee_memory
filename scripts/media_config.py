"""Media inventory: original filename -> group, alt, optional poster_time (videos)."""

def _p(file, group, alt):
    return {"file": file, "kind": "photo", "group": group, "alt": alt}

def _v(file, group, alt, poster_time=1.0):
    return {"file": file, "kind": "video", "group": group, "alt": alt, "poster_time": poster_time}

MEDIA: list[dict] = [
    _p("IMG_8819.JPEG", "hero", "Eevee with a big happy face in the snowy woods"),
    _p("37C83B77-8FD3-403A-9265-3681AB7FBFA0.JPEG", "meet", "Eevee smiling on a town street in her bandana"),
    _p("IMG_8394.JPEG", "meet", "Eevee sitting proudly in the light snow"),
    _p("IMG_4837.HEIC", "meet", "Eevee lying in the grass with a chew under a blue sky"),
    _p("EC73ECAF-C8B1-4DEC-AF35-DADA03D753AD.HEIC", "foodie", "Eevee looking up beside a cup"),
    _p("IMG_0826.HEIC", "foodie", "Eevee licking her lips on a picnic table"),
    _p("IMG_7207.HEIC", "foodie", "Eevee with her 10th birthday cake"),
    _p("IMG_2017.JPEG", "walks", "Eevee walking on a sidewalk"),
    _p("B0EADDD4-83BB-4A2B-B53C-B5D18C994AEE.HEIC", "walks", "Eevee lying on paving stones on a town street"),
    _p("IMG_6802.HEIC", "hikes", "Eevee small in the distance on a forest trail"),
    _p("IMG_4144.HEIC", "hikes", "Eevee sitting on a stone block in a park"),
    _p("IMG_5023.HEIC", "hikes", "Eevee watching the sunset over a big field"),
    _p("IMG_4973.JPEG", "hikes", "Eevee jumping into a paddling pool"),
    _p("232ed04c-d109-4862-b4d6-25e013c44062.JPEG", "adventures", "Eevee running toward the camera across a field"),
    _p("20221006_141347.JPEG", "adventures", "Eevee under an autumn maple tree"),
    _p("IMG_3785.HEIC", "snow", "Eevee in a yellow raincoat in the snow, facing the camera"),
    _p("IMG_3786.HEIC", "snow", "Eevee in a yellow raincoat in the snow, in profile"),
    _p("IMG_8788.JPEG", "snow", "Eevee exploring the snowy woods"),
    _p("IMG_1551.HEIC", "cozy", "Eevee at Christmas in antlers with her green toy"),
    _p("IMG_7522.HEIC", "cozy", "Eevee cozy on a fluffy rug"),
    _v("23983AB7-5B59-40A2-B8CC-38A68B911478.MOV", "adventures", "Eevee walking along the grass with a stick in her mouth"),
    _v("0F88D984-3F6C-4108-981B-9A6FAEAC4C7B.MOV", "adventures", "Eevee carrying a big stick at the playground"),
    _v("B9E5276C-E571-4027-9006-D91A39FF71A1.MOV", "walks", "Eevee trotting along a wet park path"),
    _v("C1A73628-47D9-44DD-87D7-FF507366121D.MOV", "snow", "Eevee on a snow walk in her yellow raincoat"),
]

WIDTHS = (480, 960, 1600)
OG_SOURCE = "IMG_8819.JPEG"
