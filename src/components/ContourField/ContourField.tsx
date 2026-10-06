'use client';
import { useRef } from 'react';
import { gsap, isFinePointer, prefersReducedMotion, ScrollTrigger, useGSAP } from '@/lib/animation';
import { motionStore } from '@/lib/motionStore';
import { cn } from '@/lib/utils';
import { CONTOUR_VIEWBOX, contourSets, type ContourVariant } from './contourData';
import styles from './ContourField.module.css';

interface ContourFieldProps {
  variant?: ContourVariant;
  className?: string;
  /** Pixels of drift toward the pointer (0 disables). */
  pointerTravel?: number;
  /** Seconds between the occasional accent stroke trace (0 disables). */
  drawEvery?: number;
}

/** Low-opacity topographic lines. Drift with scroll, lean toward the pointer,
 *  and occasionally trace one contour in the accent colour. */
export function ContourField({ variant = 'one', className, pointerTravel = 14, drawEvery = 5 }: ContourFieldProps) {
  const svg = useRef<SVGSVGElement>(null);
  const group = useRef<SVGGElement>(null);
  const highlight = useRef<SVGPathElement>(null);
  const paths = contourSets[variant];

  useGSAP(
    () => {
      const el = svg.current;
      const g = group.current;
      const hl = highlight.current;
      if (!el || !g || !hl || prefersReducedMotion()) return;

      gsap.fromTo(
        g,
        { yPercent: 4, rotation: -1.5 },
        {
          yPercent: -6,
          rotation: 1.5,
          svgOrigin: '500 500',
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );

      let removeMove: (() => void) | undefined;
      if (pointerTravel > 0 && isFinePointer()) {
        const xTo = gsap.quickTo(g, 'x', { duration: 1.6, ease: 'power3.out' });
        const yTo = gsap.quickTo(g, 'y', { duration: 1.6, ease: 'power3.out' });
        const onMove = () => {
          xTo(motionStore.pointer.nx * pointerTravel);
          yTo(motionStore.pointer.ny * pointerTravel * 0.7);
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        removeMove = () => window.removeEventListener('pointermove', onMove);
      }

      let alive = true;
      const trace = () => {
        if (!alive) return;
        if (ScrollTrigger.isInViewport(el)) {
          hl.setAttribute('d', paths[Math.floor(Math.random() * paths.length)]);
          const len = hl.getTotalLength();
          gsap
            .timeline()
            .set(hl, { strokeDasharray: len, strokeDashoffset: len, opacity: 0.85 })
            .to(hl, { strokeDashoffset: 0, duration: 2.6, ease: 'power2.inOut' })
            .to(hl, { opacity: 0, duration: 1.2, ease: 'power1.out' });
        }
        gsap.delayedCall(drawEvery, trace);
      };
      if (drawEvery > 0) gsap.delayedCall(1.2, trace);

      return () => {
        alive = false;
        gsap.killTweensOf(trace);
        gsap.killTweensOf(hl);
        removeMove?.();
      };
    },
    { scope: svg, dependencies: [variant, pointerTravel, drawEvery] },
  );

  return (
    <svg
      ref={svg}
      className={cn(styles.field, className)}
      viewBox={CONTOUR_VIEWBOX}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <g ref={group}>
        <g className={styles.lines}>
          {paths.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        <path ref={highlight} className={styles.highlight} d={paths[0]} />
      </g>
    </svg>
  );
}
