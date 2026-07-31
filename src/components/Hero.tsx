import { motion } from "framer-motion";
import SimpleBlochSphere from "./SimpleBlochSphere.tsx";
import { site } from "../data/site.ts";

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen overflow-hidden bg-background">
      <div className="grid-bg absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

      <div className="pointer-events-none absolute right-[-15%] top-1/2 h-[560px] w-[560px] -translate-y-1/2 opacity-40 md:right-[-5%] md:h-[720px] md:w-[720px]">
        <SimpleBlochSphere className="pointer-events-auto" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="absolute left-0 top-[55%] w-full -translate-y-1/2 px-6 md:px-12"
      >
        <div className="mx-auto max-w-content">
          <div className="eyebrow">
            <span className="eyebrow-rule" />
            Independent Research Institute
          </div>

          <h1 className="mt-6 max-w-[800px] text-display text-text-primary md:text-display-lg">
            {site.name}
          </h1>

          <p className="mt-4 max-w-[800px] text-body-lg font-medium text-accent md:text-body-lg-lg">
            {site.tagline}
          </p>

          <p className="mt-8 max-w-[500px] text-body-lg text-text-secondary">{site.description}</p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
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
        </div>
      </motion.div>
    </section>
  );
}
