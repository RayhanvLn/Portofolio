"use client";

import { motion } from "framer-motion";
import {
  Braces,
  Database,
  Workflow,
  PenTool,
  BrainCircuit,
  Users,
  MessageCircleMore,
  Clock3,
  Lightbulb,
  ArrowUpRight,
} from "lucide-react";

const technicalGroups = [
  {
    no: "01",
    title: "Web Development",
    label: "FRONTEND / LOGIC",
    description:
      "Building responsive web interfaces and application flows with clean structure, usable interactions, and maintainable logic.",
    tools: ["HTML5", "CSS3", "JavaScript", "Node.js"],
    icon: Braces,
    size: "wide",
  },
  {
    no: "02",
    title: "Data & Database",
    label: "DATA LAYER",
    description:
      "Structuring relational data and turning operational information into usable, organized application data.",
    tools: ["MySQL", "Microsoft Excel", "Google Sheets"],
    icon: Database,
    size: "standard",
  },
  {
    no: "03",
    title: "Automation & Scripting",
    label: "WORKFLOW",
    description:
      "Connecting user-facing workflows with lightweight automation for validation, synchronization, import, and export processes.",
    tools: ["Google Apps Script", "Python", "XLSX", "CSV"],
    icon: Workflow,
    size: "standard",
  },
  {
    no: "04",
    title: "Interface & Creative",
    label: "VISUAL SYSTEM",
    description:
      "Supporting development with interface design, visual communication, prototyping, and content production tools.",
    tools: ["Figma", "Illustrator", "Photoshop", "CapCut"],
    icon: PenTool,
    size: "wide",
  },
] as const;

const softSkills = [
  { label: "Problem Solving", icon: BrainCircuit },
  { label: "Critical Thinking", icon: Lightbulb },
  { label: "Teamwork", icon: Users },
  { label: "Communication", icon: MessageCircleMore },
  { label: "Time Management", icon: Clock3 },
] as const;

