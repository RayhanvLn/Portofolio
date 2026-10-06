'use client';
import Lenis from 'lenis';
import { useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { gsap, ScrollTrigger, refreshScroll } from '@/lib/animation';
import { animationConfig } from '@/animations/config';
import { bindPointerTracking, decayMotion, motionStore } from '@/lib/motionStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SmoothScrollContext, type ScrollToOptions, type SmoothScrollApi } from '@/hooks/useSmoothScroll';

/**
 * Lenis smooth scrolling driven by GSAP's ticker, synced with ScrollTrigger.
 * Falls back to native scrolling when the visitor prefers reduced motion.
 * Touch devices keep native momentum scrolling (Lenis syncTouch is off).
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  // Starts locked: the preloader / intro curtain releases it.
  const locks = useRef(1);
  const reduced = useReducedMotion();

  useEffect(() => bindPointerTracking(), []);

  useEffect(() => {
    const root = document.documentElement;
    let lenis: Lenis | null = null;

    if (!reduced) {
      lenis = new Lenis({
        lerp: animationConfig.scroll.lerp,
        wheelMultiplier: animationConfig.scroll.wheelMultiplier,
        smoothWheel: true,
      });
      lenis.on('scroll', (l: Lenis) => {
        const s = motionStore.scroll;
        s.y = l.scroll;
        s.velocity = l.velocity;
        if (l.direction) s.direction = l.direction;
        s.progress = l.progress;
        ScrollTrigger.update();
      });
      if (locks.current > 0) lenis.stop();
      lenisRef.current = lenis;
    }

    const onNativeScroll = () => {
      const s = motionStore.scroll;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      s.direction = window.scrollY >= s.y ? 1 : -1;
      s.y = window.scrollY;
      s.progress = max > 0 ? s.y / max : 0;
    };
    if (reduced) window.addEventListener('scroll', onNativeScroll, { passive: true });

    const tick = (time: number) => {
      decayMotion(animationConfig.scroll.velocityDecay);
      lenis?.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    root.classList.toggle('is-locked', locks.current > 0);

    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) refreshScroll();
    });

    return () => {
      cancelled = true;
      gsap.ticker.remove(tick);
      window.removeEventListener('scroll', onNativeScroll);
      lenis?.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  const lock = useCallback(() => {
    locks.current += 1;
    lenisRef.current?.stop();
    document.documentElement.classList.add('is-locked');
  }, []);

  const unlock = useCallback(() => {
    locks.current = Math.max(0, locks.current - 1);
    if (locks.current === 0) {
      lenisRef.current?.start();
      document.documentElement.classList.remove('is-locked');
    }
  }, []);

  const scrollTo = useCallback((target: number | string | HTMLElement, o: ScrollToOptions = {}) => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, { immediate: o.immediate, offset: o.offset, duration: o.duration, force: true });
      return;
    }
    const behavior: ScrollBehavior = o.immediate || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    if (typeof target === 'number') {
      window.scrollTo({ top: target + (o.offset ?? 0), behavior });
      return;
    }
    const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + (o.offset ?? 0), behavior });
  }, []);

  const api = useMemo<SmoothScrollApi>(
    () => ({ getLenis: () => lenisRef.current, scrollTo, lock, unlock }),
    [scrollTo, lock, unlock],
  );

  return <SmoothScrollContext.Provider value={api}>{children}</SmoothScrollContext.Provider>;
}
