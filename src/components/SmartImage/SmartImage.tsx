'use client';
import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import styles from './SmartImage.module.css';

interface SmartImageProps {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  objectPosition?: string;
  fit?: 'cover' | 'contain';
}

/**
 * next/image (AVIF/WebP, responsive srcset, lazy by default) that never
 * breaks the layout: if the file is missing it renders a styled placeholder
 * showing the path to replace. Always fills its positioned parent.
 */
export function SmartImage({ src, alt, sizes, priority, className, objectPosition, fit = 'cover' }: SmartImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <span className={styles.placeholder} role={alt ? 'img' : undefined} aria-label={alt || undefined}>
        <span className={styles.placeholderText}>
          Missing image
          <br />
          {src || 'no path set'}
        </span>
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn(styles.image, className)}
      style={{ objectFit: fit, objectPosition }}
      onError={() => setFailed(true)}
    />
  );
}
