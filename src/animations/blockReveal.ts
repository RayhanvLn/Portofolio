import { gsap } from '@/lib/animation';
import { animationConfig } from './config';
import {
  clearMask,
  createBlocks,
  ensurePositioned,
  measureLines,
  renderLines,
  type LineState,
} from '@/lib/blockRevealCore';

export interface BlockRevealOptions {
  delay?: number;
  /** Block colour (any CSS colour or var()). Default: the accent colour. */
  color?: string;
  /** 'lines' = one block per visual line; 'box' = the whole element as one block. */
  mode?: 'lines' | 'box';
}

/**
 * Accent blocks grow over each visual line, the text appears underneath,
 * then the blocks slide away line by line. Leaves no trace when finished.
 */
export function blockReveal(el: HTMLElement, o: BlockRevealOptions = {}) {
  const cfg = animationConfig.blockReveal;
  const lines = measureLines(el, { mode: o.mode, segmentGap: cfg.segmentGap });
  if (!lines.length) {
    clearMask(el);
    return null;
  }
  const restorePosition = ensurePositioned(el);
  const { layer, blocks } = createBlocks(el, lines, o.color ?? 'var(--c-accent)');
  const states: LineState[] = lines.map(() => ({ cover: 0, reveal: 1, revealed: false }));
  const render = () => renderLines(el, lines, blocks, states);

  let destroyed = false;
  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    tl.kill();
    layer.remove();
    clearMask(el);
    restorePosition();
  };

  const tl = gsap.timeline({ delay: o.delay ?? 0, onUpdate: render, onComplete: destroy });
  states.forEach((st, i) => {
    const t = i * cfg.stagger;
    tl.to(st, { cover: 1, duration: cfg.cover, ease: cfg.ease }, t)
      .set(st, { revealed: true }, t + cfg.cover + cfg.hold)
      .to(st, { reveal: 0, duration: cfg.reveal, ease: cfg.ease }, t + cfg.cover + cfg.hold);
  });
  render();
  return { timeline: tl, destroy };
}
