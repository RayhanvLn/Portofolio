'use client';
import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/animation';
import { mq } from '@/lib/responsive';
import type { ExperienceItem, SceneTheme } from '@/types/portfolio';
import { Scene } from '@/components/Scene/Scene';
import { TextReveal } from '@/components/TextReveal/TextReveal';
import styles from './Experience.module.css';

export function Experience({ items, title, theme = 'dark' }: { items: ExperienceItem[]; title: string[]; theme?: SceneTheme }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(mq.motionOK, () => {
        gsap.utils.toArray<HTMLElement>('[data-item]', root.current).forEach((item, i) => {
          gsap.fromTo(
            item,
            { clipPath: 'inset(0% 100% 0% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, delay: i * 0.06, ease: 'expo.out', scrollTrigger: { trigger: item, start: 'top 90%', once: true } },
          );
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <Scene theme={theme} className={styles.experience} aria-labelledby="experience-heading">
      <div ref={root}>
        <TextReveal as="h2" id="experience-heading" text={title} mode="lines" className={styles.title} />
        <ol className={styles.list}>
          {items.map((item, i) => (
            <li key={i} className={styles.item} data-item>
              <span className={styles.sweep} aria-hidden="true" />
              <span className={styles.period}>{item.period}</span>
              <span className={styles.role}>{item.role}</span>
              <span className={styles.org}>{item.organisation}</span>
              <span className={styles.note}>{item.note}</span>
            </li>
          ))}
        </ol>
      </div>
    </Scene>
  );
}
