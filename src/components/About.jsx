import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading.jsx";

export default function About() {
  return (
    <section id="about" className="section-container border-t border-line">
      <div className="grid gap-12 md:grid-cols-2 md:items-center md:gap-16">
        <SectionHeading eyebrow="About" title="About the Institute" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        >
          <p className="text-base leading-relaxed text-text-secondary md:text-lg">
            Mrama Institute for Quantum Information and Intelligence is an
            independent research initiative dedicated to advancing quantum
            information science, quantum machine learning, intelligent
            optimization, and hybrid quantum-classical computing.
          </p>

          <div className="glass-card mt-8 p-8">
            <h3 className="text-xs font-semibold uppercase tracking-widest2 text-accent">
              Mission
            </h3>
            <p className="mt-4 text-lg leading-relaxed text-text-primary">
              Bridge theoretical research with practical engineering
              applications.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
