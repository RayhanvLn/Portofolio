'use client';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { Arrow } from '@/components/Icons/Arrow';

export function BackToTop({ className, label = 'Back to top' }: { className?: string; label?: string }) {
  const { scrollTo } = useSmoothScroll();
  return (
    <button type="button" className={className} onClick={() => scrollTo(0, { duration: 1.6 })}>
      {label} <Arrow direction="up" />
    </button>
  );
}
