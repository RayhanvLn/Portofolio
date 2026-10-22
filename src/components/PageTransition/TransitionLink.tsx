'use client';
import Link from 'next/link';
import type { ComponentPropsWithoutRef, MouseEvent } from 'react';
import { usePageTransition } from '@/hooks/usePageTransition';
import { isExternal } from '@/lib/utils';

type Props = Omit<ComponentPropsWithoutRef<typeof Link>, 'href'> & {
  href: string;
  /** Text shown on the curtain during the transition. */
  transitionLabel?: string;
};

/** Next.js Link that routes through the cinematic curtain transition.
 *  Modifier-clicks, new tabs and external links behave natively. */
export function TransitionLink({ href, transitionLabel, onClick, children, ...rest }: Props) {
  const { navigate } = usePageTransition();

  if (isExternal(href)) {
    const newTab = /^(https?:)?\/\//.test(href);
    return (
      <a href={href} target={newTab ? '_blank' : undefined} rel={newTab ? 'noreferrer' : undefined} {...rest}>
        {children}
      </a>
    );
  }

  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (rest.target === '_blank') return;
    e.preventDefault();
    // click point (keyboard: none) and whether the click was inside the menu (data-transition-solid)
    const pointer = e.detail > 0;
    navigate(href, transitionLabel, {
      x: pointer ? e.clientX : undefined,
      y: pointer ? e.clientY : undefined,
      solid: Boolean(e.currentTarget.closest('[data-transition-solid]')),
    });
  };

  return (
    <Link href={href} onClick={handle} {...rest}>
      {children}
    </Link>
  );
}
