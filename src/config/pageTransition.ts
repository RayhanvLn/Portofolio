/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PAGE TRANSITION — every setting for the logo transition lives here.
 * ─────────────────────────────────────────────────────────────────────────────
 *  Flow on every navigation:
 *    current page fades out → panel sweeps over the screen → logo assembles in
 *    the centre → short hold → panel sweeps out → new page fades/slides in.
 *  All durations are in MILLISECONDS. Easing values are plain CSS easings.
 */
import { brandLogo, brandName } from '@/lib/brand';

export const pageTransitionConfig = {
  /** First visit of a session: 'logo' = logo intro, 'counter' = the earlier 00→100% preloader with Enter. */
  intro: 'logo' as 'logo' | 'counter',

  /** Overlay colour (any CSS colour or var()). Exposed to CSS as --transition-bg. */
  background: 'var(--c-accent)',

  /**
   * How the page appears when the site is OPENED (load / reload):
   *   'maskZoom' — the logo turns into a window onto the page and zooms open until it fills the screen
   *   'sweep'    — the panel sweeps away, like between pages
   * Navigating between pages always uses the sweep.
   */
  loadReveal: 'maskZoom' as 'maskZoom' | 'sweep',

  /**
   * Navigating between pages:
   *   'logoZoom' — the logo in the accent colour appears where you clicked and zooms in until the screen is
   *                orange; the dark logo appears in the middle and opens like the page load (maskZoom)
   *   'sweep'    — the earlier panel that sweeps over the page
   */
  navigation: 'logoZoom' as 'logoZoom' | 'sweep',

  /** Settings for navigation: 'logoZoom' (the growing orange logo). */
  logoCover: {
    /**
     * Time from the first tiny dot until the screen is fully orange. Measured from the reference: ~330 ms
     * (it starts ~9 px wide, ~41 px after 10 %, ~900 px after 80 % of the time, then snaps to full screen).
     */
    duration: 340,
    /** Where the logo grows from: 'center' of the screen (like the reference) or the 'click' point. */
    origin: 'center' as 'center' | 'click',
    /**
     * Size multiplier on that measured curve. 1 = the R as wide as the reference logo at each moment;
     * 1.2 ≈ the same visual weight (the R is wider and lower than the reference logo).
     */
    size: 1.2,
    /** Pause on the plain orange screen before the dark logo appears. */
    logoDelay: 0,
    /**
     * Clicked inside the menu: the menu stays open and the orange logo grows on top of it, starting this
     * long after the click (the menu is dark, so no wait is needed). The menu closes once the new page is in.
     */
    menuWait: 0,
    /** Length of the logo-window zoom that reveals the new page (the page load uses maskZoom.duration). */
    revealDuration: 1100,
  },

  /** Settings for loadReveal: 'maskZoom'. */
  maskZoom: {
    /** Length of the zoom (first visit of a session / reloads and repeat visits). */
    duration: 1400,
    repeatDuration: 1100,
    /**
     * Speed curve of the zoom: starts calm, then accelerates — the window rushes towards you.
     * The zoom is spread on a log scale, so this curve sets how evenly it grows.
     */
    easing: 'cubic-bezier(0.45, 0, 0.6, 0.85)',
    /**
     * Point inside the logo the window opens from (0–1 of its width/height).
     * Must sit on a SOLID part of the logo — for the "R" this is the thick diagonal stroke.
     * If you swap the logo, pick a spot in its thickest part.
     */
    focus: { x: 0.44, y: 0.58 },
    /** Half the thickness of the logo at that point, as a fraction of the logo width (sets how far it zooms). */
    solidRadius: 0.1,
    /** Upper limit of the zoom (logo size × this). */
    maxScale: 160,
    /** The panel also fades out over this last part of the zoom (0–1), a soft finish. */
    fadeOut: 0.12,
    /** The page behind starts this much bigger and settles to normal size (1 = off). */
    pageScale: 1.08,
    /** Entrance animations (home hero) start when the zoom is this far (0–1). 0 = as soon as the window appears. */
    readyAt: 0,
    /**
     * The home hero's entrance is squeezed into this part of the zoom (0–1), so it is finished by the
     * time the window has filled the screen. 0.85 of 1400 ms ≈ 1.2 s.
     */
    heroIntro: 0.85,
  },

  /** Length (seconds) of page entrances after the normal sweep (navigating between pages). */
  introAfterSweep: 1.1,

  /** Small text at the bottom of the load screen ('' hides it). Not shown between pages. */
  loadLabel: {
    text: `${brandName} — Portfolio`,
    /** Text colour (sits on the accent background). */
    color: '#111112',
  },

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
