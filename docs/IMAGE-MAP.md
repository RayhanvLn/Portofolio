# Image map

Every image the site renders, where it lives, which component draws it, and what to supply.

**How images are wired.** Components never contain image paths. Every path is written once in
`src/data/portfolio.ts` (the `images` object at the top, plus `graphics` and `model` near the bottom) and
reaches components as props. To replace a photo, either overwrite the file at the same path, or put your file
anywhere in `/public` and change that one path in `images`. If the new file has a different aspect ratio, also
update the `width`/`height` next to it — they reserve the layout space.

**Missing files never break the page.** `SmartImage` and the hero's `HeroSubject` catch load errors and draw a
labelled placeholder showing the path to fill.

**Placeholders.** Every file below currently exists as a generated placeholder (same aspect ratio, smaller size).
Regenerate with `python scripts/generate-placeholders.py` (creates only missing files; `--force` overwrites).

Formats: supply `.webp` (alpha-capable). Next.js serves AVIF/WebP at the right size per device automatically.

---

## Logo (page transition)

### LOGO
- **Path:** `public/assets/logo.svg`
- **Set in data:** `images.logo` → `profile.logo` (`src/data/portfolio.ts`); transition sizes in `src/config/pageTransition.ts`
- **Appears:** (1) centre of the page transition and first-visit intro; (2) top centre of the home hero, above the name
- **Components:** `src/components/PageTransition/TransitionOverlay.tsx` (as `<img>`); `src/components/Hero/Hero.tsx` (as a CSS mask in the text colour)
- **Desktop / mobile:** both — transition 120 / 96 / 76 px wide; hero 46–64 px wide
- **Transparency:** YES (SVG)
- **Notes:** this is your logo with the canvas trimmed to the artwork (only `viewBox`/size changed — paths
  untouched). The original file is kept as `public/assets/logo-original.svg` (not rendered).

---

## Hero

### HERO CUT-OUT — DESKTOP (primary hero subject)
- **Path:** `public/transparent/hero/hero-desktop.webp`
- **Set in data:** `images.heroCutoutDesktop` → `profile.heroImage`
- **Appears:** Home hero, centre layer between the two name lines (≥ 900px wide). Also preloaded by the preloader.
- **Components:** `src/components/Hero/Hero.tsx` → `src/components/Hero/HeroSubject.tsx` (`<picture>` source `min-width: 900px`); `src/components/Preloader/Preloader.tsx`
- **Desktop / mobile:** desktop and tablet
- **Transparency:** **YES** — full-body or half-body cut-out, alpha required
- **Recommended:** 3000 × 4000 px (3:4). Shown with `object-fit: contain`, anchored to the bottom — never cropped.

### HERO CUT-OUT — MOBILE
- **Path:** `public/transparent/hero/hero-mobile.webp`
- **Set in data:** `images.heroCutoutMobile` → `profile.heroMobileImage`
- **Appears:** Home hero below 900px wide
- **Components:** `Hero/Hero.tsx` → `Hero/HeroSubject.tsx` (`<picture>` source `max-width: 899px`); `Preloader/Preloader.tsx`
- **Desktop / mobile:** mobile
- **Transparency:** **YES**
- **Recommended:** 1800 × 2400 px (3:4)

### HERO BACKDROP — DESKTOP (optional)
- **Path:** `public/images/hero/hero-desktop.webp`
- **Set in data:** `images.heroBackdropDesktop` → `profile.heroBackdrop.desktop`
- **Appears:** Only when `hero.mode` is `'backdrop'`: full-bleed photo behind the name instead of the cut-out
- **Components:** `Hero/Hero.tsx` → `Hero/HeroSubject.tsx` (`fit="cover"`); `Preloader/Preloader.tsx`
- **Desktop / mobile:** desktop
- **Transparency:** no
- **Recommended:** 2560 × 1440 px (16:9). Cropped with `object-position: 50% 30%`.

### HERO BACKDROP — MOBILE (optional)
- **Path:** `public/images/hero/hero-mobile.webp`
- **Set in data:** `images.heroBackdropMobile` → `profile.heroBackdrop.mobile`
- **Appears:** Backdrop mode below 900px
- **Components:** as above
- **Desktop / mobile:** mobile
- **Transparency:** no
- **Recommended:** 1080 × 1920 px (9:16)

---

## About

### ABOUT 01 — main portrait
- **Path:** `public/images/about/about-01.webp`
- **Set in data:** `images.about01` → `profile.portrait`
- **Appears:** About section on the home page and on `/about` (large portrait with reveal + parallax)
- **Components:** `src/components/About/About.tsx` (via `ImageReveal` → `ParallaxImage` → `SmartImage`)
- **Desktop / mobile:** both
- **Transparency:** no
- **Recommended:** 2400 × 3000 px (4:5)

