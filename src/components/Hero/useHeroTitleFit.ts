'use client';
import { useEffect, type RefObject } from 'react';
import { glyphWidth } from '@/hooks/useFitText';

/** Share of the space between the side margins the longest name line may use. */
const FILL = 0.97;

/**
 * Sizes the oversized hero name from its real letter widths.
 *
 * Both lines share ONE size: the longest line fits between the side margins
 * (never past the screen edge), and the size never exceeds the CSS cap
 * (--title-cap in Hero.module.css). The result is written to --title-fit on
 * the hero, which the title, the mobile line spacing and the mobile photo size
 * all read. Re-fits on resize and once the web font has loaded.
 */
export function useHeroTitleFit(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let lastWidth = -1;

    const fit = () => {
      const lines = Array.from(el.querySelectorAll<HTMLElement>('[data-title-line]'));
      const back = el.querySelector<HTMLElement>('[data-title-back]');
      if (!lines.length || !back) return;
      // Measure at the cap size, as one unbroken row per line.
      el.style.setProperty('--title-fit', 'var(--title-cap)');
      const base = parseFloat(getComputedStyle(lines[0]).fontSize);
      const gutter = back.offsetLeft;
      const avail = (el.clientWidth - 2 * gutter) * FILL;
      let widest = 0;
      lines.forEach((line) => {
        widest = Math.max(widest, glyphWidth(line));
      });
      if (!base || !widest || avail <= 0) {
        el.style.removeProperty('--title-fit');
        return;
      }
      const size = Math.min(base, (base * avail) / widest);
      el.style.setProperty('--title-fit', `${Math.floor(size * 10) / 10}px`);
    };

    const ro = new ResizeObserver(() => {
      if (el.clientWidth === lastWidth) return;
      lastWidth = el.clientWidth;
      fit();
    });
    ro.observe(el);
    let alive = true;
    document.fonts?.ready.then(() => alive && fit());
    return () => {
      alive = false;
      ro.disconnect();
    };
  }, [root]);
}
