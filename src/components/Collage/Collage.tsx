'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap, isFinePointer, prefersReducedMotion, useGSAP } from '@/lib/animation';
import { animationConfig } from '@/animations/config';
import { drift } from '@/animations/scrollAnimations';
import { mq } from '@/lib/responsive';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import type { CollageContent } from '@/types/portfolio';
import { Scene } from '@/components/Scene/Scene';
import { ImageReveal } from '@/components/ImageReveal/ImageReveal';
import { SmartImage } from '@/components/SmartImage/SmartImage';
import styles from './Collage.module.css';

const PARALLAX = [0.6, 1.1, 0.9, 0.7];
const DIRECTIONS = ['up', 'left', 'up', 'right'] as const;
const SIZES = ['(max-width: 899px) 80vw, 40vw', '(max-width: 899px) 80vw, 50vw', '(max-width: 899px) 70vw, 33vw', '(max-width: 899px) 70vw, 33vw'];

/** Asymmetric editorial collage: mixed scales, offsets, overlaps; grayscale
 *  with one image in colour. Hover pulls the frame toward the pointer and
 *  reveals metadata; click opens a full-screen view. */
export function Collage({ collage }: { collage: CollageContent }) {
  const root = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const { lock, unlock } = useSmoothScroll();
  const items = collage.items;

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add({ desktop: mq.desktop, reduce: mq.reducedMotion }, (ctx) => {
        const { desktop, reduce } = ctx.conditions as Record<string, boolean>;
        if (reduce) return;
        const lines = el.querySelectorAll('[data-title-line]');
        if (lines[0]) drift(lines[0], el, desktop ? -8 : -4, desktop ? 6 : 3);
        if (lines[1]) drift(lines[1], el, desktop ? 8 : 4, desktop ? -6 : -3);
        if (!desktop) return;
        // Frames drift at different rates → depth between overlapping images.
        el.querySelectorAll<HTMLElement>('[data-frame]').forEach((frame, i) => {
          gsap.fromTo(
            frame,
            { y: 60 * PARALLAX[i % PARALLAX.length] },
            { y: -60 * PARALLAX[i % PARALLAX.length], ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true } },
          );
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // Pointer pull on hover (desktop).
  useEffect(() => {
    const el = root.current;
    if (!el || !isFinePointer() || prefersReducedMotion()) return;
    const pull = animationConfig.pointer.collagePull;
    const cleanups: Array<() => void> = [];
    el.querySelectorAll<HTMLElement>('[data-item]').forEach((item) => {
      const zoom = item.querySelector<HTMLElement>('[data-pull]');
      if (!zoom) return;
      const xTo = gsap.quickTo(zoom, 'x', { duration: 0.9, ease: 'power3.out' });
      const yTo = gsap.quickTo(zoom, 'y', { duration: 0.9, ease: 'power3.out' });
      const move = (e: PointerEvent) => {
        const r = item.getBoundingClientRect();
        xTo(((e.clientX - r.left) / r.width - 0.5) * pull);
        yTo(((e.clientY - r.top) / r.height - 0.5) * pull);
      };
      const leave = () => {
        xTo(0);
        yTo(0);
      };
      item.addEventListener('pointermove', move);
      item.addEventListener('pointerleave', leave);
      cleanups.push(() => {
        item.removeEventListener('pointermove', move);
        item.removeEventListener('pointerleave', leave);
      });
    });
    return () => cleanups.forEach((fn) => fn());
  }, []);

  const open = useCallback(
    (i: number) => {
      setActive(i);
      lock();
      dialog.current?.showModal();
    },
    [lock],
  );
  const close = useCallback(() => dialog.current?.close(), []);
  const onClose = useCallback(() => {
    setActive(null);
    unlock();
  }, [unlock]);

  const current = active !== null ? items[active] : null;

  return (
    <Scene theme="light" className={styles.collage} aria-labelledby="collage-heading">
      <div ref={root} className={styles.grid}>
        <h2 id="collage-heading" className={styles.title}>
          {collage.titleLines.map((line, i) => (
            <span key={i} className={styles.titleLine} data-title-line>
              {line}
            </span>
          ))}
        </h2>

        {items.map((item, i) => (
          <button
            key={item.image.src + i}
            type="button"
            className={styles.item}
            data-item
            data-color={item.color ? 'true' : 'false'}
            data-cursor="image"
            onClick={() => open(i)}
            aria-label={`View photo: ${item.caption}`}
          >
            <span className={styles.frame} data-frame>
              <span className={styles.zoom}>
                <span className={styles.pull} data-pull>
                <ImageReveal
                  image={item.image}
                  sizes={SIZES[i % SIZES.length]}
                  direction={DIRECTIONS[i % DIRECTIONS.length]}
                  parallax={PARALLAX[i % PARALLAX.length]}
                  aspect={i === 0 ? '4 / 5' : undefined}
                  imageClassName={styles.media}
                />
                </span>
              </span>
            </span>
            <span className={styles.caption}>
              <span className={styles.captionInner}>
                <span>{item.caption}</span>
                <span className={styles.captionMeta}>{item.meta}</span>
              </span>
            </span>
          </button>
        ))}
      </div>

      <dialog ref={dialog} className={styles.dialog} onClose={onClose} onClick={(e) => e.target === dialog.current && close()} aria-label="Photo viewer">
        {current ? (
          <>
            <div className={styles.dialogBar}>
              <span>
                {current.caption} <span style={{ opacity: 0.6 }}>{current.meta}</span>
              </span>
              <button type="button" onClick={close} autoFocus>
                Close
              </button>
            </div>
            <div className={styles.dialogStage}>
              <div className={styles.dialogImage}>
                <SmartImage src={current.image.src} alt={current.image.alt} sizes="100vw" fit="contain" />
              </div>
            </div>
            <div className={styles.dialogNav}>
              <button type="button" onClick={() => setActive(((active ?? 0) - 1 + items.length) % items.length)}>
                Previous photo
              </button>
              <span>
                {(active ?? 0) + 1} / {items.length}
              </span>
              <button type="button" onClick={() => setActive(((active ?? 0) + 1) % items.length)}>
                Next photo
              </button>
            </div>
          </>
        ) : null}
      </dialog>
    </Scene>
  );
}
