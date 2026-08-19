"use client";

import { motion } from "framer-motion";

export default function TextReveal({
  text,
  className = "",
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  return (
    <span className={`text-reveal ${className}`} aria-label={text}>
      {text.split(" ").map((word, i) => (
        <span className="text-reveal__mask" key={`${word}-${i}`}>
          <motion.span
            className="text-reveal__word"
            initial={{ y: "115%", rotate: 2 }}
            whileInView={{ y: "0%", rotate: 0 }}
            viewport={{ once: true, amount: 0.7 }}
            transition={{
              duration: 0.75,
              delay: delay + i * 0.045,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}&nbsp;
          </motion.span>
        </span>
      ))}
    </span>
  );
}
