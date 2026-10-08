'use client';
import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/animation';
import { parseAccent } from '@/lib/text';
import { offScreen } from '@/data/offScreen';
import type { LifestyleItem, SceneTheme } from '@/types/portfolio';
import { Scene } from '@/components/Scene/Scene';
import { SmartImage } from '@/components/SmartImage/SmartImage';
import styles from './LifestyleStrip.module.css';

type Pose = { x: number; y: number; rotation: number; scale: number; zIndex: number };

/** Distance between neighbouring cards in the open fan. */
function fanSpread(n: number, w: number, room: number) {
  const narrow = room < 700;
  // the tilted outer cards reach further than their width, hence the extra 0.15–0.3 w
  const fit = (room * 0.96 - w * (narrow ? 1.15 : 1.3)) / (n - 1);
  return n > 1 ? Math.min(w * 0.72, Math.max(w * (narrow ? 0.16 : 0.22), fit)) : 0;
}

/**
 * Fan position of card `i` of `n`. `w` = card width, `room` = stage width, `active` = lifted card.
 * Cards spread around the centre, outer ones tilt more and sit lower (an arc); the centre is on top.
 * The active card rises, grows and straightens; every card beside it slides out of its way
 * (the whole side moves together, so nothing piles up) and dips back a little.
 */
function fanPose(i: number, n: number, w: number, room: number, active: number | null): Pose {
  const c = (n - 1) / 2;
  const o = i - c;
  const t = c > 0 ? o / c : 0; // -1 … 1
  const narrow = room < 700; // phones: tighter overlap and less tilt so the fan stays on screen
  const spread = fanSpread(n, w, room);
  const maxTilt = Math.min(28, 9 * c) * (narrow ? 0.6 : 1);
  const pose: Pose = {
    x: o * spread,
    y: t * t * w * 0.18,
    rotation: t * maxTilt,
    scale: 1,
    zIndex: 100 - Math.round(Math.abs(o) * 10),
  };
  if (active !== null) {
    const d = i - active;
    // stacking follows the lifted card: the closer to it, the higher (on both sides)
    pose.zIndex = 200 - Math.abs(d) * 10;
    if (d === 0) {
      pose.y -= w * 0.12;
      pose.scale = narrow ? 1.12 : 1.08;
      pose.rotation *= 0.2;
    } else {
      // enough room that the lifted card clears its neighbours — but never so much that the
      // outer cards leave the stage (on phones there is little room, so they mostly stay put)
      const clear = w * 1.14;
      const roomLeft = room / 2 - w * 0.6 - c * spread;
      pose.x += Math.sign(d) * Math.max(0, Math.min(clear - spread, roomLeft));
      pose.y += w * 0.03;
      pose.rotation += Math.sign(d) * 4;
      pose.scale = 0.96;
    }
  }
  return pose;
}

/** Closed: every card stacked in the centre, the middle one on top. */
function stackPose(i: number, n: number): Pose {
  const o = i - (n - 1) / 2;
  return { x: 0, y: 0, rotation: 0, scale: 1, zIndex: 100 - Math.round(Math.abs(o) * 10) };
}

/** Resting tilt per letter of the bold line, so it looks hand-placed (cycled). */
const TILTS = [-7, 5, -3, 6, -5, 4, -6, 3];

/**
 * Playful title: bold letters sit slightly tilted like stickers and drop in with a bounce,
 * the accent line gets a hand-drawn underline, and a small tag pops on. Hovering the title
 * makes the letters hop in a wave.
 */
