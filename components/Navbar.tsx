"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";
import Magnetic from "./Magnetic";

const navItems = [
  ["Work", "#work"],
  ["Skills", "#skills"],
  ["Journey", "#journey"],
  ["Profile", "#profile"],
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="site-header">
        <a href="#top" className="brand-mark" aria-label="Rayhan Fakhri Risqullah home">
          <span>R</span>
          <span className="brand-mark__slash">/</span>
          <span>F</span>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map(([label, href]) => (
            <Magnetic key={href}>
              <a className="nav-link" href={href}>
                <span>{label}</span>
                <span>{label}</span>
              </a>
            </Magnetic>
          ))}
        </nav>

        <div className="header-actions">
          <Magnetic>
            <a href="#contact" className="cta-pill">
              Contact <ArrowUpRight size={15} />
            </a>
          </Magnetic>
          <button className="menu-button" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={18} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="mobile-menu__top">
              <span className="mono-label">RAYHAN / PORTFOLIO</span>
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X />
              </button>
            </div>
            <div className="mobile-menu__links">
              {navItems.map(([label, href], i) => (
                <motion.a
                  href={href}
                  key={href}
                  onClick={() => setOpen(false)}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.06 }}
                >
                  <span className="mono-label">0{i + 1}</span>
                  {label}
                </motion.a>
              ))}
            </div>
            <div className="mobile-menu__footer">
              <span>Full-Stack · Data · Systems</span>
              <span>Jakarta / ID</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
