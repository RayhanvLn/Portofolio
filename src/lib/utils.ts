export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export const clamp = (min: number, max: number, v: number) => Math.min(max, Math.max(min, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const mapRange = (inMin: number, inMax: number, outMin: number, outMax: number, v: number) =>
  outMin + ((v - inMin) / (inMax - inMin)) * (outMax - outMin);

/** Frame-rate independent lerp factor. `factor` is per 60fps frame. */
export const dampFactor = (factor: number, deltaMs: number) => 1 - Math.pow(1 - factor, deltaMs / (1000 / 60));

export const pad = (n: number | string, len = 2) => String(n).padStart(len, '0');

export const isExternal = (href: string) => /^(https?:)?\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('tel:');

/** Longest line length, used to fit oversized display type to the viewport. */
export const longestLine = (lines: string[]) => lines.reduce((m, l) => Math.max(m, l.length), 1);

/** Width ÷ height of an image (falls back to 16:10 when the numbers are missing). */
export const ratioOf = (img: { width?: number; height?: number }) =>
  img.width && img.height ? Math.round((img.width / img.height) * 10000) / 10000 : 1.6;
