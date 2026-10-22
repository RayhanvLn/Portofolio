'use client';
import { useRef, useState, type CSSProperties } from 'react';
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from '@/lib/animation';
import { mq } from '@/lib/responsive';
import { pad } from '@/lib/utils';
import { experienceSection } from '@/data/experienceSection';
import type { ExperienceItem, ImageAsset, SceneTheme } from '@/types/portfolio';
import { Scene } from '@/components/Scene/Scene';
import { TextReveal } from '@/components/TextReveal/TextReveal';
import { BlockReveal } from '@/components/BlockReveal/BlockReveal';
import { SmartImage } from '@/components/SmartImage/SmartImage';
import styles from './Experience.module.css';

/** Warm tones from the site palette, one per role (in order) unless a role sets its own `tone`. */
const TONES = ['#FF8000', '#FFB547', '#FF5533', '#E8A27C', '#FF9A3C', '#F1F0E9'];

/** Default photo per role: public/images/experience/experience-01.webp, -02… (cycled). */
const photoOf = (item: ExperienceItem, i: number): ImageAsset =>
  item.image ?? {
    src: `/images/experience/experience-${pad((i % 6) + 1)}.webp`,
    alt: `${item.role} — ${item.organisation}`,
    width: 1600,
    height: 2000,
  };

const isCurrent = (period: string) => /\b(now|present|current|sekarang)\b/i.test(period);

/** Hidden state of a card / photo that is not in focus: below (not reached yet) or above (passed). */
const OUT = (dir: 1 | -1) => ({ autoAlpha: 0, y: 70 * dir, filter: 'blur(12px)' });
const IN = { autoAlpha: 1, y: 0, filter: 'blur(0px)' };

/**
 * Experience as a centred timeline: a thin line down the middle, each role a card that alternates
 * right / left of it, with a ring on the line beside the card. Cards come into focus as they scroll
 * in — rising out of a blur — and blur away again as they leave the top (and the other way back up).
 * The role in the middle of the screen is active: its stretch of line lights up in its tone and
 * its ring fills. The empty side holds the role's photo. Phones: line on the left, cards to the right.
 */
export function Experience({ items, title, theme = 'dark' }: { items: ExperienceItem[]; title: string[]; theme?: SceneTheme }) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const n = items.length;
  const tone = (i: number) => items[i]?.tone ?? TONES[i % TONES.length];
  const { intro, showPhotos, itemLabel } = experienceSection;

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const rows = gsap.utils.toArray<HTMLElement>('[data-item]', el);

      // Active role: the one crossing the middle of the screen.
      rows.forEach((row, i) => {
        ScrollTrigger.create({
          trigger: row,
          start: 'top 55%',
          end: 'bottom 45%',
          onToggle: (self) => self.isActive && setActive(i),
        });
      });

      if (prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add(mq.motionOK, () => {
        rows.forEach((row) => {
          const parts = row.querySelectorAll<HTMLElement>('[data-focus]');
          if (!parts.length) return;
          gsap.set(parts, OUT(1));
          const show = () =>
            gsap.to(parts, { ...IN, duration: 0.95, ease: 'expo.out', stagger: 0.08, overwrite: true });
          const hide = (dir: 1 | -1) => () =>
            gsap.to(parts, { ...OUT(dir), duration: 0.6, ease: 'power2.in', stagger: 0.04, overwrite: true });
          ScrollTrigger.create({
            trigger: row,
            start: 'top 88%',
            end: 'bottom 12%',
            onEnter: show,
            onEnterBack: show,
            onLeave: hide(-1), // scrolled past: drifts up and blurs away
            onLeaveBack: hide(1), // scrolled back above it: sinks down again
          });
        });
        // the line draws itself down as the list scrolls through
        const fill = el.querySelector('[data-rail-fill]');
        if (fill) {
          gsap.fromTo(
            fill,
            { scaleY: 0 },
            { scaleY: 1, ease: 'none', scrollTrigger: { trigger: el.querySelector('[data-list]'), start: 'top 55%', end: 'bottom 55%', scrub: 0.4 } },
          );
        }
        return () => gsap.set(el.querySelectorAll('[data-focus]'), { clearProps: 'opacity,visibility,transform,filter' });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [n] },
  );

  if (!n) return null;

  return (
    <Scene theme={theme} className={styles.experience} aria-labelledby="experience-heading">
      <div ref={root} className={styles.inner} style={{ '--tone': tone(active) } as CSSProperties}>
        <span className={styles.glow} aria-hidden="true" />

        <header className={styles.head}>
          <TextReveal as="h2" id="experience-heading" text={title} mode="lines" className={styles.title} />
          {intro ? (
            <BlockReveal as="p" className={styles.intro} delay={0.1}>
              {intro}
            </BlockReveal>
          ) : null}
        </header>

        <ol className={styles.list} data-list>
          {/* faint line through the whole list + the part already scrolled through */}
          <span className={styles.rail} aria-hidden="true">
            <span className={styles.railFill} data-rail-fill />
          </span>

          {items.map((item, i) => {
            const live = isCurrent(item.period);
            const side = i % 2 === 0 ? 'right' : 'left';
            const tags = item.tags ?? [];
            return (
              <li
                key={i}
                className={styles.item}
                data-item
                data-side={side}
                data-active={i === active}
                style={{ '--item-tone': tone(i) } as CSSProperties}
              >
                {/* the ring on the line + this role's stretch of line */}
                <span className={styles.axis} aria-hidden="true">
                  <span className={styles.segment} />
                  <span className={styles.node} />
                </span>

                <article className={styles.card} data-focus>
                  <div className={styles.cardTop}>
                    <span className={styles.index}>
                      {itemLabel ? `${itemLabel} ` : ''}
                      {pad(i + 1)}
                    </span>
                    <span className={styles.period}>
                      {live ? <span className={styles.liveDot} aria-hidden="true" /> : null}
                      {item.period}
                    </span>
                  </div>
                  <h3 className={styles.role}>{item.role}</h3>
                  <p className={styles.org}>
                    <span className={styles.orgMark} aria-hidden="true" />
                    {item.organisation}
                  </p>
                  {item.note ? <p className={styles.note}>{item.note}</p> : null}
                  {tags.length ? (
                    <ul className={styles.tags} aria-label="Tools">
                      {tags.map((t) => (
                        <li key={t} className={styles.tag}>
                          {t}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </article>

                {showPhotos ? (
                  <div className={styles.photo} data-focus aria-hidden="true">
                    <span className={styles.photoBlock} />
                    <div className={styles.photoFrame}>
                      <SmartImage src={photoOf(item, i).src} alt="" sizes="(max-width: 899px) 90vw, 26vw" objectPosition="50% 30%" />
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>
    </Scene>
  );
}
