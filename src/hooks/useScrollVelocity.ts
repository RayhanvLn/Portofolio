'use client';
import { motionStore, type ScrollState } from '@/lib/motionStore';

/** Live scroll state from Lenis (velocity, direction, progress). Mutable — read in frames. */
export function useScrollVelocity(): Readonly<ScrollState> {
  return motionStore.scroll;
}
