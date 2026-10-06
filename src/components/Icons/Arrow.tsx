import { cn } from '@/lib/utils';

/** Arrow drawn from /public/svg/arrow.svg as a CSS mask so it takes currentColor. */
export function Arrow({ className, direction = 'up-right' }: { className?: string; direction?: 'up-right' | 'down' | 'right' | 'up' }) {
  return <span className={cn('icon-arrow', `icon-arrow--${direction}`, className)} aria-hidden="true" />;
}
