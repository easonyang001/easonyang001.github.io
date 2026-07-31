import { motion } from "framer-motion";
import SplitText from "./reactbits/SplitText.jsx";
import DecryptedText from "./reactbits/DecryptedText.jsx";
import ShinyText from "./reactbits/ShinyText.jsx";

function QuantumOrbital() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 opacity-70 md:h-[760px] md:w-[760px]">
      <div className="absolute inset-0 rounded-full bg-radial-glow blur-2xl" />

      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full animate-spin-slow">
        <ellipse cx="200" cy="200" rx="180" ry="70" stroke="#2563EB" strokeOpacity="0.35" strokeWidth="1" fill="none" />
        <ellipse
          cx="200"
          cy="200"
          rx="180"
          ry="70"
          stroke="#2563EB"
          strokeOpacity="0.35"
          strokeWidth="1"
          fill="none"
          transform="rotate(60 200 200)"
        />
        <circle cx="380" cy="200" r="3" fill="#2563EB" />
        <circle cx="20" cy="200" r="3" fill="#2563EB" />
      </svg>

      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full animate-spin-slow-reverse">
        <ellipse
          cx="200"
          cy="200"
          rx="180"
          ry="70"
          stroke="#94A3B8"
          strokeOpacity="0.25"
          strokeWidth="1"
          fill="none"
          transform="rotate(120 200 200)"
        />
        <circle cx="311" cy="330" r="2.5" fill="#94A3B8" />
        <circle cx="89" cy="70" r="2.5" fill="#94A3B8" />
      </svg>

      <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-glow" />
    </div>
  );
}

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background"
    >
      <div className="grid-bg absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      <QuantumOrbital />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="eyebrow justify-center"
        >
          <span className="eyebrow-rule" />
          <ShinyText text="Independent Research Institute" speed={4} />
          <span className="eyebrow-rule" />
        </motion.div>

        <h1 className="mt-6 text-6xl font-semibold tracking-tight text-text-primary md:text-7xl lg:text-8xl">
          <SplitText text="Mrama Institute" splitBy="chars" staggerDelay={0.03} delay={0.1} />
        </h1>

        <p className="mt-5 text-lg font-medium text-accent md:text-2xl">
          <DecryptedText text="for Quantum Information and Intelligence" revealDelay={700} speed={28} />
        </p>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg"
        >
          Advancing Quantum Information, Artificial Intelligence, and Intelligent
          Optimization.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <a
            href="#research"
            className="group relative overflow-hidden rounded-full bg-accent px-8 py-3 text-sm font-semibold text-text-primary shadow-glow transition-transform duration-300 hover:scale-[1.03]"
          >
            <span className="relative z-10">Explore Research</span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </a>
          <a
            href="#publications"
            className="rounded-full border border-line bg-surface/60 px-8 py-3 text-sm font-semibold text-text-primary backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:border-accent/50"
          >
            Publications
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-9 w-6 items-start justify-center rounded-full border border-line p-1.5"
        >
          <span className="h-1.5 w-1 rounded-full bg-accent" />
        </motion.div>
      </motion.div>
    </section>
  );
}
