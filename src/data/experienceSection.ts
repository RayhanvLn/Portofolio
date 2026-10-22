/**
 * Experience section on the About page (component: src/components/Experience/).
 * The roles themselves are `experience` in src/data/portfolio.ts.
 * Per role you can add `tags: ['Next.js', 'Node.js', …]` (the tech pills on the card),
 * `image` (its photo) and `tone` (its accent colour).
 */
export const experienceSection = {
  /** Short line under the title. Set to '' to hide it. */
  intro: 'Where I have worked and what I built there.',
  /** Show each role's photo on the empty side of the timeline (desktop) / above the card (phones). */
  showPhotos: true,
  /** Word in front of the number on each card, e.g. "Role 01". Set to '' for the number only. */
  itemLabel: 'Role',
};
