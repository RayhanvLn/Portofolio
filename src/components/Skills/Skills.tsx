'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { gsap, useGSAP } from '@/lib/animation';
import { mq } from '@/lib/responsive';
import { notchPath } from '@/lib/notchFrame';
import { skillsSection } from '@/data/skillsSection';
import type { SceneTheme, Skill } from '@/types/portfolio';
import { Scene } from '@/components/Scene/Scene';
import { TextReveal } from '@/components/TextReveal/TextReveal';
import { BlockReveal } from '@/components/BlockReveal/BlockReveal';
import { SmartImage } from '@/components/SmartImage/SmartImage';
import styles from './Skills.module.css';

type Tool = { name: string; icon?: string; photo?: string };
type Entry = { tool: Tool; skill: Skill; key: string; n: number };

/** Badge colours for tools without a logo (picked from the name, so a tool keeps its colour). */
const BADGE = ['#FF8000', '#111112', '#FFB547', '#FF5533', '#5E5E59', '#E8A27C'];
const LIGHT = new Set(['#FFB547', '#E8A27C']);

const toolsOf = (s: Skill): Tool[] => s.tools ?? s.labels.map((name) => ({ name }));

/** "React Three Fiber" → "RT", "Next.js" → "Ne", "Node.js" → "No", "GSAP" → "GS". */
function monogram(name: string) {
  const words = name
    .replace(/\.js$/i, '')
    .split(/[^A-Za-z0-9+#]+/)
    .filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  const w = words[0] ?? name;
  return w.length < 2 ? w.toUpperCase() : w[0].toUpperCase() + w[1];
}
function colourOf(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return BADGE[h % BADGE.length];
}

/** Deal entries into `n` columns, left to right, row by row. */
function columns(entries: Entry[], n: number) {
  const cols: Entry[][] = Array.from({ length: n }, () => []);
  entries.forEach((e, i) => cols[i % n].push(e));
  return cols;
}

/**
 * One tool card, "hall of fame" style: an outlined frame with a notch bottom-right holding the
 * name and category; the tool's logo (or lettered badge) sits in the middle like a trophy.
 * Hover (or tap) turns the outline orange and wipes in a panel — the tool's photo if it has one,
 * otherwise the category in orange with its description.
 */
function ToolCard({ entry, index, open, onToggle }: { entry: Entry; index: number; open: boolean; onToggle: () => void }) {
  const card = useRef<HTMLElement>(null);
  const caption = useRef<HTMLElement>(null);
  const [d, setD] = useState('');
  const { tool, skill } = entry;
  const colour = colourOf(tool.name);

  // The outline is computed from the real sizes, so corners and the diagonal never stretch.
  useEffect(() => {
    const c = card.current;
    const cap = caption.current;
    if (!c || !cap) return;
    const update = () => {
      // Long names wrap: the notch follows the caption's height, while corner radius and the longest
      // diagonal come from CSS (--notch-radius, --notch-diag) — the same numbers that cap the caption's
      // width (--cap-room), so the caption always fits inside the notch.
      const capH = cap.offsetHeight;
      const css = getComputedStyle(c);
      const radius = parseFloat(css.getPropertyValue('--notch-radius')) || 16;
      const diagMax = parseFloat(css.getPropertyValue('--notch-diag')) || 42;
      setD(notchPath({ width: c.offsetWidth, height: c.offsetHeight, notchW: cap.offsetWidth, notchH: capH, radius, diag: Math.min(capH * 1.05, diagMax) }));
      c.style.setProperty('--cap-h', `${capH}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(c);
    ro.observe(cap);
    return () => ro.disconnect();
  }, []);

  return (
    <figure
      ref={card}
      className={styles.card}
      data-card
      data-open={open}
      style={{ '--i': index } as CSSProperties}
      onClick={(e) => {
        if ((e.nativeEvent as PointerEvent).pointerType !== 'mouse') onToggle();
      }}
    >
      <svg className={styles.frame} aria-hidden="true" focusable="false">
        <path d={d} pathLength={1} data-frame />
      </svg>

      <div className={styles.face} data-face>
        {tool.icon ? (
          // eslint-disable-next-line @next/next/no-img-element -- small logo files, any format
          <img className={styles.logo} src={tool.icon} alt="" loading="lazy" />
        ) : (
          <span
            className={styles.badge}
            style={{ '--badge': colour, '--badge-ink': LIGHT.has(colour) ? '#111112' : '#F1F0E9' } as CSSProperties}
            aria-hidden="true"
          >
            {monogram(tool.name)}
          </span>
        )}
      </div>

      {/* hover panel */}
      <div className={styles.reveal} data-has-photo={tool.photo ? 'true' : 'false'} aria-hidden="true">
        {tool.photo ? (
          <SmartImage src={tool.photo} alt="" sizes="(max-width: 899px) 50vw, 25vw" />
        ) : (
          <div className={styles.revealInner}>
            <span className={styles.revealCat}>{skill.title}</span>
            <span className={styles.revealName}>{tool.name}</span>
            {skill.description ? <span className={styles.revealDesc}>{skill.description}</span> : null}
          </div>
        )}
      </div>

      <figcaption ref={caption} className={styles.caption}>
        <span className={styles.captionText}>
          <span className={styles.captionName}>{tool.name}</span>{' '}
          {/* number of the tool within its category, like the year on a trophy */}
          <span className={styles.captionCat}>{String(entry.n).padStart(2, '0')}</span>
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * Skills as a "hall of fame": every tool from every category in a staggered grid of
 * notched cards (4 columns on desktop, 2 on phones). Outlines draw in as they scroll into view,
 * the offset columns drift a little faster, and hovering a card reveals its category.
 */
export function Skills({ skills, title, theme = 'light' }: { skills: Skill[]; title: string[]; theme?: SceneTheme }) {
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<string | null>(null);
  const entries: Entry[] = skills.flatMap((skill) => toolsOf(skill).map((tool, n) => ({ tool, skill, key: `${skill.id}-${tool.name}`, n: n + 1 })));
  const lines = title.length ? title : ['Skills'];
  const plain = lines.slice(0, Math.max(1, lines.length - 1));
  const accent = lines.length > 1 ? lines[lines.length - 1] : null;

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      // Each card: outline draws itself, the logo rises in.
      // Only the grid that is on screen is animated (the other one is display:none — a trigger on a
      // hidden element fires at once, and with `once` it removed itself in the middle of
      // ScrollTrigger's refresh, which broke every trigger created after it, e.g. the footer's).
      const cardsIn = (kind: 'desktop' | 'mobile') => {
        gsap.utils.toArray<HTMLElement>(`[data-grid="${kind}"] [data-card]`, el).forEach((card) => {
          gsap
            .timeline({ scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' } })
            .fromTo(card.querySelector('[data-frame]'), { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, 0)
            .fromTo(card.querySelector('[data-face]'), { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'expo.out' }, 0.25);
        });
      };
      mm.add(`${mq.desktop} and ${mq.motionOK}`, () => cardsIn('desktop'));
      mm.add(`${mq.belowTablet} and ${mq.motionOK}`, () => cardsIn('mobile'));
      // desktop: the offset columns drift a little faster than the page.
      // Worked out from the grid's position every frame (no ScrollTrigger): a scrubbed trigger here,
      // right after the pinned projects section, crashed ScrollTrigger's refresh on the home page.
      mm.add(`${mq.desktop} and ${mq.motionOK}`, () => {
        const grid = el.querySelector<HTMLElement>('[data-grid="desktop"]');
        const cols = gsap.utils.toArray<HTMLElement>('[data-grid="desktop"] [data-col-offset="true"]', el);
        if (!grid || !cols.length) return;
        const setY = cols.map((col) => gsap.quickSetter(col, 'y', 'px'));
        let last = Number.NaN;
        const tick = () => {
          const r = grid.getBoundingClientRect();
          const vh = window.innerHeight;
          if (r.bottom < -100 || r.top > vh + 100) return; // off screen: nothing to do
          const progress = gsap.utils.clamp(0, 1, (vh - r.top) / (vh + r.height));
          const y = Math.round((70 - 140 * progress) * 10) / 10;
          if (y === last) return;
          last = y;
          setY.forEach((set) => set(y));
        };
        tick();
        gsap.ticker.add(tick);
        return () => {
          gsap.ticker.remove(tick);
          gsap.set(cols, { clearProps: 'transform' });
        };
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [entries.length] },
  );

  if (!entries.length) return null;

  const card = (e: Entry) => (
    <ToolCard key={e.key} entry={e} index={entries.indexOf(e)} open={open === e.key} onToggle={() => setOpen((o) => (o === e.key ? null : e.key))} />
  );
  const head = (s: Skill, i: number) => (
    <header className={styles.colHead}>
      <span className={styles.colIndex}>{String(i + 1).padStart(2, '0')}</span>
      <span className={styles.colTitle}>{s.title}</span>
      <span className={styles.colCount}>{toolsOf(s).length}</span>
    </header>
  );
  const byCategory = skills.map((s) => entries.filter((e) => e.skill === s)).filter((list) => list.length);
  const cats = skills.filter((s) => toolsOf(s).length);

  return (
    <Scene theme={theme} className={styles.skills} aria-labelledby="skills-heading">
      <div ref={root}>
        <div className={styles.head}>
          <h2 id="skills-heading" className={styles.title}>
            <span className="sr-only">{lines.join(' ')}</span>
            <span aria-hidden="true">
              <TextReveal as="span" text={plain} mode="lines" className={styles.titlePlain} />
              {accent ? <TextReveal as="span" text={accent} mode="lines" delay={0.12} className={styles.titleAccent} /> : null}
            </span>
          </h2>
          {skillsSection.intro ? (
            <BlockReveal as="p" className={styles.intro} delay={0.15}>
              {skillsSection.intro}
            </BlockReveal>
          ) : null}
        </div>

        {/* every tool, grouped visually by its category tag */}
        <ul className="sr-only">
          {entries.map((e) => (
            <li key={e.key}>
              {e.tool.name} — {e.skill.title}
            </li>
          ))}
        </ul>
        <div aria-hidden="true">
          {/* desktop: one column per category, every other column starts lower */}
          <div className={styles.grid} data-grid="desktop" style={{ '--cols': cats.length } as CSSProperties}>
            {byCategory.map((list, ci) => (
              <div key={cats[ci].id} className={styles.col} data-col-offset={ci % 2 === 1}>
                {head(cats[ci], ci)}
                {list.map(card)}
              </div>
            ))}
          </div>
          {/* phones: each category as its own block, two staggered columns of cards */}
          <div className={styles.stack} data-grid="mobile">
            {byCategory.map((list, ci) => (
              <div key={cats[ci].id} className={styles.block}>
                {head(cats[ci], ci)}
                <div className={styles.grid} style={{ '--cols': 2 } as CSSProperties}>
                  {columns(list, 2).map((col, k) => (
                    <div key={k} className={styles.col} data-col-offset={k === 1}>
                      {col.map(card)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Scene>
  );
}
