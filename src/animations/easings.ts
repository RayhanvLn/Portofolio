/** One motion language: long, decisive exponential curves. */
export const ease = {
  out: 'expo.out',
  in: 'expo.in',
  inOut: 'expo.inOut',
  soft: 'power3.out',
  softInOut: 'power3.inOut',
  linear: 'none',
} as const;

/** Matching CSS curves (also exposed as CSS variables in globals.css). */
export const cssEase = {
  out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  inOut: 'cubic-bezier(0.87, 0, 0.13, 1)',
  soft: 'cubic-bezier(0.33, 1, 0.68, 1)',
} as const;
