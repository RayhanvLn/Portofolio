'use client';
import type { CSSProperties } from 'react';
import type { Project } from '@/types/portfolio';
import { cn, pad, ratioOf } from '@/lib/utils';
import { TransitionLink } from '@/components/PageTransition/TransitionLink';
import { SmartImage } from '@/components/SmartImage/SmartImage';
import { Arrow } from '@/components/Icons/Arrow';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
  project: Project;
  index: number;
  total: number;
  className?: string;
  sizes?: string;
}

/** Muted by default; on hover the image brightens to full colour, an accent rule
 *  draws under it and the description slides in. Click → case study.
 *  The frame takes the cover's own proportions (cover.width / cover.height), and the
 *  image is never cropped. */
export function ProjectCard({ project, index, total, className, sizes = '(max-width: 899px) 85vw, 50vw' }: ProjectCardProps) {
  return (
    <article className={cn(styles.card, className)} data-card style={{ '--cover-ratio': ratioOf(project.cover) } as CSSProperties}>
      <TransitionLink
        href={`/projects/${project.slug}`}
        transitionLabel={project.title}
        className={styles.link}
        data-cursor="project"
        aria-label={`${project.title}, ${project.category}, ${project.year}. Open case study`}
      >
        <span className={styles.media} data-card-media>
          <span className={styles.mediaInner}>
            <SmartImage src={project.cover.src} alt={project.cover.alt} sizes={sizes} className={styles.image} fit="contain" />
          </span>
          <span className={styles.accent} aria-hidden="true" />
        </span>
        <span className={styles.meta}>
          <span className={styles.index}>
            {pad(index + 1)} / {pad(total)}
          </span>
          <span className={styles.title}>{project.title}</span>
          <span className={styles.year}>{project.year}</span>
          <span className={styles.details}>
            <span className={styles.category}>{project.category}</span>
            <span className={styles.desc}>{project.description}</span>
            <span className={styles.open}>
              Open case study <Arrow />
            </span>
          </span>
        </span>
      </TransitionLink>
    </article>
  );
}
