# Project structure

Actual final structure (generated after implementation; same layout as `tree src /F /A` and `tree public /F /A`).

## Root

```
.gitignore
README.md
eslint.config.mjs
next-env.d.ts
next.config.ts
package.json
tsconfig.json
docs/      IMAGE-MAP.md, EDITING-GUIDE.md, PROJECT-STRUCTURE.md
scripts/   generate-contours.mjs (contour SVG + inline data), generate-placeholders.py (placeholder images)
```

## src

```
src
+---animations
|       blockReveal.ts
|       config.ts
|       easings.ts
|       imageAnimations.ts
|       pageTransitions.ts
|       scrollAnimations.ts
|       textAnimations.ts
+---app
|   |   globals.css
|   |   icon.svg
|   |   layout.tsx
|   |   not-found.tsx
|   |   page.tsx
|   |
|   +---about
|   |       page.module.css
|   |       page.tsx
|   +---contact
|   |       page.tsx
|   \\---projects
|       |   page.module.css
|       |   page.tsx
|       |
|       \\---[slug]
|               page.module.css
|               page.tsx
+---components
|   +---About
|   |       About.module.css
|   |       About.tsx
|   +---BlockReveal
|   |       BlockReveal.tsx
|   +---Collage
|   |       Collage.module.css
|   |       Collage.tsx
|   +---Contact
|   |       Contact.module.css
|   |       ContactHero.tsx
|   |       LocalTime.tsx
|   +---ContourField
|   |       contourData.ts
|   |       ContourField.module.css
|   |       ContourField.tsx
|   +---CustomCursor
|   |       CustomCursor.module.css
|   |       CustomCursor.tsx
|   +---Experience
|   |       Experience.module.css
|   |       Experience.tsx
|   +---FitText
|   |       FitText.tsx
|   +---Footer
|   |       BackToTop.tsx
|   |       Footer.module.css
|   |       Footer.tsx
|   +---Hero
|   |       Hero.module.css
|   |       Hero.tsx
|   |       HeroSubject.tsx
|   +---HorizontalScroll
|   |       HorizontalScroll.module.css
|   |       HorizontalScroll.tsx
|   +---Icons
|   |       Arrow.tsx
|   +---ImageReveal
|   |       ImageReveal.module.css
|   |       ImageReveal.tsx
|   +---LifestyleStrip
|   |       LifestyleStrip.module.css
|   |       LifestyleStrip.tsx
|   +---Magnetic
|   |       Magnetic.tsx
|   +---Navigation
|   |       Navigation.module.css
|   |       Navigation.tsx
|   +---PageTransition
|   |       PageCurtain.module.css
|   |       TransitionLink.tsx
|   |       TransitionProvider.tsx
|   +---ParallaxImage
|   |       ParallaxImage.module.css
|   |       ParallaxImage.tsx
|   +---Preloader
|   |       Preloader.module.css
|   |       Preloader.tsx
|   +---ProjectCard
|   |       ProjectCard.module.css
|   |       ProjectCard.tsx
|   +---ProjectGallery
|   |       ProjectGallery.module.css
|   |       ProjectGallery.tsx
|   +---ProjectList
|   |       ProjectList.module.css
|   |       ProjectList.tsx
|   +---Providers
|   |       Providers.tsx
|   |       SmoothScrollProvider.tsx
|   +---Scene
|   |       Scene.tsx
|   +---SectionTransition
|   |       SectionTransition.module.css
|   |       SectionTransition.tsx
|   +---Skills
|   |       Skills.module.css
|   |       Skills.tsx
|   +---SmartImage
|   |       SmartImage.module.css
|   |       SmartImage.tsx
|   +---Statement
|   |       Statement.module.css
|   |       Statement.tsx
|   +---TextReveal
|   |       TextReveal.module.css
|   |       TextReveal.tsx
|   +---ThreeScene
|   |       StaticObject.tsx
|   |       ThreeCanvas.tsx
|   |       ThreeScene.module.css
|   |       ThreeScene.tsx
|   |       WebGLErrorBoundary.tsx
|   \\---VelocityMarquee
|           VelocityMarquee.module.css
|           VelocityMarquee.tsx
+---data
|       portfolio.ts
+---hooks
|       useFitText.ts
|       useMediaQuery.ts
|       useMousePosition.ts
|       useMouseVelocity.ts
|       usePageTransition.ts
|       useReducedMotion.ts
|       useScrollProgress.ts
|       useScrollVelocity.ts
|       useSmoothScroll.ts
+---lib
|       animation.ts
|       blockRevealCore.ts
|       motionStore.ts
|       responsive.ts
|       scene.ts
|       utils.ts
|       webgl.ts
\\---types
        portfolio.ts
```

