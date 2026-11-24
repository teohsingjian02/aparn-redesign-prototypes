"""Makes web-sized WebP copies of the images reused from aparn.net (see content/sources.json for credits).
Usage: python tools/optimize-images.py <aparn.net uploads folder>   (needs Pillow)"""
import os, sys, unicodedata
from PIL import Image


def find(rel):
    """Finds a file whose name matches after Unicode normalisation (aparn.net file names mix NFC and NFD accents)."""
    folder, name = os.path.split(os.path.join(SRC, *rel.split("/")))
    want = unicodedata.normalize("NFC", name)
    for f in os.listdir(folder):
        if unicodedata.normalize("NFC", f) == want:
            return os.path.join(folder, f)
    raise FileNotFoundError(rel)

SRC = sys.argv[1]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "static", "img")
os.makedirs(OUT, exist_ok=True)
JOBS = [  # (source, slug, widths, crop box as fractions or None)
    ("2020/10/CIS22ESH_AR_5736_AJR7187-1.jpg", "eshraghi-reculnaissance-2020", [2000, 1200, 720], None),
    ("2020/11/2020_RAQs_KH4_mid-1.jpg", "raqs-media-collective", [1400, 800], None),
    ("2020/11/AuntyRosesVictoria-copy.jpg", "victoria-hunt", [1200, 720], None),
    ("2020/11/Léuli-Eshrāghi-2019-Portrait-by-Rhett-Hammerton-soir-doré.jpg", "leuli-eshraghi-portrait", [900, 560], None),
    ("2020/11/Media-Res_Lisa-Hilli.jpg", "lisa-hilli", [1000, 600], None),
    ("2020/11/YK-Evotia-Tamua-2_5-crop.jpg", "yuki-kihara", [1200, 720], None),
    ("2020/11/Photo_GiuliaMCGauran-1.jpg", "natalie-king", [900, 560], None),
    ("2021/11/unnamed.jpg", "aparn2021-leaves", [1200, 720], None),
]
for src, slug, widths, crop in JOBS:
    im = Image.open(find(src)).convert("RGB")
    for w in widths:
        if w > im.width:
            continue
        h = round(im.height * w / im.width)
        out = os.path.join(OUT, f"{slug}-{w}.webp")
        im.resize((w, h), Image.LANCZOS).save(out, "WEBP", quality=78, method=6)
        print(f"{slug}-{w}.webp {w}x{h} {os.path.getsize(out) // 1024} KB")
