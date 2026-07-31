import { motion } from "framer-motion";
import { researchAreas } from "../data/research.js";
import SectionHeading from "./SectionHeading.jsx";

export default function Research() {
  return (
    <section id="research" className="section-container border-t border-border">
      <SectionHeading
        index="01"
        eyebrow="Research"
        title="Research Areas"
        description="Core disciplines that define our research program, from foundational quantum information theory to applied intelligent optimization."
      />

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {researchAreas.map((area, i) => {
          const Icon = area.icon;
          return (
            <motion.div
              key={area.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: "easeOut" }}
              className="glass-card p-8"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-subtle text-accent">
                <Icon size={20} />
              </div>
              <h3 className="mt-5 text-h3 text-text-primary">{area.title}</h3>
              <p className="mt-2 text-small text-text-secondary">{area.description}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
