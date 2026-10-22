/**
 * Page-transition engine — plain DOM + Web Animations API (no React, no GSAP).
 *
 *   coverPage()      A: content fades out · B: panel sweeps in · C: logo assembles
 *   coverWithLogo()  navigation: an accent-coloured logo grows from the click until it fills the screen, then C
 *   revealPage()     D: hold · E: logo lifts out, panel sweeps away, new content rises in
 *   introLogo()      first visit: the overlay is already covering; logo assembles with a soft blur
 *   revealThroughLogo()  page load: the logo becomes a window onto the page and zooms open
 *   instantCover()   browser Back/Forward: cover at once (the route has already changed)
 *   resetOverlay()   failsafe: drop every animation and hide the overlay
 *
 * Only transform, opacity, clip-path and filter are animated (compositor-friendly) —
 * except the load reveal, which grows a CSS mask (a repaint per frame, for under a second).
 * Every wait is itself an animation, so slowing the document timeline (devtools,
 * tests) slows the whole sequence consistently.
 */
import { pageTransitionConfig, type PageTransitionConfig } from '@/config/pageTransition';

export interface TransitionParts {
  overlay: HTMLElement;
  panel: HTMLElement;
  logo: HTMLElement;
  /** Small text at the bottom of the load screen (optional). */
  label: HTMLElement | null;
  /** Accent-coloured logo that grows over the page at the start of a navigation (optional). */
  grow: HTMLElement | null;
}

interface RunOptions {
  reduced?: boolean;
  config?: PageTransitionConfig;
}

const noop = () => undefined;
const COVERED = 'translate3d(0, 0, 0)';
/** Diagonal wipe following the logo's forward slant: bottom-left → top-right. */
const CLIP_HIDDEN = 'polygon(0% 100%, 0% 100%, 0% 100%)';
const CLIP_FULL = 'polygon(0% 100%, 0% -120%, 220% 100%)';

export function getParts(overlay: HTMLElement): TransitionParts {
  const panel = overlay.querySelector<HTMLElement>('[data-transition-panel]');
  const logo = overlay.querySelector<HTMLElement>('[data-transition-logo]');
  if (!panel || !logo) throw new Error('[PageTransition] overlay markup is missing its panel or logo');
  return {
    overlay,
    panel,
    logo,
    label: overlay.querySelector<HTMLElement>('[data-transition-label]'),
    grow: overlay.querySelector<HTMLElement>('[data-transition-grow]'),
  };
}

/** Elements that fade out/in with each navigation (main content + footer). */
export const pageContent = () => Array.from(document.querySelectorAll<HTMLElement>('[data-page-content]'));

function axis(direction: PageTransitionConfig['direction']) {
  switch (direction) {
    case 'down':
      return { from: 'translate3d(0, -100%, 0)', to: 'translate3d(0, 100%, 0)', logoOut: 'translate3d(0, 16px, 0)' };
    case 'left':
      return { from: 'translate3d(100%, 0, 0)', to: 'translate3d(-100%, 0, 0)', logoOut: 'translate3d(-16px, 0, 0)' };
    case 'right':
      return { from: 'translate3d(-100%, 0, 0)', to: 'translate3d(100%, 0, 0)', logoOut: 'translate3d(16px, 0, 0)' };
    default:
      return { from: 'translate3d(0, 100%, 0)', to: 'translate3d(0, -100%, 0)', logoOut: 'translate3d(0, -16px, 0)' };
  }
}

const play = (el: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions) =>
  el.animate(keyframes, { fill: 'both', ...options });

/** A pause that runs on the animation timeline (lives on the overlay root, never on animated parts). */
const wait = (overlay: HTMLElement, ms: number) =>
  ms > 0 ? overlay.animate([], { duration: ms }).finished.then(noop) : Promise.resolve();

/** Freeze current animated values into inline styles, then drop the animations (smooth hand-off). */
function settle(els: Element[]) {
  for (const el of els) {
    for (const a of el.getAnimations()) {
      try {
        a.commitStyles();
      } catch {
        /* element not rendered — nothing to keep */
      }
      a.cancel();
    }
  }
}

/** After the entrance: a static, untransformed logo — guaranteed pixel-sharp during the hold. */
function crisp(logo: HTMLElement) {
  logo.getAnimations().forEach((a) => a.cancel());
  logo.style.opacity = '1';
  logo.style.transform = 'none';
  logo.style.clipPath = 'none';
  logo.style.filter = 'none';
}

