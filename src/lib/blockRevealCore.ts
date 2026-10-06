/**
 * Block-reveal core (no GSAP, no React): measures the VISUAL lines of any
 * element, hides/shows them with CSS masks, and draws the cover blocks.
 * The element's own children are never touched, so it is safe on
 * React-rendered markup (links, lists, grids, icons).
 */

export interface LineBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LineState {
  /** 0 → 1 while the block grows from the left over the line. */
  cover: number;
  /** 1 → 0 while the block shrinks toward the right, uncovering the text. */
  reveal: number;
  /** Text of this line is visible (under the block until it slides away). */
  revealed: boolean;
}

const HIDE_ALL = 'linear-gradient(transparent, transparent)';
const SHOW = 'linear-gradient(#000, #000)';
/** Revealed rows extend far left/right so content that drifts sideways is never clipped. */
const BAND_BLEED = 4000;

function writeMask(el: HTMLElement, images: string[], positions: string[], sizes: string[]) {
  const s = el.style;
  const img = images.join(', ');
  const pos = positions.join(', ');
  const size = sizes.join(', ');
  s.setProperty('-webkit-mask-image', img);
  s.setProperty('mask-image', img);
  s.setProperty('-webkit-mask-position', pos);
  s.setProperty('mask-position', pos);
  s.setProperty('-webkit-mask-size', size);
  s.setProperty('mask-size', size);
  s.setProperty('-webkit-mask-repeat', 'no-repeat');
  s.setProperty('mask-repeat', 'no-repeat');
}

/** Hide everything inside the element (visual only — still readable by screen readers). */
export function hideContent(el: HTMLElement) {
  writeMask(el, [HIDE_ALL], ['0 0'], ['100% 100%']);
}

export function clearMask(el: HTMLElement) {
  for (const p of ['mask-image', 'mask-position', 'mask-size', 'mask-repeat']) {
    el.style.removeProperty(p);
    el.style.removeProperty(`-webkit-${p}`);
  }
}

interface InkInfo {
  /** Extra room (local px) left / right / top-bottom of a text box for glyph ink. */
  l: number;
  r: number;
  v: number;
  hidden: boolean;
}

/**
 * Glyph ink of heavy, wide display type reaches past its text box: side bearings
 * (~0.05em each side) and, with negative letter-spacing, the last glyph overhangs
 * the box on the right by the tracking amount. Cached per element.
 */
function inkFor(parent: Element, cache: Map<Element, InkInfo>): InkInfo {
  let info = cache.get(parent);
  if (!info) {
    const cs = getComputedStyle(parent);
    const fs = parseFloat(cs.fontSize) || 16;
    const ls = parseFloat(cs.letterSpacing) || 0;
    info = { l: fs * 0.05, r: fs * 0.05 + Math.max(0, -ls), v: fs * 0.03, hidden: cs.visibility === 'hidden' };
    cache.set(parent, info);
  }
  return info;
}

/**
 * Visual lines of the element's text, in the element's own (untransformed)
 * coordinates — so blocks and masks line up with the text even while an ancestor
 * is scaled (e.g. a section that zooms in on scroll). Fragments on the same row
 * that are far apart (grid columns, flex items) become separate blocks.
 * Skips screen-reader-only text, invisible text and anything inside [data-block-skip]
 * (e.g. the hidden hover copy of RollText). mode 'box' treats the whole element as one line.
 */
