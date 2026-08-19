"use client";

import { motion } from "framer-motion";
import { ArrowDownRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Magnetic from "./Magnetic";

function BlastButton() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [holding, setHolding] = useState(false);
  const [blasting, setBlasting] = useState(false);

  const begin = () => {
    setHolding(true);
    timerRef.current = setTimeout(() => {
      setBlasting(true);
      setHolding(false);
      window.setTimeout(() => setBlasting(false), 900);
    }, 680);
  };

  const stop = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setHolding(false);
  };

  return (
    <button
      className={`blast ${holding ? "is-holding" : ""} ${blasting ? "is-blasting" : ""}`}
      onPointerDown={begin}
      onPointerUp={stop}
      onPointerLeave={stop}
      aria-label="Hold to launch"
    >
      <span className="blast__orb" />
      <span className="blast__label">Hold to launch</span>
      <span className="blast__ring" />
      {Array.from({ length: 10 }).map((_, i) => (
        <span key={i} className="blast__ray" style={{ transform: `rotate(${i * 36}deg)` }} />
      ))}
    </button>
  );
}

function IdentityTitle() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [hovered, setHovered] = useState(false);

  const primaryLines = ["Rayhan Fakhri", "Risqullah"];
  const alternateLines = ["I'm a software", "engineer"];

  return (
    <h1
      ref={titleRef}
      className={`hero-title hero-title--identity ${hovered ? "is-hovered" : ""}`}
      aria-label={hovered ? "I'm a software engineer" : "Rayhan Fakhri Risqullah"}
      data-cursor="link"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <span className="hero-title__swap" aria-hidden="true">
        <span className="hero-title__layer hero-title__layer--primary">
          {primaryLines.map((line, lineIndex) => (
            <span className="hero-title__mask" key={line}>
              <motion.span
                className="hero-title__text"
                initial={{ y: "112%", rotate: 1.2 }}
                animate={{ y: 0, rotate: 0 }}
                transition={{
                  duration: 1.15,
                  delay: 0.18 + lineIndex * 0.11,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </span>

        <span className="hero-title__layer hero-title__layer--alternate">
          {alternateLines.map((line) => (
            <span className="hero-title__mask" key={line}>
              <span className="hero-title__text hero-title__text--alternate">
                {line}
              </span>
            </span>
          ))}
        </span>
      </span>
    </h1>
  );
}

export default function Hero() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || window.matchMedia("(pointer: coarse)").matches) return;

    const move = (event: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      el.style.setProperty("--rx", `${-py * 9}deg`);
      el.style.setProperty("--ry", `${px * 13}deg`);
      el.style.setProperty("--tx", `${px * 16}px`);
      el.style.setProperty("--ty", `${py * 16}px`);
    };

    const leave = () => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
      el.style.setProperty("--tx", "0px");
      el.style.setProperty("--ty", "0px");
    };

    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);

    return () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <section id="top" className="hero section-shell">
      <div className="hero-grid">
        <div className="hero-copy">
          <motion.p
            className="eyebrow mono-label"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            FULL-STACK WEB DEVELOPER · DATA &amp; SYSTEM DEVELOPMENT
          </motion.p>

          <IdentityTitle />

          <div className="hero-cta-row hero-cta-row--minimal">
            <Magnetic>
              <a className="underlined-cta" href="#work">
                Explore selected work <ArrowDownRight size={16} />
              </a>
            </Magnetic>
          </div>
        </div>

        <div ref={stageRef} className="hero-stage" aria-hidden="true">
          <div className="hero-stage__glow" />
          <div className="hero-stage__lines" />
          <div className="speedform">
            <span className="speedform__blade speedform__blade--one" />
            <span className="speedform__blade speedform__blade--two" />
            <span className="speedform__blade speedform__blade--three" />
            <span className="speedform__core" />
          </div>
        </div>
      </div>

      <div className="hero-meta">
        <div>
          <span className="mono-label">BUILDING SINCE 2024</span>
          <strong>East Jakarta · Indonesia</strong>
        </div>
        <BlastButton />
        <div className="hero-meta__scroll">
          <span className="mono-label">SCROLL TO EXPLORE</span>
          <span className="scroll-line" />
        </div>
      </div>
    </section>
  );
}
