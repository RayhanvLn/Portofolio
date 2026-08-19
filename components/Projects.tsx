"use client";

import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { projects, type Project } from "@/data/portfolio";
import styles from "./ProjectsCarousel.module.css";

const AUTO_DELAY = 2800;
const MANUAL_RESUME_DELAY = 2300;
const SWIPE_THRESHOLD = 42;
const VELOCITY_WEIGHT = 0.075;
const SLIDE_DURATION = 0.48;
const SIDE_REVEAL_DURATION = 0.085;

type Direction = 1 | -1;

function modulo(value: number, total: number) {
  return ((value % total) + total) % total;
}

function relativeOffset(index: number, activeIndex: number, total: number) {
  let diff = modulo(index - activeIndex, total);
  if (diff > total / 2) diff -= total;
  return diff;
}

function slotMotion(offset: number) {
  if (offset === 0) {
    return {
      x: "0%",
      scale: 1,
      rotateY: 0,
      opacity: 1,
      zIndex: 5,
      filter: "brightness(1)",
    };
  }

  if (offset === -1) {
    return {
      x: "-72%",
      scale: 0.82,
      rotateY: 10,
      opacity: 0.62,
      zIndex: 4,
      filter: "brightness(.66)",
    };
  }

  if (offset === 1) {
    return {
      x: "72%",
      scale: 0.82,
      rotateY: -10,
      opacity: 0.62,
      zIndex: 4,
      filter: "brightness(.66)",
    };
  }

  return {
    x: offset < 0 ? "-148%" : "148%",
    scale: 0.68,
    rotateY: offset < 0 ? 14 : -14,
    opacity: 0,
    zIndex: 0,
    filter: "brightness(.42)",
  };
}

