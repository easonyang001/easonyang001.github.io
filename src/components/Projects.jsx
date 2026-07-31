import { motion } from "framer-motion";
import { projects } from "../data/projects.js";
import SectionHeading from "./SectionHeading.jsx";

export default function Projects() {
  return (
    <section id="projects" className="section-container border-t border-border">
      <SectionHeading
        index="02"
        eyebrow="Projects"
        title="Projects"
        description="Applied research initiatives translating quantum and optimization theory into working systems."
      />

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {projects.map((project, i) => (
          <motion.div
            key={project.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: i * 0.06, ease: "easeOut" }}
            className="glass-card flex flex-col p-8"
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-h3 text-text-primary">{project.title}</h3>
              <span className="shrink-0 rounded-md bg-accent-subtle px-2 py-1 font-mono text-mono-label uppercase text-accent">
                {project.status}
              </span>
            </div>

            <p className="mt-3 flex-1 text-small text-text-secondary">
              {project.description}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-border px-2 py-1 font-mono text-mono-label uppercase text-text-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>

            <a
              href="#"
              className="mt-6 self-start text-small font-medium text-accent transition-colors duration-150 hover:text-accent-hover"
            >
              Read More &rarr;
            </a>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
