import { Link } from "react-router-dom";
import { site } from "../../data/site.ts";
import CharReveal from "./CharReveal.tsx";
import ScrollReveal from "./ScrollReveal.tsx";
import teamImage from "../about/team.png";

export default function HomeAbout() {
  return (
    <section className="bg-white text-slate-950">
      <div className="mx-auto grid min-h-screen w-full max-w-content content-center gap-12 px-6 py-24 md:px-12 md:py-32">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.72fr)] lg:items-end">
          <div>
            <ScrollReveal variant="fade-up" duration={1} delay={0}>
              <p className="font-mono text-mono-label uppercase text-slate-500">About the Institute</p>
            </ScrollReveal>
            <CharReveal
              text="Quantum research, made visible."
              startDelayMs={120}
              staggerMs={24}
              wordGapMs={140}
              charDurationMs={280}
              className="mt-5 max-w-[780px] text-[clamp(2.6rem,5.6vw,6.5rem)] font-medium leading-none text-slate-950"
            />
          </div>

          <div className="lg:pb-3">
            <ScrollReveal variant="fade-right" duration={1} delay={0.6}>
              <p className="text-xl leading-8 text-slate-600">{site.aboutBlurb}</p>
            </ScrollReveal>
            <ScrollReveal variant="fade-right" duration={1} delay={0.9}>
              <p className="mt-5 text-lg leading-8 text-slate-700">
                Taiwan x France. Intelligent systems. Open tools.
              </p>
            </ScrollReveal>
            <ScrollReveal variant="fade-up" duration={1} delay={1.2}>
              <Link
                to="/about"
                className="home-cta-link mt-7 text-small font-semibold text-orange-600 transition-colors duration-150 hover:text-orange-700"
              >
                <span className="home-cta-link__label">Full story</span>
                <span aria-hidden="true" className="home-cta-link__icon">
                  &rarr;
                </span>
              </Link>
            </ScrollReveal>
          </div>
        </div>

        <ScrollReveal variant="blur" duration={1} delay={0.15}>
          <figure className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-sm">
            <img
              src={teamImage}
              alt={`${site.name} research team in a quantum laboratory`}
              className="mx-auto h-auto max-h-[480px] w-full max-w-[900px] object-contain"
            />
            <figcaption className="border-t border-slate-200 px-5 py-4 font-mono text-mono-label uppercase text-slate-500">
              Taiwan x France research initiative
            </figcaption>
          </figure>
        </ScrollReveal>

        <div className="grid gap-5 md:grid-cols-3">
          <ScrollReveal variant="fade-up" duration={1} delay={0} className="border-l-2 border-orange-500 pl-5">
            <p className="font-mono text-mono-label uppercase text-slate-500">Mission</p>
            <p className="mt-3 text-lg font-semibold leading-7 text-slate-950">
              Theory to working systems.
            </p>
          </ScrollReveal>
          <ScrollReveal variant="fade-down" duration={1} delay={0.3} className="border-l-2 border-cyan-500 pl-5">
            <p className="font-mono text-mono-label uppercase text-slate-500">Method</p>
            <p className="mt-3 text-lg font-semibold leading-7 text-slate-950">
              Open, visual, practical.
            </p>
          </ScrollReveal>
          <ScrollReveal variant="fade-left" duration={1} delay={0.6} className="border-l-2 border-slate-300 pl-5">
            <p className="font-mono text-mono-label uppercase text-slate-500">Focus</p>
            <p className="mt-3 text-lg font-semibold leading-7 text-slate-950">
              Quantum intelligence.
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
