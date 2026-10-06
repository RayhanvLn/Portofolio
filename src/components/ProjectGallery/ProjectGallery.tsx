'use client';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { gsap, useGSAP } from '@/lib/animation';
import { mq } from '@/lib/responsive';
import { pad, ratioOf } from '@/lib/utils';
import { notchPath } from '@/lib/notchFrame';
import { caseLabels as L } from '@/lib/caseStudyLabels';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import type { ImageAsset } from '@/types/portfolio';
import { SmartImage } from '@/components/SmartImage/SmartImage';
import { BlockReveal } from '@/components/BlockReveal/BlockReveal';
import styles from './ProjectGallery.module.css';

const SIZES = '(max-width: 899px) 92vw, 46vw';

/** One framed view: thin outline with a notch bottom-right that holds the caption. */
function GalleryCard({ image, index, onOpen }: { image: ImageAsset; index: number; onOpen: () => void }) {
  const card = useRef<HTMLElement>(null);
  const caption = useRef<HTMLElement>(null);
  const [d, setD] = useState('');

  // The outline is computed from the real sizes, so corners and the diagonal never stretch.
  useEffect(() => {
    const c = card.current;
    const cap = caption.current;
    if (!c || !cap) return;
    const update = () =>
      setD(notchPath({ width: c.offsetWidth, height: c.offsetHeight, notchW: cap.offsetWidth, notchH: cap.offsetHeight }));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(c);
    ro.observe(cap);
    return () => ro.disconnect();
  }, []);

  return (
    <figure
      ref={card}
      className={styles.card}
      data-card
      style={{ '--img-ratio': ratioOf(image), order: index } as CSSProperties}
    >
      <svg className={styles.frame} aria-hidden="true" focusable="false">
        <path d={d} pathLength={1} data-frame />
      </svg>
      <button type="button" className={styles.open} onClick={onOpen} data-cursor="image" aria-label={`${L.openImage}: ${image.alt}`}>
        <span className={styles.media} data-media>
          <SmartImage src={image.src} alt={image.alt} sizes={SIZES} fit="contain" />
        </span>
      </button>
      <figcaption ref={caption} className={styles.caption}>
        <BlockReveal as="span" className={styles.captionInner}>
          <span className={styles.captionText}>{image.alt}</span>
          <span className={styles.captionIndex}>{pad(index + 1)}</span>
        </BlockReveal>
      </figcaption>
    </figure>
  );
}

/**
 * Case-study gallery ("detail views"): framed cards in two staggered columns,
 * each with its caption in a notch. Outlines draw themselves as they scroll in,
 * turn accent on hover, and a click opens the image full size.
 * Images are always shown whole, in their own proportions.
 */
export function ProjectGallery({ images }: { images: ImageAsset[] }) {
  const root = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const { lock, unlock } = useSmoothScroll();
  const columns = [images.map((img, i) => ({ img, i })).filter((x) => x.i % 2 === 0), images.map((img, i) => ({ img, i })).filter((x) => x.i % 2 === 1)];

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(mq.motionOK, () => {
        gsap.utils.toArray<HTMLElement>('[data-card]', el).forEach((card) => {
          gsap
            .timeline({ scrollTrigger: { trigger: card, start: 'top 85%', once: true } })
            .fromTo(card.querySelector('[data-frame]'), { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' }, 0)
            .fromTo(card.querySelector('[data-media]'), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1.2, ease: 'expo.out' }, 0.3);
        });
      });
      // Desktop: the second column drifts a little faster for depth.
      mm.add(`${mq.desktop} and ${mq.motionOK}`, () => {
        const second = el.querySelector('[data-column="1"]');
        if (!second) return;
        gsap.fromTo(second, { y: 60 }, { y: -60, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [images.length] },
  );

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
  const step = (dir: number) => setActive((a) => ((a ?? 0) + dir + images.length) % images.length);
  const current = active !== null ? images[active] : null;

  // Arrow keys step through the images while the viewer is open.
  useEffect(() => {
    if (active === null || images.length < 2) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setActive((a) => ((a ?? 0) + 1) % images.length);
      if (e.key === 'ArrowLeft') setActive((a) => ((a ?? 0) - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, images.length]);

  if (!images.length) return null;

  return (
    <div ref={root} className={styles.gallery}>
      <div className={styles.meta} aria-hidden="true">
        <BlockReveal as="span" className={styles.metaLabel}>
          <span className={styles.metaMark} />
          {L.gallery}
        </BlockReveal>
        <BlockReveal as="span" delay={0.1}>
          {pad(images.length)} {images.length === 1 ? L.view : L.views}
        </BlockReveal>
      </div>
      <span className={styles.rule} aria-hidden="true" />

      <div className={styles.columns}>
        {columns.map((col, ci) =>
          col.length ? (
            <div key={ci} className={styles.column} data-column={ci}>
              {col.map(({ img, i }) => (
                <GalleryCard key={img.src + i} image={img} index={i} onOpen={() => open(i)} />
              ))}
            </div>
          ) : null,
        )}
      </div>

      <dialog
        ref={dialog}
        className={styles.dialog}
        onClose={onClose}
        onClick={(e) => e.target === dialog.current && close()}
        aria-label={current ? current.alt : L.gallery}
      >
        {current ? (
          <>
            <div className={styles.dialogBar}>
              <span>
                {current.alt} <span className={styles.captionIndex}>{pad((active ?? 0) + 1)}</span>
              </span>
              <button type="button" onClick={close} autoFocus>
                {L.close}
              </button>
            </div>
            <div className={styles.dialogStage}>
              <SmartImage src={current.src} alt={current.alt} sizes="100vw" fit="contain" />
            </div>
            {images.length > 1 ? (
              <div className={styles.dialogNav}>
                <button type="button" onClick={() => step(-1)}>
                  {L.previous}
                </button>
                <span>
                  {pad((active ?? 0) + 1)} / {pad(images.length)}
                </span>
                <button type="button" onClick={() => step(1)}>
                  {L.next}
                </button>
              </div>
            ) : null}
          </>
        ) : null}
      </dialog>
    </div>
  );
}
