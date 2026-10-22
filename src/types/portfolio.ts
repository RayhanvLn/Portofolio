/**
 * Content types. Every piece of personal content and every image path the
 * site renders is described here and filled in src/data/portfolio.ts.
 */

/** A single image. width/height are the RECOMMENDED source dimensions and
 *  define the aspect ratio the layout reserves (no layout shift). */
export interface ImageAsset {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface LinkItem {
  label: string;
  href: string;
}

export type SceneTheme = 'dark' | 'light';

export interface BrandLogo {
  /** Path in /public. Used by the home hero and the page transition. */
  src: string;
  /** Width ÷ height of the artwork (from its SVG viewBox). */
  aspectRatio: number;
  alt: string;
}

export interface Profile {
  name: string;
  /** Personal logo mark (optional: defaults to /assets/logo.svg — see src/lib/brand.ts). */
  logo?: BrandLogo;
  /** Short mark used in the navigation on small screens. */
  shortName: string;
  role: string;
  location: string;
  /** IANA zone used for the live clock on the contact page, e.g. "Europe/London". */
  timezone: string;
  email: string;
  availability: string;
  /** Portrait used by the About section. */
  portrait: ImageAsset;
  /** Transparent cut-out used as the hero subject (desktop). */
  heroImage: ImageAsset;
  /** Transparent cut-out used as the hero subject (mobile). */
  heroMobileImage: ImageAsset;
  /** Normal-background photos used only when hero.mode === 'backdrop'. */
  heroBackdrop: { desktop: ImageAsset; mobile: ImageAsset };
}

export interface HeroContent {
  /** Line 0 sits BEHIND the subject, line 1 sits IN FRONT of it. */
  titleLines: [string, string];
  /** 'cutout' = transparent subject between type layers. 'backdrop' = full-bleed photo. */
  mode: 'cutout' | 'backdrop';
  intro: string;
  cta: LinkItem;
  secondaryCta: LinkItem;
  showObject: boolean;
  scrollLabel: string;
}

export interface StatementContent {
  lines: string[];
  support: string;
}

export interface LifestyleItem {
  image: ImageAsset;
  caption: string;
  meta: string;
  /** Show in colour instead of the default grayscale treatment. */
  color?: boolean;
  /** Which part of the photo stays in view on the portrait card, e.g. '50% 30%'. Default: centre. */
  focus?: string;
}

export interface CollageContent {
  titleLines: string[];
  items: LifestyleItem[];
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  year: string;
  category: string;
  role: string;
  tools: string[];
  description: string;
  /** No longer shown on the case study page (kept optional so older data stays valid). */
  body?: string[];
  cover: ImageAsset;
  gallery: ImageAsset[];
  liveUrl?: string;
}

export interface ProjectsSectionContent {
  titleLines: string[];
  intro: string;
  transitionWord: string;
  allLabel: string;
}

export interface Discipline {
  words: string[];
  detail: string;
}

export interface Fact {
  label: string;
  value: string;
}

export interface AboutContent {
  disciplines: Discipline[];
  bio: string[];
  facts: Fact[];
  /** Supporting image(s) overlapping the portrait. The portrait itself is profile.portrait. */
  images: ImageAsset[];
  objects: ImageAsset[];
  cta: LinkItem;
}

export interface Skill {
  id: string;
  title: string;
  description: string;
  labels: string[];
  /** Optional: tools with their own logo file (e.g. '/images/skills/react.svg') and an optional
   *  photo shown on hover. Without it, `labels` are used with lettered badges. */
  tools?: Array<{ name: string; icon?: string; photo?: string }>;
}

export interface ExperienceItem {
  period: string;
  role: string;
  organisation: string;
  note: string;
  /** Photo for this role. Optional: without it, public/images/experience/experience-01.webp, -02… is used (in order). */
  image?: ImageAsset;
  /** Accent colour for this role (hex). Optional: a warm tone from the site palette is picked in order. */
  tone?: string;
  /** Tools / tech used in this role, shown as pills on the card, e.g. ['Next.js', 'Node.js', 'Prisma']. Optional. */
  tags?: string[];
}

export interface ContactContent {
  headingLines: string[];
  intro: string;
  footerCtaLines: string[];
}

/** Exposed to CSS as --svg-contour-1, --svg-contour-2 and --svg-arrow (see app/layout.tsx). */
export interface GraphicsContent {
  contours: [string, string];
  arrow: string;
}

export interface ModelContent {
  /** Set to true once public/models/hero-object.glb exists. */
  enabled: boolean;
  src: string;
  /** Load with the Draco decoder (recommended for compressed .glb). */
  draco: boolean;
}

export interface PortfolioData {
  seo: { title: string; description: string };
  profile: Profile;
  navigation: LinkItem[];
  preloader: { word: string; enterLabel: string };
  hero: HeroContent;
  statement: StatementContent;
  marquee: string[];
  collage: CollageContent;
  projectsSection: ProjectsSectionContent;
  projects: Project[];
  about: AboutContent;
  skills: Skill[];
  experience: ExperienceItem[];
  lifestyle: LifestyleItem[];
  socials: LinkItem[];
  contact: ContactContent;
  graphics: GraphicsContent;
  model: ModelContent;
}
