'use client';
import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/animation';
import { mq } from '@/lib/responsive';
import { cn } from '@/lib/utils';
import type { ImageAsset } from '@/types/portfolio';
import { SmartImage } from '@/components/SmartImage/SmartImage';
import styles from './ParallaxImage.module.css';

interface ParallaxImageProps {
  image: ImageAsset;
  sizes: string;
  /** 0–1.2. Travel multiplier; reduced automatically on mobile. */
  speed?: number;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
}

/** Image that drifts inside its own frame while the frame scrolls. Fills its parent. */
export function ParallaxImage({ image, sizes, speed = 1, priority, className, imageClassName }: ParallaxImageProps) {
  const root = useRef<HTMLSpanElement>(null);
  const inner = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ desktop: mq.desktop, reduce: mq.reducedMotion }, (ctx) => {
        const { desktop, reduce } = ctx.conditions as { desktop: boolean; reduce: boolean };
        if (reduce || !root.current || !inner.current) return;
        const amount = (desktop ? 8 : 3.5) * Math.min(speed, 1.2);
        gsap.fromTo(
          inner.current,
          { yPercent: -amount },
          {
            yPercent: amount,
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [speed] },
  );

  return (
    <span ref={root} className={cn(styles.root, className)}>
      <span ref={inner} className={styles.inner}>
        <SmartImage src={image.src} alt={image.alt} sizes={sizes} priority={priority} className={imageClassName} />
      </span>
    </span>
  );
}
