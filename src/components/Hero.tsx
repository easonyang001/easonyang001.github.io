import { useEffect, useLayoutEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import IntroOverlay from "./IntroOverlay.tsx";
import HeroParticles from "./HeroParticles.tsx";
import HeroQuantumNetwork from "./HeroQuantumNetwork.tsx";
import casanBackground from "./about/casan (2).png";
import parisBackground from "./about/paris.png";
import { site } from "../data/site.ts";

const INTRO_SEEN_KEY = "mrama-intro-seen";
const HERO_BACKGROUND_ROTATION_MS = 2400;
const HERO_BACKGROUND_FADE_MS = 1100;
const HERO_BACKGROUND_PREP_MS = 550;
const HERO_CONTENT_DELAY_MS = 700;
const HERO_CONTENT_DURATION_MS = 1200;

const heroBackgrounds = ["/visuals/taipei-skyline.webp", casanBackground, parisBackground] as const;

export default function Hero() {
  const [showIntro, setShowIntro] = useState(false);
  const [activeBackground, setActiveBackground] = useState(0);
  const [contentVisible, setContentVisible] = useState(false);
  const [backgroundPrep, setBackgroundPrep] = useState(false);

  useLayoutEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const seen = sessionStorage.getItem(INTRO_SEEN_KEY) === "1";
    if (reduced || seen || mobile) {
      sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    } else {
      setShowIntro(true);
    }
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let prepTimer = 0;
    let swapTimer = 0;
    let nextCycleTimer = 0;
    let cancelled = false;

    const scheduleCycle = () => {
      if (cancelled) return;

      const prepLeadMs = Math.max(HERO_BACKGROUND_ROTATION_MS - HERO_BACKGROUND_PREP_MS, 0);
      prepTimer = window.setTimeout(() => {
        if (cancelled) return;
        setBackgroundPrep(true);
        swapTimer = window.setTimeout(() => {
          if (cancelled) return;
          setActiveBackground((current) => (current + 1) % heroBackgrounds.length);
          setBackgroundPrep(false);
          nextCycleTimer = window.setTimeout(scheduleCycle, 0);
        }, HERO_BACKGROUND_PREP_MS);
      }, prepLeadMs);
    };

    nextCycleTimer = window.setTimeout(scheduleCycle, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(prepTimer);
      window.clearTimeout(swapTimer);
      window.clearTimeout(nextCycleTimer);
    };
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setContentVisible(true);
      return;
    }

    const id = window.setTimeout(() => setContentVisible(true), HERO_CONTENT_DELAY_MS);
    return () => window.clearTimeout(id);
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

        .hero-bg-image {
          animation: hero-bg-scale 12s ease-in-out infinite alternate;
          transform-origin: center center;
          will-change: transform, opacity;
        }

        .hero-bg-image--active {
          filter: saturate(1.05) contrast(1.03);
        }

        .hero-bg-image--prep {
          filter: saturate(1.12) contrast(1.06) brightness(0.95);
          transform: scale(1.03);
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

        @keyframes hero-bg-scale {
          0% { transform: scale(1); }
          100% { transform: scale(1.05); }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-bg-image,
          .hero-ambient-light,
          .hero-network-pulse {
            animation: none !important;
            transition: none !important;
          }

          .hero-bg-image {
            transform: none !important;
          }
          .hero-bg-image--prep,
          .hero-bg-image--active {
            filter: none !important;
          }
        }

        .hero-nav-underline-base {
          background: linear-gradient(90deg, var(--nav-grad-from), var(--nav-grad-to));
          opacity: 0.75;
        }
        .hero-nav-underline-fill {
          background: linear-gradient(90deg, var(--nav-grad-from), var(--nav-grad-to));
          opacity: 1;
        }

        .hero-mobile-scrim {
          background: linear-gradient(to right, transparent 20%, #020617 65%);
        }

        @media (max-width: 767px) {
          .hero-scientific::before {
            background:
              radial-gradient(circle at 72% 26%, rgba(37, 99, 235, 0.08), transparent 34%),
              radial-gradient(circle at 48% 82%, rgba(34, 211, 238, 0.05), transparent 38%),
              linear-gradient(180deg, rgba(1, 4, 11, 0.28) 0%, rgba(2, 8, 23, 0.28) 42%, rgba(4, 17, 39, 0.42) 100%);
          }

          .hero-bg-image {
            object-position: center top;
          }

          .hero-bg-image--active {
            filter: saturate(1.08) contrast(1.02) brightness(1.08);
          }

          .hero-mobile-scrim {
            background: linear-gradient(180deg, rgba(2, 6, 23, 0.04) 0%, rgba(2, 6, 23, 0.08) 60%, rgba(2, 6, 23, 0.22) 100%);
          }
        }

      `}</style>

      {showIntro && (
        <IntroOverlay
          onExitStart={() => {}}
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
        {heroBackgrounds.map((src, index) => (
          <img
            key={src}
            src={src}
            alt=""
            aria-hidden="true"
            className={`hero-bg-image absolute inset-0 h-full w-full max-w-full object-cover object-left-top ${
              activeBackground === index ? "hero-bg-image--active" : ""
            } ${backgroundPrep && activeBackground === index ? "hero-bg-image--prep" : ""}`}
            style={{
              opacity: activeBackground === index ? (backgroundPrep ? 0.92 : 1) : 0,
              transition: `opacity ${HERO_BACKGROUND_FADE_MS}ms ease-in-out`,
            }}
          />
        ))}
        <div
          className={`absolute inset-0 transition-opacity duration-700 ease-out ${
            backgroundPrep ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background:
              "radial-gradient(circle at 56% 34%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 28%, transparent 62%)",
          }}
        />
        <div
          className="hero-mobile-scrim absolute inset-0"
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
        initial={false}
        className="relative z-10 w-full px-6 md:px-12"
      >
        <div className="mx-auto max-w-content md:flex md:justify-end">
          <div className="w-full max-w-[1040px] overflow-visible md:translate-x-28">
            <div className="flex flex-col gap-4 md:gap-5">
              <motion.h1
                initial={false}
                animate={
                  contentVisible
                    ? { opacity: 1, y: 0, filter: "blur(0px)" }
                    : { opacity: 0, y: 26, filter: "blur(12px)" }
                }
                transition={{
                  duration: HERO_CONTENT_DURATION_MS / 1000,
                  ease: [0.25, 1, 0.5, 1],
                }}
                className="whitespace-normal overflow-visible text-[clamp(3.25rem,9.2vw,8rem)] font-medium leading-[0.9] tracking-[-0.05em] text-text-primary md:whitespace-nowrap"
              >
                {site.name}
              </motion.h1>

              <motion.p
                initial={false}
                animate={
                  contentVisible
                    ? { opacity: 1, y: 0, filter: "blur(0px)" }
                    : { opacity: 0, y: 22, filter: "blur(12px)" }
                }
                transition={{
                  duration: 1.1,
                  delay: 0.18,
                  ease: [0.25, 1, 0.5, 1],
                }}
                className="max-w-none whitespace-normal text-[clamp(1.38rem,1.05rem_+_0.5vw,2rem)] font-normal leading-[1.04] text-text-primary md:whitespace-nowrap"
              >
                {site.tagline}
              </motion.p>
            </div>

            <motion.p
              initial={false}
              animate={
                contentVisible
                  ? { opacity: 1, y: 0, filter: "blur(0px)" }
                  : { opacity: 0, y: 20, filter: "blur(12px)" }
              }
              transition={{
                duration: 1.1,
                delay: 0.38,
                ease: [0.25, 1, 0.5, 1],
              }}
              className="mt-8 max-w-[56ch] text-[clamp(1.22rem,1.05rem_+_0.4vw,1.42rem)] leading-[1.56] text-text-secondary"
            >
              {site.description}
            </motion.p>

            <div className="mt-12 flex flex-col items-start gap-6">
              <motion.div
                initial={false}
                animate={
                  contentVisible
                    ? { opacity: 1, y: 0, filter: "blur(0px)" }
                    : { opacity: 0, y: 18, filter: "blur(12px)" }
                }
                transition={{
                  duration: 1,
                  delay: 0.62,
                  ease: [0.25, 1, 0.5, 1],
                }}
              >
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
              </motion.div>

              <motion.div
                initial={false}
                animate={
                  contentVisible
                    ? { opacity: 1, y: 0, filter: "blur(0px)" }
                    : { opacity: 0, y: 18, filter: "blur(12px)" }
                }
                transition={{
                  duration: 1,
                  delay: 0.84,
                  ease: [0.25, 1, 0.5, 1],
                }}
              >
                <Link
                  to="/publications"
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
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
