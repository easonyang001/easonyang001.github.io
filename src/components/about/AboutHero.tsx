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
          <p className="section-kicker">Our Story</p>
          <div className="mt-4 space-y-4 text-body-lg text-text-secondary">
            <p>
              Mrama began with Chia-Chen in Taiwan and Alexandre in France, two young researchers
              who found in each other the same passion for understanding difficult problems and
              building ideas that could move beyond the page.
            </p>
            <p>
              Across different cultures, languages, and time zones, their conversations kept
              returning to the same questions: how quantum information could reshape computation,
              how intelligent systems could help solve real-world problems, and how research could
              remain open, curious, and useful.
            </p>
            <p>
              That shared curiosity became a commitment. Together, they founded Mrama as the kind
              of research institute they wanted to see in the world: independent in thought,
              international in spirit, and driven by the belief that ambitious science can begin
              with a small team and genuine passion.
            </p>
          </div>
        </div>

        <div className="mt-8 max-w-prose">
          <p className="section-kicker">Organization</p>
          <p className="mt-4 text-body-lg text-text-secondary">
            Mrama Institute is an independent, self-funded research project co-founded across
            Taiwan and France. It is not yet a registered legal entity. Its work focuses on
            practical research in quantum information, quantum optimization, quantum machine
            learning, and intelligent systems.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