export default function Services() {
  return (
    <section id="skills" className="skills-studio section-shell section-pad">
      <div className="skills-studio__head">
        <div className="section-kicker mono-label">✦ SKILLS / TOOLKIT</div>
      </div>

      <div className="skills-matrix">
        {technicalGroups.map((group, index) => {
          const Icon = group.icon;
          return (
            <motion.article
              key={group.no}
              className={`skill-module skill-module--${group.size}`}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.22 }}
              transition={{ duration: 0.65, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
              data-cursor="negative"
            >
              <div className="skill-module__scan" aria-hidden="true" />

              <div className="skill-module__top">
                <span className="skill-module__index mono-label">{group.no}</span>
                <span className="skill-module__category mono-label">{group.label}</span>
                <span className="skill-module__icon" aria-hidden="true">
                  <Icon size={19} strokeWidth={1.8} />
                </span>
              </div>

              <div className="skill-module__body">
                <h3>{group.title}</h3>
                <p>{group.description}</p>
              </div>

              <div className="skill-module__tools">
                {group.tools.map((tool) => (
                  <span key={tool}>{tool}</span>
                ))}
              </div>

              <ArrowUpRight className="skill-module__arrow" size={20} strokeWidth={1.6} />
            </motion.article>
          );
        })}
      </div>

      <div className="soft-skill-zone">
        <div className="soft-skill-zone__heading">
          <div>
            <span className="mono-label">SOFT SKILLS</span>
            <h3>How I work with people & problems.</h3>
          </div>
          <p>
            Technical execution works better when the thinking, communication,
            and collaboration behind it are equally structured.
          </p>
        </div>

        <div className="soft-skill-rail">
          {softSkills.map((skill, index) => {
            const Icon = skill.icon;
            return (
              <motion.div
                key={skill.label}
                className="soft-skill-chip"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                data-cursor="negative"
              >
                <span className="soft-skill-chip__icon"><Icon size={17} strokeWidth={1.8} /></span>
                <span>{skill.label}</span>
                <span className="soft-skill-chip__dot" aria-hidden="true" />
              </motion.div>
            );
          })}
        </div>
      </div>

      <style jsx global>{`
        /* =========================================================
           SKILLS STUDIO V5 — compact McLaren / editorial technical matrix
           Self-contained to avoid colliding with earlier service styles.
           ========================================================= */
        .skills-studio {
          position: relative;
          border-top: 1px solid var(--line);
          overflow: hidden;
        }

        .skills-studio::before {
          content: "";
          position: absolute;
          width: min(780px, 62vw);
          aspect-ratio: 1;
          right: -28vw;
          top: 8%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,128,0,.085), rgba(255,128,0,0) 66%);
          pointer-events: none;
          filter: blur(8px);
        }

        .skills-studio.section-pad {
          padding-top: clamp(62px, 5.5vw, 92px);
          padding-bottom: clamp(66px, 5.8vw, 96px);
        }

        .skills-studio__head {
          position: relative;
          z-index: 1;
          display: block;
        }

        .skills-matrix {
          position: relative;
          z-index: 1;
          margin-top: clamp(24px, 2.2vw, 34px);
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          gap: 12px;
        }

        .skill-module {
          position: relative;
          min-height: clamp(230px, 19vw, 320px);
          padding: clamp(22px, 2vw, 30px);
          background:
            linear-gradient(145deg, rgba(255,255,255,.034), rgba(255,255,255,.008)),
            #0e0f11;
          border: 1px solid rgba(255,255,255,.09);
          border-radius: clamp(18px, 1.6vw, 26px);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition:
            transform .58s cubic-bezier(.16,1,.3,1),
            border-color .4s ease,
            background-color .4s ease,
            box-shadow .5s ease;
          isolation: isolate;
        }

        .skill-module--wide { grid-column: span 7; }
        .skill-module--standard { grid-column: span 5; }

        .skill-module:nth-child(3) { grid-column: span 5; }
        .skill-module:nth-child(4) { grid-column: span 7; }

        .skill-module::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          background:
            linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px);
          background-size: 42px 42px;
          opacity: .22;
          mask-image: linear-gradient(to bottom right, #000, transparent 80%);
        }

        .skill-module::after {
          content: "";
          position: absolute;
          width: 240px;
          height: 240px;
          right: -100px;
          bottom: -135px;
          border: 1px solid rgba(255,128,0,.24);
          border-radius: 50%;
          box-shadow:
            0 0 0 34px rgba(255,128,0,.018),
            0 0 0 72px rgba(255,128,0,.012);
          transition: transform .8s cubic-bezier(.16,1,.3,1), border-color .4s ease;
        }

        .skill-module__scan {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(112deg, transparent 28%, rgba(255,128,0,.08) 48%, transparent 68%);
          transform: translateX(-115%);
          transition: transform .9s cubic-bezier(.16,1,.3,1);
        }

        .skill-module:hover {
          transform: translateY(-8px);
          border-color: rgba(255,128,0,.5);
          box-shadow: 0 28px 70px rgba(0,0,0,.32), inset 0 0 0 1px rgba(255,128,0,.055);
        }

        .skill-module:hover::after {
          transform: scale(1.14) translate(-10px, -9px);
          border-color: rgba(255,128,0,.48);
        }

        .skill-module:hover .skill-module__scan {
          transform: translateX(115%);
        }

        .skill-module__top {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 16px;
          align-items: center;
        }

        .skill-module__index {
          color: var(--papaya);
        }

        .skill-module__category {
          color: rgba(255,255,255,.45);
        }

        .skill-module__icon {
          width: 42px;
          height: 42px;
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: #fff;
          background: rgba(255,255,255,.02);
          transition: color .35s ease, border-color .35s ease, transform .5s cubic-bezier(.16,1,.3,1), background .35s ease;
        }

        .skill-module:hover .skill-module__icon {
          color: #0b0c0e;
          background: var(--papaya);
          border-color: var(--papaya);
          transform: rotate(-8deg) scale(1.06);
        }

        .skill-module__body {
          margin-top: auto;
          padding-top: clamp(26px, 3vw, 46px);
          max-width: 690px;
        }

        .skill-module__body h3 {
          margin: 0;
          font-family: var(--font-syne);
          font-size: clamp(32px, 3.1vw, 56px);
          line-height: .96;
          letter-spacing: -.055em;
          font-weight: 600;
          transition: transform .52s cubic-bezier(.16,1,.3,1), color .35s ease;
        }

        .skill-module:hover .skill-module__body h3 {
          transform: translateY(-3px);
          color: #fff;
        }

        .skill-module__body p {
          max-width: 58ch;
          margin: 10px 0 0;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.7;
        }

        .skill-module__tools {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 16px;
          padding-right: 42px;
        }

        .skill-module__tools span {
          display: inline-flex;
          min-height: 31px;
          align-items: center;
          padding: 0 12px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.105);
          color: rgba(255,255,255,.72);
          background: rgba(255,255,255,.025);
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: .075em;
          text-transform: uppercase;
          transition: border-color .35s ease, color .35s ease, background .35s ease, transform .35s ease;
        }

        .skill-module:hover .skill-module__tools span {
          border-color: rgba(255,128,0,.24);
        }

        .skill-module__tools span:hover {
          color: #0b0c0e;
          background: var(--papaya);
          border-color: var(--papaya);
          transform: translateY(-2px);
        }

        .skill-module__arrow {
          position: absolute;
          right: clamp(22px, 2vw, 30px);
          bottom: clamp(22px, 2vw, 30px);
          color: rgba(255,255,255,.24);
          transition: transform .5s cubic-bezier(.16,1,.3,1), color .35s ease;
        }

        .skill-module:hover .skill-module__arrow {
          color: var(--papaya);
          transform: translate(4px, -4px);
        }

        .soft-skill-zone {
          position: relative;
          z-index: 1;
          margin-top: clamp(22px, 2vw, 30px);
          padding-top: clamp(18px, 1.6vw, 24px);
          border-top: 1px solid var(--line);
        }

        .soft-skill-zone__heading {
          display: grid;
          grid-template-columns: 1.1fr .9fr;
          gap: clamp(28px, 4vw, 64px);
          align-items: end;
        }

        .soft-skill-zone__heading .mono-label {
          color: var(--papaya);
        }

        .soft-skill-zone__heading h3 {
          max-width: 18ch;
          margin: 10px 0 0;
          font-family: var(--font-syne);
          font-size: clamp(30px, 3vw, 54px);
          line-height: .98;
          letter-spacing: -.052em;
          font-weight: 600;
        }

        .soft-skill-zone__heading p {
          max-width: 560px;
          margin: 0;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.7;
        }

        .soft-skill-rail {
          margin-top: clamp(14px, 1.4vw, 20px);
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 10px;
        }

        .soft-skill-chip {
          position: relative;
          min-height: 74px;
          padding: 15px 16px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 12px;
          align-items: center;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.09);
          border-radius: 17px;
          background: rgba(255,255,255,.018);
          color: rgba(255,255,255,.82);
          font-size: 12px;
          transition: transform .45s cubic-bezier(.16,1,.3,1), border-color .35s ease, background .35s ease;
        }

        .soft-skill-chip::before {
          content: "";
          position: absolute;
          inset: auto 0 0;
          height: 2px;
          background: var(--papaya);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform .48s cubic-bezier(.16,1,.3,1);
        }

        .soft-skill-chip:hover {
          transform: translateY(-5px);
          border-color: rgba(255,128,0,.38);
          background: rgba(255,128,0,.035);
        }

        .soft-skill-chip:hover::before {
          transform: scaleX(1);
        }

        .soft-skill-chip__icon {
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: rgba(255,128,0,.08);
          color: var(--papaya);
        }

        .soft-skill-chip__dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: rgba(255,255,255,.3);
          transition: background .35s ease, box-shadow .35s ease;
        }

        .soft-skill-chip:hover .soft-skill-chip__dot {
          background: var(--papaya);
          box-shadow: 0 0 12px rgba(255,128,0,.75);
        }

        @media (max-width: 1050px) {
          .skill-module--wide,
          .skill-module--standard,
          .skill-module:nth-child(3),
          .skill-module:nth-child(4) {
            grid-column: span 6;
          }

          .soft-skill-rail {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .skills-matrix {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .skill-module--wide,
          .skill-module--standard,
          .skill-module:nth-child(3),
          .skill-module:nth-child(4) {
            grid-column: 1;
          }

          .skill-module {
            min-height: 300px;
          }

          .soft-skill-zone__heading {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .soft-skill-rail {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 480px) {
          .skills-studio.section-pad {
            padding-top: 54px;
            padding-bottom: 62px;
          }

          .skill-module {
            min-height: 278px;
            padding: 20px;
            border-radius: 18px;
          }

          .skill-module__body {
            padding-top: 34px;
          }

          .skill-module__body h3 {
            font-size: 36px;
          }

          .soft-skill-rail {
            grid-template-columns: 1fr;
          }

          .soft-skill-chip {
            min-height: 72px;
          }
        }

        @media (hover: none), (pointer: coarse) {
          .skill-module:hover,
          .soft-skill-chip:hover {
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}
