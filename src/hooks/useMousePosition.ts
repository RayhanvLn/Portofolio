'use client';
import { useEffect } from 'react';
import { bindPointerTracking, motionStore, type PointerState } from '@/lib/motionStore';

/**
 * Live pointer position. Returns a MUTABLE object updated on every pointer
 * move — read it inside requestAnimationFrame / gsap.ticker / useFrame.
 * It intentionally does not trigger React re-renders.
 */
export function useMousePosition(): Readonly<PointerState> {
  useEffect(() => bindPointerTracking(), []);
  return motionStore.pointer;
}
