'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { prefersReducedMotion, refreshScroll } from '@/lib/animation';
import { syncSceneFromPage } from '@/lib/scene';
import { portfolio } from '@/data/portfolio';
import { pageTransitionConfig as cfg } from '@/config/pageTransition';
import {
  awaitLoadLogo,
  coverPage,
  getParts,
  instantCover,
  pageContent,
  resetOverlay,
  revealPage,
  waitForVisibleImages,
} from '@/lib/pageTransitionEngine';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { PageTransitionContext, type PageTransitionApi } from '@/hooks/usePageTransition';
import { TransitionOverlay } from './TransitionOverlay';

const SESSION_KEY = 'pf:intro';

function labelForPath(path: string) {
  if (path === '/') return 'Home';
  if (path === '/projects') return 'Work';
  if (path.startsWith('/projects/')) {
    const slug = path.split('/')[2];
    return portfolio.projects.find((p) => p.slug === slug)?.title ?? 'Project';
  }
  return portfolio.navigation.find((n) => n.href === path)?.label ?? 'Page';
}

interface RevealArgs {
  hash?: string;
  withLogo?: boolean;
  shift?: boolean;
  holdMs?: number;
  focus?: boolean;
}

/**
 * Orchestrates the logo transition for every navigation:
 *   1. start (lock scroll, block double clicks)  2. close the old page
 *   3. route to the destination once covered     4. logo shown
 *   5. reveal the new page                       6. finish, unlock, move focus
 * Also handles the first-visit intro, Back/Forward, and a failsafe so the
 * overlay can never stay stuck on screen.
 */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { lock, unlock, scrollTo } = useSmoothScroll();

  const overlayRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLSpanElement>(null);
  const [ready, setReady] = useState(false);
  const [isTransitioning, setTransitioning] = useState(false);

  const busy = useRef(false);
  const introDone = useRef(false);
  const shown = useRef<Promise<unknown>>(Promise.resolve());
  const pending = useRef<{ hash: string; kind: 'push' | 'pop' } | null>(null);
  const pathRef = useRef(pathname);
  const watchdog = useRef<number | undefined>(undefined);

  const announce = (text: string) => {
    if (liveRef.current) liveRef.current.textContent = text;
  };

  const finish = useCallback(() => {
    window.clearTimeout(watchdog.current);
    busy.current = false;
    setTransitioning(false);
    unlock();
  }, [unlock]);

  /** 4–6: wait for the logo + first-screen images, hold, reveal. Always unlocks, even on error. */
  const reveal = useCallback(
    async ({ hash = '', withLogo = true, shift = true, holdMs = cfg.durations.logoHold, focus = true }: RevealArgs = {}) => {
      const overlay = overlayRef.current;
      const reduced = prefersReducedMotion();
      try {
        syncSceneFromPage();
        if (hash) scrollTo(hash, { immediate: true });
        refreshScroll();
        await Promise.all([shown.current, waitForVisibleImages(document.getElementById('main'), cfg.imageWaitMs)]);
        setReady(true);
        if (overlay) {
          await revealPage(getParts(overlay), pageContent(), {
            reduced,
            withLogo,
            shift,
            holdMs: reduced ? cfg.reducedMotion.hold : holdMs,
          });
        }
        if (focus) document.getElementById('main')?.focus({ preventScroll: true });
      } catch (err) {
        console.error('[PageTransition] reveal failed — removing overlay', err);
        if (overlay) resetOverlay(getParts(overlay), pageContent());
        setReady(true);
      } finally {
        finish();
      }
    },
    [finish, scrollTo],
  );

  // Page load: the logo is already animating with CSS. First visit of the session holds a little
  // longer; reloads and repeat visits use the shorter timing. The logo is always shown.
  useEffect(() => {
    if (cfg.intro !== 'logo') return; // the 'counter' preloader calls completeIntro() itself
    const id = window.setTimeout(() => {
      const overlay = overlayRef.current;
      if (!overlay || introDone.current) return;
      introDone.current = true;
      busy.current = true;
      const first = document.documentElement.dataset.preloaded !== 'true';
      if (first) {
        try {
          sessionStorage.setItem(SESSION_KEY, '1');
        } catch {
          /* private mode: the full intro simply plays again next time */
        }
      }
      shown.current = awaitLoadLogo(getParts(overlay));
      void reveal({ withLogo: true, holdMs: first ? cfg.introAnimation.hold : cfg.introAnimation.repeatHold, focus: false });
    }, 60);
    return () => window.clearTimeout(id);
  }, [reveal]);

  /** Used by the optional 'counter' preloader when the visitor presses Enter. */
  const completeIntro = useCallback(async () => {
    if (introDone.current) return;
    introDone.current = true;
    busy.current = true;
    if (overlayRef.current) shown.current = awaitLoadLogo(getParts(overlayRef.current));
    await reveal({ withLogo: true, holdMs: 0, focus: false });
  }, [reveal]);

  /** 1–3: cover, then route once the screen is fully covered. */
  const navigate = useCallback(
    async (href: string, label?: string) => {
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) {
        window.location.href = href;
        return;
      }
      if (url.pathname === pathRef.current) {
        scrollTo(url.hash || 0);
        return;
      }
      // One transition at a time: rapid or double clicks are ignored.
      if (busy.current || !introDone.current || !overlayRef.current) return;
      busy.current = true;
      setTransitioning(true);
      lock();
      announce(`Opening ${label ?? labelForPath(url.pathname)}`);
      router.prefetch(url.pathname);
      try {
        const run = coverPage(getParts(overlayRef.current), pageContent(), { reduced: prefersReducedMotion() });
        shown.current = run.shown;
        await run.covered;
        setReady(false);
        scrollTo(0, { immediate: true });
        pending.current = { hash: url.hash, kind: 'push' };
        // Failsafe: never leave the overlay up if the route does not arrive.
        watchdog.current = window.setTimeout(() => {
          if (!pending.current) return;
          pending.current = null;
          void reveal();
        }, cfg.navigationTimeoutMs);
        router.push(url.pathname + url.search, { scroll: false });
      } catch (err) {
        console.error('[PageTransition] navigation failed', err);
        if (overlayRef.current) resetOverlay(getParts(overlayRef.current), pageContent());
        pending.current = null;
        setReady(true);
        finish();
      }
    },
    [finish, lock, reveal, router, scrollTo],
  );

  // Browser Back/Forward: the page has already changed, so cover instantly and reveal.
  useEffect(() => {
    const onPop = () => {
      const overlay = overlayRef.current;
      if (!overlay || !introDone.current || busy.current) return;
      busy.current = true;
      setTransitioning(true);
      lock();
      setReady(false);
      shown.current = instantCover(getParts(overlay), pageContent(), { reduced: prefersReducedMotion() }).shown;
      pending.current = { hash: '', kind: 'pop' };
      const samePath = window.location.pathname === pathRef.current;
      watchdog.current = window.setTimeout(
        () => {
          if (!pending.current) return;
          pending.current = null;
          void reveal({ shift: false, focus: false });
        },
        samePath ? 250 : cfg.navigationTimeoutMs,
      );
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [lock, reveal]);

  // The new route has rendered: give React two frames to lay it out, then reveal.
  useEffect(() => {
    if (pathRef.current === pathname) return;
    pathRef.current = pathname;
    const job = pending.current;
    pending.current = null;
    if (job) {
      window.clearTimeout(watchdog.current);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => void reveal({ hash: job.hash, shift: job.kind === 'push', focus: job.kind === 'push' })),
      );
      return;
    }
    syncSceneFromPage();
    setReady(true);
    requestAnimationFrame(refreshScroll);
  }, [pathname, reveal]);

  // Entrance triggers are created when `ready` flips; refresh once they exist.
  useEffect(() => {
    if (!ready) return;
    const id = requestAnimationFrame(refreshScroll);
    return () => cancelAnimationFrame(id);
  }, [ready]);

  const api = useMemo<PageTransitionApi>(
    () => ({ navigate: (h, l) => void navigate(h, l), ready, isTransitioning, completeIntro }),
    [navigate, ready, isTransitioning, completeIntro],
  );

  return (
    <PageTransitionContext.Provider value={api}>
      {children}
      <TransitionOverlay overlayRef={overlayRef} />
      <span ref={liveRef} className="sr-only" aria-live="polite" />
    </PageTransitionContext.Provider>
  );
}
