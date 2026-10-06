'use client';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { hasWebGL } from '@/lib/webgl';
import { mq } from '@/lib/responsive';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { ModelContent } from '@/types/portfolio';
import { StaticObject } from './StaticObject';
import { WebGLErrorBoundary } from './WebGLErrorBoundary';
import styles from './ThreeScene.module.css';

// Three.js is code-split and only fetched when the object is about to be seen.
const ThreeCanvas = dynamic(() => import('./ThreeCanvas'), { ssr: false, loading: () => null });

/**
 * Editorial 3D object. High quality on desktop, lighter on tablet/mobile,
 * static SVG with reduced motion or without WebGL. Rendering pauses while
 * off-screen.
 */
export function ThreeScene({ className, model }: { className?: string; model: ModelContent }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const desktop = useMediaQuery(mq.desktop);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => setSupported(hasWebGL()), []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setMounted(true);
      },
      { rootMargin: '200px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const useStatic = supported === false || reduced;

  return (
    <div ref={ref} className={cn(styles.scene, className)} aria-hidden="true">
      {useStatic ? (
        <StaticObject />
      ) : supported && mounted ? (
        <WebGLErrorBoundary fallback={<StaticObject />}>
          <div className={styles.canvas}>
            <ThreeCanvas quality={desktop ? 'high' : 'low'} active={visible} model={model} />
          </div>
        </WebGLErrorBoundary>
      ) : null}
    </div>
  );
}
