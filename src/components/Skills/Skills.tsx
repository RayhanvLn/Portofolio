'use client';
import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/animation';
import { ease } from '@/animations/easings';
import { mq } from '@/lib/responsive';
import type { SceneTheme, Skill } from '@/types/portfolio';
import { Scene } from '@/components/Scene/Scene';
import { TextReveal } from '@/components/TextReveal/TextReveal';
import styles from './Skills.module.css';

/**
 * Disciplines as a timeline, not progress bars: a rail fills with scroll,
 * a accent marker travels to the row in focus, its outlined number fills in,
 * and each row's rule draws across as it enters.
 */
export function Skills({ skills, title, theme = 'light' }: { skills: Skill[]; title: string[]; theme?: SceneTheme }) {
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const marker = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const l = list.current;
      if (!l) return;
      const rows = gsap.utils.toArray<HTMLElement>('[data-row]', l);
      const reduce = window.matchMedia(mq.reducedMotion).matches;
      const moveMarker = marker.current ? gsap.quickTo(marker.current, 'y', { duration: reduce ? 0 : 0.8, ease: ease.out }) : null;

      rows.forEach((row) => {
        ScrollTrigger.create({
          trigger: row,
          start: 'top 60%',
          end: 'bottom 60%',
          onToggle: (self) => {
            row.dataset.active = String(self.isActive);
            if (self.isActive) moveMarker?.(row.offsetTop + row.offsetHeight / 2 - 6);
          },
        });
      });
      if (reduce) return;

      gsap.fromTo(fill.current, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: l, start: 'top 60%', end: 'bottom 60%', scrub: true } });
      rows.forEach((row) => {
        gsap.fromTo(row.querySelector('[data-rule]'), { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: ease.out, scrollTrigger: { trigger: row, start: 'top 85%', once: true } });
        gsap.fromTo(
          row.querySelectorAll('[data-in]'),
          { y: 30, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 1, ease: ease.out, stagger: 0.08, scrollTrigger: { trigger: row, start: 'top 85%', once: true } },
        );
      });
    },
    { scope: root },
  );

  return (
    <Scene theme={theme} className={styles.skills} aria-labelledby="skills-heading">
      <div ref={root}>
        <div className={styles.head}>
          <TextReveal as="h2" id="skills-heading" text={title} mode="lines" className={styles.title} />
        </div>
        <div className={styles.list}>
          <span className={styles.rail} aria-hidden="true">
            <span ref={fill} className={styles.railFill} />
          </span>
          <span ref={marker} className={styles.indicator} aria-hidden="true" />
          <ol ref={list}>
          {skills.map((s) => (
            <li key={s.id} className={styles.row} data-row data-active="false">
              <span className={styles.num} aria-hidden="true">
                {s.id}
              </span>
              <h3 className={styles.name} data-in>
                {s.title}
              </h3>
              <div className={styles.body}>
                <p data-in>{s.description}</p>
                <p className={styles.labels} data-in>
                  {s.labels.join(' / ')}
                </p>
              </div>
              <span className={styles.rule} data-rule aria-hidden="true" />
            </li>
          ))}
          </ol>
        </div>
      </div>
    </Scene>
  );
}
