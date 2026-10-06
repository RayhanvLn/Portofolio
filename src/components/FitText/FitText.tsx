'use client';
import { useRef, type ReactNode } from 'react';
import { useFitText } from '@/hooks/useFitText';

/** Wrapper that shrinks its font-size so each [data-text-line] fits on one row.
 *  Put the display styles (font-size etc.) on this wrapper; children inherit. */
export function FitText({
  children,
  className,
  lines = '[data-text-line]',
  query,
}: {
  children: ReactNode;
  className?: string;
  lines?: string;
  query?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useFitText(ref, { lines, query });
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
