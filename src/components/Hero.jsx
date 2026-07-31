import { motion } from "framer-motion";
import { useMemo } from "react";

function Particles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 2 + 1,
        duration: Math.random() * 8 + 8,
        delay: Math.random() * 6,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-accent/40"
          style={{
            top: `${p.top}%`,
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{ opacity: [0.15, 0.6, 0.15], y: [0, -16, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background"
    >
      <div className="grid-bg absolute inset-0 opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
      <Particles />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-5xl font-bold tracking-tight text-text-primary md:text-7xl"
        >
          Mrama Institute
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="mt-4 text-lg font-medium text-accent md:text-2xl"
        >
          for Quantum Information and Intelligence
        </motion.p>

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
          transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <a
            href="#research"
            className="rounded-full bg-accent px-8 py-3 text-sm font-semibold text-text-primary shadow-glow transition-transform hover:scale-105"
          >
            Explore Research
          </a>
          <a
            href="#publications"
            className="rounded-full border border-white/10 bg-surface/60 px-8 py-3 text-sm font-semibold text-text-primary backdrop-blur-sm transition-transform hover:scale-105"
          >
            Publications
          </a>
        </motion.div>
      </div>
    </section>
  );
}
