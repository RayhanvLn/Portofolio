'use client';
import { useRef, type ReactNode, type Ref } from 'react';
import { ScrollTrigger, useGSAP } from '@/lib/animation';
import { setScene } from '@/lib/scene';
import type { SceneTheme } from '@/types/portfolio';

interface SceneProps {
  theme: SceneTheme;
  as?: 'section' | 'div' | 'header' | 'footer' | 'article';
  id?: string;
  className?: string;
  children: ReactNode;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/**
 * A dark or light "scene". When it crosses the middle of the viewport the
 * whole document switches theme; background, type, nav, cursor and graphics
 * interpolate together via registered CSS custom properties.
 */
export function Scene({ theme, as = 'section', className, children, ...rest }: SceneProps) {
  const ref = useRef<HTMLElement>(null);
  // One concrete tag type for TypeScript; the real tag is still whatever `as` says.
  const Tag = as as 'section';

  useGSAP(
    () => {
      if (!ref.current) return;
      ScrollTrigger.create({
        trigger: ref.current,
        start: 'top 55%',
        end: 'bottom 55%',
        // Refresh after pins so pin spacing is included in this scene's range.
        refreshPriority: -1,
        onToggle: (self) => {
          if (self.isActive) setScene(theme);
        },
      });
    },
    { scope: ref, dependencies: [theme] },
  );

  return (
    <Tag ref={ref as Ref<HTMLElement>} className={className} data-scene={theme} {...rest}>
      {children}
    </Tag>
  );
}
