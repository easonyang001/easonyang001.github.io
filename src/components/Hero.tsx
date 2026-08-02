import { useLayoutEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SimpleBlochSphere from "./SimpleBlochSphere.tsx";
import IntroOverlay from "./IntroOverlay.tsx";
import { site } from "../data/site.ts";

const INTRO_SEEN_KEY = "mrama-intro-seen";

export default function Hero() {
  const [showIntro, setShowIntro] = useState(false);
  const [heroRevealed, setHeroRevealed] = useState(false);

  useLayoutEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = sessionStorage.getItem(INTRO_SEEN_KEY) === "1";
    if (reduced || seen) {
      sessionStorage.setItem(INTRO_SEEN_KEY, "1");
      setHeroRevealed(true);
    } else {
      setShowIntro(true);
    }
  }, []);

  return (
    <section
      id="home"
      className="hero-portrait relative isolate flex min-h-screen flex-col justify-center overflow-x-hidden bg-background pt-[120px] pb-16 md:pt-[136px] md:pb-24"
    >
      {/*
        Portrait background layer. Scoped to this component (not index.css) so the
        shared stylesheet and tailwind.config.js stay untouched, per spec.
        Sits behind everything via isolation:isolate + z-index:-1 on the ::before,
        so it never affects text contrast — grid-bg, the gradient overlay, and the
        text layer all stack above it.
        Requires public/brand/portrait.webp (+ portrait@2x.webp) to exist; until then
        this rule has nothing to paint and is inert.
      */}
      <style>{`
        .hero-portrait::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          background-image: image-set(
            url("/brand/portrait.webp") 1x,
            url("/brand/portrait@2x.webp") 2x
          );
          background-size: cover;
          background-position: 70% 25%;
          background-repeat: no-repeat;
          opacity: 0.12;
          filter: grayscale(1) contrast(1.2) brightness(1.1);
          mask-image: radial-gradient(ellipse 70% 60% at 70% 30%, #000 35%, transparent 75%);
          -webkit-mask-image: radial-gradient(ellipse 70% 60% at 70% 30%, #000 35%, transparent 75%);
          mask-repeat: no-repeat;
          -webkit-mask-repeat: no-repeat;
        }

        @media (max-width: 767px) {
          .hero-portrait::before {
            display: none;
          }
        }
      `}</style>

      {showIntro && (
        <IntroOverlay
          onExitStart={() => setHeroRevealed(true)}
          onDone={() => {
            setShowIntro(false);
            sessionStorage.setItem(INTRO_SEEN_KEY, "1");
          }}
        />
      )}

      <div className="grid-bg absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

      <div className="pointer-events-none absolute right-[-15%] top-1/2 h-[560px] w-[560px] -translate-y-1/2 opacity-40 md:right-[-5%] md:h-[720px] md:w-[720px]">
        <SimpleBlochSphere className="pointer-events-auto" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={heroRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative w-full px-6 md:px-12"
      >
        <div className="mx-auto max-w-content">
          <h1 className="max-w-[800px] text-display text-text-primary md:text-display-lg">
            {site.name}
          </h1>

          <p className="mt-4 max-w-[800px] text-[26px] font-normal text-text-primary">
            {site.tagline}
          </p>

          <p className="mt-8 max-w-[500px] text-body-lg text-text-secondary">{site.description}</p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              to="/solutions"
              className="rounded-md bg-accent px-8 py-3 text-small font-medium text-text-primary transition-colors duration-150 hover:bg-accent-hover"
            >
              Solutions
            </Link>
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
