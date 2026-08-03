import { motion } from "framer-motion";
import AboutCircuitBackground from "./AboutCircuitBackground.tsx";

export default function AboutHero() {
  return (
    <section className="section-container relative overflow-hidden border-t border-border">
      <AboutCircuitBackground />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative max-w-prose"
      >
        <h1 className="text-h2 md:text-h2-lg text-text-primary">About the Institute</h1>

        <p className="mt-6 text-body-lg text-text-secondary">
          Mrama Institute for Quantum Information and Intelligence is an independent research
          initiative dedicated to advancing quantum information science, quantum machine learning,
          intelligent optimization, and hybrid quantum-classical computing.
        </p>

        <div className="mt-8 max-w-prose">
          <p className="font-mono text-mono-label uppercase text-text-muted">Why Mrama</p>
          <p className="mt-4 text-body-lg text-text-secondary">
            Most quantum computing research happens inside universities and large corporate labs,
            where the agenda follows department priorities or product roadmaps. Mrama started as a
            way to work on quantum optimization and quantum machine learning problems on their own
            terms — driven by the problems themselves, not by where a funding cycle points next.
          </p>
        </div>

        <div className="mt-8 max-w-prose">
          <p className="font-mono text-mono-label uppercase text-text-muted">Organization</p>
          <p className="mt-4 text-body-lg text-text-secondary">
            Mrama Institute is an independent research project, currently led by a single
            researcher, self-funded, and not a registered legal entity. Research is focused on
            practical applications of quantum optimization and quantum machine learning.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
