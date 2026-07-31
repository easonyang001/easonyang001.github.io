import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="about" className="section-container">
      <div className="grid gap-12 md:grid-cols-2 md:items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="section-heading">About the Institute</h2>
          <p className="mt-6 text-base leading-relaxed text-text-secondary md:text-lg">
            Mrama Institute for Quantum Information and Intelligence is an
            independent research initiative dedicated to advancing quantum
            information science, quantum machine learning, intelligent
            optimization, and hybrid quantum-classical computing.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="glass-card p-8"
        >
          <h3 className="text-sm font-semibold uppercase tracking-widest text-accent">
            Mission
          </h3>
          <p className="mt-4 text-lg leading-relaxed text-text-primary">
            Bridge theoretical research with practical engineering
            applications.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
