import { gsap } from '@/lib/animation';
import { animationConfig } from './config';
import { ease } from './easings';

interface EnterOptions {
  delay?: number;
  stagger?: number;
  distance?: number;
  trigger?: Element | null;
  start?: string;
}

const enterTrigger = (el: gsap.TweenTarget, o: EnterOptions) => ({
  trigger: (o.trigger ?? (Array.isArray(el) ? el[0] : el)) as Element,
  start: o.start ?? animationConfig.reveal.start,
  once: true,
});

export function fadeUp(el: gsap.TweenTarget, o: EnterOptions = {}) {
  return gsap.fromTo(
    el,
    { y: o.distance ?? 40, autoAlpha: 0 },
    {
      y: 0,
      autoAlpha: 1,
      duration: animationConfig.durations.base,
      ease: ease.out,
      delay: o.delay ?? 0,
      stagger: o.stagger ?? 0.08,
      scrollTrigger: enterTrigger(el, o),
    },
  );
}

export function slideLeft(el: gsap.TweenTarget, o: EnterOptions = {}) {
  return gsap.fromTo(
    el,
    { x: o.distance ?? 80, autoAlpha: 0 },
    { x: 0, autoAlpha: 1, duration: animationConfig.durations.slow, ease: ease.out, delay: o.delay ?? 0, scrollTrigger: enterTrigger(el, o) },
  );
}

export function slideRight(el: gsap.TweenTarget, o: EnterOptions = {}) {
  return gsap.fromTo(
    el,
    { x: -(o.distance ?? 80), autoAlpha: 0 },
    { x: 0, autoAlpha: 1, duration: animationConfig.durations.slow, ease: ease.out, delay: o.delay ?? 0, scrollTrigger: enterTrigger(el, o) },
  );
}

/** Scrubbed vertical parallax. amount = yPercent travel each direction. */
export function parallax(el: gsap.TweenTarget, trigger: Element, amount = 10) {
  return gsap.fromTo(
    el,
    { yPercent: -amount },
    {
      yPercent: amount,
      ease: 'none',
      scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: true },
    },
  );
}

/** Scrubbed horizontal drift, used for oversized typography. */
export function drift(el: gsap.TweenTarget, trigger: Element, from: number, to: number) {
  return gsap.fromTo(
    el,
    { xPercent: from },
    { xPercent: to, ease: 'none', scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: 1 } },
  );
}

/** Scroll-linked word highlight: words go from dim to full as the line passes. */
export function scrubWords(words: gsap.TweenTarget, trigger: Element) {
  return gsap.fromTo(
    words,
    { opacity: 0.14 },
    {
      opacity: 1,
      ease: 'none',
      stagger: 0.12,
      scrollTrigger: { trigger, start: 'top 88%', end: 'top 42%', scrub: 1 },
    },
  );
}

/** Returns a setter that eases an element's skew toward the scroll velocity. */
export function velocitySkew(el: gsap.TweenTarget, axis: 'skewX' | 'skewY' = 'skewY') {
  const setter = gsap.quickTo(el, axis, { duration: 0.6, ease: ease.soft });
  const { velocitySkewMax: max, velocitySkewFactor: f } = animationConfig.scroll;
  return (velocity: number) => setter(gsap.utils.clamp(-max, max, velocity * f));
}
