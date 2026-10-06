import type { CSSProperties } from 'react';
import styles from './RollText.module.css';

/**
 * Text whose letters roll up to an accent copy when the parent link is hovered.
 * Visual only (aria-hidden): put the readable label next to it, e.g. in a .sr-only span.
 */
export function RollText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className ? `${styles.roll} ${className}` : styles.roll} aria-hidden="true">
      {Array.from(text).map((ch, i) => (
        <span key={i} className={styles.char} style={{ '--i': i } as CSSProperties}>
          <span className={styles.a}>{ch === ' ' ? '\u00a0' : ch}</span>
          <span className={styles.b} data-block-skip>
            {ch === ' ' ? '\u00a0' : ch}
          </span>
        </span>
      ))}
    </span>
  );
}
