"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { journey } from "@/data/portfolio";
import TextReveal from "./TextReveal";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { number: 3.9, decimals: 1, suffix: "", label: "GPA / 4.00" },
  { number: 4, decimals: 0, suffix: "", label: "Featured projects" },
  { number: 2, decimals: 0, suffix: "", label: "Internship projects" },
  { number: 4, decimals: 0, suffix: "", label: "Core technical areas" },
];

export default function Snapshot() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!root.current) return;

    const counters = root.current.querySelectorAll<HTMLElement>("[data-counter]");
    const profileItems = root.current.querySelectorAll<HTMLElement>("[data-profile-item]");

    const ctx = gsap.context(() => {
      counters.forEach((counter) => {
        const target = Number(counter.dataset.counter || 0);
        const decimals = Number(counter.dataset.decimals || 0);
        const obj = { value: 0 };

        gsap.to(obj, {
          value: target,
          duration: 1.5,
          ease: "power3.out",
          scrollTrigger: { trigger: counter, start: "top 88%", once: true },
          onUpdate: () => {
            counter.textContent = obj.value.toFixed(decimals);
          },
        });
      });

      gsap.from(profileItems, {
        y: 28,
        opacity: 0,
        duration: 0.75,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".profile-history",
          start: "top 82%",
          once: true,
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="profile" className="snapshot profile-section section-shell section-pad">
      <div className="section-kicker mono-label">✦ PROFILE / SNAPSHOT</div>

      <div className="snapshot-intro snapshot-intro--profile">
        <div className="profile-bio negative-hover" data-cursor="negative">
          <div className="negative-hover__inner">
            <span className="mono-label">ABOUT ME</span>
            <p>
              I&apos;m Rayhan Fakhri Risqullah, an Informatics Engineering student at Universitas Nasional in Jakarta with a 3.9/4.00 GPA and a strong interest in data and system development. I build web applications, dashboards, and database-driven systems with a focus on clarity and usability, combining database thinking, web development, interface design, and practical automation.
            </p>
          </div>
        </div>

        <h2 className="profile-statement">
          <TextReveal text="Data with clarity." />
          <br />
          <TextReveal text="Code with purpose." delay={0.08} />
        </h2>
      </div>

      <div className="snapshot-grid snapshot-grid--compact">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="stat-card negative-hover negative-hover--stat"
            data-cursor="negative"
          >
            <div className="negative-hover__inner">
              <div className="stat-card__number">
                <span data-counter={stat.number} data-decimals={stat.decimals}>0</span>
                <span>{stat.suffix}</span>
              </div>
              <p>{stat.label}</p>
            </div>
          </article>
        ))}
      </div>

      <div id="journey" className="profile-history">
        <div className="profile-history__heading">
          <div>
            <span className="mono-label">EDUCATION / ORGANIZATION</span>
            <h3>A compact view of the path behind the work.</h3>
          </div>
          <p>
            Academic foundations and organizational experience that shaped how I approach collaboration, responsibility, and technical problem solving.
          </p>
        </div>

        <div className="profile-history__list">
          {journey.map((item, index) => (
            <article
              className="profile-history__item negative-hover negative-hover--history"
              data-profile-item
              data-cursor="negative"
              key={`${item.type}-${item.title}`}
            >
              <div className="negative-hover__inner">
                <div className="profile-history__meta">
                  <span className="profile-history__index mono-label">0{index + 1}</span>
                  <span className="profile-history__type mono-label">{item.type}</span>
                  <span className="profile-history__period mono-label">{item.period}</span>
                </div>

                <div className="profile-history__content">
                  <h4>{item.title}</h4>
                  <strong>{item.organization}</strong>
                  <p>{item.description}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
