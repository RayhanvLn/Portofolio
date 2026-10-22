/**
 * "Skills" section (component: src/components/Skills/). The tools themselves are `skills` in
 * src/data/portfolio.ts: every entry is a category (`title`), its `labels` are the tools, and
 * `description` is shown when you hover a tool. Section title: the `title` prop in
 * src/app/page.tsx and src/app/about/page.tsx (the last line gets the orange accent style).
 */
export const skillsSection = {
  /** Short paragraph beside the title. Set to '' to hide it. */
  intro: 'From the first sketch to the deployed site — the languages, frameworks and tools I reach for every day.',
  /** Not shown any more (kept so older edits keep working). */
  eyebrow: 'Tech stack & tools',
  /** Not shown any more (kept so older edits keep working). */
  itemWord: ['tool', 'tools'] as [string, string],
};
