/**
 * Page-transition engine — plain DOM + Web Animations API (no React, no GSAP).
 *
 *   coverPage()      A: content fades out · B: panel sweeps in · C: logo assembles
 *   revealPage()     D: hold · E: logo lifts out, panel sweeps away, new content rises in
 *   introLogo()      first visit: the overlay is already covering; logo assembles with a soft blur
 *   instantCover()   browser Back/Forward: cover at once (the route has already changed)
 *   resetOverlay()   failsafe: drop every animation and hide the overlay
 *
 * Only transform, opacity, clip-path and filter are animated (compositor-friendly).
 * Every wait is itself an animation, so slowing the document timeline (devtools,
 * tests) slows the whole sequence consistently.
 */
import { pageTransitionConfig, type PageTransitionConfig } from '@/config/pageTransition';

export interface TransitionParts {
  overlay: HTMLElement;
  panel: HTMLElement;
  logo: HTMLElement;
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
  return { overlay, panel, logo };
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

const CLEARED = ['opacity', 'transform', 'clip-path', 'filter'];

/** Remove every trace: animations, inline styles, and hide the overlay. Always safe to call. */
export function resetOverlay(parts: TransitionParts, content: HTMLElement[]) {
  for (const el of [parts.panel, parts.logo, ...content]) {
    el.getAnimations().forEach((a) => a.cancel());
    CLEARED.forEach((p) => el.style.removeProperty(p));
  }
  parts.overlay.getAnimations().forEach((a) => a.cancel());
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
