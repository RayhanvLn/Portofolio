'use client';
import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/animation';
import { ease } from '@/animations/easings';
import { mq } from '@/lib/responsive';
import { setScene } from '@/lib/scene';
import { cn } from '@/lib/utils';
import type { SceneTheme } from '@/types/portfolio';
import styles from './SectionTransition.module.css';

const COLS = 6;

/**
 * Scroll-scrubbed scene change: accent columns rise, oversized type crosses the
 * screen, dark columns cover — and the document theme flips underneath at the
 * midpoint, so the next section is already in its scene when they leave.
 */
export function SectionTransition({ text, from, to }: { text: string; from: SceneTheme; to: SceneTheme }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      // Theme handoff in both directions. With motion, flip while accent fully
      // covers the screen (≈70% through the sticky phase) so the change is hidden.
      const reduce = window.matchMedia(mq.reducedMotion).matches;
      ScrollTrigger.create({
        trigger: el,
        start: reduce ? 'top center' : 'top top',
        end: reduce ? 'bottom center' : 'bottom bottom',
        onUpdate: (self) => setScene(self.progress > (reduce ? 0.5 : 0.7) ? to : from),
        onLeave: () => setScene(to),
        onLeaveBack: () => setScene(from),
      });

      const mm = gsap.matchMedia();
      mm.add(mq.motionOK, () => {
        const accent = el.querySelectorAll('[data-accent] [data-block]');
        const dark = el.querySelectorAll('[data-dark] [data-block]');
        const words = el.querySelectorAll('[data-word]');
        const onDark = el.querySelector('[data-word-dark]');
        gsap
          .timeline({ scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 1, invalidateOnRefresh: true } })
          .fromTo(words, { xPercent: 0, x: () => window.innerWidth }, { xPercent: -100, x: 0, ease: 'none', duration: 1 }, 0)
          .fromTo(accent, { scaleY: 0 }, { scaleY: 1, ease: ease.softInOut, stagger: 0.05, duration: 0.35 }, 0)
          .fromTo(dark, { scaleY: 0 }, { scaleY: 1, ease: ease.softInOut, stagger: 0.05, duration: 0.35 }, 0.42)
          .fromTo(onDark, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: ease.softInOut, duration: 0.45 }, 0.42);
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [from, to] },
  );

  return (
    <div ref={root} className={styles.wrap} aria-hidden="true">
      <div className={styles.sticky}>
        <div className={cn(styles.blocks, styles.accent)} data-accent>
          {Array.from({ length: COLS }, (_, i) => (
            <span key={i} className={styles.block} data-block />
          ))}
        </div>
        <span className={styles.word} data-word>
          {text}
        </span>
        <div className={cn(styles.blocks, styles.dark)} data-dark>
          {Array.from({ length: COLS }, (_, i) => (
            <span key={i} className={styles.block} data-block />
          ))}
        </div>
        <span className={cn(styles.word, styles.wordOnDark)} data-word data-word-dark>
          {text}
        </span>
      </div>
    </div>
  );
}
