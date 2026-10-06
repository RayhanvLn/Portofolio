'use client';
import { Fragment, useRef } from 'react';
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/animation';
import { mq } from '@/lib/responsive';
import { parseAccent } from '@/lib/text';
import { usePageTransition } from '@/hooks/usePageTransition';
import { academic, type AcademicStat } from '@/data/academic';
import { Scene } from '@/components/Scene/Scene';
import { BlockReveal } from '@/components/BlockReveal/BlockReveal';
import { ParallaxImage } from '@/components/ParallaxImage/ParallaxImage';
import { FitText } from '@/components/FitText/FitText';
import styles from './AcademicCareer.module.css';

const split = (value: number, decimals: number) => {
  const [int, dec = ''] = value.toFixed(decimals).split('.');
  return { int, dec };
};

/** Big number: integer part large, decimals small top-right. Counts up on scroll (see below). */
function StatNumber({ value, decimals = 0, highlight }: { value: number; decimals?: number; highlight?: boolean }) {
  const { int, dec } = split(value, decimals);
  return (
    <span className={styles.number} data-count={value} data-decimals={decimals}>
      <span data-int>{int}</span>
      {decimals > 0 ? (
        <span className={styles.dec} data-dec>
          .{dec}
        </span>
      ) : null}
      {highlight ? (
        <svg className={styles.circle} viewBox="0 0 240 120" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <path
            data-circle
            pathLength={1}
            d="M58 104 C 20 96, 6 64, 26 38 C 52 6, 170 -2, 214 26 C 246 48, 226 90, 168 104 C 120 116, 52 112, 34 86"
          />
        </svg>
      ) : null}
    </span>
  );
}

/**
 * Academic career (home page): title + photo on the left, a 2×2 grid of
 * stats on the right. Numbers count up when they scroll into view, words and
 * labels use the accent block reveal, the highlighted value gets a drawn circle.
 */
export function AcademicCareer() {
  const root = useRef<HTMLDivElement>(null);
  const { ready } = usePageTransition();
  const { titleLines, image, stats } = academic;
  const srText = stats
    .map((s) => `${s.label}: ${s.text ? s.text.join(' ') : split(s.value ?? 0, s.decimals ?? 0).int + (s.decimals ? '.' + split(s.value ?? 0, s.decimals).dec : '')}`)
    .join('. ');

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const numbers = Array.from(el.querySelectorAll<HTMLElement>('[data-count]'));
      const write = (n: HTMLElement, v: number) => {
        const { int, dec } = split(v, Number(n.dataset.decimals ?? 0));
        const i = n.querySelector('[data-int]');
        const d = n.querySelector('[data-dec]');
        if (i) i.textContent = int;
        if (d) d.textContent = `.${dec}`;
      };
      const showFinal = () => numbers.forEach((n) => write(n, Number(n.dataset.count)));
      const circles = el.querySelectorAll('[data-circle]');

      if (prefersReducedMotion()) {
        showFinal();
        gsap.set(circles, { strokeDashoffset: 0 });
        return showFinal;
      }
      numbers.forEach((n) => write(n, 0));
      gsap.set(circles, { strokeDashoffset: 1 });
      if (!ready) return showFinal;

      const mm = gsap.matchMedia();
      mm.add(mq.motionOK, () => {
        numbers.forEach((n, i) => {
          const target = Number(n.dataset.count);
          const counter = { v: 0 };
          gsap
            .timeline({ scrollTrigger: { trigger: n, start: 'top 85%', once: true } })
            .to(counter, { v: target, duration: 1.8, delay: i * 0.12, ease: 'expo.out', onUpdate: () => write(n, counter.v) })
            .to(n.querySelectorAll('[data-circle]'), { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' }, '-=0.9');
        });
      });
      return () => {
        mm.revert();
        showFinal();
      };
    },
    { scope: root, dependencies: [ready], revertOnUpdate: true },
  );

  const renderValue = (s: AcademicStat) =>
    s.text ? (
      <BlockReveal delay={0.25} className={styles.wordsWrap}>
        <FitText className={styles.words}>
          {s.text.map((line, li) => (
            <span key={li} className={styles.wordLine} data-text-line>
              {line}
            </span>
          ))}
        </FitText>
      </BlockReveal>
    ) : (
      <StatNumber value={s.value ?? 0} decimals={s.decimals} highlight={s.highlight} />
    );

  return (
    <Scene theme="light" className={styles.section} aria-labelledby="academic-heading">
      <div ref={root} className={styles.grid}>
        <div className={styles.left}>
          <BlockReveal as="h2" id="academic-heading" className={styles.title}>
            {titleLines.map((line, li) => (
              <span key={li} className={styles.titleLine}>
                {parseAccent(line).map((seg, si) => (
                  <Fragment key={si}>
                    <span className={seg.accent ? styles.accent : styles.plain}>{seg.text}</span>
                  </Fragment>
                ))}
              </span>
            ))}
          </BlockReveal>
          <BlockReveal mode="box" delay={0.15} className={styles.image}>
            <ParallaxImage image={image} sizes="(max-width: 899px) 60vw, 26vw" speed={0.7} />
          </BlockReveal>
        </div>

        <p className="sr-only">{srText}</p>
        <dl className={styles.stats}>
          {stats.map((s, i) => (
            <div key={i} className={styles.stat} aria-hidden="true">
              <dt>
                <BlockReveal as="span" delay={0.1 + i * 0.06} className={styles.label}>
                  {s.label}
                </BlockReveal>
              </dt>
              <dd className={styles.value}>{renderValue(s)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Scene>
  );
}
