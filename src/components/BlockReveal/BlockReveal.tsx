'use client';
import { useRef, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { prefersReducedMotion, ScrollTrigger, useGSAP } from '@/lib/animation';
import { animationConfig } from '@/animations/config';
import { blockReveal } from '@/animations/blockReveal';
import { clearMask, hideContent } from '@/lib/blockRevealCore';
import { usePageTransition } from '@/hooks/usePageTransition';

type Tag = 'div' | 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'dl' | 'nav' | 'figcaption';

type BlockRevealProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
  as?: Tag;
  children: ReactNode;
  /** 'scroll' (default) plays when it enters the viewport; 'load' when the page appears. */
  trigger?: 'scroll' | 'load';
  delay?: number;
  /** Block colour. Default: the accent colour. */
  color?: string;
  /** 'lines' = one block per visual line (default); 'box' = whole element as one block (buttons). */
  mode?: 'lines' | 'box';
};

/**
 * Wrap any text (paragraphs, links, lists, grids) to give it the accent
 * block reveal: blocks cover each line, the text appears, the blocks slide
 * away line by line. Content stays in the DOM and accessible throughout;
 * focusing a link inside reveals it immediately.
 */
export function BlockReveal({ as = 'div', children, trigger = 'scroll', delay = 0, color, mode, ...rest }: BlockRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const { ready } = usePageTransition();
  // One concrete tag type for TypeScript (a bare ElementType makes `children` resolve to never);
  // the real tag is still whatever `as` says.
  const Comp = as as 'div';

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      hideContent(el);
      if (!ready) return () => clearMask(el);

      let played = false;
      let handle: ReturnType<typeof blockReveal> = null;
      const play = () => {
        if (played) return;
        played = true;
        handle = blockReveal(el, { delay, color, mode });
      };
      // Keyboard users never land on invisible links.
      const onFocus = () => {
        if (!played) played = true;
        handle?.destroy();
        clearMask(el);
      };
      el.addEventListener('focusin', onFocus);

      let st: ReturnType<typeof ScrollTrigger.create> | undefined;
      const ratio = animationConfig.blockReveal.startRatio;
      if (trigger === 'load') {
        play();
      } else {
        st = ScrollTrigger.create({ trigger: el, start: `top ${ratio * 100}%`, once: true, onEnter: play });
        // Already past the start line (in view on arrival, or reloaded mid-page): play now.
        if (el.getBoundingClientRect().top < window.innerHeight * ratio) play();
      }

      return () => {
        el.removeEventListener('focusin', onFocus);
        st?.kill();
        handle?.destroy();
        clearMask(el);
      };
    },
    { scope: ref, dependencies: [ready], revertOnUpdate: true },
  );

  return (
    <Comp ref={ref as Ref<HTMLDivElement>} {...rest}>
      {children}
    </Comp>
  );
}
