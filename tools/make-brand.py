"""Makes the web versions of the APARN logo and favicon supplied by the project team.
Usage: python tools/make-brand.py <folder with Logo.png and "APARN Favicon.png">   (needs Pillow)
Output in static/brand/: logo-black-300/600.png, logo-white-300/600.png (trimmed to the artwork),
favicon-32.png, favicon-192.png, apple-touch-icon.png (on white) and favicon.ico."""
import os
import sys
from PIL import Image

SRC = sys.argv[1]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "static", "brand")
os.makedirs(OUT, exist_ok=True)

logo = Image.open(os.path.join(SRC, "Logo.png")).convert("RGBA")
x0, y0, x1, y1 = logo.getchannel("A").getbbox()
pad = 6
logo = logo.crop((max(0, x0 - pad), max(0, y0 - pad), min(logo.width, x1 + pad), min(logo.height, y1 + pad)))
alpha = logo.getchannel("A")
for tone, rgb in (("black", (12, 12, 14)), ("white", (255, 255, 255))):
    solid = Image.new("RGBA", logo.size, rgb + (255,))
    solid.putalpha(alpha)
    for w in (300, 600):
        h = round(w * logo.height / logo.width)
        solid.resize((w, h), Image.LANCZOS).save(os.path.join(OUT, f"logo-{tone}-{w}.png"), optimize=True)
print("logo", logo.size, "->", round(300 * logo.height / logo.width), "px tall at 300 wide")

fav = Image.open(os.path.join(SRC, "APARN Favicon.png")).convert("RGBA")
x0, y0, x1, y1 = fav.getchannel("A").getbbox()
side = max(x1 - x0, y1 - y0)
cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
fav = fav.crop((cx - side // 2, cy - side // 2, cx - side // 2 + side, cy - side // 2 + side))
fav.resize((32, 32), Image.LANCZOS).save(os.path.join(OUT, "favicon-32.png"), optimize=True)
fav.resize((192, 192), Image.LANCZOS).save(os.path.join(OUT, "favicon-192.png"), optimize=True)
touch = Image.new("RGBA", (180, 180), (255, 255, 255, 255))
touch.alpha_composite(fav.resize((160, 160), Image.LANCZOS), (10, 10))
touch.convert("RGB").save(os.path.join(OUT, "apple-touch-icon.png"), optimize=True)
fav.save(os.path.join(OUT, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
for f in sorted(os.listdir(OUT)):
    print(f, os.path.getsize(os.path.join(OUT, f)) // 1024, "KB")