export function measureLines(el: HTMLElement, opts: { mode?: 'lines' | 'box'; segmentGap?: number; pad?: number } = {}): LineBox[] {
  const { mode = 'lines', segmentGap = 24, pad = 2 } = opts;
  if (mode === 'box') {
    return el.offsetWidth > 0 && el.offsetHeight > 0 ? [{ x: 0, y: 0, w: el.offsetWidth, h: el.offsetHeight }] : [];
  }
  const box = el.getBoundingClientRect();
  // Screen px → local px. getBoundingClientRect includes ancestor transforms, offsetWidth does not.
  const fix = (v: number) => (Number.isFinite(v) && v > 0.2 && v < 5 ? v : 1);
  const sx = fix(el.offsetWidth ? box.width / el.offsetWidth : 1);
  const sy = fix(el.offsetHeight ? box.height / el.offsetHeight : 1);

  const inkCache = new Map<Element, InkInfo>();
  const frags: Array<{ l: number; t: number; r: number; b: number }> = [];
  const range = document.createRange();
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const parent = n.parentElement;
    if (!parent || !n.textContent?.trim()) continue;
    if (parent.closest('.sr-only, [data-block-skip]')) continue;
    const ink = inkFor(parent, inkCache);
    if (ink.hidden) continue;
    range.selectNodeContents(n);
    for (const r of Array.from(range.getClientRects())) {
      if (r.width < 1 || r.height < 1) continue;
      frags.push({
        l: (r.left - box.left) / sx - ink.l,
        r: (r.right - box.left) / sx + ink.r,
        t: (r.top - box.top) / sy - ink.v,
        b: (r.bottom - box.top) / sy + ink.v,
      });
    }
  }
  frags.sort((a, b) => a.t - b.t || a.l - b.l);

  // Group fragments into rows by vertical centre.
  const rows: Array<{ t: number; b: number; items: typeof frags }> = [];
  for (const f of frags) {
    const cy = (f.t + f.b) / 2;
    const row = rows.find((r) => cy > r.t && cy < r.b);
    if (row) {
      row.items.push(f);
      row.t = Math.min(row.t, f.t);
      row.b = Math.max(row.b, f.b);
    } else {
      rows.push({ t: f.t, b: f.b, items: [f] });
    }
  }

  // Split each row into segments separated by large gaps.
  const lines: LineBox[] = [];
  for (const row of rows.sort((a, b) => a.t - b.t)) {
    const items = row.items.sort((a, b) => a.l - b.l);
    let seg = { l: items[0].l, r: items[0].r, t: items[0].t, b: items[0].b };
    const flush = () =>
      lines.push({ x: seg.l - pad, y: seg.t - pad / 2, w: seg.r - seg.l + pad * 2, h: seg.b - seg.t + pad });
    for (const f of items.slice(1)) {
      if (f.l - seg.r > segmentGap) {
        flush();
        seg = { l: f.l, r: f.r, t: f.t, b: f.b };
      } else {
        seg.r = Math.max(seg.r, f.r);
        seg.t = Math.min(seg.t, f.t);
        seg.b = Math.max(seg.b, f.b);
      }
    }
    flush();
  }
  return lines;
}

/** Make the element a containing block for the blocks; returns a restore function. */
export function ensurePositioned(el: HTMLElement) {
  if (getComputedStyle(el).position !== 'static') return () => {};
  const prev = el.style.position;
  el.style.position = 'relative';
  return () => {
    el.style.position = prev;
  };
}

/** One absolutely positioned block per line, appended inside the element. */
export function createBlocks(el: HTMLElement, lines: LineBox[], color: string) {
  const layer = document.createElement('span');
  layer.setAttribute('aria-hidden', 'true');
  layer.dataset.blockLayer = '';
  Object.assign(layer.style, { position: 'absolute', inset: '0', pointerEvents: 'none', zIndex: '2' });
  const blocks = lines.map((ln) => {
    const b = document.createElement('span');
    Object.assign(b.style, {
      position: 'absolute',
      left: `${ln.x - el.clientLeft}px`,
      top: `${ln.y - el.clientTop}px`,
      width: `${ln.w}px`,
      height: `${ln.h}px`,
      background: color,
      transform: 'scaleX(0)',
      transformOrigin: '0% 50%',
      willChange: 'transform',
    });
    layer.appendChild(b);
    return b;
  });
  el.appendChild(layer);
  return { layer, blocks };
}

/** Apply the current state of every line: block transforms + the text mask. */
export function renderLines(el: HTMLElement, lines: LineBox[], blocks: HTMLElement[], states: LineState[]) {
  const images: string[] = [];
  const positions: string[] = [];
  const sizes: string[] = [];
  const width = el.offsetWidth;
  lines.forEach((ln, i) => {
    const st = states[i];
    const block = blocks[i];
    if (st.revealed) {
      // Text row visible; block shrinks toward the right.
      images.push(SHOW);
      positions.push(`${-BAND_BLEED}px ${ln.y}px`);
      sizes.push(`${width + BAND_BLEED * 2}px ${ln.h}px`);
      block.style.transformOrigin = '100% 50%';
      block.style.transform = `scaleX(${st.reveal})`;
    } else {
      // Block grows from the left; only the covered part may paint (the block hides the text there).
      if (st.cover > 0) {
        images.push(SHOW);
        positions.push(`${ln.x}px ${ln.y}px`);
        sizes.push(`${ln.w * st.cover}px ${ln.h}px`);
      }
      block.style.transformOrigin = '0% 50%';
      block.style.transform = `scaleX(${st.cover})`;
    }
  });
  if (!images.length) hideContent(el);
  else writeMask(el, images, positions, sizes);
}