const CLEARED = ['opacity', 'transform', 'clip-path', 'filter', 'transform-origin'];
const MASK_PROPS = ['mask-size', '-webkit-mask-size', 'mask-position', '-webkit-mask-position'];

/** Remove every trace: animations, inline styles, and hide the overlay. Always safe to call. */
export function resetOverlay(parts: TransitionParts, content: HTMLElement[]) {
  for (const el of [parts.panel, parts.logo, ...content]) {
    el.getAnimations().forEach((a) => a.cancel());
    CLEARED.forEach((p) => el.style.removeProperty(p));
  }
  MASK_PROPS.forEach((p) => parts.panel.style.removeProperty(p));
  delete parts.panel.dataset.hole;
  if (parts.grow) {
    MASK_PROPS.forEach((p) => parts.grow?.style.removeProperty(p));
    delete parts.grow.dataset.on;
  }
  parts.overlay.getAnimations().forEach((a) => a.cancel());
  parts.overlay.style.removeProperty('opacity');
  // the load screen is over: its label never shows again
  delete parts.overlay.dataset.load;
  parts.label?.getAnimations().forEach((a) => a.cancel());
  parts.overlay.dataset.state = 'idle';
}

/** A + B + C. `covered` resolves when the screen is fully covered, `shown` when the logo is in place. */
export function coverPage(parts: TransitionParts, content: HTMLElement[], o: RunOptions = {}) {
  const c = o.config ?? pageTransitionConfig;
  const d = c.durations;
  const { overlay, panel, logo } = parts;
  settle([panel, logo, ...content]);
  overlay.dataset.state = 'active';

  if (o.reduced) {
    const f = c.reducedMotion.fade;
    content.forEach((el) => play(el, [{ opacity: getComputedStyle(el).opacity }, { opacity: 0 }], { duration: f, easing: 'linear' }));
    const p = play(panel, [{ opacity: 0, transform: COVERED }, { opacity: 1, transform: COVERED }], { duration: f, easing: 'linear' });
    const l = play(logo, [{ opacity: 0 }, { opacity: 1 }], { duration: f, delay: f, easing: 'linear' });
    return { covered: p.finished.then(noop), shown: l.finished.then(() => crisp(logo)) };
  }

  const ax = axis(c.direction);
  content.forEach((el) =>
    play(el, [{ opacity: getComputedStyle(el).opacity }, { opacity: 0 }], { duration: d.contentOut, easing: 'cubic-bezier(0.33, 1, 0.68, 1)' }),
  );
  const p = play(panel, [{ transform: ax.from }, { transform: COVERED }], { duration: d.overlayIn, delay: d.overlayDelay, easing: c.easing });
  const l = play(
    logo,
    [
      { opacity: 0, transform: 'translate3d(0, 14px, 0) scale(0.9)', clipPath: CLIP_HIDDEN },
      { opacity: 1, offset: 0.35 },
      { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)', clipPath: CLIP_FULL },
    ],
    { duration: d.logoIn, delay: Math.max(0, d.overlayDelay + d.overlayIn - d.logoOverlap), easing: c.logoEasing },
  );
  return { covered: p.finished.then(noop), shown: l.finished.then(() => crisp(logo)) };
}

/** Where a navigation started: the click point, and whether that spot is already the transition colour. */
export interface CoverOrigin {
  x?: number;
  y?: number;
  /** Clicked inside an element marked data-transition-solid (the menu): starts after logoCover.menuWait. */
  solid?: boolean;
}

const LOGO_IN: Keyframe[] = [
  { opacity: 0, transform: 'translate3d(0, 14px, 0) scale(0.9)', clipPath: CLIP_HIDDEN },
  { opacity: 1, offset: 0.35 },
  { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)', clipPath: CLIP_FULL },
];

/**
 * Navigation cover: a tiny accent-coloured logo appears in the middle of the screen and zooms in
 * (timing and sizes measured from the reference) until its solid part fills the screen with the accent colour. Then the
 * panel takes over and the dark logo assembles in the middle (the page is then revealed through it,
 * see revealThroughLogo). Clicked inside the menu (data-transition-solid): it stays open and the logo
 * grows over it, after logoCover.menuWait. Falls back to coverPage() for reduced motion / no CSS masks.
 */
