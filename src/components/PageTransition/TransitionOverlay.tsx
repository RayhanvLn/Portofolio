import type { CSSProperties, RefObject } from 'react';
import { pageTransitionConfig as cfg } from '@/config/pageTransition';
import styles from './TransitionOverlay.module.css';

/**
 * Markup of the full-screen transition: a solid panel with the logo centred
 * (plus a small label on page load).
 * Server-rendered in its covering state so the first paint never shows
 * un-animated content. Animated by src/lib/pageTransitionEngine.ts.
 */
export function TransitionOverlay({ overlayRef }: { overlayRef: RefObject<HTMLDivElement | null> }) {
  const { logo } = cfg;
  const vars = {
    '--transition-bg': cfg.background,
    '--transition-logo-filter': logo.filter,
    '--logo-w-mobile': `${logo.width.mobile}px`,
    '--logo-w-tablet': `${logo.width.tablet}px`,
    '--logo-w-desktop': `${logo.width.desktop}px`,
    '--intro-delay': `${cfg.introAnimation.logoDelay}ms`,
    '--intro-duration': `${cfg.introAnimation.logoIn}ms`,
    '--intro-repeat-delay': `${cfg.introAnimation.repeatLogoDelay}ms`,
    '--intro-repeat-duration': `${cfg.introAnimation.repeatLogoIn}ms`,
    '--intro-blur': `${cfg.introAnimation.blur}px`,
    '--intro-ease': cfg.logoEasing,
    '--transition-ink': cfg.loadLabel.color,
    '--hole-src': `url("${logo.src}")`,
  } as CSSProperties;
  const w = logo.width.desktop;

  return (
    <div ref={overlayRef} className={`${styles.overlay} page-transition`} data-state="covering" data-load="true" aria-hidden="true" style={vars}>
      <div className={styles.panel} data-transition-panel>
        <span className={styles.logoWrap}>
          {/* eslint-disable-next-line @next/next/no-img-element -- plain SVG file: stays sharp at any size, swappable in /public */}
          <img
            className={styles.logo}
            data-transition-logo
            src={logo.src}
            alt=""
            width={w}
            height={Math.round(w / logo.aspectRatio)}
            decoding="async"
            draggable={false}
          />
        </span>
        {cfg.loadLabel.text ? (
          <span className={styles.label} data-transition-label>
            <span className={styles.labelDot} />
            {cfg.loadLabel.text}
          </span>
        ) : null}
      </div>
      {/* navigation: the accent logo that grows from the click (see coverWithLogo) */}
      <div className={styles.grow} data-transition-grow />
    </div>
  );
}
