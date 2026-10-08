/**
 * "Off screen" section on the About page (component: src/components/LifestyleStrip/).
 * The photos themselves are `lifestyle` in src/data/portfolio.ts — each one is a card.
 * Cards are portrait (2:3); `focus` on a photo (e.g. '50% 30%') picks which part stays in view.
 */
export const offScreen = {
  /** Title, one entry per line. Words between *stars* get the narrow orange accent style. */
  titleLines: ['Off', '*screen*'],
  /** Small tilted tag that pops onto the title. Set to '' to hide it. */
  sticker: 'after hours',
};
