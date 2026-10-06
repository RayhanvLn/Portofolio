/**
 * ACADEMIC CAREER (home page, under the statement) — content.
 * Separate from portfolio.ts so it can be edited on its own.
 */
import type { ImageAsset } from '@/types/portfolio';

export interface AcademicStat {
  label: string;
  /** A number counts up when it scrolls into view (e.g. 3.89 or 7)… */
  value?: number;
  /** …shown with this many decimals; decimals appear small, top-right (3 + .89). */
  decimals?: number;
  /** …or words instead of a number, one entry per line. */
  text?: string[];
  /** Draw the hand-drawn accent circle around this value. */
  highlight?: boolean;
}

export const academic = {
  /** Title, one entry per line. Wrap words in *asterisks* for the accent style (narrow, light, orange). */
  titleLines: ['Academic career', '*since 2023*'],

  /** Photo next to the title (portrait 4:5 recommended, e.g. 1600 × 2000 px). */
  image: {
    src: '/images/academic/academic.webp',
    alt: 'Academic life',
    width: 1600,
    height: 2000,
  } as ImageAsset,

  stats: [
    { label: 'Cumulative GPA', value: 3.89, decimals: 2 },
    { label: 'Study program', text: ['Informatics'] },
    { label: 'Favourite course', text: ['Web', 'Development'] },
    { label: 'Current semester', value: 7, decimals: 0 },
  ] as AcademicStat[],
};
