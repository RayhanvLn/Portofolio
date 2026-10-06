'use client';
import { createContext, useContext } from 'react';
import type Lenis from 'lenis';

export interface ScrollToOptions {
  immediate?: boolean;
  offset?: number;
  duration?: number;
}

export interface SmoothScrollApi {
  getLenis: () => Lenis | null;
  scrollTo: (target: number | string | HTMLElement, options?: ScrollToOptions) => void;
  /** Reference-counted: scrolling resumes only when every lock is released. */
  lock: () => void;
  unlock: () => void;
}

export const SmoothScrollContext = createContext<SmoothScrollApi | null>(null);

export function useSmoothScroll(): SmoothScrollApi {
  const ctx = useContext(SmoothScrollContext);
  if (!ctx) throw new Error('useSmoothScroll must be used inside <SmoothScrollProvider>');
  return ctx;
}