export function coverWithLogo(parts: TransitionParts, content: HTMLElement[], o: RunOptions & { from?: CoverOrigin } = {}) {
  const c = o.config ?? pageTransitionConfig;
  const g = c.logoCover;
  const d = c.durations;
  const { overlay, panel, logo, grow } = parts;
  if (o.reduced || !grow || !supportsLogoWindow()) return coverPage(parts, content, o);
  settle([panel, logo, ...content]);
  overlay.dataset.state = 'active';
  play(logo, [{ opacity: 0 }, { opacity: 0 }], { duration: 1 });

  const logoIn = () => {
    logo.getAnimations().forEach((a) => a.cancel());
    return play(logo, LOGO_IN, { duration: d.logoIn, easing: c.logoEasing }).finished.then(() => crisp(logo));
  };

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const box = logo.getBoundingClientRect();
  const w = box.width || c.logo.width.desktop;
  const h = box.height || w / c.logo.aspectRatio;
  const z = c.maskZoom;
  // Where it grows from: the centre of the screen (like the reference), or the click point.
  const centre = { x: vw / 2, y: vh / 2 };
  const at = g.origin === 'click' && o.from?.x !== undefined && o.from?.y !== undefined ? { x: o.from.x, y: o.from.y } : centre;
  const reach = Math.max(Math.hypot(at.x, at.y), Math.hypot(vw - at.x, at.y), Math.hypot(at.x, vh - at.y), Math.hypot(vw - at.x, vh - at.y));
  // Width of the logo on screen over time, as a fraction of the screen width, measured frame by frame
  // from the reference (60 fps, 1920 px): ~9 px → 41 px at 10 % → 900 px at 80 % of the time, then it
  // snaps to full screen. Between two points the size grows at a steady zoom rate.
  const sizeScale = g.size;
  const endW = Math.max(vw, (reach / z.solidRadius) * 1.1); // wide enough for its solid part to cover everything
  // reference widths in px (1920 px wide screen) at 0 %, 5 %, 10 % … 80 % of the time
  const measured: Array<[number, number]> = [
    [0, 6],
    [0.05, 9],
    [0.1, 41],
    [0.2, 82],
    [0.3, 140],
    [0.4, 208],
    [0.5, 319],
    [0.6, 452],
    [0.7, 640],
    [0.8, 898],
  ];
  const curve: Array<[number, number]> = [...measured.map(([t, px]): [number, number] => [t, (px / 1920) * sizeScale]), [1, endW / vw]];
  const widthAt = (t: number) => {
    let k = 1;
    while (k < curve.length - 1 && t > curve[k][0]) k += 1;
    const [t0, a0] = curve[k - 1];
    const [t1, a1] = curve[k];
    const f = Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
    return vw * Math.exp(Math.log(a0) + (Math.log(a1) - Math.log(a0)) * f);
  };

  const apply = (t: number) => {
    const sw = widthAt(t);
    const sh = (sw * h) / w;
    const size = `${sw.toFixed(2)}px ${sh.toFixed(2)}px`;
    const pos = `${(at.x - z.focus.x * sw).toFixed(2)}px ${(at.y - z.focus.y * sh).toFixed(2)}px`;
    grow.style.setProperty('-webkit-mask-size', size);
    grow.style.setProperty('mask-size', size);
    grow.style.setProperty('-webkit-mask-position', pos);
    grow.style.setProperty('mask-position', pos);
  };

  const duration = Math.max(200, g.duration);
  // Clicked in the menu: optional pause (logoCover.menuWait) before the orange logo starts.
  const startDelay = o.from?.solid ? g.menuWait : 0;
  // The panel (same colour) is invisible while the logo grows, and fades in over the last moment
  // so the corners the logo has not reached yet fill in smoothly as it snaps to full screen.
  play(panel, [{ opacity: 0, transform: COVERED }, { opacity: 0, transform: COVERED }], { duration: 1 });
  const covered = wait(overlay, startDelay).then(() => new Promise<void>((resolve) => {
    apply(0);
    grow.dataset.on = 'true';
    panel.getAnimations().forEach((a) => a.cancel());
    play(
      panel,
      [
        { opacity: 0, transform: COVERED, offset: 0 },
        { opacity: 0, transform: COVERED, offset: 0.9 },
        { opacity: 1, transform: COVERED },
      ],
      { duration, easing: 'linear' },
    );
    const clock = overlay.animate([], { duration });
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      // hand over to the panel (same colour): no visible change
      panel.getAnimations().forEach((a) => a.cancel());
      panel.style.opacity = '1';
      panel.style.transform = COVERED;
      delete grow.dataset.on;
      resolve();
    };
    const frame = () => {
      if (done) return;
      const t = Math.min(1, Number(clock.currentTime ?? duration) / duration);
      apply(t);
      if (t >= 1 || clock.playState === 'finished') finish();
      else requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    clock.finished.then(finish, finish);
  }));
  return { covered, shown: covered.then(() => wait(overlay, g.logoDelay)).then(logoIn) };
}

