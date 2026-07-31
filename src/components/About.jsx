import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading.jsx";

export default function About() {
  return (
    <section id="about" className="section-container border-t border-border">
      <div className="grid gap-12 md:grid-cols-2 md:items-center md:gap-16">
        <SectionHeading eyebrow="About" title="About the Institute" />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4, delay: 0.06, ease: "easeOut" }}
        >
          <p className="max-w-prose text-body-lg text-text-secondary">
            Mrama Institute for Quantum Information and Intelligence is an
            independent research initiative dedicated to advancing quantum
            information science, quantum machine learning, intelligent
            optimization, and hybrid quantum-classical computing.
          </p>

          <div className="glass-card mt-8 p-8">
            <p className="font-mono text-mono-label uppercase text-accent">Mission</p>
            <p className="mt-4 text-body-lg text-text-primary">
              Bridge theoretical research with practical engineering
              applications.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
