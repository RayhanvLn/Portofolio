import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getNextProject, getProject, portfolio } from '@/data/portfolio';
import type { CSSProperties } from 'react';
import { pad, ratioOf } from '@/lib/utils';
import { descriptionLength, paragraphs, parseAccent, titleLength } from '@/lib/text';
import { caseLabels as L } from '@/lib/caseStudyLabels';
import { Scene } from '@/components/Scene/Scene';
import { TextReveal } from '@/components/TextReveal/TextReveal';
import { ImageReveal } from '@/components/ImageReveal/ImageReveal';
import { ProjectGallery } from '@/components/ProjectGallery/ProjectGallery';
import { TransitionLink } from '@/components/PageTransition/TransitionLink';
import { SmartImage } from '@/components/SmartImage/SmartImage';
import { Arrow } from '@/components/Icons/Arrow';
import { BlockReveal } from '@/components/BlockReveal/BlockReveal';
import styles from './page.module.css';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return portfolio.projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  return project ? { title: project.title, description: project.description } : {};
}

export default async function CaseStudyPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const index = portfolio.projects.indexOf(project);
  const next = getNextProject(slug);

  return (
    <article>
      <Scene theme="dark" className={`${styles.header} page-pad-top`} aria-labelledby="case-title">
        <BlockReveal as="p" className={styles.number} delay={0.1}>
          {pad(index + 1)} / {pad(portfolio.projects.length)}
        </BlockReveal>
        {/* size follows the title length (short / medium / long) */}
        <div className={styles.titleWrap} data-length={titleLength(project.title)}>
          <TextReveal as="h1" id="case-title" text={project.title} mode="chars" trigger="load" className={styles.title} />
        </div>
        <BlockReveal as="dl" className={styles.meta} delay={0.55}>
          <div>
            <dt>{L.category}</dt>
            <dd>{project.category}</dd>
          </div>
          <div>
            <dt>{L.year}</dt>
            <dd>{project.year}</dd>
          </div>
          <div>
            <dt>{L.role}</dt>
            <dd>{project.role}</dd>
          </div>
          <div>
            <dt>{L.tools}</dt>
            <dd>{project.tools.join(', ')}</dd>
          </div>
        </BlockReveal>
      </Scene>

      <div className={styles.cover}>
        {/* whole cover, in its own proportions (no parallax crop) */}
        <ImageReveal image={project.cover} sizes="100vw" fit="contain" trigger="load" delay={0.25} priority />
      </div>

      {/* Overview: heading left, description right — its size follows its length (short / medium / long) */}
      <Scene theme="light" className={styles.overview} aria-labelledby="overview-heading">
        <div className={styles.metaRow} aria-hidden="true">
          <BlockReveal as="span" className={styles.metaLabel}>
            <span className={styles.metaMark} />
            {L.overview}
          </BlockReveal>
          <BlockReveal as="span" delay={0.1}>
            {project.category}
          </BlockReveal>
        </div>
        <span className={styles.rule} aria-hidden="true" />
        <div className={styles.overviewGrid}>
          <BlockReveal as="h2" id="overview-heading" className={styles.overviewTitle}>
            {L.overviewTitle.map((line, li) => (
              <span key={li} className={styles.titleLine}>
                {parseAccent(line).map((seg, si) => (
                  <span key={si} className={seg.accent ? styles.accent : styles.plain}>
                    {seg.text}
                  </span>
                ))}
              </span>
            ))}
          </BlockReveal>
          <div className={styles.descWrap} data-length={descriptionLength(project.description)}>
            {paragraphs(project.description).map((para, i) => (
              <BlockReveal key={i} as="p" className={styles.desc} delay={0.1 + i * 0.08}>
                {para}
              </BlockReveal>
            ))}
            {project.liveUrl ? (
              <a className="btn btn--outline" href={project.liveUrl} target="_blank" rel="noreferrer">
                {L.visitLive} <Arrow />
              </a>
            ) : null}
          </div>
        </div>
      </Scene>

      {/* Gallery: the detail views as framed cards */}
      <Scene theme="dark" aria-label={L.gallery}>
        <ProjectGallery images={project.gallery} />
      </Scene>

      {next && next.slug !== project.slug ? (
        <Scene theme="dark" className={styles.next} aria-label="Next project">
          <TransitionLink href={`/projects/${next.slug}`} transitionLabel={next.title} className={styles.nextLink} data-cursor="open">
            <BlockReveal as="span" className={styles.nextLabel}>
              {L.nextProject}
            </BlockReveal>
            <BlockReveal as="span" className={styles.nextTitle} delay={0.1} data-length={titleLength(next.title)}>
              {next.title}
            </BlockReveal>
            <span className={styles.nextThumb} style={{ '--cover-ratio': ratioOf(next.cover) } as CSSProperties}>
              <SmartImage src={next.cover.src} alt="" sizes="(max-width: 899px) 90vw, 40vw" fit="contain" />
            </span>
            <span className={styles.nextArrow}>
              <Arrow />
            </span>
          </TransitionLink>
        </Scene>
      ) : null}
    </article>
  );
}
