'use client';
import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/animation';
import { characterReveal, hideForReveal } from '@/animations/textAnimations';
import { mq } from '@/lib/responsive';
import { pad } from '@/lib/utils';
import { usePageTransition } from '@/hooks/usePageTransition';
import { contactPage } from '@/data/contactPage';
import type { ContactContent, LinkItem, Profile } from '@/types/portfolio';
import { Scene } from '@/components/Scene/Scene';
import { TextReveal } from '@/components/TextReveal/TextReveal';
import { ContourField } from '@/components/ContourField/ContourField';
import { FitText } from '@/components/FitText/FitText';
import { BlockReveal } from '@/components/BlockReveal/BlockReveal';
import { RollText } from '@/components/RollText/RollText';
import { Arrow } from '@/components/Icons/Arrow';
import { LocalTime } from './LocalTime';
import styles from './Contact.module.css';

/** Hiragana, katakana or kanji → shown in the Japanese font. */
const isJapanese = (word: string) => /[\u3040-\u30ff\u31f0-\u31ff\u4e00-\u9fff]/.test(word);

const chars = (word: string) =>
  Array.from(word).map((c, i) => (
    <span key={i} className={styles.char} data-char>
      {c}
    </span>
  ));

/**
 * Contact page: "SAY" + a greeting that rolls through the languages you speak,
 * a live local clock, availability, and the channels as large interactive rows.
 * (`contact` is accepted for compatibility with the page; the copy now lives in src/data/contactPage.ts.)
 */
export function ContactHero({ profile, socials }: { contact?: ContactContent; profile: Profile; socials: LinkItem[] }) {
  const root = useRef<HTMLDivElement>(null);
  const { ready } = usePageTransition();
  const { label, lead, greetings, greetingHold, channelsLabel } = contactPage;

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(mq.motionOK, () => {
        const q = gsap.utils.selector(el);
        const words = q('[data-greet]');
        const wordChars = words.map((w) => w.querySelectorAll<HTMLElement>('[data-char]'));
        gsap.set(words, { visibility: 'visible' });
        wordChars.slice(1).forEach((c) => gsap.set(c, { yPercent: 115 }));

        if (!ready) {
          gsap.set(q('[data-rule]'), { scaleX: 0 });
          hideForReveal(wordChars[0]);
          return;
        }
        gsap.fromTo(q('[data-rule]'), { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'expo.inOut', delay: 0.05 });
        characterReveal(wordChars[0], { delay: 0.45, stagger: 0.04 });

        if (words.length < 2) return;
        // Greeting loop: current word rolls up and out, the next rolls in from below.
        const loop = gsap.timeline({ repeat: -1, paused: true, delay: 0 });
        words.forEach((_, i) => {
          const next = (i + 1) % words.length;
          loop
            .to(wordChars[i], { yPercent: -115, duration: 0.55, ease: 'expo.in', stagger: 0.025 }, `+=${greetingHold}`)
            .fromTo(wordChars[next], { yPercent: 115 }, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.03 }, '-=0.2');
        });
        // Only runs while the headline is on screen.
        const st = ScrollTrigger.create({
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
        });
        const starter = gsap.delayedCall(1.2, () => st.isActive && loop.play());
        return () => {
          starter.kill();
          loop.kill();
        };
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [ready], revertOnUpdate: true },
  );

  return (
    <>
      <Scene theme="dark" className={styles.contact} aria-labelledby="contact-heading">
        <div className={styles.bg} aria-hidden="true">
          <ContourField variant="two" />
        </div>
        <div ref={root} className={styles.inner}>
          <h1 id="contact-heading" className="sr-only">
            {lead} {greetings[0]} — {profile.name}
          </h1>

          <div className={styles.meta} aria-hidden="true">
            <BlockReveal as="span" trigger="load" delay={0.1} className={styles.metaLabel}>
              <span className={styles.metaMark} />
              {label}
            </BlockReveal>
            <BlockReveal as="span" trigger="load" delay={0.2} className={styles.metaRight}>
              {profile.location} · <LocalTime timeZone={profile.timezone} />
            </BlockReveal>
          </div>
          <span className={styles.rule} data-rule aria-hidden="true" />

          <div className={styles.greet} aria-hidden="true">
            <TextReveal as="span" text={lead} mode="chars" trigger="load" delay={0.2} stagger={0.04} className={styles.lead} />
            <FitText className={styles.rotator}>
              <span className={styles.stack}>
                {greetings.map((g, i) => (
                  <span
                    key={g + i}
                    className={styles.greetWord}
                    data-greet
                    data-text-line
                    data-script={isJapanese(g) ? 'jp' : undefined}
                    lang={isJapanese(g) ? 'ja' : undefined}
                  >
                    <span className={styles.mask}>{chars(g)}</span>
                  </span>
                ))}
              </span>
            </FitText>
          </div>

          <BlockReveal as="p" trigger="load" delay={0.9} className={styles.status}>
            <span className={styles.statusDot} aria-hidden="true" />
            {profile.availability}
          </BlockReveal>
        </div>
      </Scene>

      <Scene theme="dark" className={styles.channels} aria-labelledby="channels-heading">
        <div className={styles.channelsHead}>
          <BlockReveal as="h2" id="channels-heading" className={styles.channelsLabel}>
            {channelsLabel}
          </BlockReveal>
          <span className={styles.channelsCount} aria-hidden="true">
            {pad(socials.length)}
          </span>
        </div>
        <BlockReveal>
          <ul className={styles.list}>
            {socials.map((s, i) => (
              <li key={s.href} className={styles.row}>
                <a href={s.href} target="_blank" rel="noreferrer" className={styles.link} data-cursor="link">
                  <span className={styles.index} aria-hidden="true">
                    {pad(i + 1)}
                  </span>
                  <span className="sr-only">{s.label} (opens in a new tab)</span>
                  <RollText text={s.label} className={styles.name} />
                  <span className={styles.arrow} aria-hidden="true">
                    <Arrow />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </BlockReveal>
      </Scene>
    </>
  );
}
