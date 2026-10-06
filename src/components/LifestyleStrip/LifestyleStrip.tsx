'use client';
import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/animation';
import { mq } from '@/lib/responsive';
import { motionStore } from '@/lib/motionStore';
import type { LifestyleItem, SceneTheme } from '@/types/portfolio';
import { Scene } from '@/components/Scene/Scene';
import { SmartImage } from '@/components/SmartImage/SmartImage';
import { BlockReveal } from '@/components/BlockReveal/BlockReveal';
import styles from './LifestyleStrip.module.css';

/** Mouse-drag mode: wide screens with a mouse/trackpad. Everything else (phones,
 *  tablets, touch screens) gets the native swipe rail from the CSS. Keep in sync
 *  with the media query in LifestyleStrip.module.css. */
const DRAG_QUERY = `${mq.desktop} and ${mq.finePointer}`;

/** Mouse drag with inertia + arrow keys. Returns a cleanup that restores the native rail. */
function enableDrag(vp: HTMLElement, t: HTMLElement) {
  let x = 0;
  let startX = 0;
  let startPos = 0;
  let dragging = false;
  let lastX = 0;
  let velocity = 0;
  const bounds = () => Math.min(0, vp.clientWidth - t.scrollWidth);
  const clampX = (v: number) => gsap.utils.clamp(bounds(), 0, v);
  const xTo = gsap.quickTo(t, 'x', { duration: 0.6, ease: 'power3.out' });

  const down = (e: PointerEvent) => {
    dragging = true;
    startX = e.clientX;
    lastX = e.clientX;
    startPos = x;
    velocity = 0;
    vp.setPointerCapture(e.pointerId);
  };
  const move = (e: PointerEvent) => {
    if (!dragging) return;
    velocity = e.clientX - lastX;
    lastX = e.clientX;
    const raw = startPos + (e.clientX - startX);
    // rubber-band past the edges
    const min = bounds();
    x = raw > 0 ? raw * 0.35 : raw < min ? min + (raw - min) * 0.35 : raw;
    xTo(x);
  };
  const up = () => {
    if (!dragging) return;
    dragging = false;
    x = clampX(x + velocity * 14);
    gsap.to(t, { x, duration: 1.1, ease: 'expo.out', overwrite: true });
    motionStore.pointer.vx = 0;
  };
  const key = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    x = clampX(x + (e.key === 'ArrowRight' ? -1 : 1) * vp.clientWidth * 0.4);
    gsap.to(t, { x, duration: 0.9, ease: 'expo.out', overwrite: true });
  };

  vp.addEventListener('pointerdown', down);
  vp.addEventListener('pointermove', move);
  vp.addEventListener('pointerup', up);
  vp.addEventListener('pointercancel', up);
  vp.addEventListener('keydown', key);
  return () => {
    vp.removeEventListener('pointerdown', down);
    vp.removeEventListener('pointermove', move);
    vp.removeEventListener('pointerup', up);
    vp.removeEventListener('pointercancel', up);
    vp.removeEventListener('keydown', key);
    gsap.killTweensOf(t);
    gsap.set(t, { clearProps: 'transform' });
  };
}

/** Draggable strip with inertia (desktop, DRAG cursor). Phones, tablets and touch
 *  screens get a native swipe rail with snapping. Arrow keys work in both. */
export function LifestyleStrip({ items, title, theme = 'light' }: { items: LifestyleItem[]; title: string; theme?: SceneTheme }) {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  // Switches between drag mode and the swipe rail live (rotation, resizing, DevTools device mode).
  useEffect(() => {
    const vp = viewport.current;
    const t = track.current;
    if (!vp || !t) return;
    const mql = window.matchMedia(DRAG_QUERY);
    let teardown: (() => void) | null = null;
    const sync = () => {
      teardown?.();
      teardown = mql.matches ? enableDrag(vp, t) : null;
    };
    sync();
    mql.addEventListener('change', sync);
    return () => {
      mql.removeEventListener('change', sync);
      teardown?.();
    };
  }, []);

  return (
    <Scene theme={theme} className={styles.strip} aria-labelledby="lifestyle-heading">
      <div className={styles.head}>
        <BlockReveal as="h2" id="lifestyle-heading" className={styles.title}>
          {title}
        </BlockReveal>
      </div>
      <div
        ref={viewport}
        className={styles.viewport}
        data-cursor="drag"
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label={title}
      >
        <div ref={track} className={styles.track}>
          {items.map((item, i) => (
            <figure key={i} className={styles.item} data-color={item.color ? 'true' : 'false'}>
              <span className={styles.frame}>
                <SmartImage src={item.image.src} alt={item.image.alt} sizes="(max-width: 899px) 78vw, 34vw" className={styles.img} />
              </span>
              <figcaption className={styles.caption}>
                <span>{item.caption}</span>
                <span className={styles.meta}>{item.meta}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </Scene>
  );
}
