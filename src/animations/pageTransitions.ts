/**
 * Page transitions are implemented in src/lib/pageTransitionEngine.ts
 * (Web Animations API, framework-free) and configured in
 * src/config/pageTransition.ts. Re-exported here so all animation
 * entry points stay discoverable from src/animations/.
 */
export {
  coverPage,
  revealPage,
  introLogo,
  instantCover,
  resetOverlay,
  waitForVisibleImages,
} from '@/lib/pageTransitionEngine';
