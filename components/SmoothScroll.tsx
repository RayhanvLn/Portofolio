"use client";

import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactNode, useEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.1,
    });

    lenis.on("scroll", ScrollTrigger.update);

    // Route every internal navbar/CTA anchor through Lenis so section jumps
    // keep the same smooth movement as the rest of the portfolio.
    const handleAnchorClick = (event: MouseEvent) => {
      const clicked = event.target as Element | null;
      const anchor = clicked?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector<HTMLElement>(href);
      if (!target) return;

      event.preventDefault();
      lenis.scrollTo(target, {
        offset: -88,
        duration: 1.05,
        easing: (t: number) => 1 - Math.pow(1 - t, 4),
        onComplete: () => window.history.replaceState(null, "", href),
      });
    };

    document.addEventListener("click", handleAnchorClick);

    const update = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
