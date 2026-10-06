'use client';
import { Fragment, useRef, type CSSProperties } from 'react';
import { gsap, useGSAP } from '@/lib/animation';
import { mq } from '@/lib/responsive';
import { portfolio } from '@/data/portfolio';
import { contactSection } from '@/data/contactSection';
import { brandLogo } from '@/lib/brand';
import { accentWords, splitHang } from '@/lib/text';
import { usePageTransition } from '@/hooks/usePageTransition';
import { Scene } from '@/components/Scene/Scene';
import { SmartImage } from '@/components/SmartImage/SmartImage';
import { Magnetic } from '@/components/Magnetic/Magnetic';
import { TransitionLink } from '@/components/PageTransition/TransitionLink';
import { BlockReveal } from '@/components/BlockReveal/BlockReveal';
import { RollText } from '@/components/RollText/RollText';
import { Arrow } from '@/components/Icons/Arrow';
import { BackToTop } from './BackToTop';
import styles from './Footer.module.css';

const CLIP_HIDDEN = 'polygon(0% 100%, 0% 100%, 0% 100%)';
const CLIP_FULL = 'polygon(0% 100%, 0% -120%, 220% 100%)';

function contactHref({ email, subject, mode }: typeof contactSection.cta) {
  const su = encodeURIComponent(subject);
  return mode === 'gmail'
    ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${su}`
    : `mailto:${email}?subject=${su}`;
}

/**
 * Closing section on every page: a dark stage inside an accent frame, the
 * headline with the logo stamped over it, the portrait rising from the bottom,
 * page links left, social links right, and the "Contact me" button.
 * The stage settles into place as you scroll to it.
 */
export function FooterShowcase({ year }: { year: number }) {
  const root = useRef<HTMLDivElement>(null);
  const { ready } = usePageTransition();
  const { profile, navigation, socials, marquee } = portfolio;
  const { headline, cta, portrait, labels, showMarquee } = contactSection;
  const pages = [{ label: 'Home', href: '/' }, ...navigation];
  const plainHeadline = headline.map((l) => l.replace(/\*/g, '')).join(' ');

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(mq.motionOK, () => {
        const stage = el.querySelector('[data-stage]');
        const words = el.querySelectorAll('[data-word]');
        const logo = el.querySelector('[data-logo]');
        const person = el.querySelector('[data-portrait]');
        const button = el.querySelector('[data-cta]');

        // The stage rises and settles while the section scrolls into view.
        gsap.fromTo(
          stage,
          { yPercent: 7, scale: 0.94 },
          { yPercent: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top top', scrub: true } },
        );

        if (!ready) {
          gsap.set(words, { yPercent: 115 });
          gsap.set(logo, { clipPath: CLIP_HIDDEN });
          gsap.set([person, button], { autoAlpha: 0 });
          return;
        }
        gsap
          .timeline({ scrollTrigger: { trigger: el, start: 'top 55%', once: true } })
          .fromTo(person, { autoAlpha: 0, y: 90 }, { autoAlpha: 1, y: 0, duration: 1.5, ease: 'expo.out' }, 0)
          .fromTo(words, { yPercent: 115 }, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.06 }, 0.1)
          .fromTo(logo, { clipPath: CLIP_HIDDEN, scale: 0.9 }, { clipPath: CLIP_FULL, scale: 1, duration: 0.9, ease: 'power3.out' }, 0.5)
          .fromTo(button, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out' }, 0.65);
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [ready], revertOnUpdate: true },
  );

  return (
    <Scene theme="dark" as="footer" className={styles.footer} aria-labelledby="footer-heading">
      <div ref={root}>
        <div className={styles.stage} data-stage>
          {/* Shape: body + top tab + bottom tab, on the accent frame */}
          <span className={styles.body} aria-hidden="true" />
          <span className={styles.tabTop} aria-hidden="true" />
          <span className={styles.tabBottom} aria-hidden="true" />

          {showMarquee ? (
            <div className={styles.marquee} aria-hidden="true">
              <div className={styles.marqueeTrack}>
                {[0, 1].map((copy) => (
                  <span key={copy} className={styles.marqueeGroup}>
                    {marquee.map((item) => (
                      <span key={item} className={styles.marqueeItem}>
                        {item}
                      </span>
                    ))}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className={styles.portrait} data-portrait>
            <span className={styles.portraitFrame}>
              <SmartImage src={portrait.src} alt={portrait.alt} sizes="(max-width: 899px) 86vw, 42vw" fit="contain" objectPosition="50% 100%" />
            </span>
          </div>

          <div className={styles.top}>
            <span
              className={styles.logo}
              data-logo
              aria-hidden="true"
              style={{ '--logo-src': `url('${brandLogo.src}')`, '--logo-ratio': brandLogo.aspectRatio } as CSSProperties}
            />
            <h2 id="footer-heading" className={styles.headline}>
              <span className="sr-only">{plainHeadline}</span>
              <span aria-hidden="true">
                {headline.map((line, li) => (
                  <span key={li} className={styles.headlineLine}>
                    {accentWords(line).map((word, wi) => {
                      // "things." is one unbreakable word; its full stop hangs just past it,
                      // so it never drops to a line of its own or pushes the word down.
                      const { body, hang } = splitHang(word);
                      return (
                        <Fragment key={wi}>
                          {wi > 0 ? ' ' : null}
                          <span className={styles.word} data-hang={hang ? '' : undefined}>
                            <span className={styles.wordInner} data-word>
                              {body.map((piece, pi) => (
                                <span key={pi} className={piece.accent ? styles.wordAccent : styles.wordPlain}>
                                  {piece.text}
                                </span>
                              ))}
                              {hang ? (
                                <span className={`${hang.accent ? styles.wordAccent : styles.wordPlain} ${styles.hang}`}>
                                  {hang.text}
                                </span>
                              ) : null}
                            </span>
                          </span>
                        </Fragment>
                      );
                    })}
                  </span>
                ))}
              </span>
            </h2>
          </div>

          <BlockReveal as="nav" className={`${styles.col} ${styles.colLeft}`} aria-label="Footer pages">
            <span className={styles.colLabel}>{labels.pages}</span>
            {pages.map((p) => (
              <TransitionLink key={p.href} href={p.href} className={styles.colLink}>
                <span className="sr-only">{p.label}</span>
                <RollText text={p.label} />
              </TransitionLink>
            ))}
          </BlockReveal>

          <BlockReveal className={`${styles.col} ${styles.colRight}`} delay={0.1}>
            <span className={styles.colLabel}>{labels.follow}</span>
            {socials.map((s) => (
              <a key={s.href} href={s.href} target="_blank" rel="noreferrer" className={styles.colLink}>
                <span className="sr-only">{s.label}</span>
                <RollText text={s.label} />
              </a>
            ))}
          </BlockReveal>

          <div className={styles.cta} data-cta>
            <Magnetic strength={0.2}>
              <a
                className={styles.ctaButton}
                href={contactHref(cta)}
                target={cta.mode === 'gmail' ? '_blank' : undefined}
                rel={cta.mode === 'gmail' ? 'noreferrer' : undefined}
                data-cursor="link"
                aria-label={`${cta.label}: email ${cta.email}`}
              >
                <span data-magnetic-inner>{cta.label}</span>
                <Arrow />
              </a>
            </Magnetic>
          </div>

          <div className={styles.barLeft}>
            © {year} {profile.name}. All rights reserved
          </div>
          <div className={styles.barRight}>
            <BackToTop className={styles.back} label={labels.backToTop} />
          </div>
        </div>
      </div>
    </Scene>
  );
}
