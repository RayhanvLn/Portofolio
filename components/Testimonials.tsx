"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { testimonials } from "@/data/portfolio";
import Magnetic from "./Magnetic";

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const next = () => setIndex((v) => (v + 1) % testimonials.length);
  const prev = () => setIndex((v) => (v - 1 + testimonials.length) % testimonials.length);
  const item = testimonials[index];

  return (
    <section className="testimonials section-shell section-pad">
      <div className="section-kicker mono-label">✦ CLIENT STORIES / DUMMY CONTENT</div>
      <div className="testimonial-shell">
        <AnimatePresence mode="wait">
          <motion.div
            className="testimonial-copy"
            key={index}
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="testimonial-mark">“</span>
            <blockquote>{item.quote}</blockquote>
            <div>
              <strong>{item.name}</strong>
              <span>{item.role}</span>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="testimonial-controls">
          <span className="mono-label">0{index + 1} / 0{testimonials.length}</span>
          <div>
            <Magnetic><button onClick={prev} aria-label="Previous quote"><ArrowLeft /></button></Magnetic>
            <Magnetic><button onClick={next} aria-label="Next quote"><ArrowRight /></button></Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