/** First visit: the overlay is already covering (server-rendered); the logo assembles with a soft blur. */
export function introLogo(parts: TransitionParts, content: HTMLElement[], o: RunOptions = {}) {
  const c = o.config ?? pageTransitionConfig;
  const i = c.introAnimation;
  const { overlay, panel, logo } = parts;
  settle([panel, logo, ...content]);
  overlay.dataset.state = 'active';
  play(panel, [{ transform: COVERED, opacity: 1 }, { transform: COVERED, opacity: 1 }], { duration: 1 });
  content.forEach((el) => play(el, [{ opacity: 0 }, { opacity: 0 }], { duration: 1 }));
  const l = o.reduced
    ? play(logo, [{ opacity: 0 }, { opacity: 1 }], { duration: c.reducedMotion.fade, easing: 'linear' })
    : play(
        logo,
        [
          { opacity: 0, transform: 'translate3d(0, 20px, 0) scale(0.85)', filter: `blur(${i.blur}px)`, clipPath: CLIP_HIDDEN },
          { opacity: 1, offset: 0.3 },
          { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)', filter: 'blur(0px)', clipPath: CLIP_FULL },
        ],
        { duration: i.logoIn, delay: i.logoDelay, easing: c.logoEasing },
      );
  return { shown: l.finished.then(() => crisp(logo)) };
}

/**
 * Page load: the logo is already animating with CSS (see TransitionOverlay.module.css).
 * Resolves when that animation has finished — immediately if it already has (slow
 * hydration) or if there is none (reduced motion) — and leaves the logo static and sharp.
 */
export async function awaitLoadLogo(parts: TransitionParts) {
  parts.overlay.dataset.state = 'covering';
  await Promise.all(parts.logo.getAnimations().map((a) => a.finished.catch(noop)));
  crisp(parts.logo);
}

/* ── Page load: the logo becomes a window and zooms open ─────────────── */

/** True when the browser can cut a logo-shaped hole with CSS masks. */
export function supportsLogoWindow() {
  if (typeof CSS === 'undefined' || !CSS.supports) return false;
  const image = CSS.supports('mask-image', 'linear-gradient(#000, #000)') || CSS.supports('-webkit-mask-image', 'linear-gradient(#000, #000)');
  const cut = CSS.supports('mask-composite', 'exclude') || CSS.supports('-webkit-mask-composite', 'xor');
  return image && cut;
}

/** CSS `cubic-bezier(x1, y1, x2, y2)` as a function of time (0–1 → progress). Falls back to ease-in. */
function bezier(css: string): (t: number) => number {
  const m = css.match(/cubic-bezier\(([^)]+)\)/);
  const n = m ? m[1].split(',').map(Number) : [];
  if (n.length !== 4 || n.some((v) => Number.isNaN(v))) return (t) => t * t * t;
  const [x1, y1, x2, y2] = n;
  const at = (a: number, b: number, t: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0;
    let hi = 1;
    let t = x;
    for (let k = 0; k < 24; k += 1) {
      t = (lo + hi) / 2;
      if (at(x1, x2, t) < x) lo = t;
      else hi = t;
    }
    return at(y1, y2, t);
  };
}

interface WindowOptions extends RunOptions {
  /** Total time of the zoom in ms. */
  duration?: number;
  /** Called once the window is open this far (config: maskZoom.readyAt) — page entrances start here. */
  onOpen?: () => void;
  /** Hold the logo this long before it opens, in ms. */
  holdMs?: number;
}

