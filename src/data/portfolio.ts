/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PORTFOLIO CONTENT — the only file you need to edit for content & images.
 * ─────────────────────────────────────────────────────────────────────────────
 *  • Every text string and every image path used by the site lives here.
 *  • To swap a photo: drop the file in /public and change ONE path in `images`.
 *  • width/height = recommended source size; they also set the aspect ratio
 *    the layout reserves, so keep them in the same ratio as your file.
 *  • Placeholder copy is written in CAPS ("YOUR NAME") or says "Replace…"
 *    so it is easy to find. Nothing here is a real achievement or client.
 *  See docs/IMAGE-MAP.md and docs/EDITING-GUIDE.md.
 */
import type { ImageAsset, LifestyleItem, PortfolioData} from '@/types/portfolio';

/* ── Image paths (centralised — change a photo here) ───────────────────── */
export const images = {
  heroCutoutDesktop: '/transparent/hero/hero-desktop.webp',
  heroCutoutMobile: '/transparent/hero/hero-mobile.webp',
  heroBackdropDesktop: '/images/hero/hero-desktop.webp',
  heroBackdropMobile: '/images/hero/hero-mobile.webp',
  about01: '/images/about/about-01.webp',
  about02: '/images/about/about-02.webp',
  object01: '/transparent/objects/object-01.webp',
  object02: '/transparent/objects/object-02.webp',
  object03: '/transparent/objects/object-03.webp',
  lifestyle01: '/images/lifestyle/lifestyle-01.webp',
  lifestyle02: '/images/lifestyle/lifestyle-02.webp',
  lifestyle03: '/images/lifestyle/lifestyle-03.webp',
  lifestyle04: '/images/lifestyle/lifestyle-04.webp',
  logo: '/assets/logo.svg',
  projectCover: (n: number) => `/images/projects/project-0${n}/cover.webp`,
  projectDetail: (n: number, d: number) => `/images/projects/project-0${n}/detail-0${d}.webp`,
} as const;

const img = (src: string, alt: string, width: number, height: number): ImageAsset => ({ src, alt, width, height });

const lifestyle: LifestyleItem[] = [
  { image: img(images.lifestyle01, 'Lifestyle photo 1', 2400, 1600), caption: 'Hi-Res', meta: 'Cafe, 2026', color: true },
  { image: img(images.lifestyle02, 'Lifestyle photo 2', 2400, 1600), caption: 'Cafe', meta: 'Taka House, 2026', color: true },
  { image: img(images.lifestyle03, 'Lifestyle photo 3', 2400, 1600), caption: 'Hermes', meta: 'Dufan, 2026', color: true },
  { image: img(images.lifestyle04, 'Lifestyle photo 4', 2400, 1600), caption: 'Coffee', meta: 'Taka House, 2026', color: true },
];

