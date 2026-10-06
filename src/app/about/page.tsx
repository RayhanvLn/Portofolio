import type { Metadata } from 'next';
import { portfolio } from '@/data/portfolio';
import { AboutIntro } from '@/components/AboutIntro/AboutIntro';
import { About } from '@/components/About/About';
import { Skills } from '@/components/Skills/Skills';
import { Experience } from '@/components/Experience/Experience';
import { LifestyleStrip } from '@/components/LifestyleStrip/LifestyleStrip';

export const metadata: Metadata = { title: 'About' };

export default function AboutPage() {
  const p = portfolio;
  return (
    <>
      <AboutIntro name={p.profile.name} role={p.profile.role} lead={p.about.bio[0]} location={p.profile.location} />
      <About about={p.about} portrait={p.profile.portrait} variant="full" theme="light" headingId="about-detail-heading" />
      <Skills skills={p.skills} title={['My', 'Skills']} theme="light" />
      <Experience items={p.experience} title={['Experience']} theme="dark" />
      <LifestyleStrip items={p.lifestyle} title="Off screen" theme="light" />
    </>
  );
}
