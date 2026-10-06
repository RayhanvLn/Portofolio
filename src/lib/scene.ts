import type { SceneTheme } from '@/types/portfolio';

/** Switch the global dark/light scene. CSS custom properties registered with
 *  @property interpolate, so background, type, nav and graphics move together. */
export function setScene(theme: SceneTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (root.dataset.scene !== theme) root.dataset.scene = theme;
}

/** Use the first scene on the page (called after each route change). */
export function syncSceneFromPage() {
  if (typeof document === 'undefined') return;
  const first = document.querySelector<HTMLElement>('main [data-scene]');
  setScene((first?.dataset.scene as SceneTheme) ?? 'dark');
}
