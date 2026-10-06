'use client';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/animation';
import { animationConfig } from '@/animations/config';
import { ease } from '@/animations/easings';
import { portfolio } from '@/data/portfolio';
import { usePageTransition } from '@/hooks/usePageTransition';
import { pad } from '@/lib/utils';
import { Magnetic } from '@/components/Magnetic/Magnetic';
import styles from './Preloader.module.css';

const SESSION_KEY = 'pf:intro';
type Phase = 'loading' | 'ready' | 'leaving' | 'done';

/** Images worth having before the curtain opens. */
function criticalImages() {
  const mobile = window.matchMedia('(max-width: 899px)').matches;
  const { profile, hero, projects } = portfolio;
  const heroSrc =
    hero.mode === 'backdrop'
      ? mobile
        ? profile.heroBackdrop.mobile.src
        : profile.heroBackdrop.desktop.src
      : mobile
        ? profile.heroMobileImage.src
        : profile.heroImage.src;
  return [heroSrc, projects[0]?.cover.src].filter(Boolean) as string[];
}

/**
 * Cinematic intro, first visit per session only:
 * counter steps 00 → 25 → 50 → 75 → 100 while the word fills with accent,
 * then ENTER. On enter the panel lifts and the accent/dark curtain retracts.
 */
export function Preloader() {
  const { completeIntro } = usePageTransition();
  const { word, enterLabel } = portfolio.preloader;
  const { name, role } = portfolio.profile;

  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const enter = useRef<HTMLButtonElement>(null);
  const [phase, setPhase] = useState<Phase>('loading');

  // Loading: real progress (images + fonts), quantised to the five steps.
  useEffect(() => {
    if (document.documentElement.dataset.preloaded === 'true') {
      setPhase('done');
      return;
    }
    const urls = criticalImages();
    const total = urls.length + 1;
    let loaded = 0;
    let target = 0;
    let alive = true;
    const bump = () => {
      loaded += 1;
      target = Math.round((loaded / total) * 100);
    };
    urls.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = bump;
      img.src = src;
    });
    (document.fonts?.ready ?? Promise.resolve()).then(bump);

    const { steps, minStepTime, maxWait } = animationConfig.preloader;
    const reduced = prefersReducedMotion();
    let i = 0;
    const render = (value: number) => {
      if (counter.current) {
        counter.current.textContent = pad(value);
        if (!reduced) gsap.fromTo(counter.current, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.4, ease: ease.out });
      }
      if (fill.current) {
        gsap.to(fill.current, { clipPath: `inset(${100 - value}% 0% 0% 0%)`, duration: reduced ? 0 : 0.6, ease: ease.out });
      }
    };
    const step = () => {
      if (!alive) return;
      if (target < steps[i]) {
        gsap.delayedCall(0.05, step);
        return;
      }
      render(steps[i]);
      if (i === steps.length - 1) {
        gsap.delayedCall(reduced ? 0 : 0.4, () => alive && setPhase('ready'));
        return;
      }
      i += 1;
      gsap.delayedCall(reduced ? 0.05 : minStepTime, step);
    };
    step();
    const safety = gsap.delayedCall(maxWait, () => {
      target = 100;
    });

    return () => {
      alive = false;
      gsap.killTweensOf(step);
      safety.kill();
    };
  }, []);

  // Ready: show ENTER and move focus to it.
  useEffect(() => {
    if (phase !== 'ready' || !enter.current) return;
    enter.current.dataset.visible = 'true';
    gsap.fromTo(enter.current, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, ease: ease.out });
    enter.current.focus({ preventScroll: true });
  }, [phase]);

  const handleEnter = useCallback(() => {
    if (phase !== 'ready' || !root.current) return;
    setPhase('leaving');
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* private mode: preloader simply shows again next time */
    }
    const reduced = prefersReducedMotion();
    if (reduced) {
      gsap.to(root.current, {
        autoAlpha: 0,
        duration: 0.3,
        onComplete: () => {
          void completeIntro();
          setPhase('done');
        },
      });
      return;
    }
    gsap
      .timeline({ onComplete: () => setPhase('done') })
      .to(enter.current, { scale: 0.92, opacity: 0, duration: 0.35, ease: ease.in })
      .to(`.${styles.word}`, { yPercent: -40, opacity: 0, duration: 0.7, ease: ease.inOut }, 0)
      .to(root.current, { yPercent: -100, duration: 1, ease: ease.inOut }, 0.15)
      .add(() => void completeIntro(), 0.75);
  }, [completeIntro, phase]);

  if (phase === 'done') return null;

  return (
    <div
      ref={root}
      className={`${styles.preloader} preloader`}
      data-preloader
      role="dialog"
      aria-modal="true"
      aria-label="Loading portfolio"
    >
      <div className={styles.backdrop} aria-hidden="true" />
      <div className={styles.top}>
        <span>{name}</span>
        <span>{role}</span>
      </div>

      <div className={styles.word} style={{ '--chars': word.length } as CSSProperties} aria-hidden="true">
        <span className={styles.outline}>{word}</span>
        <span ref={fill} className={styles.fill}>
          {word}
        </span>
      </div>

      <div className={styles.bottom}>
        <span className={styles.counter} aria-live="polite" aria-atomic="true">
          <span ref={counter} className={styles.counterValue}>
            00
          </span>
          <span className={styles.percent}>%</span>
        </span>
        {phase === 'loading' ? <span className={styles.hint}>Loading</span> : null}
        <Magnetic>
          <button ref={enter} type="button" className={styles.enter} onClick={handleEnter} data-cursor="link" tabIndex={phase === 'ready' ? 0 : -1}>
            {enterLabel}
          </button>
        </Magnetic>
      </div>
    </div>
  );
}
