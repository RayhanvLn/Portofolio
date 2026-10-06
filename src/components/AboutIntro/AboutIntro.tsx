'use client';
import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/animation';
import { mq } from '@/lib/responsive';
import { usePageTransition } from '@/hooks/usePageTransition';
import { Scene } from '@/components/Scene/Scene';
import { TextReveal } from '@/components/TextReveal/TextReveal';
import { FitText } from '@/components/FitText/FitText';
import { BlockReveal } from '@/components/BlockReveal/BlockReveal';
import styles from './AboutIntro.module.css';

interface AboutIntroProps {
  name: string;
  role: string;
  lead: string;
  location: string;
  label?: string;
}

/**
 * About page opening with a clear hierarchy:
 *   meta row (label · location) + drawn rule
 *   FIRST NAME — one line, fitted to the full width (primary)
 *   other names (secondary) ········ role in the accent voice
 *   lead paragraph
 * Sequenced entrance; on scroll the name lines drift apart slightly.
 */
export function AboutIntro({ name, role, lead, location, label = 'About' }: AboutIntroProps) {
  const root = useRef<HTMLDivElement>(null);
  const { ready } = usePageTransition();
  const [first, ...others] = name.trim().split(/\s+/);
  const rest = others.join(' ');

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(mq.motionOK, () => {
        const q = gsap.utils.selector(el);
        // Scroll depth: first name drifts left, the second row drifts right.
        gsap
          .timeline({ scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } })
          .to(q('[data-drift="first"]'), { xPercent: -5, ease: 'none' }, 0)
          .to(q('[data-drift="second"]'), { xPercent: 3, ease: 'none' }, 0);

        if (!ready) {
          gsap.set(q('[data-rule]'), { scaleX: 0 });
          return;
        }
        gsap.fromTo(q('[data-rule]'), { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'expo.inOut', delay: 0.05 });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [ready], revertOnUpdate: true },
  );

  return (
    <Scene theme="dark" className={styles.intro} aria-labelledby="about-page-heading">
      <div ref={root}>
        <h1 id="about-page-heading" className="sr-only">
          {name}, {role}
        </h1>

        <div className={styles.meta} aria-hidden="true">
          <BlockReveal as="span" trigger="load" delay={0.1} className={styles.metaLabel}>
            <span className={styles.metaMark} />
            {label}
          </BlockReveal>
          <BlockReveal as="span" trigger="load" delay={0.2} className={styles.metaRight}>
            {location}
          </BlockReveal>
        </div>
        <span className={styles.rule} data-rule aria-hidden="true" />

        <div className={styles.names} aria-hidden="true">
          <div data-drift="first">
            <FitText className={styles.first}>
              <TextReveal as="span" text={first} mode="chars" trigger="load" delay={0.25} stagger={0.035} />
            </FitText>
          </div>
          <div className={styles.second} data-drift="second">
            {rest ? <TextReveal as="span" text={rest} mode="words" trigger="load" delay={0.6} className={styles.rest} /> : null}
            <BlockReveal as="span" trigger="load" delay={0.85} color="var(--c-paper)" className={styles.role}>
              {role}
            </BlockReveal>
          </div>
        </div>

        <div className={styles.foot}>
          <BlockReveal as="p" trigger="load" delay={1.05} className={styles.lead}>
            {lead}
          </BlockReveal>
        </div>
      </div>
    </Scene>
  );
}
