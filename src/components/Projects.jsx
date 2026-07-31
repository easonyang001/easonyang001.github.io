import { motion } from "framer-motion";
import { projects } from "../data/projects.js";

const statusColors = {
  Ongoing: "bg-emerald-500/10 text-emerald-400",
  "In Development": "bg-amber-500/10 text-amber-400",
  Research: "bg-accent/10 text-accent",
};

export default function Projects() {
  return (
    <section id="projects" className="section-container">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="section-heading"
      >
        Projects
      </motion.h2>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {projects.map((project, i) => (
          <motion.div
            key={project.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.05, ease: "easeOut" }}
            whileHover={{ y: -6 }}
            className="glass-card flex flex-col p-6 transition-shadow hover:shadow-glow"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">
                {project.title}
              </h3>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
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
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-text-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>

            <button className="mt-6 self-start text-sm font-semibold text-accent transition-colors hover:text-accent/80">
              Read More &rarr;
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
