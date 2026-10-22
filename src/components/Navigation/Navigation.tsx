'use client';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/animation';
import { ease } from '@/animations/easings';
import { motionStore } from '@/lib/motionStore';
import { portfolio } from '@/data/portfolio';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { useFitText } from '@/hooks/useFitText';
import { mq } from '@/lib/responsive';
import { TransitionLink } from '@/components/PageTransition/TransitionLink';
import { usePageTransition } from '@/hooks/usePageTransition';
import { RollText } from '@/components/RollText/RollText';
import styles from './Navigation.module.css';

const isActive = (pathname: string, href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

/** Hand-drawn accent line marking the current page; draws itself when the menu opens. */
function Squiggle() {
  return (
    <svg className={styles.squiggle} viewBox="0 0 240 24" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path
        d="M2 14 C 30 14, 38 6, 62 6 S 96 18, 122 18 S 158 6, 182 7 S 220 14, 238 12"
        pathLength={1}
      />
    </svg>
  );
}

/**
 * Menu toggle (top-right) + full-screen menu.
 * The button adapts to the section beneath it (light button on dark sections,
 * dark button on light ones). Links rise in one by one, the current page gets
 * an accent line, and letters roll to the accent colour on hover.
 */
export function Navigation() {
  const pathname = usePathname();
  const { profile, navigation, socials } = portfolio;
  const { lock, unlock } = useSmoothScroll();
  const header = useRef<HTMLElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const toggleBtn = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  // A menu link was clicked: the menu stays open during the page transition (the orange logo grows
  // over the dark menu) and only closes once the new page is in.
  const [leaving, setLeaving] = useState(false);
  const leavingRef = useRef(false);
  const { isTransitioning } = usePageTransition();
  const list = useRef<HTMLUListElement>(null);
  // Phones and tablets: the longest label fills about three quarters of the width, never edge to edge.
  useFitText(list, { lines: '[data-fit-line]', query: mq.belowTablet, fill: 0.74 });
  const items = [{ label: 'Home', href: '/' }, ...navigation];

  const setMenu = useCallback(
    (next: boolean) => {
      if (next === openRef.current) return;
      openRef.current = next;
      if (next) lock();
      else unlock();
      setOpen(next);
    },
    [lock, unlock],
  );

  const stopLeaving = useCallback(() => {
    leavingRef.current = false;
    setLeaving(false);
  }, []);

  // Route change. Leaving through the menu: the new page is still under the transition screen —
  // hide the menu panel at once (so it never shows through the logo window); the menu itself
  // closes when the transition has finished (below). Otherwise: close as usual.
  useEffect(() => {
    if (leavingRef.current) {
      if (menu.current) gsap.set(menu.current, { visibility: 'hidden', clipPath: 'inset(0% 0% 100% 0%)' });
      return;
    }
    setMenu(false);
  }, [pathname, setMenu]);

  // The page transition has finished: now close the menu (the toggle turns back into the bars).
  useEffect(() => {
    if (isTransitioning || !leavingRef.current) return;
    stopLeaving();
    setMenu(false);
  }, [isTransitioning, setMenu, stopLeaving]);

  // Safety: the click did not start a transition (e.g. one was already running) — back to normal.
  useEffect(() => {
    if (!leaving) return;
    const id = window.setTimeout(() => {
      if (leavingRef.current && !isTransitioning) stopLeaving();
    }, 600);
    return () => window.clearTimeout(id);
  }, [leaving, isTransitioning, stopLeaving]);

  // While open: Escape closes, Tab stays inside (toggle + menu).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenu(false);
        toggleBtn.current?.focus();
        return;
      }
      if (e.key !== 'Tab' || !menu.current || !toggleBtn.current) return;
      const focusables = [toggleBtn.current, ...Array.from(menu.current.querySelectorAll<HTMLElement>('a[href], button'))];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setMenu]);

  // The toggle adopts the scene of the section directly beneath it.
  useEffect(() => {
    let navScene = '';
    let lastY = Number.NaN;
    let lastAt = 0;
    const tick = () => {
      const el = header.current;
      const btn = toggleBtn.current;
      if (!el || !btn) return;
      const now = performance.now();
      const y = motionStore.scroll.y;
      // Re-check while scrolling (≤ every 50ms) and every 400ms at rest (route changes, resizes).
      if (now - lastAt < (y === lastY ? 400 : 50)) return;
      lastAt = now;
      lastY = y;
      const r = btn.getBoundingClientRect();
      for (const node of document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2)) {
        if (el.contains(node) || menu.current?.contains(node)) continue;
        const scene = node.closest<HTMLElement>('[data-scene]')?.dataset.scene;
        if (!scene) continue;
        if (scene !== navScene) {
          navScene = scene;
          el.dataset.navScene = scene;
        }
        return;
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  // Open / close choreography.
  useGSAP(
    () => {
      const el = menu.current;
      if (!el) return;
      const rows = el.querySelectorAll('[data-menu-item]');
      const foot = el.querySelector('[data-menu-foot]');
      const reduced = prefersReducedMotion();
      if (open) {
        gsap
          .timeline()
          .set(el, { visibility: 'visible' })
          .fromTo(el, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: reduced ? 0 : 0.75, ease: ease.inOut })
          .fromTo(rows, { yPercent: 110 }, { yPercent: 0, duration: reduced ? 0 : 0.9, ease: ease.out, stagger: 0.07 }, reduced ? 0 : 0.32)
          .fromTo(foot, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: reduced ? 0 : 0.6, ease: ease.out }, reduced ? 0 : 0.6)
          .add(() => el.querySelector<HTMLElement>('a[href]')?.focus({ preventScroll: true }));
      } else if (el.style.visibility === 'visible') {
        gsap
          .timeline()
          .to(rows, { yPercent: -110, duration: reduced ? 0 : 0.4, ease: ease.in, stagger: 0.03 })
          .to(foot, { autoAlpha: 0, duration: reduced ? 0 : 0.25 }, 0)
          .to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: reduced ? 0 : 0.6, ease: ease.inOut }, reduced ? 0 : 0.18)
          .set(el, { visibility: 'hidden' });
      }
    },
    { dependencies: [open] },
  );

  return (
    <>
      <header ref={header} className={styles.header} data-open={open} data-nav-scene="dark">
        <button
          ref={toggleBtn}
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setMenu(!open)}
        >
          <span className={styles.bars} aria-hidden="true">
            <span className={styles.bar} />
            <span className={styles.bar} />
          </span>
        </button>
      </header>

      <div
        ref={menu}
        id="site-menu"
        className={styles.menu}
        data-transition-solid
        data-open={open}
        data-leaving={leaving}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={!open}
        inert={!open}
      >
        <nav className={styles.menuNav} aria-label="Main">
          <ul ref={list} className={styles.menuList}>
            {items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href} className={styles.menuRow}>
                  <span className={styles.menuRowInner} data-menu-item>
                    <TransitionLink
                      href={item.href}
                      className={styles.menuLink}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => {
                        // same page: just close; another page: keep the menu open through the transition
                        if (item.href === pathname) {
                          setMenu(false);
                          return;
                        }
                        leavingRef.current = true;
                        setLeaving(true);
                      }}
                    >
                      <span className="sr-only">{item.label}</span>
                      <span className={styles.menuLabel} data-fit-line>
                        <RollText text={item.label} />
                        {active ? <Squiggle /> : null}
                      </span>
                    </TransitionLink>
                  </span>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.menuFoot} data-menu-foot>
          <span className={styles.status}>
            <span className={styles.statusDot} aria-hidden="true" />
            {profile.availability}
          </span>
          <span className={styles.footLinks}>
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
            {socials.map((s) => (
              <a key={s.href} href={s.href} target="_blank" rel="noreferrer">
                {s.label}
              </a>
            ))}
          </span>
        </div>
      </div>
    </>
  );
}