### ABOUT 02 — supporting portrait
- **Path:** `public/images/about/about-02.webp`
- **Set in data:** `images.about02` → `about.images[0]`
- **Appears:** Smaller image overlapping the main portrait (home About + `/about`)
- **Components:** `About/About.tsx` (via `ImageReveal`)
- **Desktop / mobile:** both
- **Transparency:** no
- **Recommended:** 2400 × 3000 px (4:5)

---

## Projects (×4: `project-01` … `project-04`)

### PROJECT COVER — `public/images/projects/project-0N/cover.webp`
- **Set in data:** `images.projectCover(N)` → `projects[N-1].cover`
- **Appears in four places:**
  1. Home → pinned horizontal "Selected work" rail — `src/components/ProjectCard/ProjectCard.tsx` (rendered by `HorizontalScroll/HorizontalScroll.tsx`)
  2. `/projects` → floating cursor preview (desktop) and inline thumbnail (touch/mobile) — `src/components/ProjectList/ProjectList.tsx`
  3. `/projects/project-0N` → full-width cover under the title — `src/app/projects/[slug]/page.tsx` (via `ImageReveal`)
  4. The previous project's case study → "Next project" thumbnail — `src/app/projects/[slug]/page.tsx`
- `project-01/cover.webp` is also preloaded by `Preloader/Preloader.tsx`.
- **Desktop / mobile:** both
- **Transparency:** no
- **Recommended:** 2560 × 1440 px (16:9). Any ratio works: every frame (cards, list preview, case-study cover,
  "Next project") takes the cover's own proportions from the two numbers in `img(...)`, and covers are never
  cropped. Keep those numbers equal to the file's real size, and use the same ratio for all covers so the rail
  stays even.

### PROJECT DETAIL 1 & 2 — `public/images/projects/project-0N/detail-01.webp`, `detail-02.webp`
- **Set in data:** `images.projectDetail(N, 1|2)` → `projects[N-1].gallery[0|1]`
- **Appears:** Case-study gallery on `/projects/project-0N` — framed cards in two staggered columns; caption in the
  notch = the image's `alt` text (keep it short, e.g. "Admin dashboard") + its number; click opens it full size
- **Display:** shown whole (never cropped), in the image's own proportions from `img(...)`.
- **Components:** `src/components/ProjectGallery/ProjectGallery.tsx` (frame outline: `src/lib/notchFrame.ts`)
- **Desktop / mobile:** both
- **Transparency:** no
- **Recommended:** 2400 × 1600 px (3:2). Add more by appending to `gallery`.

---

## Academic career

### ACADEMIC PHOTO
- **Path:** `public/images/academic/academic.webp`
- **Set in data:** `src/data/academic.ts` → `image`
- **Appears:** home page, academic career section (left, under the title), with the accent block reveal + parallax
- **Component:** `src/components/AcademicCareer/AcademicCareer.tsx`
- **Desktop / mobile:** both
- **Transparency:** no
- **Recommended:** 1600 × 2000 px (4:5)

---

## Lifestyle (×4: `lifestyle-01` … `lifestyle-04`)

### LIFESTYLE — `public/images/lifestyle/lifestyle-0N.webp`
- **Set in data:** `images.lifestyle0N` → `lifestyle[N-1]` (the same array is used as `collage.items`)
- **Appears:**
  1. (Optional) Home collage — `src/components/Collage/Collage.tsx`, no longer on the home page since the academic section replaced it
  2. `/about` → draggable "Off screen" strip — `src/components/LifestyleStrip/LifestyleStrip.tsx`
- **Treatment:** grayscale by default; the item with `color: true` (currently lifestyle-02) stays in colour.
- **Note:** in the collage, lifestyle-01 is cropped to a 4:5 frame — keep its subject central.
- **Desktop / mobile:** both
- **Transparency:** no
- **Recommended:** 2400 × 1600 px (3:2)

---

## Decorative objects (×3)

### OBJECT — `public/transparent/objects/object-0N.webp`
- **Set in data:** `images.object0N` → `about.objects[N-1]`
- **Appears:** Floating around the About portraits with scroll-driven drift and rotation. `object-01` on the home page and `/about`; `object-02` and `object-03` on `/about` only.
- **Components:** `About/About.tsx`
- **Desktop / mobile:** both
- **Transparency:** **YES**
- **Recommended:** ~2000 × 2000 px max, subject filling most of the square

---

## Vector graphics

