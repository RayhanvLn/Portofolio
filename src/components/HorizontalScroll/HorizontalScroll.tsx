'use client';
import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/animation';
import { velocitySkew } from '@/animations/scrollAnimations';
import { motionStore } from '@/lib/motionStore';
import { mq } from '@/lib/responsive';
import { pad } from '@/lib/utils';
import type { Project, ProjectsSectionContent } from '@/types/portfolio';
import { Scene } from '@/components/Scene/Scene';
import { TextReveal } from '@/components/TextReveal/TextReveal';
import { ProjectCard } from '@/components/ProjectCard/ProjectCard';
import { TransitionLink } from '@/components/PageTransition/TransitionLink';
import { FitText } from '@/components/FitText/FitText';
import { BlockReveal } from '@/components/BlockReveal/BlockReveal';
import styles from './HorizontalScroll.module.css';

/**
 * Pinned horizontal storytelling (desktop): vertical scroll drives the rail
 * (pin: true, scrub: 1); cards lean with scroll velocity. Covers are shown
 * whole (no zoom or drift inside the frame). Below 900px it becomes a native
 * swipe rail with snapping.
 */
export function HorizontalScroll({ section, projects }: { section: ProjectsSectionContent; projects: Project[] }) {
  const root = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const count = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${mq.desktop} and ${mq.motionOK}`, () => {
        const p = pin.current;
        const t = track.current;
        if (!p || !t) return;
        const distance = () => Math.max(0, t.scrollWidth - window.innerWidth);

        gsap.to(t, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: p,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (bar.current) gsap.set(bar.current, { scaleX: self.progress });
              if (count.current) count.current.textContent = pad(Math.min(projects.length, Math.floor(self.progress * projects.length) + 1));
            },
          },
        });

        // Velocity lean, settles to 0 when scrolling stops.
        const cards = t.querySelectorAll<HTMLElement>('[data-card]');
        const lean = velocitySkew(cards, 'skewX');
        // Ticker callbacks must not return a value (a returned tween fails the type check).
        const tick = () => {
          lean(-motionStore.scroll.velocity * 0.6);
        };
        gsap.ticker.add(tick);
        return () => gsap.ticker.remove(tick);
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [projects.length] },
  );

  return (
    <Scene theme="dark" className={styles.section} id="work" aria-labelledby="work-heading">
      <div ref={root}>
        <div ref={pin} className={styles.pin}>
          <div ref={track} className={styles.track}>
            <div className={styles.intro}>
              <FitText className={styles.title}>
                <TextReveal as="h2" id="work-heading" text={section.titleLines} mode="lines" />
              </FitText>
              <BlockReveal as="p" className={styles.introText} delay={0.2}>
                {section.intro}
              </BlockReveal>
            </div>
            {projects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} total={projects.length} className={styles.card} />
            ))}
            <TransitionLink href="/projects" className={styles.end} transitionLabel="Work">
              {section.allLabel}
            </TransitionLink>
          </div>
          <div className={styles.foot} aria-hidden="true">
            <div className={styles.progress}>
              <span ref={bar} className={styles.progressBar} />
            </div>
            <span className={styles.counter}>
              <span ref={count}>01</span> / {pad(projects.length)}
            </span>
          </div>
        </div>
      </div>
    </Scene>
  );
}
