import { portfolio } from '@/data/portfolio';
import type { BrandLogo } from '@/types/portfolio';

/**
 * The personal logo used by the home hero and the page transition.
 * Comes from profile.logo in src/data/portfolio.ts; if that entry is missing,
 * falls back to /assets/logo.svg so the site keeps working.
 */
export const brandLogo: BrandLogo = portfolio.profile.logo ?? {
  src: '/assets/logo.svg',
  aspectRatio: 982.7 / 716.7,
  alt: `${portfolio.profile.name} logo`,
};
