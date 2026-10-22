'use client';
import { Fragment, useRef, type Ref } from 'react';
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/animation';
import { characterReveal, hideForReveal, lineReveal, wordReveal } from '@/animations/textAnimations';
import { animationConfig } from '@/animations/config';
import { usePageTransition } from '@/hooks/usePageTransition';
import { cn } from '@/lib/utils';
import styles from './TextReveal.module.css';

type Mode = 'chars' | 'words' | 'lines';

interface TextRevealProps {
  text: string | string[];
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  mode?: Mode;
  /** 'load' = plays when the page becomes ready; 'scroll' = when it enters the viewport; 'none' = static, no animation. */
  trigger?: 'load' | 'scroll' | 'none';
  delay?: number;
  stagger?: number;
  start?: string;
  className?: string;
  lineClassName?: string;
  id?: string;
}

/**
 * Split-text reveal rendered on the server (no DOM splitting at runtime, no
 * hydration mismatch). Screen readers get the plain sentence; the split
 * spans are aria-hidden.
 */
export function TextReveal({
  text,
  as = 'p',
  mode = 'words',
  trigger = 'scroll',
  delay = 0,
  stagger,
  start = animationConfig.reveal.start,
  className,
  lineClassName,
  id,
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const { ready } = usePageTransition();
  const lines = Array.isArray(text) ? text : [text];
  // One concrete tag type for TypeScript; the real tag is still whatever `as` says.
  const Tag = as as 'div';

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || trigger === 'none') return;
      const selector = mode === 'chars' ? '[data-char]' : mode === 'words' ? '[data-word]' : '[data-line-inner]';
      const targets = el.querySelectorAll<HTMLElement>(selector);

      if (prefersReducedMotion()) {
        if (ready) gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 });
        return;
      }
      if (!ready) {
        hideForReveal(targets);
        return;
      }
      const opts = { delay, stagger, scrollTrigger: trigger === 'scroll' ? { trigger: el, start, once: true } : undefined };
      if (mode === 'chars') characterReveal(targets, opts);
      else if (mode === 'words') wordReveal(targets, opts);
      else lineReveal(targets, opts);
    },
    { scope: ref, dependencies: [ready], revertOnUpdate: true },
  );

  return (
    <Tag ref={ref as Ref<HTMLDivElement>} id={id} className={cn(styles.root, className)}>
      <span className="sr-only">{lines.join(' ')}</span>
      <span className={styles.visual} aria-hidden="true">
        {lines.map((line, li) => (
          <span key={li} className={cn(styles.line, lineClassName)} data-text-line>
            {mode === 'lines' ? (
              <span className={styles.lineMask}>
                <span className={styles.lineInner} data-line-inner>
                  {line}
                </span>
              </span>
            ) : (
              line.split(' ').map((word, wi, words) => (
                <Fragment key={wi}>
                  <span className={styles.word}>
                    {mode === 'chars' ? (
                      <span className={styles.wordInner}>
                        {Array.from(word).map((c, ci) => (
                          <span key={ci} className={styles.char} data-char>
                            {c}
                          </span>
                        ))}
                      </span>
                    ) : (
                      <span className={styles.wordInner} data-word>
                        {word}
                      </span>
                    )}
                  </span>
                  {wi < words.length - 1 ? ' ' : null}
                </Fragment>
              ))
            )}
          </span>
        ))}
      </span>
    </Tag>
  );
}
