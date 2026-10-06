/** Breakpoints (px) and the media queries used across components. */
export const breakpoints = {
  mobile: 640,
  tablet: 900,
  desktop: 1200,
} as const;

export const mq = {
  mobile: `(max-width: ${breakpoints.mobile - 1}px)`,
  belowTablet: `(max-width: ${breakpoints.tablet - 1}px)`,
  /** "Desktop experience" — full parallax, pinned horizontal section, WebGL high quality. */
  desktop: `(min-width: ${breakpoints.tablet}px)`,
  wide: `(min-width: ${breakpoints.desktop}px)`,
  finePointer: '(hover: hover) and (pointer: fine)',
  coarsePointer: '(hover: none), (pointer: coarse)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
  motionOK: '(prefers-reduced-motion: no-preference)',
} as const;