| File | Set in data | Used by | How |
|---|---|---|---|
| `public/svg/contour-01.svg` | `graphics.contours[0]` | `Footer/Footer.module.css` | CSS mask (`--svg-contour-1`): texture on the closing-section stage |
| `public/svg/contour-02.svg` | `graphics.contours[1]` | `Preloader/Preloader.module.css`, `SmartImage/SmartImage.module.css` | preloader backdrop; texture on missing-image placeholders (`--svg-contour-2`) |
| `public/svg/arrow.svg` | `graphics.arrow` | `globals.css` `.icon-arrow` ← `Icons/Arrow.tsx` | CSS mask so arrows take the text colour (`--svg-arrow`) |
| `src/app/icon.svg` | — (generated from the logo) | browser tab | vector favicon (accent tile + logo) |
| `src/app/favicon.ico` | — (generated) | browser tab / Google results | 16, 32, 48 px |
| `src/app/apple-icon.png` | — (generated) | iOS home screen | 180×180 |
| `src/app/opengraph-image.png` | — (generated) | link previews | 1200×630 |

The paths in `graphics` are exposed to CSS as custom properties by a `<style>` rule in `<head>` (`src/app/layout.tsx`).

The **animated contour lines** in the hero and contact page (`ContourField`) are drawn inline from
`src/components/ContourField/contourData.ts`, not from the SVG files, so their strokes can animate.
`node scripts/generate-contours.mjs` regenerates both the inline data and the two SVG files.

---

## 3D model (optional)

- **Path:** `public/models/hero-object.glb` (not included — add your own)
- **Set in data:** `model.src`; enable with `model.enabled: true` (`model.draco: true` for Draco-compressed files)
- **Appears:** Home hero, upper right, behind the subject. Until enabled, a procedural object is shown.
- **Component:** `src/components/ThreeScene/ThreeCanvas.tsx` (`Model`), loaded on demand by `ThreeScene.tsx`
- **Recommended:** < 1.5 MB, Draco-compressed, centred at the origin, about 2.5 units across

---

## Codebase search — every image reference

Equivalent of `rg -n --glob "*.{ts,tsx,js,jsx,css,scss}" "images/|transparent/|backgroundImage|src=" src public`, run after
implementation. **Literal paths appear only in `src/data/portfolio.ts`.**

```
src/data/portfolio.ts:17   heroCutoutDesktop: '/transparent/hero/hero-desktop.webp'
src/data/portfolio.ts:18   heroCutoutMobile:  '/transparent/hero/hero-mobile.webp'
src/data/portfolio.ts:19   heroBackdropDesktop: '/images/hero/hero-desktop.webp'
src/data/portfolio.ts:20   heroBackdropMobile:  '/images/hero/hero-mobile.webp'
src/data/portfolio.ts:21   about01: '/images/about/about-01.webp'
src/data/portfolio.ts:22   about02: '/images/about/about-02.webp'
src/data/portfolio.ts:23-25 object01–03: '/transparent/objects/object-0N.webp'
src/data/portfolio.ts:26-29 lifestyle01–04: '/images/lifestyle/lifestyle-0N.webp'
src/data/portfolio.ts:30   projectCover(n):  `/images/projects/project-0${n}/cover.webp`
src/data/portfolio.ts:31   projectDetail(n,d): `/images/projects/project-0${n}/detail-0${d}.webp`
src/data/portfolio.ts:183  contours: ['/svg/contour-01.svg', '/svg/contour-02.svg']
src/data/portfolio.ts:184  arrow: '/svg/arrow.svg'
src/data/portfolio.ts:189  src: '/models/hero-object.glb'
```

Components that render images (all receive them as props from the data file):

```
Footer:          src/components/Footer/FooterShowcase.tsx → contactSection.portrait (= hero photo for now), logo mask
Hero:            src/components/Hero/Hero.tsx → HeroSubject.tsx
                 → profile.heroImage, profile.heroMobileImage (cut-out) | profile.heroBackdrop.* (backdrop mode)
Preloader:       src/components/Preloader/Preloader.tsx → preloads hero image + projects[0].cover
About:           src/components/About/About.tsx
                 → profile.portrait (about-01), about.images[0] (about-02), about.objects[0..2]
Collage:         src/components/Collage/Collage.tsx → collage.items[].image (lifestyle-01..04)
Lifestyle strip: src/components/LifestyleStrip/LifestyleStrip.tsx → lifestyle[].image
Project card:    src/components/ProjectCard/ProjectCard.tsx → project.cover
Project list:    src/components/ProjectList/ProjectList.tsx → p.cover (preview + thumbnail)
Case study:      src/app/projects/[slug]/page.tsx → project.cover, next.cover
Gallery:         src/components/ProjectGallery/ProjectGallery.tsx → project.gallery[]
3D model:        src/components/ThreeScene/ThreeCanvas.tsx → model.src
SVG graphics:    src/app/layout.tsx → graphics.contours, graphics.arrow (as CSS variables in a <style> rule)
Shared image primitives (no paths of their own):
                 SmartImage/SmartImage.tsx, ImageReveal/ImageReveal.tsx, ParallaxImage/ParallaxImage.tsx
```
