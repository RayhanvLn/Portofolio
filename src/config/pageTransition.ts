/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PAGE TRANSITION — every setting for the logo transition lives here.
 * ─────────────────────────────────────────────────────────────────────────────
 *  Flow on every navigation:
 *    current page fades out → panel sweeps over the screen → logo assembles in
 *    the centre → short hold → panel sweeps out → new page fades/slides in.
 *  All durations are in MILLISECONDS. Easing values are plain CSS easings.
 */
import { brandLogo } from '@/lib/brand';

export const pageTransitionConfig = {
  /** First visit of a session: 'logo' = logo intro, 'counter' = the earlier 00→100% preloader with Enter. */
  intro: 'logo' as 'logo' | 'counter',

  /** Overlay colour (any CSS colour or var()). Exposed to CSS as --transition-bg. */
  background: 'var(--c-accent)',

  logo: {
    /** Logo file + proportions come from src/data/portfolio.ts → profile.logo (one place for both uses). */
    src: brandLogo.src,
    aspectRatio: brandLogo.aspectRatio,
    /** Display width in px per screen size (height follows the aspect ratio). */
    width: { mobile: 76, tablet: 96, desktop: 120 },
    /** CSS filter for the logo, e.g. 'invert(1)' to show a black logo white on a dark background. */
    filter: 'none',
  },

  /** Direction the overlay travels: enters from the opposite side, leaves this way. */
  direction: 'up' as 'up' | 'down' | 'left' | 'right',

  /** Easing for the overlay sweep in/out. */
  easing: 'cubic-bezier(0.76, 0, 0.24, 1)',
  /** Easing for the logo entrance and the new page content. */
  logoEasing: 'cubic-bezier(0.22, 1, 0.36, 1)',

  durations: {
    /** A — current page fades out. */
    contentOut: 300,
    /** B — overlay starts this long after the click… */
    overlayDelay: 60,
    /** …and takes this long to cover the screen. */
    overlayIn: 420,
    /** C — logo starts this long BEFORE the overlay has fully covered (overlap feels continuous). */
    logoOverlap: 180,
    /** C — logo entrance. */
    logoIn: 340,
    /** D — logo hold before the reveal. */
    logoHold: 110,
    /** E — logo fades up and out… */
    logoOut: 260,
    /** …and the overlay starts leaving this long after the logo starts fading. */
    logoLead: 60,
    /** E — overlay sweeps out. */
    overlayOut: 450,
    /** E — new page content fade/slide in. */
    contentIn: 360,
    /** New content starts when the overlay is this far out (0–1). */
    contentInStart: 0.35,
  },

  /** New page content slides up this many px while fading in. */
  contentShift: 20,

  /**
   * Page load. The logo animation is pure CSS so it starts with the first paint
   * (no waiting for JavaScript). First visit of a session gets the full version,
   * reloads / later visits a shorter one — the logo is always shown.
   */
  introAnimation: {
    logoDelay: 80,
    logoIn: 520,
    hold: 220,
    /** Shorter version for reloads and repeat visits in the same session. */
    repeatLogoDelay: 40,
    repeatLogoIn: 360,
    repeatHold: 90,
    /** Starting blur of the logo in px. */
    blur: 8,
  },

  /** prefers-reduced-motion: short cross-fades only, no movement. */
  reducedMotion: { fade: 180, hold: 60 },

  /** Max time to wait for images in the first screen of the new page before revealing it. */
  imageWaitMs: 600,
  /** Safety net: if a navigation never completes, the overlay is removed after this long. */
  navigationTimeoutMs: 8000,
} as const;

export type PageTransitionConfig = typeof pageTransitionConfig;