function FunTitle({ lines, sticker }: { lines: string[]; sticker?: string }) {
  const root = useRef<HTMLDivElement>(null);
  let n = 0; // running letter index, for the wave delay

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const chars = el.querySelectorAll('[data-fun-char]');
    const line = el.querySelector('[data-fun-line]');
    const tag = el.querySelector('[data-fun-tag]');
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(
      chars,
      { yPercent: -140, rotation: (i: number) => (i % 2 ? 38 : -34), autoAlpha: 0 },
      { yPercent: 0, rotation: 0, autoAlpha: 1, duration: 0.95, ease: 'back.out(2.4)', stagger: 0.05 },
    );
    if (line) tl.fromTo(line, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' }, 0.45);
    if (tag) tl.fromTo(tag, { scale: 0, rotation: -40 }, { scale: 1, rotation: 0, duration: 1.1, ease: 'elastic.out(1, 0.5)' }, 0.7);
    tl.progress(0); // hidden until it scrolls in
    const st = ScrollTrigger.create({ trigger: el, start: 'top 82%', once: true, onEnter: () => tl.play() });
    if (st.scroll() > st.start) tl.progress(1);
    return () => {
      st.kill();
      tl.progress(1).kill();
      gsap.set([...Array.from(chars), line, tag].filter(Boolean), { clearProps: 'all' });
    };
  }, []);

  return (
    <div ref={root} className={styles.title} aria-hidden="true">
      {lines.map((text, li) => {
        const segs = parseAccent(text);
        const accentLine = segs.some((seg) => seg.accent);
        return (
          <span key={li} className={styles.titleLine}>
            {segs.map((seg, si) => (
              <span key={si} className={seg.accent ? styles.accent : styles.plain}>
                {Array.from(seg.text).map((ch, ci) => {
                  const i = n++;
                  const tilt = seg.accent ? (ci % 2 ? 2 : -2) : TILTS[i % TILTS.length];
                  return ch === ' ' ? (
                    <span key={ci}> </span>
                  ) : (
                    <span key={ci} className={styles.char} data-fun-char>
                      <span className={styles.charInner} style={{ '--tilt': `${tilt}deg`, '--i': i } as CSSProperties}>
                        {ch}
                      </span>
                    </span>
                  );
                })}
              </span>
            ))}
            {accentLine ? (
              <svg className={styles.underline} viewBox="0 0 240 24" preserveAspectRatio="none" focusable="false">
                <path d="M2 14 C 30 14, 38 6, 62 6 S 96 18, 122 18 S 158 6, 182 7 S 220 14, 238 12" pathLength={1} data-fun-line />
              </svg>
            ) : null}
          </span>
        );
      })}
      {sticker ? (
        <span className={styles.tag} data-fun-tag>
          <span className={styles.tagInner}>{sticker}</span>
        </span>
      ) : null}
    </div>
  );
}

/**
 * "Off screen" — a stack of photo cards rises in as you scroll, then fans out into an arc.
 * Once the fan has settled, hover (or tap / keyboard focus) lifts a card to the front, in colour,
 * with its caption. Content: src/data/offScreen.ts + `lifestyle` in src/data/portfolio.ts.
 */
