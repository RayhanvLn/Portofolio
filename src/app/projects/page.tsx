import type { Metadata } from 'next';
import { portfolio } from '@/data/portfolio';
import { workPage } from '@/data/workPage';
import { Scene } from '@/components/Scene/Scene';
import { WorkIntro } from '@/components/WorkIntro/WorkIntro';
import { ProjectList } from '@/components/ProjectList/ProjectList';
import styles from './page.module.css';

export const metadata: Metadata = { title: 'Work' };

export default function ProjectsPage() {
  const { projects } = portfolio;
  return (
    <>
      {/* Light header — content in src/data/workPage.ts */}
      <WorkIntro label={workPage.label} titleLines={workPage.titleLines} intro={workPage.intro} count={projects.length} />
      {/* Dark card with the project index, sliding over the header */}
      <Scene theme="dark" className={styles.list} aria-label="Projects">
        <ProjectList projects={projects} />
      </Scene>
    </>
  );
}
