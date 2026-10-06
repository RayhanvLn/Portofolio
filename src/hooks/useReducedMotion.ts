'use client';
import { mq } from '@/lib/responsive';
import { useMediaQuery } from './useMediaQuery';

export function useReducedMotion() {
  return useMediaQuery(mq.reducedMotion);
}