export function LifestyleStrip({ items, title, theme = 'light' }: { items: LifestyleItem[]; title: string; theme?: SceneTheme }) {
  const stage = useRef<HTMLDivElement>(null);
  const deck = useRef<HTMLDivElement>(null);
  const opened = useRef(false);
  /** true once the fan has finished opening — cards only lift after that */
  const interactive = useRef(false);
  const settle = useRef<ReturnType<typeof gsap.delayedCall> | null>(null);
  const activeRef = useRef<number | null>(null);
  const lastPointer = useRef('mouse');
  /** last mouse position over the cards, so a card under a waiting cursor lifts when the fan settles */
  const hoverX = useRef<number | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const n = items.length;
  const titleLines = offScreen.titleLines?.length ? offScreen.titleLines : [title];
  const plainTitle = titleLines.map((l) => l.replace(/\*/g, '')).join(' ');

  const cards = useCallback(() => Array.from(deck.current?.querySelectorAll<HTMLElement>('[data-card]') ?? []), []);

  /** Card under a mouse x position, picked from the RESTING fan (lifted cards move, so picking
   *  from live positions made neighbours flicker). */
  const pickAt = useCallback(
    (clientX: number) => {
      const el = stage.current;
      const list = cards();
      if (!el || !list.length) return null;
      const r = el.getBoundingClientRect();
      const w = list[0].offsetWidth;
      const spread = fanSpread(n, w, el.clientWidth);
      const c = (n - 1) / 2;
      const px = clientX - (r.left + r.width / 2);
      const i = Math.min(n - 1, Math.max(0, Math.round(spread ? px / spread + c : c)));
      return Math.abs(px - (i - c) * spread) < w * 0.75 ? i : null;
    },
    [cards, n],
  );

  /** Move every card to its fan (open) or stack (closed) pose. */
  const layout = useCallback(
    (mode: 'open' | 'close' | 'hover' | 'snap') => {
      const el = stage.current;
      const list = cards();
      if (!el || !list.length) return;
      const w = list[0].offsetWidth;
      const room = el.clientWidth;
      const reduced = prefersReducedMotion();
      const poseOf = (i: number) => (opened.current ? fanPose(i, n, w, room, activeRef.current) : stackPose(i, n));
      if (mode === 'snap' || reduced) {
        list.forEach((card, i) => gsap.set(card, poseOf(i)));
        return;
      }
      const c = (n - 1) / 2;
      list.forEach((card, i) => {
        const p = poseOf(i);
        const vars =
          mode === 'open'
            ? { duration: 1.15, ease: 'expo.out', delay: Math.abs(i - c) * 0.035 }
            : mode === 'close'
              ? { duration: 0.7, ease: 'power3.inOut' }
              : { duration: 0.65, ease: 'power3.out' };
        // z-index changes at once so a lifted card is never hidden behind its neighbours
        gsap.set(card, { zIndex: p.zIndex });
        gsap.to(card, { x: p.x, y: p.y, rotation: p.rotation, scale: p.scale, overwrite: 'auto', ...vars });
      });
    },
    [cards, n],
  );

  /** Fan settled: allow lifting, and lift the card that is already under the cursor. */
  const unlock = useCallback(() => {
    interactive.current = true;
    if (hoverX.current !== null) setActive(pickAt(hoverX.current));
  }, [pickAt]);

  // Scroll choreography: the stack rises in, then fans out (and folds back when you scroll up).
  useEffect(() => {
    const el = stage.current;
    const d = deck.current;
    if (!el || !d || !n) return;
    layout('snap');
    const reduced = prefersReducedMotion();
    const triggers: Array<ReturnType<typeof ScrollTrigger.create>> = [];

    const open = (animate: boolean) => {
      opened.current = true;
      settle.current?.kill();
      if (!animate) {
        layout('snap');
        unlock();
        return;
      }
      interactive.current = false;
      layout('open');
      // the open animation: 1.15s + the stagger of the outermost card
      settle.current = gsap.delayedCall(1.15 + ((n - 1) / 2) * 0.035, unlock);
    };
    const close = () => {
      settle.current?.kill();
      interactive.current = false;
      opened.current = false;
      activeRef.current = null;
      setActive(null);
      layout('close');
    };

    if (reduced) {
      open(false);
    } else {
      const rise = gsap.fromTo(
        d,
        { y: () => window.innerHeight * (window.innerWidth < 700 ? 0.3 : 0.45) },
        {
          y: 0,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 38%', scrub: 0.6, invalidateOnRefresh: true },
        },
      );
      if (rise.scrollTrigger) triggers.push(rise.scrollTrigger);
      const fan = ScrollTrigger.create({ trigger: el, start: 'top 38%', onEnter: () => open(true), onLeaveBack: close });
      triggers.push(fan);
      // Arrived further down the page (reload, back button): open straight away.
      if (fan.scroll() > fan.start) open(false);
    }

    // Re-fan on resize (card width and room change).
    let lastWidth = el.clientWidth;
    const ro = new ResizeObserver(() => {
      if (el.clientWidth === lastWidth) return;
      lastWidth = el.clientWidth;
      layout('snap');
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      settle.current?.kill();
      triggers.forEach((t) => t.kill());
      gsap.killTweensOf([d, ...cards()]);
      gsap.set(d, { clearProps: 'transform' });
      cards().forEach((card) => gsap.set(card, { clearProps: 'transform,zIndex' }));
    };
  }, [cards, layout, n, unlock]);

  // Lift / lower a card.
  useEffect(() => {
    activeRef.current = active;
    if (opened.current && interactive.current) layout('hover');
  }, [active, layout]);

  if (!n) return null;

  return (
    <Scene theme={theme} className={styles.section} aria-labelledby="lifestyle-heading">
      <div className={styles.head}>
        <span className={styles.mark} aria-hidden="true" />
        <h2 id="lifestyle-heading" className="sr-only">
          {plainTitle}
        </h2>
        <FunTitle lines={titleLines} sticker={(offScreen as { sticker?: string }).sticker} />
      </div>

      <div ref={stage} className={styles.stage}>
        <div
          ref={deck}
          className={styles.deck}
          role="group"
          aria-label={plainTitle}
          onPointerMove={(e: ReactPointerEvent<HTMLDivElement>) => {
            if (e.pointerType !== 'mouse') return;
            hoverX.current = e.clientX;
            if (!interactive.current) return; // fan still opening: wait, unlock() picks it up
            const next = pickAt(e.clientX);
            if (next !== activeRef.current) setActive(next);
          }}
          onPointerLeave={(e: ReactPointerEvent<HTMLDivElement>) => {
            if (e.pointerType !== 'mouse') return;
            hoverX.current = null;
            setActive(null);
          }}
        >
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              className={styles.card}
              data-card
              data-color={item.color ? 'true' : 'false'}
              data-active={active === i}
              aria-pressed={active === i}
              aria-label={[item.caption, item.meta].filter(Boolean).join(' — ') || item.image.alt}
              style={{ zIndex: 100 - Math.round(Math.abs(i - (n - 1) / 2) * 10) } as CSSProperties}
              onPointerDown={(e) => {
                lastPointer.current = e.pointerType;
              }}
              onClick={() => {
                if (!interactive.current) return;
                // Touch: tap lifts a card, tapping it again lowers it. Mouse: hover already lifted it.
                if (lastPointer.current === 'mouse') setActive(i);
                else setActive((a) => (a === i ? null : i));
              }}
              onFocus={() => interactive.current && setActive(i)}
              onBlur={(e) => {
                if (!deck.current?.contains(e.relatedTarget as Node | null)) setActive(null);
              }}
            >
              <span className={styles.media}>
                <SmartImage src={item.image.src} alt={item.image.alt} sizes="(max-width: 899px) 50vw, 20vw" objectPosition={item.focus} />
              </span>
              <span className={styles.label} aria-hidden="true">
                <span>{item.caption}</span>
                <span className={styles.labelMeta}>{item.meta}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </Scene>
  );
}
