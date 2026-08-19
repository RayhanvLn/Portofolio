"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Github,
  Instagram,
  Linkedin,
} from "lucide-react";
import { useEffect, useState } from "react";
import Magnetic from "./Magnetic";
import styles from "./Footer.module.css";

function LocalTime() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () =>
      setTime(
        new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Jakarta",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date()),
      );

    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, []);

  return <span>{time || "--:--:--"} WIB</span>;
}

const socials = [
  {
    id: "01",
    label: "Instagram",
    handle: "@violenhan",
    meta: "SOCIAL / VISUAL",
    href: "https://www.instagram.com/violenhan/",
    icon: Instagram,
    active: true,
  },
  {
    id: "02",
    label: "GitHub",
    handle: "RayhanvLn",
    meta: "CODE / PROJECTS",
    href: "https://github.com/RayhanvLn",
    icon: Github,
    active: true,
  },
  {
    id: "03",
    label: "LinkedIn",
    handle: "Link coming soon",
    meta: "PROFESSIONAL / NETWORK",
    href: "",
    icon: Linkedin,
    active: false,
  },
];

export default function Footer() {
  return (
    <footer id="contact" className={`${styles.footer} section-shell`}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.gridGlow} aria-hidden="true" />

      <div className={styles.top}>
        <span className={`${styles.kicker} mono-label`}>
          OPEN TO OPPORTUNITIES &amp; COLLABORATION
        </span>

        <motion.div
          className={styles.headingWrap}
          initial={{ opacity: 0, y: 54 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className={styles.heading}>
            Let&apos;s stay <em>connected.</em>
          </h2>
          <p className={styles.intro}>
            Follow my work, experiments, and the systems I&apos;m building next.
          </p>
        </motion.div>

        <div className={styles.socialGrid}>
          {socials.map((social, index) => {
            const Icon = social.icon;

            if (!social.active) {
              return (
                <motion.div
                  key={social.id}
                  className={`${styles.socialCard} ${styles.socialCardDisabled}`}
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: index * 0.07 }}
                  aria-disabled="true"
                >
                  <div className={styles.socialTopline}>
                    <span className={styles.socialIndex}>{social.id}</span>
                    <span className={styles.socialMeta}>{social.meta}</span>
                  </div>

                  <div className={styles.socialMain}>
                    <span className={styles.iconShell}>
                      <Icon size={20} strokeWidth={1.8} />
                    </span>
                    <div>
                      <strong>{social.label}</strong>
                      <span>{social.handle}</span>
                    </div>
                  </div>

                  <span className={styles.soonBadge}>COMING SOON</span>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={social.id}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: index * 0.07 }}
              >
                <Magnetic className={styles.magneticCard} strength={0.07}>
                  <a
                    className={styles.socialCard}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={`Open Rayhan's ${social.label}`}
                  >
                    <div className={styles.socialTopline}>
                      <span className={styles.socialIndex}>{social.id}</span>
                      <span className={styles.socialMeta}>{social.meta}</span>
                    </div>

                    <div className={styles.socialMain}>
                      <span className={styles.iconShell}>
                        <Icon size={20} strokeWidth={1.8} />
                      </span>
                      <div>
                        <strong>{social.label}</strong>
                        <span>{social.handle}</span>
                      </div>
                    </div>

                    <span className={styles.arrowShell} aria-hidden="true">
                      <ArrowUpRight size={21} strokeWidth={1.7} />
                    </span>
                  </a>
                </Magnetic>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className={styles.bottom}>
        <div>
          <span className="mono-label">LOCAL TIME</span>
          <LocalTime />
        </div>

        <div>
          <span className="mono-label">EMAIL</span>
          <a href="mailto:Rayhanfakhri01@gmail.com">Rayhanfakhri01@gmail.com</a>
        </div>

        <div>
          <span className="mono-label">PHONE / LOCATION</span>
          <a href="tel:087856914731">087856914731</a>
          <span>East Jakarta, Indonesia</span>
        </div>

        <div className={styles.signoff}>
          <span className="mono-label">© 2026</span>
          <strong>R/F</strong>
        </div>
      </div>
    </footer>
  );
}
