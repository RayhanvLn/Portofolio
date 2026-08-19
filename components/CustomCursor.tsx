"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

type CursorMode = "default" | "link" | "view" | "negative";

export default function CustomCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 650, damping: 45, mass: 0.15 });
  const sy = useSpring(y, { stiffness: 650, damping: 45, mass: 0.15 });
  const [mode, setMode] = useState<CursorMode>("default");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };

    const leave = () => setVisible(false);

    const over = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Keep the modes mutually exclusive. This prevents the large negative
      // cursor from fighting with VIEW/link states on nested elements.
      if (target.closest("[data-cursor='view']")) {
        setMode("view");
      } else if (target.closest("[data-cursor='negative']")) {
        setMode("negative");
      } else if (target.closest("a, button, [data-cursor='link']")) {
        setMode("link");
      } else {
        setMode("default");
      }
    };

    window.addEventListener("mousemove", move);
    document.addEventListener("mouseover", over);
    document.documentElement.addEventListener("mouseleave", leave);

    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", over);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, [x, y]);

  return (
    <motion.div
      className={`custom-cursor custom-cursor--${mode}`}
      style={{ left: sx, top: sy }}
      animate={{ opacity: visible ? 1 : 0 }}
      aria-hidden="true"
    >
      {mode === "view" && <span>VIEW</span>}
    </motion.div>
  );
}
