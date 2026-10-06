'use client';
import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/animation';
import { animationConfig } from '@/animations/config';
import { motionStore } from '@/lib/motionStore';
import { mq } from '@/lib/responsive';
import { dampFactor } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import styles from './CustomCursor.module.css';

export type CursorState = 'default' | 'link' | 'image' | 'project' | 'drag' | 'view' | 'open';

const LABELS: Record<CursorState, string> = {
  default: '',
  link: '',
  image: 'View',
  project: 'Open',
  drag: 'Drag',
  view: 'View',
  open: 'Open case study',
};
const LABELLED = new Set<CursorState>(['image', 'project', 'drag', 'view', 'open']);
const INTERACTIVE = '[data-cursor], a, button, [role="button"], summary, label[for]';

/**
 * Negative cursor: a lerped ring and a faster dot rendered with
 * mix-blend-mode: difference, so they invert whatever is beneath them and are
 * never lost on white text or images. Labelled states (View / Open / Drag)
 * switch to an accent bubble. data-cursor="image|project|drag|view|open|link"
 * sets the state; data-cursor-label overrides the text. Fine pointers only.
 */
export function CustomCursor() {
  const fine = useMediaQuery(mq.finePointer);
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const bubble = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!fine || !ring.current || !dot.current || !bubble.current || !label.current) return;
    const ringEl = ring.current;
    const dotEl = dot.current;
    const bubbleEl = bubble.current;
    const labelEl = label.current;
    const layers = [ringEl, dotEl, bubbleEl];
    const html = document.documentElement;
    html.classList.add('has-cursor');

    const p = motionStore.pointer;
    const ringPos = { x: p.x, y: p.y };
    const dotPos = { x: p.x, y: p.y };
    const { cursorLerp, cursorDotLerp } = animationConfig.pointer;
    let current: CursorState = 'default';
    const round = (v: number) => Math.round(v * 10) / 10;

    const tick = (_t: number, delta: number) => {
      const fr = dampFactor(cursorLerp, delta);
      const fd = dampFactor(cursorDotLerp, delta);
      ringPos.x += (p.x - ringPos.x) * fr;
      ringPos.y += (p.y - ringPos.y) * fr;
      dotPos.x += (p.x - dotPos.x) * fd;
      dotPos.y += (p.y - dotPos.y) * fd;
      const ringT = `translate3d(${round(ringPos.x)}px, ${round(ringPos.y)}px, 0)`;
      ringEl.style.transform = ringT;
      bubbleEl.style.transform = ringT;
      dotEl.style.transform = `translate3d(${round(dotPos.x)}px, ${round(dotPos.y)}px, 0)`;
    };
    gsap.ticker.add(tick);

    const setAll = (key: string, value: string) => {
      layers.forEach((el) => {
        el.dataset[key] = value;
      });
    };
    const setState = (state: CursorState, text: string) => {
      if (state === current && labelEl.textContent === text) return;
      current = state;
      setAll('state', state);
      setAll('labelled', String(LABELLED.has(state)));
      labelEl.textContent = text;
    };

    const onOver = (e: PointerEvent) => {
      const target = (e.target as Element | null)?.closest<HTMLElement>(INTERACTIVE);
      if (!target) return setState('default', '');
      const raw = (target.dataset.cursor as CursorState | undefined) ?? 'link';
      const state: CursorState = raw in LABELS ? raw : 'link';
      setState(state, target.dataset.cursorLabel ?? LABELS[state]);
    };
    const onMove = () => setAll('visible', 'true');
    const onLeave = () => setAll('visible', 'false');
    const onDown = () => setAll('pressed', 'true');
    const onUp = () => setAll('pressed', 'false');

    document.addEventListener('pointerover', onOver);
    window.addEventListener('pointermove', onMove, { passive: true });
    html.addEventListener('pointerleave', onLeave);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);

    return () => {
      gsap.ticker.remove(tick);
      html.classList.remove('has-cursor');
      document.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointermove', onMove);
      html.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    };
  }, [fine]);

  if (!fine) return null;

  return (
    <>
      <div ref={ring} className={styles.ring} data-state="default" data-visible="false" aria-hidden="true">
        <span className={styles.ringShape} />
      </div>
      <div ref={dot} className={styles.dot} data-state="default" data-visible="false" aria-hidden="true">
        <span className={styles.dotShape} />
      </div>
      <div ref={bubble} className={styles.bubble} data-state="default" data-visible="false" aria-hidden="true">
        <span className={styles.bubbleShape} />
        <span ref={label} className={styles.label} />
      </div>
    </>
  );
}