export default function Projects() {
  const totalProjects = projects.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<0 | Direction>(0);
  const [selected, setSelected] = useState<Project | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  const draggingRef = useRef(false);
  const isSlidingRef = useRef(false);
  const queuedSlidesRef = useRef<Direction[]>([]);
  const suppressClickUntilRef = useRef(0);
  const nextAutoAtRef = useRef(Date.now() + AUTO_DELAY);

  const scheduleAutoAfterManual = useCallback(() => {
    nextAutoAtRef.current = Date.now() + MANUAL_RESUME_DELAY;
  }, []);

  const startSlide = useCallback((direction: Direction) => {
    isSlidingRef.current = true;
    setSlideDirection(direction);
  }, []);

  const requestSlide = useCallback(
    (direction: Direction, manual = false) => {
      if (selected) return;
      if (manual) scheduleAutoAfterManual();

      // Rapid manual gestures are queued instead of interrupting a running step.
      if (isSlidingRef.current) {
        if (queuedSlidesRef.current.length < 6) queuedSlidesRef.current.push(direction);
        return;
      }

      startSlide(direction);
    },
    [scheduleAutoAfterManual, selected, startSlide],
  );

  const finishSlide = useCallback(
    (direction: Direction) => {
      // Commit after the visible 3-card movement finishes. The new side card
      // mounts directly in its final slot, so it never crosses the stage.
      setActiveIndex((current) => modulo(current + direction, totalProjects));
      setSlideDirection(0);
      isSlidingRef.current = false;

      window.setTimeout(() => {
        const queued = queuedSlidesRef.current.shift();
        if (queued) startSlide(queued);
      }, 8);
    },
    [startSlide, totalProjects],
  );

  const goNext = useCallback((manual = false) => requestSlide(1, manual), [requestSlide]);
  const goPrevious = useCallback((manual = false) => requestSlide(-1, manual), [requestSlide]);

  useEffect(() => {
    if (selected) return;

    const ticker = window.setInterval(() => {
      if (draggingRef.current || isSlidingRef.current) return;
      const now = Date.now();
      if (now < nextAutoAtRef.current) return;

      startSlide(1);
      nextAutoAtRef.current = now + AUTO_DELAY;
    }, 120);

    return () => window.clearInterval(ticker);
  }, [selected, startSlide]);

  const closeProject = useCallback(() => {
    setSelected(null);
    queuedSlidesRef.current = [];
    nextAutoAtRef.current = Date.now() + MANUAL_RESUME_DELAY;
  }, []);

  useEffect(() => {
    if (!selected) return;

    setActiveImage(0);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeProject();
      if (event.key === "ArrowRight") {
        setActiveImage((current) =>
          selected.gallery.length > 1 ? (current + 1) % selected.gallery.length : current,
        );
      }
      if (event.key === "ArrowLeft") {
        setActiveImage((current) =>
          selected.gallery.length > 1
            ? (current - 1 + selected.gallery.length) % selected.gallery.length
            : current,
        );
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeProject, selected]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (selected) return;
      if (event.key === "ArrowRight") goNext(true);
      if (event.key === "ArrowLeft") goPrevious(true);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrevious, selected]);

  const handleDragStart = () => {
    draggingRef.current = true;
    suppressClickUntilRef.current = Date.now() + 220;
    scheduleAutoAfterManual();
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const intent = info.offset.x + info.velocity.x * VELOCITY_WEIGHT;

    if (intent <= -SWIPE_THRESHOLD) goNext(true);
    else if (intent >= SWIPE_THRESHOLD) goPrevious(true);
    else scheduleAutoAfterManual();

    draggingRef.current = false;
    suppressClickUntilRef.current = Date.now() + 220;
  };

  const handleCardClick = (project: Project, offset: number) => {
    if (draggingRef.current || isSlidingRef.current || Date.now() < suppressClickUntilRef.current) {
      return;
    }

    if (offset === -1) {
      goPrevious(true);
      return;
    }

    if (offset === 1) {
      goNext(true);
      return;
    }

    if (offset === 0) {
      queuedSlidesRef.current = [];
      setSelected(project);
    }
  };

  // The fourth card is ambiguous in a four-item circular carousel: mathematically
  // it can be treated as +2 or -2. We resolve that ambiguity from the current
  // travel direction so left and right loops behave identically.
  const incomingIndex =
    slideDirection === 0
      ? -1
      : modulo(activeIndex + slideDirection * 2, totalProjects);

  const visibleProjects = projects
    .map((project, projectIndex) => ({
      project,
      projectIndex,
      offset: relativeOffset(projectIndex, activeIndex, totalProjects),
      isIncoming: slideDirection !== 0 && projectIndex === incomingIndex,
    }))
    .filter(({ offset, isIncoming }) => Math.abs(offset) <= 1 || isIncoming);

  return (
    <>
      <section id="work" className={`${styles.section} section-shell section-pad`}>
        <motion.div
          className={styles.wrap}
          initial={{ opacity: 0, y: 42 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.header}>
            <div className={styles.headingBlock}>
              <span className={`${styles.eyebrow} mono-label`}>SELECTED WORK</span>
              <h2>Projects in motion.</h2>
              <p>
                A living carousel of systems I&apos;ve built across dashboards, automation,
                full-stack development, and database management.
              </p>
            </div>
          </div>

          <div className={styles.stageShell}>
            <div className={styles.glow} aria-hidden="true" />

            <motion.div
              className={styles.stage}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.09}
              dragMomentum={false}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              whileTap={{ cursor: "grabbing" }}
            >
              {visibleProjects.map(({ project, projectIndex, offset, isIncoming }) => {
                const isActive = offset === 0;
                const isSide = Math.abs(offset) === 1;
                const isInteractive = (isActive || isSide) && slideDirection === 0;
                const animatedOffset = offset - slideDirection;
                const incomingSlot = slideDirection === 1 ? 1 : -1;

                // The incoming project is injected directly into the newly-opened side
                // slot in BOTH directions. It never travels across the center and it
                // becomes visible almost immediately, eliminating the delayed blank
                // edge that could be seen when looping left.
                const motionState = isIncoming
                  ? { ...slotMotion(incomingSlot), opacity: 0.62 }
                  : slotMotion(animatedOffset);

                return (
                  <motion.article
                    key={project.title}
                    className={`${styles.cardSlot} ${isActive ? styles.cardSlotActive : ""} ${
                      isSide ? styles.cardSlotSide : ""
                    }`}
                    initial={
                      isIncoming
                        ? {
                            ...slotMotion(slideDirection === 1 ? 1 : -1),
                            opacity: 0,
                            scale: 0.79,
                          }
                        : false
                    }
                    animate={motionState}
                    transition={
                      slideDirection === 0
                        ? { duration: 0 }
                        : isIncoming
                          ? {
                              duration: SIDE_REVEAL_DURATION,
                              delay: 0,
                              ease: [0.22, 1, 0.36, 1],
                            }
                          : {
                              duration: SLIDE_DURATION,
                              ease: [0.22, 1, 0.36, 1],
                            }
                    }
                    onAnimationComplete={() => {
                      if (
                        slideDirection !== 0 &&
                        projectIndex === activeIndex &&
                        isSlidingRef.current
                      ) {
                        finishSlide(slideDirection);
                      }
                    }}
                    style={{ pointerEvents: isInteractive ? "auto" : "none" }}
                    data-cursor={isActive && slideDirection === 0 ? "view" : undefined}
                    role="button"
                    tabIndex={isInteractive ? 0 : -1}
                    aria-label={
                      isActive
                        ? `Open ${project.title} project details`
                        : `Move ${project.title} into focus`
                    }
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => handleCardClick(project, offset)}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter" && event.key !== " ") return;
                      event.preventDefault();
                      handleCardClick(project, offset);
                    }}
                  >
                    <div className={styles.card}>
                      <div className={styles.media}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={project.image} alt={project.title} draggable={false} />
                        <div className={styles.mediaShade} />
                        <span className={`${styles.projectNumber} mono-label`}>{project.index}</span>
                        <span className={`${styles.contextBadge} mono-label`}>{project.context}</span>
                        {project.placeholder && (
                          <span className={`${styles.dummyBadge} mono-label`}>DUMMY VISUAL</span>
                        )}
                      </div>

                      <div className={styles.cardBody}>
                        <div>
                          <h3>{project.title}</h3>
                          <span className={`${styles.role} mono-label`}>{project.role}</span>
                        </div>
                        <span className={styles.openIcon} aria-hidden="true">
                          <ArrowUpRight size={18} />
                        </span>
                      </div>

                      <div className={styles.cardMeta}>
                        <span className="mono-label">{project.period}</span>
                        <span className="mono-label">{isActive ? "VIEW CASE" : "CLICK TO FOCUS"}</span>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>

            <div className={`${styles.dragHint} mono-label`}>
              <span>DRAG / SWIPE</span>
              <span className={styles.dragLine} />
              <span>CLICK SIDE TO SLIDE</span>
              <span className={styles.dragLine} />
              <span>CENTER FOR DETAILS</span>
            </div>
          </div>

          <div className={styles.pagination}>
            <span className={`${styles.counter} mono-label`}>
              {String(activeIndex + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
            </span>
            <div className={styles.dots} aria-label="Project carousel position">
              {projects.map((project, index) => (
                <span
                  key={project.title}
                  className={index === activeIndex ? styles.dotActive : ""}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="case-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeProject();
            }}
          >
            <motion.div
              className="case-modal__panel"
              data-lenis-prevent
              data-lenis-prevent-wheel
              onWheel={(event) => event.stopPropagation()}
              initial={{ opacity: 0, y: 28, scale: 0.975 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.985 }}
              transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="case-modal__header">
                <div className="case-modal__eyebrow">
                  <span className="case-modal__category mono-label">{selected.context}</span>
                  <span className="mono-label">{selected.period}</span>
                </div>
                <button
                  type="button"
                  className="case-modal__close"
                  onClick={closeProject}
                  aria-label="Close project details"
                >
                  <X size={19} />
                </button>
                <h2>{selected.title}</h2>
              </div>

              <div className="case-modal__media">
                <AnimatePresence mode="wait">
                  <motion.div
                    className={`case-modal__hero ${selected.placeholder ? "is-placeholder" : ""}`}
                    key={`${selected.title}-${activeImage}`}
                    initial={{ opacity: 0, scale: 0.985 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.01 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selected.gallery[activeImage]}
                      alt={`${selected.title} documentation ${activeImage + 1}`}
                    />
                    <span className="case-modal__image-count mono-label">
                      {String(activeImage + 1).padStart(2, "0")} / {String(selected.gallery.length).padStart(2, "0")}
                    </span>
                  </motion.div>
                </AnimatePresence>

                {selected.gallery.length > 1 && (
                  <div className="case-modal__thumbs" aria-label="Project documentation thumbnails">
                    {selected.gallery.map((image, index) => (
                      <button
                        type="button"
                        key={`${selected.title}-${image}`}
                        className={index === activeImage ? "is-active" : ""}
                        onClick={() => setActiveImage(index)}
                        aria-label={`Show documentation image ${index + 1}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image} alt="" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="case-modal__content">
                <div className="case-modal__description">
                  <span className="mono-label">PROJECT OVERVIEW</span>
                  <p>{selected.description}</p>
                </div>

                <div className="case-modal__facts">
                  <div>
                    <span className="mono-label">ROLE</span>
                    <strong>{selected.role}</strong>
                  </div>
                  <div>
                    <span className="mono-label">YEAR</span>
                    <strong>{selected.year}</strong>
                  </div>
                </div>

                <div className="case-modal__tech">
                  <span className="mono-label">TECHNOLOGY &amp; FEATURES</span>
                  <div className="case-modal__tags">
                    {selected.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>

                {selected.placeholder && (
                  <div className="case-modal__notice mono-label">
                    Temporary visual documentation. The original project screenshots can replace this later without changing the layout.
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
