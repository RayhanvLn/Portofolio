'use client';
import { useRef, useState } from 'react';
import { gsap, useGSAP } from '@/lib/animation';
import { fadeUp } from '@/animations/scrollAnimations';
import { mq } from '@/lib/responsive';
import type { AboutContent, ImageAsset, SceneTheme } from '@/types/portfolio';
import { Scene } from '@/components/Scene/Scene';
import { ImageReveal } from '@/components/ImageReveal/ImageReveal';
import { SmartImage } from '@/components/SmartImage/SmartImage';
import { Magnetic } from '@/components/Magnetic/Magnetic';
import { TransitionLink } from '@/components/PageTransition/TransitionLink';
import styles from './About.module.css';

interface AboutProps {
  about: AboutContent;
  /** Main portrait — comes from profile.portrait in src/data/portfolio.ts. */
  portrait: ImageAsset;
  /** 'teaser' on the home page links to /about; 'full' is the about page. */
  variant?: 'teaser' | 'full';
  theme?: SceneTheme;
  headingId?: string;
}

/** Editorial about: oversized disciplines you can open for detail, portrait
 *  pair with a floating object, short bio and facts. */
export function About({ about, portrait, variant = 'teaser', theme = 'light', headingId = 'about-heading' }: AboutProps) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(mq.motionOK, () => {
        el.querySelectorAll<HTMLElement>('[data-discipline]').forEach((row, i) => {
          gsap.fromTo(
            row,
            { xPercent: i % 2 ? 6 : -6, autoAlpha: 0 },
            { xPercent: 0, autoAlpha: 1, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: row, start: 'top 90%', once: true } },
          );
        });
        el.querySelectorAll<HTMLElement>('[data-object]').forEach((obj, i) => {
          const dir = i % 2 ? -1 : 1;
          gsap.fromTo(
            obj,
            { y: 90 * dir, rotation: -12 * dir },
            { y: -90 * dir, rotation: 10 * dir, ease: 'none', scrollTrigger: { trigger: obj, start: 'top bottom', end: 'bottom top', scrub: true } },
          );
        });
        fadeUp(el.querySelectorAll('[data-fade]'), { trigger: el.querySelector('[data-fade]') });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const second = about.images[0];
  // Teaser shows one floating object; the full about page shows all of them.
  const objects = variant === 'full' ? about.objects : about.objects.slice(0, 1);
  const objectClass = [styles.object, styles.object2, styles.object3];

  return (
    <Scene theme={theme} className={styles.about} aria-labelledby={headingId}>
      <div ref={root} className={styles.grid}>
        <h2 id={headingId} className="sr-only">
          About
        </h2>
        <ul className={styles.disciplines} data-has-active={active !== null}>
          {about.disciplines.map((d, i) => {
            const open = active === i;
            return (
              <li key={i} className={styles.discipline} data-discipline>
                <button
                  type="button"
                  className={styles.disciplineButton}
                  aria-expanded={open}
                  aria-controls={`${headingId}-detail-${i}`}
                  onClick={() => setActive(open ? null : i)}
                  onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(i)}
                >
                  <span className={styles.disciplineWords}>
                    {d.words.map((w) => (
                      <span key={w} style={{ display: 'block' }}>
                        {w}
                      </span>
                    ))}
                  </span>
                  <span className={styles.disciplineMark} aria-hidden="true" />
                </button>
                <div id={`${headingId}-detail-${i}`} className={styles.detail} data-open={open}>
                  <div className={styles.detailInner}>
                    <p>{d.detail}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className={styles.visual}>
          <ImageReveal image={portrait} sizes="(max-width: 899px) 80vw, 33vw" parallax={0.8} className={styles.portrait} />
          {second ? (
            <ImageReveal image={second} sizes="(max-width: 899px) 40vw, 18vw" direction="left" delay={0.2} className={styles.second} />
          ) : null}
          {objects.map((object, i) => (
            <span key={object.src} className={objectClass[i % objectClass.length]} data-object aria-hidden="true">
              <SmartImage src={object.src} alt="" sizes="(max-width: 899px) 30vw, 14vw" fit="contain" />
            </span>
          ))}
        </div>

        <div className={styles.text}>
          {(variant === 'teaser' ? about.bio.slice(0, 1) : about.bio.slice(1)).map((p, i) => (
            <p key={i} data-fade>
              {p}
            </p>
          ))}
        </div>

        <dl className={styles.facts}>
          {about.facts.map((f) => (
            <div key={f.label} className={styles.fact} data-fade>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>

        {variant === 'teaser' ? (
          <div className={styles.cta} data-fade>
            <Magnetic>
              <TransitionLink href={about.cta.href} className="btn btn--outline">
                <span data-magnetic-inner>{about.cta.label}</span>
              </TransitionLink>
            </Magnetic>
          </div>
        ) : null}
      </div>
    </Scene>
  );
}
