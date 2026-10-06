'use client';
import { useMousePosition } from './useMousePosition';

/** Live pointer velocity (px per 60fps frame) — decays to 0 when the pointer stops. */
export function useMouseVelocity() {
  const p = useMousePosition();
  return {
    get vx() {
      return p.vx;
    },
    get vy() {
      return p.vy;
    },
    get speed() {
      return p.speed;
    },
  };
}
