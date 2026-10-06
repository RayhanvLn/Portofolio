/**
 * Shared, mutable motion state read inside animation frames (GSAP ticker,
 * R3F useFrame). Mutated directly — never stored in React state, so pointer
 * and scroll updates cause zero re-renders.
 */
export interface PointerState {
  x: number;
  y: number;
  /** Normalised -1..1 from viewport centre. */
  nx: number;
  ny: number;
  /** Velocity in px per 60fps frame. */
  vx: number;
  vy: number;
  speed: number;
  active: boolean;
}

export interface ScrollState {
  y: number;
  velocity: number;
  direction: number;
  progress: number;
}

export const motionStore = {
  pointer: { x: 0, y: 0, nx: 0, ny: 0, vx: 0, vy: 0, speed: 0, active: false } as PointerState,
  scroll: { y: 0, velocity: 0, direction: 1, progress: 0 } as ScrollState,
  hero: { progress: 0 },
};

let bound = 0;
let lastMove = 0;

export function bindPointerTracking() {
  if (typeof window === 'undefined') return () => {};
  bound += 1;
  if (bound > 1) return () => { bound -= 1; };

  const p = motionStore.pointer;
  p.x = window.innerWidth / 2;
  p.y = window.innerHeight / 2;

  const onMove = (e: PointerEvent) => {
    const now = performance.now();
    const dt = Math.max(now - lastMove, 1);
    lastMove = now;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    p.vx = (dx / dt) * 16.67;
    p.vy = (dy / dt) * 16.67;
    p.speed = Math.hypot(p.vx, p.vy);
    p.x = e.clientX;
    p.y = e.clientY;
    p.nx = (p.x / window.innerWidth) * 2 - 1;
    p.ny = (p.y / window.innerHeight) * 2 - 1;
    p.active = true;
  };
  const onLeave = () => {
    p.active = false;
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  document.documentElement.addEventListener('pointerleave', onLeave);
  return () => {
    bound -= 1;
    window.removeEventListener('pointermove', onMove);
    document.documentElement.removeEventListener('pointerleave', onLeave);
  };
}

/** Called once per frame: lets velocities settle smoothly when input stops. */
export function decayMotion(decay: number) {
  const p = motionStore.pointer;
  p.vx *= 0.86;
  p.vy *= 0.86;
  p.speed = Math.hypot(p.vx, p.vy);
  const s = motionStore.scroll;
  s.velocity *= decay;
  if (Math.abs(s.velocity) < 0.001) s.velocity = 0;
}
