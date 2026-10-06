"""
Regenerates the placeholder images in /public (requires Python 3 + Pillow).
    python scripts/generate-placeholders.py           # only creates missing files
    python scripts/generate-placeholders.py --force   # overwrites everything
Placeholders keep the recommended aspect ratios at a reduced size so the
repository stays light. Replace them with your own files at the same paths.
"""
import math, os, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.join(os.path.dirname(__file__), '..', 'public')
FORCE = '--force' in sys.argv
DARK, PAPER, ACCENT, GRAY = (17, 17, 18), (241, 240, 233), (255, 128, 0), (119, 119, 119)

def font(size, bold=False):
    for path in [
        f"/usr/share/fonts/truetype/dejavu/DejaVuSans{'-Bold' if bold else ''}.ttf",
        f"C:/Windows/Fonts/{'arialbd' if bold else 'arial'}.ttf",
        f"/System/Library/Fonts/Supplemental/Arial{' Bold' if bold else ''}.ttf",
    ]:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default(size=size)

def contour_points(w, h, seed, r, rings, cx=0.62, cy=0.45, spread=0.75, aspect=1.25):
    base = (0.03 + r * (spread / rings)) * min(w, h)
    pts = []
    for i in range(121):
        a = i / 120 * math.tau
        n = math.sin(a * 3 + seed + r * .31) * .085 + math.sin(a * 5 - seed * 1.7 + r * .22) * .045 + math.cos(a * 2 + seed * .6 - r * .17) * .07
        rad = base * (1 + n)
        pts.append((w * cx + math.cos(a) * rad * aspect, h * cy + math.sin(a) * rad))
    return pts

def draw_contours(img, color, alpha, seed=1.3, rings=14, width=2, **kw):
    over = Image.new('RGBA', img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(over)
    for r in range(rings):
        d.line(contour_points(img.width, img.height, seed, r, rings, **kw), fill=color + (alpha,), width=width, joint='curve')
    return over

def gradient(size, top, bottom):
    w, h = size
    g = Image.new('RGB', (1, h))
    for y in range(h):
        t = y / max(h - 1, 1)
        g.putpixel((0, y), tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3)))
    return g.resize((w, h))

def save(img, rel, **kw):
    path = os.path.join(ROOT, rel)
    if os.path.exists(path) and not FORCE:
        print('keep  ', rel); return
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, 'WEBP', quality=80, method=5, **kw)
    print('write ', rel, img.size)

