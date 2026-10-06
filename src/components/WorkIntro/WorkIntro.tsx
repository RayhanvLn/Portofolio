'use client';
import { Fragment, useRef } from 'react';
import { gsap, useGSAP } from '@/lib/animation';
import { hideForReveal, characterReveal } from '@/animations/textAnimations';
import { mq } from '@/lib/responsive';
import { pad } from '@/lib/utils';
import { parseAccent, stripAccent } from '@/lib/text';
import { usePageTransition } from '@/hooks/usePageTransition';
import { Scene } from '@/components/Scene/Scene';
import { FitText } from '@/components/FitText/FitText';
import { BlockReveal } from '@/components/BlockReveal/BlockReveal';
import styles from './WorkIntro.module.css';

interface WorkIntroProps {
  label: string;
  titleLines: string[];
  intro?: string;
  count: number;
}

/**
 * Light header of the Work page: meta row + drawn rule, a stepped title
 * (each line further right, *accent* words in the narrow orange voice),
 * optional intro. The dark project list slides over it as you scroll.
 */
export function WorkIntro({ label, titleLines, intro, count }: WorkIntroProps) {
  const root = useRef<HTMLDivElement>(null);
  const { ready } = usePageTransition();
  const plain = titleLines.map(stripAccent).join(' ');

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(mq.motionOK, () => {
        const q = gsap.utils.selector(el);
        const lines = q('[data-title-line]');
        // Scroll: lines drift in alternating directions, the header content lifts gently.
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } });
        lines.forEach((line, i) => tl.to(line, { xPercent: i % 2 ? 4 : -4, ease: 'none' }, 0));
        tl.to(q('[data-lift]'), { yPercent: -12, ease: 'none' }, 0);

        if (!ready) {
          gsap.set(q('[data-rule]'), { scaleX: 0 });
          hideForReveal(q('[data-char]'));
          return;
        }
        gsap.fromTo(q('[data-rule]'), { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'expo.inOut', delay: 0.05 });
        lines.forEach((line, i) => characterReveal(line.querySelectorAll('[data-char]'), { delay: 0.2 + i * 0.16, stagger: 0.03 }));
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [ready], revertOnUpdate: true },
  );

  return (
    <Scene theme="light" className={styles.intro} aria-labelledby="work-page-heading">
      <div ref={root} className={styles.inner}>
        <h1 id="work-page-heading" className="sr-only">
          {plain}
        </h1>
        <div data-lift>
          <div className={styles.meta} aria-hidden="true">
            <BlockReveal as="span" trigger="load" delay={0.1} className={styles.metaLabel}>
              <span className={styles.metaMark} />
              {label}
            </BlockReveal>
            <BlockReveal as="span" trigger="load" delay={0.2}>
              {pad(count)} {count === 1 ? 'Project' : 'Projects'}
            </BlockReveal>
          </div>
          <span className={styles.rule} data-rule aria-hidden="true" />

          <FitText className={styles.title}>
            <span aria-hidden="true">
              {titleLines.map((line, li) => (
                <span key={li} className={styles.line} data-text-line data-title-line>
                  {parseAccent(line).map((seg, si) =>
                    seg.text.split(/(\s+)/).map((part, pi) =>
                      part === '' || /^\s+$/.test(part) ? (
                        <Fragment key={`${si}-${pi}`}>{part}</Fragment>
                      ) : (
                        <span key={`${si}-${pi}`} className={`${styles.word} ${seg.accent ? styles.accent : styles.plain}`}>
                          {Array.from(part).map((ch, ci) => (
                            <span key={ci} className={styles.char} data-char>
                              {ch}
                            </span>
                          ))}
                        </span>
                      ),
                    ),
                  )}
                </span>
              ))}
            </span>
          </FitText>

          {intro ? (
            <div className={styles.foot}>
              <BlockReveal as="p" trigger="load" delay={0.8} className={styles.introText}>
                {intro}
              </BlockReveal>
            </div>
          ) : null}
        </div>
      </div>
    </Scene>
  );
}
