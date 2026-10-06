/**
 * ANIMATION SETTINGS — tweak the feel of the whole site here.
 * Durations are in seconds, offsets in pixels.
 */
export const animationConfig = {
  durations: {
    fast: 0.45,
    base: 0.9,
    slow: 1.3,
    // Page transition timing lives in src/config/pageTransition.ts
  },
  stagger: {
    chars: 0.022,
    words: 0.06,
    lines: 0.1,
  },
  /** Pointer parallax multipliers for the hero layers. */
  depth: {
    background: 0.15,
    midground: 0.35,
    subject: 0.6,
    foreground: 1,
  },
  pointer: {
    heroMaxOffset: 34,
    heroRotation: 1.4,
    magneticStrength: 0.28,
    /** 0–1 per 60fps frame. Lower = smoother/laggier ring. */
    cursorLerp: 0.16,
    cursorDotLerp: 0.42,
    collagePull: 14,
  },
  scroll: {
    /** Lenis smoothing. 0.07 = very smooth, 0.15 = snappier. */
    lerp: 0.085,
    wheelMultiplier: 1,
    /** Max skew in degrees from scroll velocity. */
    velocitySkewMax: 5,
    velocitySkewFactor: 0.18,
    /** Per-frame decay of velocity once scrolling stops. */
    velocityDecay: 0.9,
  },
  reveal: {
    start: 'top 86%',
    imageStartScale: 1.15,
    /** Mask stops for image reveals: 100% → 70% → 0%. */
    maskStops: [100, 70, 0] as const,
  },
  /** Line-by-line accent block reveal (BlockReveal component). */
  blockReveal: {
    /** Block grows over a line (left → right). */
    cover: 0.45,
    /** Pause while fully covered. */
    hold: 0.04,
    /** Block slides away toward the right, uncovering the text. */
    reveal: 0.55,
    /** Delay between consecutive lines. */
    stagger: 0.09,
    ease: 'power3.inOut',
    /** Plays when the element's top passes this fraction of the viewport height. */
    startRatio: 0.88,
    /** Pixels between fragments on one row before they get separate blocks (grid columns). */
    segmentGap: 24,
  },
  preloader: {
    steps: [0, 25, 50, 75, 100] as const,
    minStepTime: 0.34,
    maxWait: 7,
  },
} as const;

export type AnimationConfig = typeof animationConfig;
