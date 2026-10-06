import { gsap } from '@/lib/animation';
import { animationConfig } from './config';
import { ease } from './easings';

type Targets = gsap.TweenTarget;
/** Minimal ScrollTrigger config for entrance reveals. */
export interface RevealTrigger {
  trigger: Element | null;
  start?: string;
  once?: boolean;
}

interface RevealOptions {
  delay?: number;
  stagger?: number;
  duration?: number;
  /** Play when this trigger enters instead of immediately. */
  scrollTrigger?: RevealTrigger;
}

/** Characters rise out of their word mask with a slight rotation. */
export function characterReveal(targets: Targets, o: RevealOptions = {}) {
  return gsap.fromTo(
    targets,
    { yPercent: 115, rotate: 6 },
    {
      yPercent: 0,
      rotate: 0,
      duration: o.duration ?? animationConfig.durations.slow,
      ease: ease.out,
      stagger: o.stagger ?? animationConfig.stagger.chars,
      delay: o.delay ?? 0,
      scrollTrigger: o.scrollTrigger,
    },
  );
}

/** Words rise out of their own masks. */
export function wordReveal(targets: Targets, o: RevealOptions = {}) {
  return gsap.fromTo(
    targets,
    { yPercent: 110 },
    {
      yPercent: 0,
      duration: o.duration ?? animationConfig.durations.slow,
      ease: ease.out,
      stagger: o.stagger ?? animationConfig.stagger.words,
      delay: o.delay ?? 0,
      scrollTrigger: o.scrollTrigger,
    },
  );
}

/** Whole lines rise out of line masks. */
export function lineReveal(targets: Targets, o: RevealOptions = {}) {
  return gsap.fromTo(
    targets,
    { yPercent: 105 },
    {
      yPercent: 0,
      duration: o.duration ?? animationConfig.durations.slow,
      ease: ease.out,
      stagger: o.stagger ?? animationConfig.stagger.lines,
      delay: o.delay ?? 0,
      scrollTrigger: o.scrollTrigger,
    },
  );
}

/** Hidden start state used before the page is ready. */
export function hideForReveal(targets: Targets) {
  gsap.set(targets, { yPercent: 115 });
}
