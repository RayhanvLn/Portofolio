'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { isFinePointer, magnetic, prefersReducedMotion } from '@/lib/animation';
import { animationConfig } from '@/animations/config';
import { cn } from '@/lib/utils';

/** Wrap a CTA to give it a subtle pull toward the pointer (desktop only). */
export function Magnetic({
  children,
  strength = animationConfig.pointer.magneticStrength,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!ref.current || !isFinePointer() || prefersReducedMotion()) return;
    return magnetic(ref.current, strength);
  }, [strength]);
  return (
    <span ref={ref} className={cn('magnetic', className)}>
      {children}
    </span>
  );
}
