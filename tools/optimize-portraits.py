"""Makes web-sized WebP copies of the Director and convenor portraits supplied by the APARN project team.
Usage: python tools/optimize-portraits.py <folder with the original portraits>   (needs Pillow)
Output: static/img/convenor-<person id>-360.webp and -720.webp (the person ids match content/people.json)."""
import os
import sys
from PIL import Image, ImageOps

FILES = {  # original file name -> person id in content/people.json
    "Roopesh.jpg": "roopesh-sitharan",
    "Kurniawan Adi Saputro.jpg": "kurniawan-adi-saputro",
    "Danny Butt.jpg": "danny-butt",
    "Pornrat Damrhung.jpg": "pornrat-damrhung",
    "Gunalan Nadarajan.jpg": "gunalan-nadarajan",
}
SRC = sys.argv[1]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "static", "img")
os.makedirs(OUT, exist_ok=True)
for name, pid in FILES.items():
    im = ImageOps.exif_transpose(Image.open(os.path.join(SRC, name))).convert("RGB")
    im = ImageOps.fit(im, (895, 1000), Image.LANCZOS, centering=(0.5, 0.4))  # a consistent 0.895 portrait frame
    for w in (360, 720):
        h = round(w * 1000 / 895)
        out = os.path.join(OUT, f"convenor-{pid}-{w}.webp")
        im.resize((w, h), Image.LANCZOS).save(out, "WEBP", quality=82, method=6)
        print(out, w, h, os.path.getsize(out) // 1024, "KB")