/* ── Everything else ───────────────────────────────────────────────────── */
export const portfolio: PortfolioData = {
  seo: {
    title: 'RAYHAN FAKHRI RISQULLAH — Creative Developer',
    description: 'Portfolio of RAYHAN FAKHRI RISQULLAH, creative developer. Replace this description in src/data/portfolio.ts.',
  },

  profile: {
    name: 'RAYHAN FAKHRI RISQULLAH',
    logo: { src: images.logo, aspectRatio: 982.7 / 716.7, alt: 'Logo Rayhan' },
    shortName: 'RFR',
    role: 'Computer Science',
    location: 'JAKARTA, INDONESIA',
    timezone: 'UTC',
    email: 'rayhanfakhri01@gmail.com',
    availability: 'Available for work',
    portrait: img(images.about01, 'Portrait of YOUR NAME', 2400, 3000),
    heroImage: img(images.heroCutoutDesktop, 'YOUR NAME', 3000, 4000),
    heroMobileImage: img(images.heroCutoutMobile, 'YOUR NAME', 1800, 2400),
    heroBackdrop: {
      desktop: img(images.heroBackdropDesktop, 'YOUR NAME', 2560, 1440),
      mobile: img(images.heroBackdropMobile, 'YOUR NAME', 1080, 1920),
    },
  },

  navigation: [
    { label: 'Projects', href: '/projects' },
    { label: 'About Me', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],

  preloader: { word: 'Portfolio', enterLabel: 'Enter' },

  hero: {
    titleLines: ['RAYHAN', 'FAKHRI'],
    mode: 'cutout',
    intro: '',
    cta: { label: 'My Projects', href: '#work' },
    secondaryCta: { label: 'Get in touch', href: '/contact' },
    showObject: false,
    scrollLabel: 'Scroll to explore',
  },

  statement: {
    lines: ['I build digital experiences', 'that turn ideas into', 'impactful visuals'],
    support:
      '',
  },

  marquee: ['Web Development', 'Graphic Design', 'Software Engineering', 'Photography', 'Full Stack Development'],

  collage: {
    titleLines: ['Off', 'screen'],
    items: lifestyle,
  },

  projectsSection: {
    titleLines: ['SCROLL','OR', 'SWIPE'],
    intro: '',
    transitionWord: 'MY PROJECTS',
    allLabel: 'See all projects',
  },

    projects: [
    // ── Project 1 ─────────────────────────────────────────────
    {
      id: '01',
      slug: 'project-01', // URL: /projects/project-01
      title: 'Car Rental Website',
      year: '2026',
      category: 'Web Development',
      role: 'Full-stack Web Developer',
      tools: ['PHP ', 'MySQL', 'Tailwind CSS', 'JavaScript'],
      description: 'Developed end-to-end in August 2026, Raun Raun Transport is a web-based car rental reservation and management platform designed to digitalize vehicle rental operations through a dynamic showcase catalog featuring diverse vehicle fleets—including the Toyota Alphard, Innova Zenix, Hyundai Stargazer, and Mitsubishi Xpander—integrated with direct WhatsApp booking workflows and a secure, centralized admin dashboard offering full authentication, inventory CRUD capabilities, and profile settings management. Built utilizing a custom HTML, CSS, and JavaScript frontend powered by a native PHP backend and .htaccess server configuration, the project spanned the entire development lifecycle, encompassing full frontend architecture, backend business logic implementation, and custom visual branding design..',
      body: [
        'Paragraph about the brief: who it was for and what problem needed solving.',
        'Paragraph about your approach and the key decisions.',
      ],
      cover: img(images.projectCover(1), 'Cover image for Project 1', 2560, 1440),
      gallery: [
        img(images.projectDetail(1, 1), 'Detail view 1', 2400, 1600),
        img(images.projectDetail(1, 2), 'Detail view 2', 2400, 1600),
      ],
      // liveUrl: 'https://example.com', // optional: adds a "Visit live site" button
    },
    // ── Project 2 ─────────────────────────────────────────────
    {
      id: '02',
      slug: 'project-02',
      title: 'Cleaning Supplies Inventory Database',
      year: '2026',
      category: 'Web Development',
      role: 'Full-stack Web Developer',
      tools: ['PHP', 'MySQL', 'Tailwind CSS', 'JavaScript', 'Google Apps Script'],
      description: 'A real-time inventory monitoring dashboard connected to Google Sheets with add, edit, delete, validation, search, filters, pagination, automatic synchronization, summary cards, interactive charts, database tables, and CSV export.',
      body: [
        'Paragraph about the brief: who it was for and what problem needed solving.',
        'Paragraph about your approach and the key decisions.',
      ],
      cover: img(images.projectCover(2), 'Cover image for Project 2', 2560, 1440),
      gallery: [
        img(images.projectDetail(2, 1), 'Detail view 1', 2400, 1600),
        img(images.projectDetail(2, 2), 'Detail view 2', 2400, 1600),
      ],
    },
    // ── Project 3 ─────────────────────────────────────────────
    {
      id: '03',
      slug: 'project-03',
      title: 'Operational Spending Dashboard',
      year: '2026',
      category: 'Web Development',
      role: 'Full-stack Web Developer',
      tools: ['PHP', 'MySQL', 'Tailwind CSS', 'JavaScript', 'Google Apps Script'],
      description: 'A web-based operational spending dashboard integrated with Google Sheets, featuring structured data entry, validation, search and filters, XLSX import, summary cards, interactive charts, transaction tables, and an operational activity calendar.',
      body: [
        'Paragraph about the brief: who it was for and what problem needed solving.',
        'Paragraph about your approach and the key decisions.',
      ],
      cover: img(images.projectCover(3), 'Cover image for Project 3', 2560, 1440),
      gallery: [
        img(images.projectDetail(3, 1), 'Detail view 1', 2400, 1600),
        img(images.projectDetail(3, 2), 'Detail view 2', 2400, 1600),
      ],
    },
    // ── Project 4 ─────────────────────────────────────────────
    {
      id: '04',
      slug: 'project-04',
      title: 'Coming Soon',
      year: '20XX',
      category: 'Coming Soon',
      role: 'Your role on this project',
      tools: ['Tool one', 'Tool two', 'Tool three'],
      description: 'Coming soon...',
      body: [
        'Paragraph about the brief: who it was for and what problem needed solving.',
        'Paragraph about your approach and the key decisions.',
      ],
      cover: img(images.projectCover(4), 'Cover image for Project 4', 2560, 1440),
      gallery: [
        img(images.projectDetail(4, 1), 'Detail view 1', 2400, 1600),
        img(images.projectDetail(4, 2), 'Detail view 2', 2400, 1600),
      ],
    },
  ],

  about: {
    disciplines: [
      { words: ['Full-stack', 'Web Development'], detail: '' },
      { words: ['Graphic', 'Designer'], detail: '' },
      { words: ['Software', 'Engineer'], detail: '' },
    ],
    bio: [
      'As an Informatics undergraduate at Universitas Nasional and former intern at BPKP, I specialize in web development and graphic design. I build modern, responsive web applications while crafting distinct visual assets that capture attention.',
      'Fueled by a passion for photography and visual composition, I am currently exploring new ways to refine user experiences through thoughtful design layouts and creative media.',
    ],
    facts: [
      { label: 'Based in', value: 'JAKARTA, INDONESIA' },
      { label: 'Focus', value: 'Full-stack Web Development' },
      { label: 'Currently', value: 'Available for work' },
      { label: 'Languages', value: 'English, Indonesian, Japanese' },
    ],
    // Supporting image(s). The main portrait is profile.portrait.
    images: [img(images.about02, 'Second portrait of YOUR NAME', 2400, 3000)],
    objects: [
      img(images.object01, '', 2000, 2000),
      img(images.object02, '', 2000, 2000),
      img(images.object03, '', 2000, 2000),
    ],
    cta: { label: 'More about me', href: '/about' },
  },

  skills: [
    { id: '01', title: 'FULL-STACK WEB DEVELOPMENT', description: 'Building end-to-end web applications, combining responsive user interfaces with structured relational databases and clean application logic.', labels: ['React', 'Next.js', 'TypeScript', 'PHP', 'MySQL'] },
    { id: '02', title: 'SOFTWARE ENGINEERING', description: 'Applying software architecture principles, writing maintainable code, and developing automated scripts to streamline data workflows and system processes.', labels: ['Python', 'Git', 'Google Apps Script'] },
    { id: '03', title: 'UI/UX & VISUAL DESIGN', description: 'Designing intuitive user interfaces and experiences, with a focus on visual communication and brand consistency.', labels: ['Figma', 'Adobe Photoshop', 'Adobe Illustrator', 'Canva','Capcut','Affinity Designer','Adobe After Effects'] },
    { id: '04', title: 'PROFESSIONAL & SOFT SKILLS', description: 'Communicating effectively with stakeholders, managing projects, and fostering a collaborative work environment.', labels: ['Communication', 'Leadership', 'Time Management','Teamwork','Problem Solving','Adaptive Learning'] },
  ],

  experience: [
    { period: 'SEP 2025 — NOW', role: 'Head of Science & Technology Division (IPTEK)', organisation: 'HIMTI', note: 'Leading division members and task allocation' },
    { period: 'JUN 2026 — AUG 2026', role: 'IT Asset Data Analyst', organisation: 'BPKP', note: 'Developed a centralized inventory monitoring dashboard for the Household Affairs sub-division at BPKP to optimize office asset tracking and equipment management.' },
    { period: 'MAY 2024 — SEP 2025', role: 'Science & Technology Division Member (IPTEK)', organisation: 'HIMTI', note: 'Contributed to the IPTEK division with involvement in technology-focused student activities and the creative media subdivision' },
  ],

  lifestyle,

  socials: [
    { label: 'GitHub', href: 'https://github.com/RayhanvLn' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/rayhan-fakhri-risqullah-43475a327/?isSelfProfile=true' },
    { label: 'Instagram', href: 'https://www.instagram.com/wntrhan/' },
  ],

  contact: {
    headingLines: ['Let’s build', 'something', 'together'],
    intro: 'Tell me about your project, timeline and budget. I reply within a few days.',
    footerCtaLines: ['Let’s', 'talk'],
  },

  graphics: {
    contours: ['/svg/contour-01.svg', '/svg/contour-02.svg'],
    arrow: '/svg/arrow.svg',
  },

  model: {
    enabled: false,
    src: '/models/hero-object.glb',
    draco: true,
  },
};

export const getProject = (slug: string) => portfolio.projects.find((p) => p.slug === slug);

export const getNextProject = (slug: string) => {
  const i = portfolio.projects.findIndex((p) => p.slug === slug);
  return portfolio.projects[(i + 1) % portfolio.projects.length];
};
