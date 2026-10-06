'use client';
import { useEffect, type RefObject } from 'react';
import { refreshScroll } from '@/lib/animation';

interface FitOptions {
  /** Selector for the lines inside the container that must each fit on one row. */
  lines: string;
  /** Only fit while this media query matches (e.g. desktop). Default: always. */
  query?: string;
  /** Fraction of the container width a line may use. */
  fill?: number;
}

/** Width of the actual glyphs inside `el`, ignoring block boxes and padding. */
export function glyphWidth(el: HTMLElement) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  let left = Infinity;
  let right = -Infinity;
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent?.trim()) continue;
    // Screen-reader copies are positioned off-flow; only the visible glyphs count.
    if (n.parentElement?.closest('.sr-only')) continue;
    range.selectNodeContents(n);
    const r = range.getBoundingClientRect();
    if (r.width > 0) {
      left = Math.min(left, r.left);
      right = Math.max(right, r.right);
    }
  }
  return right > left ? right - left : 0;
}

let refreshTimer: number | undefined;
const scheduleRefresh = () => {
  window.clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(refreshScroll, 150);
};

/**
 * Shrinks the container's font-size (never grows past the CSS value) until
 * every line fits its width, including each line's own padding-left indent.
 * Re-fits on resize and once web fonts have loaded, then refreshes ScrollTrigger.
 */
export function useFitText(ref: RefObject<HTMLElement | null>, { lines, query, fill = 0.98 }: FitOptions) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mql = query ? window.matchMedia(query) : null;
    let lastWidth = -1;
    let lastSize = '';

    const fit = () => {
      el.style.removeProperty('font-size');
      if (mql && !mql.matches) {
        if (lastSize) scheduleRefresh();
        lastSize = '';
        return;
      }
      const avail = el.clientWidth * fill;
      if (avail <= 0) return;
      const base = parseFloat(getComputedStyle(el).fontSize);
      // Measure every line as ONE unbroken row: wrapping or overflow-wrap would
      // otherwise split long words and make them look like they already fit.
      const prevWhiteSpace = el.style.whiteSpace;
      el.style.whiteSpace = 'nowrap';
      let scale = 1;
      el.querySelectorAll<HTMLElement>(lines).forEach((line) => {
        const w = glyphWidth(line);
        const indent = parseFloat(getComputedStyle(line).paddingLeft) || 0;
        if (w > 0) scale = Math.min(scale, (avail - indent) / w);
      });
      el.style.whiteSpace = prevWhiteSpace;
      const next = scale < 1 ? `${Math.floor(base * scale * 10) / 10}px` : '';
      if (next) el.style.fontSize = next;
      if (next !== lastSize) {
        lastSize = next;
        scheduleRefresh();
      }
    };

    const ro = new ResizeObserver(() => {
      if (el.clientWidth === lastWidth) return;
      lastWidth = el.clientWidth;
      fit();
    });
    ro.observe(el);
    let alive = true;
    document.fonts?.ready.then(() => alive && fit());
    mql?.addEventListener('change', fit);
    return () => {
      alive = false;
      ro.disconnect();
      mql?.removeEventListener('change', fit);
    };
  }, [ref, lines, query, fill]);
}
