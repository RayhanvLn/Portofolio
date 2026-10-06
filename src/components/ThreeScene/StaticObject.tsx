import styles from './ThreeScene.module.css';

/** SVG stand-in for the 3D object (no WebGL, reduced motion, or a WebGL error). */
export function StaticObject() {
  return (
    <svg className={styles.fallback} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <ellipse cx="100" cy="100" rx="78" ry="30" fill="none" stroke="var(--c-accent)" strokeWidth="0.8" transform="rotate(-24 100 100)" />
      <circle cx="100" cy="100" r="54" fill="none" stroke="currentColor" strokeOpacity="0.5" strokeWidth="14" />
      <polygon points="100,74 122,88 122,112 100,126 78,112 78,88" fill="currentColor" fillOpacity="0.85" />
    </svg>
  );
}
