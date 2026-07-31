import { motion } from "framer-motion";
import Particles from "./Particles.jsx";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background"
    >
      <div className="absolute inset-0">
        <Particles />
      </div>
      <div className="grid-bg absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 mx-auto max-w-content px-6 text-center md:px-12"
      >
        <div className="eyebrow justify-center">
          <span className="eyebrow-rule" />
          Independent Research Institute
          <span className="eyebrow-rule" />
        </div>

        <h1 className="mt-6 text-h1 md:text-h1-lg text-text-primary">Mrama Institute</h1>

        <p className="mt-4 text-body-lg md:text-body-lg-lg font-medium text-accent">
          for Quantum Information and Intelligence
        </p>

        <p className="mx-auto mt-8 max-w-prose text-body-lg text-text-secondary">
          Advancing Quantum Information, Artificial Intelligence, and Intelligent
          Optimization.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#research"
            className="rounded-md bg-accent px-8 py-3 text-small font-medium text-text-primary transition-colors duration-150 hover:bg-accent-hover"
          >
            Explore Research
          </a>
          <a
            href="#publications"
            className="rounded-md border border-border px-8 py-3 text-small font-medium text-text-primary transition-colors duration-150 hover:border-border-strong"
          >
            Publications
          </a>
        </div>
      </motion.div>
    </section>
  );
}
