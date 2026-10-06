'use client';
import { getImageProps } from 'next/image';
import { useState } from 'react';
import type { ImageAsset } from '@/types/portfolio';
import styles from './Hero.module.css';

/**
 * Art-directed hero subject: mobile cut-out below 900px, desktop cut-out above.
 * object-fit: contain + bottom anchoring keeps the whole figure in frame.
 */
export function HeroSubject({
  desktop,
  mobile,
  fit = 'contain',
}: {
  desktop: ImageAsset;
  mobile: ImageAsset;
  /** 'contain' for the transparent cut-out (never crops), 'cover' for backdrop mode. */
  fit?: 'contain' | 'cover';
}) {
  const [failed, setFailed] = useState(false);
  const sizes = fit === 'cover' ? '100vw' : '(max-width: 899px) 120vw, 55vw';
  const {
    props: { srcSet: desktopSet, ...rest },
  } = getImageProps({ src: desktop.src, alt: desktop.alt, width: desktop.width, height: desktop.height, sizes, priority: true });
  const {
    props: { srcSet: mobileSet },
  } = getImageProps({ src: mobile.src, alt: mobile.alt, width: mobile.width, height: mobile.height, sizes, priority: true });

  if (failed) {
    return (
      <span className={styles.silhouette} role="img" aria-label={desktop.alt}>
        Add your transparent portrait
        <br />
        {desktop.src}
      </span>
    );
  }

  return (
    <picture>
      <source media="(max-width: 899px)" srcSet={mobileSet} />
      <source media="(min-width: 900px)" srcSet={desktopSet} />
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- art-directed via getImageProps */}
      <img
        {...rest}
        className={styles.subjectImg}
        style={fit === 'cover' ? { objectFit: 'cover', objectPosition: '50% 30%' } : undefined}
        onError={() => setFailed(true)}
        ref={(img) => {
          // Catch errors that happened before hydration attached onError.
          if (img && img.complete && img.naturalWidth === 0) setFailed(true);
        }}
      />
    </picture>
  );
}
