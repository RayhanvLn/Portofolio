import { caseStudyLabels } from '@/data/caseStudy';

/** Built-in labels for the case study pages. */
const defaults = {
  category: 'Category',
  year: 'Year',
  role: 'Role',
  tools: 'Tools',
  visitLive: 'Visit live site',
  nextProject: 'Next project',
  overview: 'Overview',
  overviewTitle: ['About the', '*project*'],
  gallery: 'Gallery',
  view: 'view',
  views: 'views',
  openImage: 'View full size',
  close: 'Close',
  previous: 'Previous',
  next: 'Next',
};

/**
 * Labels used on the case study pages: your values from src/data/caseStudy.ts,
 * with the built-in defaults for anything that file does not define.
 */
export const caseLabels: typeof defaults = { ...defaults, ...(caseStudyLabels as Partial<typeof defaults>) };
