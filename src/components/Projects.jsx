import { motion } from "framer-motion";
import { projects } from "../data/projects.js";
import SectionHeading from "./SectionHeading.jsx";
import SpotlightCard from "./reactbits/SpotlightCard.jsx";

const statusColors = {
  Ongoing: "bg-emerald-500/10 text-emerald-400",
  "In Development": "bg-amber-500/10 text-amber-400",
  Research: "bg-accent/10 text-accent",
};

export default function Projects() {
  return (
    <section id="projects" className="section-container border-t border-line">
      <SectionHeading
        index="02"
        eyebrow="Projects"
        title="Projects"
        description="Applied research initiatives translating quantum and optimization theory into working systems."
      />

      <div className="mt-14 grid gap-6 sm:grid-cols-2">
        {projects.map((project, i) => (
          <motion.div
            key={project.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.05, ease: "easeOut" }}
            whileHover={{ y: -6 }}
          >
            <SpotlightCard
              className="glass-card h-full p-6 hover:border-accent/30 hover:shadow-card-hover"
              contentClassName="flex h-full flex-col"
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-text-primary">
                  {project.title}
                </h3>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                    statusColors[project.status] ?? "bg-white/5 text-text-secondary"
                  }`}
                >
                  {project.status}
                </span>
              </div>

              <p className="mt-3 flex-1 text-sm leading-relaxed text-text-secondary">
                {project.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-line px-3 py-1 text-xs text-text-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <button className="group mt-6 flex items-center gap-1.5 self-start text-sm font-semibold text-accent">
                Read More
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  &rarr;
                </span>
              </button>
            </SpotlightCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
