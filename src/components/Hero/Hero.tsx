'use client';
import { useRef, type CSSProperties } from 'react';
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/animation';
import { animationConfig } from '@/animations/config';
import { ease } from '@/animations/easings';
import { hideImage, imageReveal } from '@/animations/imageAnimations';
import { motionStore } from '@/lib/motionStore';
import { mq } from '@/lib/responsive';
import { cn, longestLine } from '@/lib/utils';
import { brandLogo } from '@/lib/brand';
import { usePageTransition } from '@/hooks/usePageTransition';
import type { HeroContent, ModelContent, Profile } from '@/types/portfolio';
import { Scene } from '@/components/Scene/Scene';
import { TextReveal } from '@/components/TextReveal/TextReveal';
import { ContourField } from '@/components/ContourField/ContourField';
import { ThreeScene } from '@/components/ThreeScene/ThreeScene';
import { Magnetic } from '@/components/Magnetic/Magnetic';
import { TransitionLink } from '@/components/PageTransition/TransitionLink';
import { HeroSubject } from './HeroSubject';
import { useHeroTitleFit } from './useHeroTitleFit';
import styles from './Hero.module.css';

interface HeroProps {
  profile: Profile;
  hero: HeroContent;
  model: ModelContent;
}

/**
 * Four depth layers (background 0.15 · midground 0.35 · subject 0.6 · foreground 1)
 * follow the pointer. The first name line sits behind the subject, the second
 * in front of it. On scroll the lines drift apart and the subject settles.
 */
