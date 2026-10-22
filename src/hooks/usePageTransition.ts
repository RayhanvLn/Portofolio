'use client';
import { createContext, useContext } from 'react';
import type { CoverOrigin } from '@/lib/pageTransitionEngine';

export interface PageTransitionApi {
  /**
   * Navigate with the page transition. `label` is announced to screen readers; `from` is where the
   * click happened (the orange logo grows from there).
   */
  navigate: (href: string, label?: string, from?: CoverOrigin) => void;
  /** False while the curtain covers the page. Entrance animations wait for it. */
  ready: boolean;
  isTransitioning: boolean;
  /**
   * How long (seconds) the entrance of the page that is being revealed should take, so it ends
   * together with the transition (e.g. the home hero finishes as the logo window fills the screen).
   */
  introDuration: number;
  /** Called by the preloader when the visitor presses Enter. */
  completeIntro: () => Promise<void>;
}

export const PageTransitionContext = createContext<PageTransitionApi | null>(null);

export function usePageTransition(): PageTransitionApi {
  const ctx = useContext(PageTransitionContext);
  if (!ctx) throw new Error('usePageTransition must be used inside <TransitionProvider>');
  return ctx;
}
