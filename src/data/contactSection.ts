/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  CLOSING SECTION (footer on every page) — content
 * ─────────────────────────────────────────────────────────────────────────────
 *  Separate from portfolio.ts so this section can be edited on its own.
 */
import type { ImageAsset } from '@/types/portfolio';
import { portfolio } from './portfolio';

export const contactSection = {
  /** Headline, one entry per line. Wrap words in *asterisks* to set them in the accent style. */
  headline: ['Always *experimenting*', 'with cool *things*.'],

  cta: {
    label: 'Contact me',
    email: 'rayhanfakhri01@gmail.com',
    /** Pre-filled subject of the message. */
    subject: 'Hello Rayhan',
    /**
     * 'mailto' — opens the visitor's own mail app (works for everyone).
     * 'gmail'  — opens Gmail's compose window in the browser (visitor must use Gmail).
     */
    mode: 'mailto' as 'mailto' | 'gmail',
  },

  /** Portrait (transparent cut-out). For now the same photo as the home hero — replace with your own ImageAsset. */
     portrait: { src: '/images/contact/portrait.webp', alt: 'Rayhan Fakhri Risqullah', width: 1800, height: 2400 },

  labels: { pages: 'Pages', follow: 'Follow on', backToTop: 'Back to top' },

  /** Running line of words behind the portrait (uses portfolio.marquee). */
  showMarquee: true,
};
