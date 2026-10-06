import { portfolio } from '@/data/portfolio';
import { Hero } from '@/components/Hero/Hero';
import { Statement } from '@/components/Statement/Statement';
import { VelocityMarquee } from '@/components/VelocityMarquee/VelocityMarquee';
import { AcademicCareer } from '@/components/AcademicCareer/AcademicCareer';import { SectionTransition } from '@/components/SectionTransition/SectionTransition';
import { HorizontalScroll } from '@/components/HorizontalScroll/HorizontalScroll';
import { About } from '@/components/About/About';
import { Skills } from '@/components/Skills/Skills';

export default function HomePage() {
  const p = portfolio;
  return (
    <>
      {/* 01 — dark */}
      <Hero profile={p.profile} hero={p.hero} model={p.model} />
      {/* 02 — light */}
      <Statement statement={p.statement} />
      <VelocityMarquee items={p.marquee} />
      {/* 03 — light */}
      <AcademicCareer />
      {/* light → dark wipe */}
      <SectionTransition text={p.projectsSection.transitionWord} from="light" to="dark" />
      {/* 04 — dark, pinned horizontal */}
      <HorizontalScroll section={p.projectsSection} projects={p.projects} />
      {/* 05 — light */}
      <About about={p.about} portrait={p.profile.portrait} variant="teaser" theme="light" />
      <Skills skills={p.skills} title={['My', 'Skills']} theme="light" />
      {/* 06 — dark footer lives in the layout */}
    </>
  );
}
