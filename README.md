# Immersive portfolio

Cinematic, scroll-driven personal portfolio — Next.js (App Router), TypeScript, GSAP + ScrollTrigger, Lenis,
Three.js / React Three Fiber. All content and image paths live in `src/data/portfolio.ts`.

## Run it

Requires Node.js 18.18+ (20 LTS recommended).

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run start      # serve the production build
npm run lint       # ESLint (next/core-web-vitals + TypeScript rules)
npm run typecheck  # tsc --noEmit
```

## Docs
- `docs/EDITING-GUIDE.md` — where to change content, images, colours, type and motion
- `docs/IMAGE-MAP.md` — every image: path, component, size, transparency
- `docs/PROJECT-STRUCTURE.md` — folder structure and how the pieces fit together

## Verification status
This project was authored in an environment without npm registry access, so it has **not yet been
installed, built or run in a browser**. Before delivery, every TypeScript/TSX file passed a syntax check
(esbuild), and the codebase was type-checked against stand-in declarations for React/Next/GSAP/Three,
which validates the project's own types, props and data shape but not the libraries' real APIs.
On first run, `npm run build` is the fastest way to surface anything that needs adjusting.

## First-run checklist
1. Preloader: counter 00 → 100, Enter, panel lifts, curtain retracts.
2. Hero: pointer parallax on desktop, name lines drift apart on scroll, 3D object rotates.
3. Cursor states: links, collage ("View"), project cards ("Open"), project list ("Open case study"), `/about` strip ("Drag").
4. Statement → collage (light) → orange/dark wipe → pinned horizontal projects (dark).
5. Click a project: curtain transition into the case study, then "Next project".
6. Mobile width: swipe rail instead of the pin, overlay menu, no custom cursor.
7. Reduced motion emulated: content visible, no parallax, simple fades, static 3D fallback.
