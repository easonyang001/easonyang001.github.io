import { motion } from "framer-motion";
import { researchAreas } from "../data/research.js";

export default function Research() {
  return (
    <section id="research" className="section-container">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="section-heading"
      >
        Research Areas
      </motion.h2>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {researchAreas.map((area, i) => {
          const Icon = area.icon;
          return (
            <motion.div
              key={area.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: "easeOut" }}
              whileHover={{ y: -6 }}
              className="glass-card group p-6 transition-shadow hover:shadow-glow"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent/20">
                <Icon size={24} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-text-primary">
                {area.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {area.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