## public

```
public
+---images
|   +---about
|   |       about-01.webp
|   |       about-02.webp
|   +---hero
|   |       hero-desktop.webp
|   |       hero-mobile.webp
|   +---lifestyle
|   |       lifestyle-01.webp
|   |       lifestyle-02.webp
|   |       lifestyle-03.webp
|   |       lifestyle-04.webp
|   \\---projects
|       +---project-01
|       |       cover.webp
|       |       detail-01.webp
|       |       detail-02.webp
|       +---project-02
|       |       cover.webp
|       |       detail-01.webp
|       |       detail-02.webp
|       +---project-03
|       |       cover.webp
|       |       detail-01.webp
|       |       detail-02.webp
|       \\---project-04
|               cover.webp
|               detail-01.webp
|               detail-02.webp
+---models
|       README.md
+---svg
|       arrow.svg
|       contour-01.svg
|       contour-02.svg
\\---transparent
    +---hero
    |       hero-desktop.webp
    |       hero-mobile.webp
    \\---objects
            object-01.webp
            object-02.webp
            object-03.webp
```

## How it fits together

**Content → components.** `src/data/portfolio.ts` (typed by `src/types/portfolio.ts`) is the single source of
content and image paths. Server-rendered pages in `src/app` read it and pass slices to client components as props.

**Layout shell** (`src/app/layout.tsx`):
`Providers` → `SmoothScrollProvider` (Lenis on GSAP's ticker, synced to ScrollTrigger, reference-counted scroll
lock) → `TransitionProvider` (owns the curtain and the page lifecycle) → `Preloader`, `CustomCursor`,
`Navigation`, `<main>`, `Footer`.

**Page lifecycle.** The curtain is server-rendered covering the page, so un-animated content never flashes.
First visit: preloader → Enter → curtain retracts. Repeat visit in the session: curtain retracts after a short
delay. Navigation (`TransitionLink`): curtain covers → `router.push` → new page lays out → triggers refresh →
curtain retracts while entrance animations play. Entrance animations wait for the `ready` flag from
`usePageTransition()`.

**Scenes.** Every section is a `<Scene theme="dark|light">`. Crossing the viewport middle sets
`html[data-scene]`; colours are `@property`-registered CSS variables, so background, type, navigation, cursor,
lines and accents cross-fade together. `SectionTransition` hides the switch behind a orange/dark block wipe.

**Motion state.** `src/lib/motionStore.ts` holds live pointer and scroll values (including Lenis velocity) as
plain mutable objects read inside animation frames — no React re-renders from pointer or scroll.

**Responsive strategy.** `gsap.matchMedia` with queries from `src/lib/responsive.ts`: full experience ≥ 900px;
below that the horizontal section becomes a native swipe rail, parallax is reduced, WebGL drops quality, the menu
becomes a full-screen overlay. Fine pointers get the custom cursor and magnetic buttons; touch keeps native
behaviour. `prefers-reduced-motion` disables Lenis, parallax, pins and heavy WebGL while keeping content visible.

**Code splitting.** Three.js, R3F and drei load only when the hero object scrolls near the viewport
(`next/dynamic`, `ssr: false`, IntersectionObserver).
