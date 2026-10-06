let cached: boolean | null = null;

/** Detects WebGL support once; result is cached. */
export function hasWebGL(): boolean {
  if (cached !== null) return cached;
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('webgl2') || canvas.getContext('webgl');
    cached = !!ctx;
    const lose = ctx?.getExtension('WEBGL_lose_context');
    lose?.loseContext();
  } catch {
    cached = false;
  }
  return cached;
}