/**
 * Load reveal: the logo on the panel turns into a cut-out showing the page behind it, then the
 * cut-out grows from a point inside the logo until it covers the whole screen.
 * The panel gets a two-layer CSS mask (logo + full rectangle, combined with "exclude" = a hole);
 * the logo layer is resized every frame. Sizes grow on a log scale so the zoom feels even.
 */
export async function revealThroughLogo(parts: TransitionParts, content: HTMLElement[], o: WindowOptions = {}) {
  const c = o.config ?? pageTransitionConfig;
  const z = c.maskZoom;
  const { overlay, panel, logo, label } = parts;
  const duration = Math.max(200, o.duration ?? z.duration);
  if (o.holdMs) await wait(overlay, o.holdMs);
  settle([panel, logo, ...content]);
  overlay.dataset.state = 'active';

  // Make sure the mask image is in the cache, so the first frame already has the hole.
  try {
    const img = new Image();
    img.src = c.logo.src;
    await img.decode();
  } catch {
    /* not decodable here — the CSS mask loads it on its own */
  }

  const box = logo.getBoundingClientRect();
  const pbox = panel.getBoundingClientRect();
  const w = box.width || c.logo.width.desktop;
  const h = box.height || w / c.logo.aspectRatio;
  // Screen point the window opens from: a solid spot inside the logo.
  const fx = box.left + z.focus.x * w;
  const fy = box.top + z.focus.y * h;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const reach = Math.max(Math.hypot(fx, fy), Math.hypot(vw - fx, fy), Math.hypot(fx, vh - fy), Math.hypot(vw - fx, vh - fy));
  // Scale at which the solid part around the focus point is wider than the whole screen.
  const end = Math.min(z.maxScale, Math.max(8, (reach / (z.solidRadius * w)) * 1.8));
  const lnEnd = Math.log(end);
  const ease = bezier(z.easing);

  const apply = (s: number) => {
    const sw = w * s;
    const sh = h * s;
    const size = `${sw.toFixed(2)}px ${sh.toFixed(2)}px, 100% 100%`;
    const pos = `${(fx - pbox.left - z.focus.x * sw).toFixed(2)}px ${(fy - pbox.top - z.focus.y * sh).toFixed(2)}px, 0 0`;
    panel.style.setProperty('-webkit-mask-size', size);
    panel.style.setProperty('mask-size', size);
    panel.style.setProperty('-webkit-mask-position', pos);
    panel.style.setProperty('mask-position', pos);
  };

  // The page is fully there behind the panel — only visible through the window.
  content.forEach((el) => {
    const r = el.getBoundingClientRect();
    el.style.transformOrigin = `${(vw / 2 - r.left).toFixed(1)}px ${(vh / 2 - r.top).toFixed(1)}px`;
    play(el, [{ opacity: 1, transform: `scale(${z.pageScale})` }, { opacity: 1, transform: 'scale(1)' }], {
      duration: duration * 1.25,
      easing: 'cubic-bezier(0.45, 0, 0.2, 1)',
    });
  });

  apply(1);
  panel.dataset.hole = 'open';
  logo.style.opacity = '0';
  if (label) play(label, [{ opacity: getComputedStyle(label).opacity }, { opacity: 0 }], { duration: Math.min(260, duration * 0.3), easing: 'linear' });

  // The zoom runs on the animation timeline (an empty animation is the clock).
  const clock = overlay.animate([], { duration });
  const fade = play(overlay, [{ opacity: 1 }, { opacity: 0 }], {
    duration: duration * z.fadeOut,
    delay: duration * (1 - z.fadeOut),
    easing: 'linear',
  });
  let opened = false;
  const open = () => {
    if (opened) return;
    opened = true;
    o.onOpen?.();
  };
  await new Promise<void>((resolve) => {
    const frame = () => {
      const t = Math.min(1, Number(clock.currentTime ?? duration) / duration);
      apply(Math.exp(lnEnd * ease(t)));
      if (t >= z.readyAt) open();
      if (t >= 1 || clock.playState === 'finished') resolve();
      else requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    // Hidden tabs pause requestAnimationFrame; the clock still finishes.
    clock.finished.then(() => resolve(), () => resolve());
  });
  open();
  await fade.finished.catch(noop);
  await Promise.all(content.flatMap((el) => el.getAnimations().map((a) => a.finished.catch(noop))));
  resetOverlay(parts, content);
}

/** Back/Forward: the browser has already switched pages, so cover immediately, then reveal as usual. */
export function instantCover(parts: TransitionParts, content: HTMLElement[], o: RunOptions = {}) {
  const c = o.config ?? pageTransitionConfig;
  const { overlay, panel, logo } = parts;
  settle([panel, logo, ...content]);
  overlay.dataset.state = 'active';
  play(panel, [{ transform: COVERED, opacity: 1 }, { transform: COVERED, opacity: 1 }], { duration: 1 });
  content.forEach((el) => play(el, [{ opacity: 0 }, { opacity: 0 }], { duration: 1 }));
  const l = play(
    logo,
    o.reduced ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: 'translate3d(0, 10px, 0)' }, { opacity: 1, transform: 'translate3d(0, 0, 0)' }],
    { duration: o.reduced ? c.reducedMotion.fade : 260, easing: c.logoEasing },
  );
  return { shown: l.finished.then(() => crisp(logo)) };
}

