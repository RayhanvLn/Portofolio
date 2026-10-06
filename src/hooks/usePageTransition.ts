'use client';
import { createContext, useContext } from 'react';

export interface PageTransitionApi {
  /** Navigate with the curtain transition. `label` shows on the curtain. */
  navigate: (href: string, label?: string) => void;
  /** False while the curtain covers the page. Entrance animations wait for it. */
  ready: boolean;
  isTransitioning: boolean;
  /** Called by the preloader when the visitor presses Enter. */
  completeIntro: () => Promise<void>;
}

export const PageTransitionContext = createContext<PageTransitionApi | null>(null);

export function usePageTransition(): PageTransitionApi {
  const ctx = useContext(PageTransitionContext);
  if (!ctx) throw new Error('usePageTransition must be used inside <TransitionProvider>');
  return ctx;
}
