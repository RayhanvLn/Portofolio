import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { animationConfig } from '@/animations/config';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  // Mobile URL-bar show/hide should not trigger a full refresh (prevents jumps).
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export { gsap, ScrollTrigger, useGSAP };

/** Re-sort and refresh every trigger (after route changes, font load, pins). */
export function refreshScroll() {
  if (typeof window === 'undefined') return;
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isFinePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/**
 * Subtle magnetic pull toward the pointer. Returns a cleanup function.
 * An optional child with [data-magnetic-inner] travels a little further.
 */
export function magnetic(el: HTMLElement, strength: number = animationConfig.pointer.magneticStrength) {
  const opts = { duration: 0.7, ease: 'power3.out' };
  const xTo = gsap.quickTo(el, 'x', opts);
  const yTo = gsap.quickTo(el, 'y', opts);
  const inner = el.querySelector<HTMLElement>('[data-magnetic-inner]');
  const ixTo = inner ? gsap.quickTo(inner, 'x', opts) : null;
  const iyTo = inner ? gsap.quickTo(inner, 'y', opts) : null;

  const onMove = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    const cx = r.left - (gsap.getProperty(el, 'x') as number) + r.width / 2;
    const cy = r.top - (gsap.getProperty(el, 'y') as number) + r.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    xTo(dx * strength);
    yTo(dy * strength);
    ixTo?.(dx * strength * 0.45);
    iyTo?.(dy * strength * 0.45);
  };
  const onLeave = () => {
    xTo(0);
    yTo(0);
    ixTo?.(0);
    iyTo?.(0);
  };
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerleave', onLeave);
  return () => {
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerleave', onLeave);
    gsap.set([el, inner].filter(Boolean), { x: 0, y: 0 });
  };
}