def frame(rel, size, title, rec, light=False, seed=1.3):
    w, h = size
    bg = gradient(size, (232, 231, 223), (214, 213, 204)) if light else gradient(size, (34, 34, 38), (17, 17, 18))
    img = bg.convert('RGBA')
    ink = DARK if light else PAPER
    img.alpha_composite(draw_contours(img, ink, 34 if light else 30, seed=seed, rings=16, width=max(1, w // 700)))
    d = ImageDraw.Draw(img)
    pad = int(min(w, h) * .06)
    big = font(int(min(w, h) * .12), True)
    small = font(max(14, int(min(w, h) * .028)))
    d.rectangle([pad, pad, pad + int(min(w, h) * .045), pad + int(min(w, h) * .045)], fill=ACCENT)
    d.text((pad, h - pad - int(min(w, h) * .2)), title.upper(), font=big, fill=ink + (235,))
    d.text((pad, h - pad - int(min(w, h) * .055)), f"{rel}   ·   recommended {rec}", font=small, fill=ink + (170,))
    d.text((w - pad, pad), 'PLACEHOLDER', font=small, fill=ink + (150,), anchor='ra')
    save(img.convert('RGB'), rel)

def silhouette(rel, size, rec):
    w, h = size
    mask = Image.new('L', size, 0)
    m = ImageDraw.Draw(mask)
    X, Y = (lambda v: v * w), (lambda v: v * h)
    m.ellipse([X(.385), Y(.12), X(.615), Y(.335)], fill=255)                       # head
    m.rectangle([X(.45), Y(.3), X(.55), Y(.4)], fill=255)                           # neck
    m.ellipse([X(.17), Y(.37), X(.47), Y(.62)], fill=255)                           # shoulders
    m.ellipse([X(.53), Y(.37), X(.83), Y(.62)], fill=255)
    m.polygon([(X(.2), Y(1)), (X(.18), Y(.5)), (X(.32), Y(.385)), (X(.68), Y(.385)), (X(.82), Y(.5)), (X(.8), Y(1))], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(max(1, w // 600)))
    body = gradient(size, (118, 118, 124), (52, 52, 58)).convert('RGBA')
    body.alpha_composite(draw_contours(body, PAPER, 40, seed=2.2, rings=18, width=max(1, w // 500), cx=.5, cy=.55, spread=.9, aspect=.8))
    rim = Image.new('RGBA', size, ACCENT + (0,))
    edge = mask.filter(ImageFilter.FIND_EDGES).filter(ImageFilter.GaussianBlur(1))
    rim.putalpha(edge.point(lambda v: min(255, v * 3)))
    body.alpha_composite(rim)
    d = ImageDraw.Draw(body)
    f1, f2 = font(int(w * .036), True), font(max(14, int(w * .02)))
    d.text((w / 2, h * .6), 'YOUR TRANSPARENT', font=f1, fill=PAPER + (240,), anchor='mm')
    d.text((w / 2, h * .6 + w * .045), 'PORTRAIT', font=f1, fill=PAPER + (240,), anchor='mm')
    d.text((w / 2, h * .68), rel.split('/')[-1], font=f2, fill=PAPER + (190,), anchor='mm')
    d.text((w / 2, h * .68 + w * .03), f'{rec}, alpha required', font=f2, fill=PAPER + (190,), anchor='mm')
    out = Image.new('RGBA', size, (0, 0, 0, 0))
    out.paste(body, (0, 0), mask)
    save(out, rel, lossless=False)

def obj(rel, kind, s=800):
    img = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if kind == 'ring':
        m = Image.new('L', (s, s), 0); md = ImageDraw.Draw(m)
        md.ellipse([s*.1, s*.25, s*.9, s*.75], fill=255); md.ellipse([s*.26, s*.37, s*.74, s*.63], fill=0)
        col = gradient((s, s), (241, 240, 233), (150, 150, 145)).convert('RGBA')
        img.paste(col, (0, 0), m.filter(ImageFilter.GaussianBlur(1)))
        d.ellipse([s*.18, s*.31, s*.82, s*.69], outline=ACCENT + (255,), width=max(2, s // 160))
        img = img.rotate(-18, resample=Image.BICUBIC)
    elif kind == 'cube':
        c, r = (s / 2, s / 2), s * .32
        top = [(c[0], c[1]-r), (c[0]+r*.87, c[1]-r/2), (c[0], c[1]), (c[0]-r*.87, c[1]-r/2)]
        left = [(c[0]-r*.87, c[1]-r/2), (c[0], c[1]), (c[0], c[1]+r), (c[0]-r*.87, c[1]+r/2)]
        right = [(c[0]+r*.87, c[1]-r/2), (c[0], c[1]), (c[0], c[1]+r), (c[0]+r*.87, c[1]+r/2)]
        d.polygon(top, fill=ACCENT + (255,)); d.polygon(left, fill=PAPER + (255,)); d.polygon(right, fill=(90, 90, 95, 255))
    else:
        m = Image.new('L', (s, s), 0); ImageDraw.Draw(m).ellipse([s*.15, s*.15, s*.85, s*.85], fill=255)
        sph = Image.new('RGBA', (s, s))
        for y in range(s):
            for x in range(0, s, 2):
                dx, dy = (x - s*.38) / s, (y - s*.36) / s
                v = max(0, 1 - math.hypot(dx, dy) * 1.6)
                col = (int(40 + 200 * v), int(40 + 199 * v), int(44 + 189 * v), 255)
                sph.putpixel((x, y), col)
                if x + 1 < s: sph.putpixel((x + 1, y), col)
        img.paste(sph, (0, 0), m.filter(ImageFilter.GaussianBlur(1)))
        band = Image.new('L', (s, s), 0); ImageDraw.Draw(band).ellipse([s*.05, s*.44, s*.95, s*.58], outline=255, width=max(3, s // 90))
        img.paste(Image.new('RGBA', (s, s), ACCENT + (255,)), (0, 0), band)
    save(img, rel, lossless=False)

if __name__ == '__main__':
    silhouette('transparent/hero/hero-desktop.webp', (1200, 1600), '3000×4000')
    silhouette('transparent/hero/hero-mobile.webp', (900, 1200), '1800×2400')
    frame('images/hero/hero-desktop.webp', (1600, 900), 'Hero backdrop', '2560×1440', seed=.4)
    frame('images/hero/hero-mobile.webp', (900, 1600), 'Hero backdrop', '1080×1920', seed=.4)
    frame('images/about/about-01.webp', (960, 1200), 'Portrait', '2400×3000', seed=2.7)
    frame('images/about/about-02.webp', (960, 1200), 'Portrait 02', '2400×3000', light=True, seed=3.4)
    frame('images/academic/academic.webp', (960, 1200), 'Academic', '1600×2000', seed=6.2)
    for n in range(1, 5):
        frame(f'images/projects/project-0{n}/cover.webp', (1600, 900), f'Project 0{n}', '2560×1440', light=(n % 2 == 0), seed=n * 1.1)
        frame(f'images/projects/project-0{n}/detail-01.webp', (1200, 800), f'P0{n} detail 1', '2400×1600', light=(n % 2 == 1), seed=n * 1.7)
        frame(f'images/projects/project-0{n}/detail-02.webp', (1200, 800), f'P0{n} detail 2', '2400×1600', seed=n * 2.3)
    for n in range(1, 5):
        frame(f'images/lifestyle/lifestyle-0{n}.webp', (1200, 800), f'Lifestyle 0{n}', '2400×1600', light=(n == 2), seed=n * .9 + 5)
    obj('transparent/objects/object-01.webp', 'ring')
    obj('transparent/objects/object-02.webp', 'cube')
    obj('transparent/objects/object-03.webp', 'sphere')
