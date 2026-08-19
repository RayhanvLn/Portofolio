"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { journey } from "@/data/portfolio";
import Magnetic from "./Magnetic";

export default function Journey() {
  const [index, setIndex] = useState(0);
  const next = () => setIndex((value) => (value + 1) % journey.length);
  const prev = () => setIndex((value) => (value - 1 + journey.length) % journey.length);
  const item = journey[index];

  return (
    <section id="journey" className="journey section-shell section-pad">
      <div className="section-kicker mono-label">✦ EXPERIENCE / EDUCATION</div>
      <div className="journey-shell">
        <AnimatePresence mode="wait">
          <motion.div
            className="journey-copy"
            key={index}
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="journey-topline">
              <span className="mono-label">{item.type}</span>
              <span className="mono-label">{item.period}</span>
            </div>
            <span className="journey-index">{item.no}</span>
            <h2>{item.title}</h2>
            <strong>{item.organization}</strong>
            <p>{item.description}</p>
          </motion.div>
        </AnimatePresence>

        <div className="journey-controls">
          <span className="mono-label">0{index + 1} / 0{journey.length}</span>
          <div>
            <Magnetic><button onClick={prev} aria-label="Previous timeline item"><ArrowLeft /></button></Magnetic>
            <Magnetic><button onClick={next} aria-label="Next timeline item"><ArrowRight /></button></Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