interface RevealOptions extends RunOptions {
  /** Fade the logo out (false on repeat visits where it never appeared). */
  withLogo?: boolean;
  /** Slide content up while fading in (false when the page may be scrolled, e.g. Back/Forward). */
  shift?: boolean;
  /** Hold before revealing, in ms. */
  holdMs?: number;
}

/** D + E. Resolves when the overlay is gone and the page is fully interactive again. */
export async function revealPage(parts: TransitionParts, content: HTMLElement[], o: RevealOptions = {}) {
  const c = o.config ?? pageTransitionConfig;
  const d = c.durations;
  const { overlay, panel, logo } = parts;
  const withLogo = o.withLogo ?? true;
  if (o.holdMs) await wait(overlay, o.holdMs);
  settle([panel, logo, ...content]);
  overlay.dataset.state = 'active';
  const anims: Animation[] = [];

  if (o.reduced) {
    const f = c.reducedMotion.fade;
    if (withLogo) anims.push(play(logo, [{ opacity: 1 }, { opacity: 0 }], { duration: f, easing: 'linear' }));
    anims.push(play(panel, [{ opacity: 1, transform: COVERED }, { opacity: 0, transform: COVERED }], { duration: f, delay: withLogo ? f / 2 : 0, easing: 'linear' }));
    content.forEach((el) => anims.push(play(el, [{ opacity: 0 }, { opacity: 1 }], { duration: f, delay: f / 2, easing: 'linear' })));
  } else {
    const ax = axis(c.direction);
    const lead = withLogo ? d.logoLead : 0;
    if (withLogo) {
      anims.push(
        play(logo, [{ opacity: 1, transform: COVERED }, { opacity: 0, transform: ax.logoOut }], {
          duration: d.logoOut,
          easing: 'cubic-bezier(0.5, 0, 0.75, 0)',
        }),
      );
    }
    anims.push(play(panel, [{ transform: COVERED }, { transform: ax.to }], { duration: d.overlayOut, delay: lead, easing: c.easing }));
    const start = lead + d.overlayOut * d.contentInStart;
    const frames: Keyframe[] =
      o.shift === false
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [
            { opacity: 0, transform: `translate3d(0, ${c.contentShift}px, 0)` },
            { opacity: 1, transform: 'translate3d(0, 0, 0)' },
          ];
    content.forEach((el) => anims.push(play(el, frames, { duration: d.contentIn, delay: start, easing: c.logoEasing })));
  }

  await Promise.all(anims.map((a) => a.finished));
  resetOverlay(parts, content);
}

/** Resolve once the images in the first screen of `root` are decoded, or after `ms` at most. */
export function waitForVisibleImages(root: ParentNode | null, ms: number): Promise<void> {
  if (!root || ms <= 0) return Promise.resolve();
  const vh = window.innerHeight;
  const pending = Array.from(root.querySelectorAll('img')).filter((img) => {
    if (img.complete) return false;
    const r = img.getBoundingClientRect();
    return r.width > 0 && r.bottom > 0 && r.top < vh;
  });
  if (!pending.length) return Promise.resolve();
  return Promise.race([
    Promise.all(pending.map((img) => img.decode().catch(noop))),
    new Promise((resolve) => window.setTimeout(resolve, ms)),
  ]).then(noop);
}
