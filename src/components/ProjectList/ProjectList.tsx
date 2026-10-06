'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { gsap, isFinePointer, prefersReducedMotion, useGSAP } from '@/lib/animation';
import { motionStore } from '@/lib/motionStore';
import { dampFactor, pad, ratioOf } from '@/lib/utils';
import type { Project } from '@/types/portfolio';
import { TransitionLink } from '@/components/PageTransition/TransitionLink';
import { SmartImage } from '@/components/SmartImage/SmartImage';
import styles from './ProjectList.module.css';

/** Index of all projects. Desktop: a cover preview trails the pointer and
 *  cross-fades between projects. Touch: inline thumbnails. */
export function ProjectList({ projects }: { projects: Project[] }) {
  const listRef = useRef<HTMLUListElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const el = preview.current;
    if (!el || !isFinePointer()) return;
    const pos = { x: motionStore.pointer.x, y: motionStore.pointer.y };
    const tick = (_t: number, delta: number) => {
      const f = dampFactor(0.12, delta);
      const p = motionStore.pointer;
      pos.x += (p.x - pos.x) * f;
      pos.y += (p.y - pos.y) * f;
      const tilt = gsap.utils.clamp(-8, 8, p.vx * 0.4);
      el.style.transform = `translate3d(${pos.x + 24}px, ${pos.y - el.offsetHeight / 2}px, 0) rotate(${tilt}deg)`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray<HTMLElement>('[data-row]', listRef.current).forEach((row, i) => {
        gsap.fromTo(
          row,
          { yPercent: 40, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: 1.1, ease: 'expo.out', delay: i * 0.05, scrollTrigger: { trigger: row, start: 'top 95%', once: true } },
        );
      });
    },
    { scope: listRef },
  );

  return (
    <>
      <ul ref={listRef} className={styles.list} data-hovering={active !== null} onPointerLeave={() => setActive(null)}>
        {projects.map((p, i) => (
          <li key={p.id} className={styles.row} data-row>
            <TransitionLink
              href={`/projects/${p.slug}`}
              transitionLabel={p.title}
              className={styles.link}
              data-cursor="open"
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
            >
              <span className={styles.thumb} style={{ '--cover-ratio': ratioOf(p.cover) } as CSSProperties}>
                <SmartImage src={p.cover.src} alt="" sizes="100vw" fit="contain" />
              </span>
              <span className={styles.index}>{pad(i + 1)}</span>
              <span className={styles.title}>{p.title}</span>
              <span className={styles.category}>{p.category}</span>
              <span className={styles.year}>{p.year}</span>
            </TransitionLink>
          </li>
        ))}
      </ul>
      <div
        ref={preview}
        className={styles.preview}
        data-visible={active !== null}
        aria-hidden="true"
        style={{ '--cover-ratio': ratioOf((active !== null ? projects[active] : projects[0])?.cover ?? {}) } as CSSProperties}
      >
        {projects.map((p, i) => (
          <span key={p.id} className={styles.previewSlide} data-active={active === i}>
            <SmartImage src={p.cover.src} alt="" sizes="420px" fit="contain" />
          </span>
        ))}
      </div>
    </>
  );
}
