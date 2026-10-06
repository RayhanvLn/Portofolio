import { gsap } from '@/lib/animation';
import { animationConfig } from './config';
import { ease } from './easings';
import type { RevealTrigger } from './textAnimations';

export type RevealDirection = 'up' | 'down' | 'left' | 'right';

const inset = (dir: RevealDirection, v: number) => {
  switch (dir) {
    case 'down':
      return `inset(0% 0% ${v}% 0%)`;
    case 'left':
      return `inset(0% 0% 0% ${v}%)`;
    case 'right':
      return `inset(0% ${v}% 0% 0%)`;
    default:
      return `inset(${v}% 0% 0% 0%)`;
  }
};

/**
 * Signature image reveal: mask 100% → 70% → 0% while the image scales 1.15 → 1.
 * `mask` is the clipped wrapper, `media` the element that scales.
 */
export function imageReveal(
  mask: HTMLElement,
  media: HTMLElement | null,
  o: { direction?: RevealDirection; delay?: number; scrollTrigger?: RevealTrigger } = {},
) {
  const dir = o.direction ?? 'up';
  const [a, b, c] = animationConfig.reveal.maskStops;
  const tl = gsap.timeline({ delay: o.delay ?? 0, scrollTrigger: o.scrollTrigger });
  tl.fromTo(mask, { clipPath: inset(dir, a) }, { clipPath: inset(dir, b), duration: 0.32, ease: 'power2.in' })
    .to(mask, { clipPath: inset(dir, c), duration: 1.05, ease: ease.out });
  if (media) {
    tl.fromTo(
      media,
      { scale: animationConfig.reveal.imageStartScale },
      { scale: 1, duration: 1.45, ease: ease.out },
      0,
    );
  }
  return tl;
}

export function hideImage(mask: HTMLElement, direction: RevealDirection = 'up') {
  gsap.set(mask, { clipPath: inset(direction, 100) });
}

/** Generic clip reveal for blocks (not images). */
export function clipReveal(el: gsap.TweenTarget, o: { direction?: RevealDirection; delay?: number } = {}) {
  const dir = o.direction ?? 'up';
  return gsap.fromTo(
    el,
    { clipPath: inset(dir, 100) },
    { clipPath: inset(dir, 0), duration: animationConfig.durations.slow, ease: ease.out, delay: o.delay ?? 0 },
  );
}

export function scaleReveal(el: gsap.TweenTarget, o: { delay?: number; from?: number } = {}) {
  return gsap.fromTo(
    el,
    { scale: o.from ?? 0.86, autoAlpha: 0 },
    { scale: 1, autoAlpha: 1, duration: animationConfig.durations.slow, ease: ease.out, delay: o.delay ?? 0 },
  );
}