export function Hero({ profile, hero, model }: HeroProps) {
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const { ready } = usePageTransition();
  const { depth, pointer } = animationConfig;
  const chars = longestLine(hero.titleLines);
  // Both name lines share one size, measured so the longest line always fits the screen.
  useHeroTitleFit(root);

  // Pointer depth + scroll choreography (independent of the intro).
  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add({ desktop: mq.desktop, fine: mq.finePointer, reduce: mq.reducedMotion }, (ctx) => {
        const { desktop, fine, reduce } = ctx.conditions as Record<string, boolean>;
        if (reduce) return;

        const layers = gsap.utils.toArray<HTMLElement>('[data-depth]', el);
        let onMove: (() => void) | undefined;
        if (fine && desktop) {
          const setters = layers.map((layer) => {
            const d = Number(layer.dataset.depth);
            return {
              d,
              x: gsap.quickTo(layer, 'x', { duration: 1.2, ease: ease.out }),
              y: gsap.quickTo(layer, 'y', { duration: 1.2, ease: ease.out }),
            };
          });
          const rot = frame.current ? gsap.quickTo(frame.current, 'rotation', { duration: 1.4, ease: ease.out }) : null;
          onMove = () => {
            const p = motionStore.pointer;
            setters.forEach((s) => {
              s.x(-p.nx * pointer.heroMaxOffset * s.d);
              s.y(-p.ny * pointer.heroMaxOffset * 0.6 * s.d);
            });
            rot?.(p.nx * pointer.heroRotation);
          };
          window.addEventListener('pointermove', onMove, { passive: true });
        }

        const q = gsap.utils.selector(el);
        const k = desktop ? 1 : 0.5;
        gsap
          .timeline({
            scrollTrigger: {
              trigger: el,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
              onUpdate: (self) => {
                motionStore.hero.progress = self.progress;
              },
            },
          })
          .to(q('[data-title-back]'), { xPercent: -16 * k, ease: 'none' }, 0)
          .to(q('[data-title-front]'), { xPercent: 12 * k, ease: 'none' }, 0)
          .to(q('[data-subject-inner]'), { yPercent: 10 * k, scale: 1 + 0.06 * k, ease: 'none' }, 0)
          .to(q('[data-hero-fade]'), { opacity: 0, y: -40, ease: 'none' }, 0)
          .to(q('[data-object]'), { yPercent: -30 * k, ease: 'none' }, 0);

        return () => {
          if (onMove) window.removeEventListener('pointermove', onMove);
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // Intro: one orchestrated moment when the curtain opens.
  useGSAP(
    () => {
      if (!frame.current || prefersReducedMotion()) return;
      const fades = root.current?.querySelectorAll('[data-hero-intro]') ?? [];
      if (!ready) {
        hideImage(frame.current, 'up');
        gsap.set(fades, { autoAlpha: 0, y: 24 });
        return;
      }
      imageReveal(frame.current, frame.current.querySelector('[data-subject-media]'), { delay: 0.15 });
      gsap.to(fades, { autoAlpha: 1, y: 0, duration: 1, ease: ease.out, stagger: 0.08, delay: 0.7 });
    },
    { scope: root, dependencies: [ready], revertOnUpdate: true },
  );

  return (
    <Scene theme="dark" className={styles.hero} aria-labelledby="hero-heading">
      <div ref={root} className={styles.stage} style={{ '--chars': chars } as CSSProperties}>
        <h1 id="hero-heading" className={cn('sr-only', styles.heading)}>
          {profile.name}, {profile.role}
        </h1>

        {/* Logo: centred at the top, above the first name line, aligned with the menu toggle. */}
        <div
          className={styles.brand}
          data-hero-fade
          aria-hidden="true"
          style={{ '--logo-src': `url('${brandLogo.src}')`, '--logo-ratio': brandLogo.aspectRatio } as CSSProperties}
        >
          <span className={styles.brandMark} data-hero-intro />
        </div>

        <div className={cn(styles.layer, styles.bg)} data-depth={depth.background}>
          <ContourField variant="one" pointerTravel={0} />
        </div>

        <div className={cn(styles.layer, styles.mid)} data-depth={depth.midground}>
          <div data-title-back data-title-line className={cn(styles.title, styles.titleBack)}>
            <TextReveal as="span" text={hero.titleLines[0]} mode="chars" trigger="load" delay={0.2} />
          </div>
          {hero.showObject && hero.mode === 'cutout' ? (
            <div className={styles.object} data-object>
              <ThreeScene model={model} />
            </div>
          ) : null}
        </div>

        <div className={cn(styles.layer, styles.subject)} data-depth={depth.subject}>
          {hero.mode === 'backdrop' ? (
            <div ref={frame} className={styles.backdrop}>
              <div data-subject-inner style={{ position: 'absolute', inset: 0 }}>
                <div data-subject-media style={{ position: 'absolute', inset: 0 }}>
                  <HeroSubject desktop={profile.heroBackdrop.desktop} mobile={profile.heroBackdrop.mobile} fit="cover" />
                </div>
              </div>
            </div>
          ) : (
            <div ref={frame} className={styles.subjectFrame}>
              <div data-subject-inner style={{ position: 'absolute', inset: 0, transformOrigin: '50% 100%' }}>
                <div data-subject-media style={{ position: 'absolute', inset: 0, transformOrigin: '50% 100%' }}>
                  <HeroSubject desktop={profile.heroImage} mobile={profile.heroMobileImage} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={cn(styles.layer, styles.fg)} data-depth={depth.foreground}>
          <div data-title-front data-title-line className={cn(styles.title, styles.titleFront)}>
            <TextReveal as="span" text={hero.titleLines[1]} mode="chars" trigger="load" delay={0.38} />
          </div>
        </div>

        <div className={styles.ui} data-hero-fade>
          <div className={styles.meta} data-hero-intro>
            <span>{profile.role}</span>
            <span className={styles.metaMuted}>{profile.location}</span>
          </div>
          <p className={styles.intro} data-hero-intro>
            {hero.intro}
          </p>
          <div className={styles.actions} data-hero-intro>
            <TransitionLink href={hero.secondaryCta.href} className={styles.secondary}>
              {hero.secondaryCta.label}
            </TransitionLink>
            <Magnetic>
              <TransitionLink href={hero.cta.href} className="btn btn--accent">
                <span data-magnetic-inner>{hero.cta.label}</span>
              </TransitionLink>
            </Magnetic>
          </div>
        </div>

        <div className={styles.scrollCue} data-hero-fade aria-hidden="true">
          <span>{hero.scrollLabel}</span>
          <span className={styles.scrollLine} />
        </div>
      </div>
    </Scene>
  );
}
