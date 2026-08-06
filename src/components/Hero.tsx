import { useLayoutEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import IntroOverlay from "./IntroOverlay.tsx";
import HeroParticles from "./HeroParticles.tsx";
import HeroQuantumNetwork from "./HeroQuantumNetwork.tsx";
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
      className="hero-scientific relative isolate flex w-full min-h-screen flex-col justify-center overflow-hidden bg-background pt-[120px] pb-16 md:pt-[136px] md:pb-24"
    >
      {/*
        "Scientific elegance" background composition -- quantum network +
        circuit traces + city horizon + ambient light + near-invisible
        particles. Local blue/cyan colors here are a one-off exception for
        this Hero only; the rest of the site stays on the violet accent
        system in tailwind.config.js. Scoped to this component so nothing
        global changes.
      */}
      <style>{`
        .hero-scientific::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          background:
            radial-gradient(circle at 72% 26%, rgba(37, 99, 235, 0.16), transparent 34%),
            radial-gradient(circle at 48% 82%, rgba(34, 211, 238, 0.08), transparent 38%),
            linear-gradient(180deg, #01040b 0%, #020817 42%, #041127 78%, #0a1e3c 100%);
        }

        .hero-ambient-light {
          background: radial-gradient(circle, rgba(37, 99, 235, 0.18), transparent 65%);
          animation: hero-ambient-breathe 10s ease-in-out infinite;
        }

        .hero-network-pulse {
          animation: hero-network-pulse 6s ease-in-out infinite;
        }

        @keyframes hero-ambient-breathe {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }

        @keyframes hero-network-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-ambient-light,
          .hero-network-pulse {
            animation: none !important;
          }
        }

        /* Homepage Hero nav links only (Solutions / Publications) -- an
           underline + arrow style replacing the old filled/bordered
           buttons. Each instance sets --nav-grad-from/--nav-grad-to via
           inline style; the arrow stays a fixed near-white regardless of
           the underline color so it doesn't compete with either gradient. */
        .hero-nav-underline-base {
          background: linear-gradient(90deg, var(--nav-grad-from), var(--nav-grad-to));
          opacity: 0.7;
        }
        .hero-nav-underline-fill {
          background: linear-gradient(90deg, var(--nav-grad-from), var(--nav-grad-to));
          opacity: 1;
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

      {/*
        Background image layer -- pure full-bleed background (position:
        absolute, inset:0, z-index:-1), not a positioned box competing with
        the text column for horizontal space. Text is right-aligned, so the
        scrim darkens the RIGHT side (behind the text) and leaves the photo
        visible on the left -- which is also where Taipei 101 actually sits
        in the source photo, so the tower stays the visible subject instead
        of being cropped out or hidden under the scrim.
      */}
      <div className="pointer-events-none absolute inset-0 z-[-1]">
        <img
          src="/visuals/taipei-skyline.webp"
          alt=""
          aria-hidden="true"
          className="h-full w-full max-w-full object-cover object-left-top opacity-30 md:opacity-90"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to right, transparent 20%, #020617 65%)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
      </div>

      <div
        aria-hidden="true"
        className="hero-ambient-light pointer-events-none absolute left-[8%] top-[30%] h-[420px] w-[420px] md:h-[560px] md:w-[560px]"
      />
      <HeroParticles />
      <HeroQuantumNetwork />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={heroRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative w-full px-6 md:px-12"
      >
        <div className="mx-auto max-w-content md:flex md:justify-end">
          <div className="w-full max-w-[720px] overflow-visible">
            <h1 className="whitespace-normal overflow-visible text-[40px] font-medium leading-[0.95] tracking-[-0.035em] text-text-primary md:text-[clamp(56px,7vw,96px)]">
              {site.name}
            </h1>

            <p className="mt-4 whitespace-normal text-[clamp(1.25rem,1.1rem_+_0.6vw,1.625rem)] font-normal text-text-primary">
              {site.tagline}
            </p>

            <p className="mt-8 text-[clamp(1rem,0.95rem_+_0.2vw,1.125rem)] leading-[1.6] text-text-secondary">
              {site.description}
            </p>

            <div className="mt-12 flex flex-col items-start gap-6">
              <Link
                to="/solutions"
                className="hero-nav-link group inline-flex w-fit items-center gap-2 text-body-lg font-medium text-text-primary transition-colors duration-200 ease-out hover:text-white"
                style={{
                  ["--nav-grad-from" as string]: "#FDBA74",
                  ["--nav-grad-to" as string]: "#EA580C",
                }}
              >
                <span className="relative inline-block pb-1">
                  Solutions
                  <span className="hero-nav-underline-base pointer-events-none absolute inset-x-0 bottom-0 block h-[1.5px]" />
                  <span className="hero-nav-underline-fill pointer-events-none absolute inset-x-0 bottom-0 block h-[1.5px] origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100" />
                </span>
                <ArrowRight
                  size={16}
                  strokeWidth={1.5}
                  className="text-text-primary transition-transform duration-200 ease-out group-hover:translate-x-1.5"
                />
              </Link>
              <a
                href="#publications"
                className="hero-nav-link group inline-flex w-fit items-center gap-2 text-body-lg font-medium text-text-primary transition-colors duration-200 ease-out hover:text-white"
                style={{
                  ["--nav-grad-from" as string]: "#3B82F6",
                  ["--nav-grad-to" as string]: "#8B5CF6",
                }}
              >
                <span className="relative inline-block pb-1">
                  Publications
                  <span className="hero-nav-underline-base pointer-events-none absolute inset-x-0 bottom-0 block h-[1.5px]" />
                  <span className="hero-nav-underline-fill pointer-events-none absolute inset-x-0 bottom-0 block h-[1.5px] origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100" />
                </span>
                <ArrowRight
                  size={16}
                  strokeWidth={1.5}
                  className="text-text-primary transition-transform duration-200 ease-out group-hover:translate-x-1.5"
                />
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
