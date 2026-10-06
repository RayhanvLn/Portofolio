'use client';
import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/animation';
import { velocitySkew } from '@/animations/scrollAnimations';
import { motionStore } from '@/lib/motionStore';
import styles from './VelocityMarquee.module.css';

/** Endless type band. Speeds up with scroll velocity, follows scroll direction,
 *  leans with momentum and settles when scrolling stops. Runs only on screen. */
export function VelocityMarquee({ items }: { items: string[] }) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const t = track.current;
    if (!el || !t || prefersReducedMotion()) return;
    const wrap = gsap.utils.wrap(-50, 0);
    const skew = velocitySkew(t, 'skewX');
    let x = 0;
    let running = false;
    const tick = (_time: number, delta: number) => {
      const { velocity, direction } = motionStore.scroll;
      const speed = (0.018 + Math.min(Math.abs(velocity), 60) * 0.006) * (delta / 16.67);
      x = wrap(x - speed * (direction >= 0 ? 1 : -1));
      gsap.set(t, { xPercent: x });
      skew(-velocity);
    };
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) {
        gsap.ticker.add(tick);
        running = true;
      } else if (!entry.isIntersecting && running) {
        gsap.ticker.remove(tick);
        running = false;
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      gsap.ticker.remove(tick);
      gsap.killTweensOf(t);
    };
  }, []);

  return (
    <div ref={root} className={styles.marquee}>
      <p className="sr-only">{items.join(', ')}</p>
      <div ref={track} className={styles.track} aria-hidden="true">
        {[0, 1].map((copy) => (
          <div key={copy} className={styles.group}>
            {items.map((item, i) => (
              <span key={i} className={styles.item}>
                {item}
                <span className={styles.sep} />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
