'use client';
import { useRef, type CSSProperties } from 'react';
import { prefersReducedMotion, useGSAP } from '@/lib/animation';
import { hideImage, imageReveal, type RevealDirection } from '@/animations/imageAnimations';
import { animationConfig } from '@/animations/config';
import { usePageTransition } from '@/hooks/usePageTransition';
import { cn } from '@/lib/utils';
import type { ImageAsset } from '@/types/portfolio';
import { ParallaxImage } from '@/components/ParallaxImage/ParallaxImage';
import { SmartImage } from '@/components/SmartImage/SmartImage';
import styles from './ImageReveal.module.css';

interface ImageRevealProps {
  image: ImageAsset;
  sizes: string;
  direction?: RevealDirection;
  /** Adds scroll parallax inside the frame (0 = off). */
  parallax?: number;
  trigger?: 'scroll' | 'load';
  delay?: number;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  /** Override the frame ratio (defaults to the image's width/height). */
  aspect?: string;
  /** 'contain' shows the whole image (no cropping) — used for project screenshots/designs. */
  fit?: 'cover' | 'contain';
  style?: CSSProperties;
}

/**
 * The site-wide image reveal: mask 100% → 70% → 0% while the image settles
 * from scale 1.15 to 1. Reserves its aspect ratio so nothing shifts.
 */
export function ImageReveal({
  image,
  sizes,
  direction = 'up',
  parallax = 0,
  trigger = 'scroll',
  delay = 0,
  priority,
  className,
  imageClassName,
  aspect,
  fit = 'cover',
  style,
}: ImageRevealProps) {
  const root = useRef<HTMLSpanElement>(null);
  const mask = useRef<HTMLSpanElement>(null);
  const media = useRef<HTMLSpanElement>(null);
  const { ready } = usePageTransition();

  useGSAP(
    () => {
      if (!mask.current || prefersReducedMotion()) return;
      if (!ready) {
        hideImage(mask.current, direction);
        return;
      }
      imageReveal(mask.current, media.current, {
        direction,
        delay,
        scrollTrigger: trigger === 'scroll' ? { trigger: root.current, start: animationConfig.reveal.start, once: true } : undefined,
      });
    },
    { scope: root, dependencies: [ready], revertOnUpdate: true },
  );

  return (
    <span
      ref={root}
      className={cn(styles.root, className)}
      style={{ aspectRatio: aspect ?? `${image.width} / ${image.height}`, ...style }}
    >
      <span ref={mask} className={styles.mask}>
        <span ref={media} className={styles.media}>
          {parallax > 0 ? (
            <ParallaxImage image={image} sizes={sizes} speed={parallax} priority={priority} imageClassName={imageClassName} />
          ) : (
            <SmartImage src={image.src} alt={image.alt} sizes={sizes} priority={priority} className={imageClassName} fit={fit} />
          )}
        </span>
      </span>
    </span>
  );
}
