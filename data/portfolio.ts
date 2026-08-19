export type Project = {
  index: string;
  title: string;
  role: string;
  context: string;
  period: string;
  year: string;
  image: string;
  imageAlt?: string;
  gallery: string[];
  tags: string[];
  description: string;
  size: "large" | "small";
  placeholder?: boolean;
};

export const projects: Project[] = [
  {
    index: "01",
    title: "Operational Spending Dashboard",
    role: "Full-Stack Web Developer",
    context: "Internship Project",
    period: "Jun - Aug 2026",
    year: "2026",
    image: "/projects/dashboard-belanja-main.png",
    imageAlt: "/projects/dashboard-belanja-input.png",
    gallery: [
      "/projects/dashboard-belanja-main.png",
      "/projects/dashboard-belanja-calendar.png",
      "/projects/dashboard-belanja-table.png",
      "/projects/dashboard-belanja-highlights.png",
      "/projects/dashboard-belanja-input.png",
      "/projects/dashboard-belanja-import.png",
    ],
    tags: ["JavaScript", "Google Apps Script", "Google Sheets", "XLSX"],
    description:
      "A web-based operational spending dashboard integrated with Google Sheets, featuring structured data entry, validation, search and filters, XLSX import, summary cards, interactive charts, transaction tables, and an operational activity calendar.",
    size: "large" as const,
  },
  {
    index: "02",
    title: "Cleaning Supplies Inventory Database",
    role: "Full-Stack Web Developer",
    context: "Internship Project",
    period: "Jul - Aug 2026",
    year: "2026",
    image: "/projects/monitoring-persediaan-main.png",
    imageAlt: "/projects/monitoring-persediaan-database.png",
    gallery: [
      "/projects/monitoring-persediaan-main.png",
      "/projects/monitoring-persediaan-database.png",
    ],
    tags: ["JavaScript", "Google Apps Script", "Google Sheets", "CSV"],
    description:
      "A real-time inventory monitoring dashboard connected to Google Sheets with add, edit, delete, validation, search, filters, pagination, automatic synchronization, summary cards, interactive charts, database tables, and CSV export.",
    size: "large" as const,
  },
  {
    index: "03",
    title: "Tuner & Repair Car Shop",
    role: "Full-Stack Web Developer",
    context: "Academic Project",
    period: "Mar 2024 - May 2025",
    year: "2025",
    image: "/projects/tuner-repair-dummy.svg",
    gallery: ["/projects/tuner-repair-dummy.svg"],
    tags: ["Full-Stack", "JavaScript", "Responsive UI"],
    description:
      "An academic full-stack car repair web application that presents repair and tuning service packages in a structured interface, implements dynamic JavaScript interactions, and adapts across desktop and mobile layouts.",
    size: "small" as const,
    placeholder: true,
  },
  {
    index: "04",
    title: "Database Management Project",
    role: "Database Administrator",
    context: "Academic Project",
    period: "Feb - Jun 2024",
    year: "2024",
    image: "/projects/mysql-database-dummy.svg",
    gallery: ["/projects/mysql-database-dummy.svg"],
    tags: ["MySQL", "SQL", "Relational Design", "CRUD"],
    description:
      "An academic MySQL database project covering schema design, table relationships, structured insert/update/delete operations, and SQL queries for data processing and retrieval.",
    size: "small" as const,
    placeholder: true,
  },
];

export const services = [
  {
    no: "01",
    title: "Web Development",
    text: "Building responsive web interfaces and application flows with a focus on clear structure, usability, and maintainable front-end logic.",
    bullets: ["HTML5 / CSS3", "JavaScript", "Node.js", "Responsive interfaces"],
  },
  {
    no: "02",
    title: "Data & Database",
    text: "Structuring relational data, managing records, and writing queries that turn raw information into usable application data.",
    bullets: ["MySQL", "SQL queries", "CRUD operations", "Microsoft Excel"],
  },
  {
    no: "03",
    title: "Dashboard & Automation",
    text: "Designing operational dashboards that connect user-facing workflows with spreadsheet-based data sources and lightweight automation.",
    bullets: ["Google Sheets", "Google Apps Script", "XLSX / CSV workflows", "Validation & filtering"],
  },
  {
    no: "04",
    title: "UI & Visual Tools",
    text: "Supporting development with interface design, visual communication, prototyping, and content production tools.",
    bullets: ["Figma", "Adobe Illustrator", "Adobe Photoshop", "CapCut"],
  },
];

export const journey = [
  {
    no: "01",
    type: "Organization",
    title: "Head of Science & Technology Division (IPTEK)",
    organization: "HIMTI - Universitas Nasional",
    period: "Sep 2025 - Present",
    description:
      "Leading division members and task allocation, initiating technology-based competency activities, contributing to workshop theme planning, and serving as a Steering Committee member for IT workshops.",
  },
  {
    no: "02",
    type: "Organization",
    title: "Science & Technology Division Member (IPTEK)",
    organization: "HIMTI - Universitas Nasional · Creative Media Subdivision",
    period: "May 2024 - Sep 2025",
    description:
      "Contributed to the IPTEK division with involvement in technology-focused student activities and the Creative Media subdivision.",
  },
  {
    no: "03",
    type: "Education",
    title: "Informatics Engineering",
    organization: "Universitas Nasional, Jakarta",
    period: "Sep 2023 - Present",
    description:
      "Undergraduate Informatics Engineering student with a 3.9/4.00 GPA, with a strong interest in data, database systems, and web development.",
  },
  {
    no: "04",
    type: "Education",
    title: "Social Sciences",
    organization: "SMA PGRI 4 Jakarta",
    period: "Jul 2020 - Jul 2023",
    description:
      "Completed senior high school studies before continuing into Informatics Engineering at Universitas Nasional.",
  },
];
