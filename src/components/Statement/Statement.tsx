'use client';
import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/animation';
import { scrubWords, fadeUp } from '@/animations/scrollAnimations';
import { mq } from '@/lib/responsive';
import { useFitText } from '@/hooks/useFitText';
import type { StatementContent } from '@/types/portfolio';
import { Scene } from '@/components/Scene/Scene';
import styles from './Statement.module.css';

/** Editorial statement: each line slides in from an alternating side and its
 *  words brighten as it passes — the read is tied to the scroll. */
export function Statement({ statement }: { statement: StatementContent }) {
  const root = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  // Each line stays on one row on desktop: shrink type until the longest fits.
  useFitText(heading, { lines: '[data-line]', query: mq.desktop });

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add({ desktop: mq.desktop, reduce: mq.reducedMotion }, (ctx) => {
        const { desktop, reduce } = ctx.conditions as Record<string, boolean>;
        if (reduce) return;
        el.querySelectorAll<HTMLElement>('[data-line]').forEach((line, i) => {
          const from = (i % 2 === 0 ? -1 : 1) * (desktop ? 14 : 6);
          gsap.fromTo(
            line,
            { xPercent: from },
            { xPercent: 0, ease: 'none', scrollTrigger: { trigger: line, start: 'top bottom', end: 'top 45%', scrub: 1 } },
          );
          scrubWords(line.querySelectorAll('[data-word]'), line);
        });
        fadeUp(el.querySelectorAll('[data-foot]'), { trigger: el.querySelector('[data-foot]') });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <Scene theme="light" className={styles.statement} aria-labelledby="statement-heading">
      <div ref={root}>
        <h2 ref={heading} id="statement-heading" className={styles.lines}>
          {statement.lines.map((line, i) => (
            <span key={i} className={styles.line} data-line>
              {line.split(' ').map((w, wi, arr) => (
                <span key={wi}>
                  <span className={styles.word} data-word>
                    {w}
                  </span>
                  {wi < arr.length - 1 ? ' ' : ''}
                </span>
              ))}
            </span>
          ))}
        </h2>
        <div className={styles.foot}>
          <span className={styles.mark} aria-hidden="true" data-foot />
          <p className={styles.support} data-foot>
            {statement.support}
          </p>
        </div>
      </div>
    </Scene>
  );
}
