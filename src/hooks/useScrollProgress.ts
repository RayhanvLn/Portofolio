'use client';
import { useEffect, useRef, type RefObject } from 'react';
import { ScrollTrigger } from '@/lib/animation';

/**
 * Scroll progress (0–1) of an element through the viewport, or of the whole
 * page when no target is given. Returns a ref so reading it never re-renders.
 */
export function useScrollProgress(
  target?: RefObject<HTMLElement | null>,
  options: { start?: string; end?: string } = {},
) {
  const progress = useRef(0);
  const { start = 'top bottom', end = 'bottom top' } = options;

  useEffect(() => {
    const el = target?.current;
    const st = el
      ? ScrollTrigger.create({ trigger: el, start, end, onUpdate: (s) => (progress.current = s.progress) })
      : ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => (progress.current = s.progress) });
    return () => st.kill();
  }, [target, start, end]);

  return progress;
}
