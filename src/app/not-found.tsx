import { Scene } from '@/components/Scene/Scene';
import { TransitionLink } from '@/components/PageTransition/TransitionLink';
import { BlockReveal } from '@/components/BlockReveal/BlockReveal';

export default function NotFound() {
  return (
    <Scene theme="dark" className="page-pad-top" aria-labelledby="nf-heading">
      <div style={{ padding: '0 var(--gutter) 8rem', display: 'grid', gap: '2rem' }}>
        <BlockReveal
          as="h1"
          id="nf-heading"
          style={{
            fontWeight: 850,
            fontStretch: '125%',
            fontVariationSettings: "'wdth' 125",
            letterSpacing: '-0.05em',
            lineHeight: 0.82,
            fontSize: 'clamp(6rem, 26vw, 26rem)',
          }}
        >
          404
        </BlockReveal>
        <BlockReveal as="p" style={{ maxWidth: '36ch', fontSize: '1.15rem' }} delay={0.2}>
          This page does not exist. The work is still here.
        </BlockReveal>
        <TransitionLink href="/" className="btn btn--accent" style={{ justifySelf: 'start' }}>
          Back to the index
        </TransitionLink>
      </div>
    </Scene>
  );
}
