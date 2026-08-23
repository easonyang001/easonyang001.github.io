import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { site } from "../../data/site.ts";
import ScrollReveal from "./ScrollReveal.tsx";
import teamImage from "../about/team.png";

export default function HomeAbout() {
  return (
    <section className="bg-white text-slate-950">
      <div className="mx-auto grid min-h-screen w-full max-w-content content-center gap-12 px-6 py-24 md:px-12 md:py-32">
        <div className="grid gap-8 lg:grid-cols-[minmax(360px,440px)_minmax(0,1fr)] lg:items-end lg:gap-12">
          <div>
            <h2 className="max-w-[780px] font-display text-[clamp(2.35rem,4.4vw,5.2rem)] font-medium leading-[0.78] text-slate-950">
              {['Quantum', 'Research,', 'Made', 'Visible.'].map((line, index) => (
                <motion.span
                  key={line}
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.72, delay: index * 0.12, ease: [0.25, 1, 0.5, 1] }}
                  className="block"
                >
                  {line}
                </motion.span>
              ))}
            </h2>
          </div>

          <div className="lg:-translate-x-5 lg:pb-3">
            <ScrollReveal variant="fade-right" duration={1} delay={0.6}>
              <p className="font-display text-[clamp(1.5rem,2vw,2rem)] leading-[1.2] text-slate-700">{site.aboutBlurb}</p>
            </ScrollReveal>
            <ScrollReveal variant="fade-right" duration={1} delay={0.9}>
              <p className="mt-5 font-display text-[clamp(1.25rem,1.6vw,1.55rem)] leading-[1.25] text-slate-700">
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
            <figcaption className="border-t border-slate-200 bg-slate-50 px-5 py-5 font-display text-[19px] font-bold uppercase tracking-[0.08em] text-slate-800">
              Taiwan x France research initiative
            </figcaption>
          </figure>
        </ScrollReveal>

        <div className="grid gap-5 md:grid-cols-3">
          <ScrollReveal variant="fade-up" duration={1} delay={0} className="border-l-2 border-orange-500 pl-5">
            <p className="font-display text-[21px] font-semibold tracking-[0.02em] text-slate-600">Mission</p>
            <p className="mt-3 font-sans text-xl font-semibold leading-8 text-slate-950">
              Theory to working systems.
            </p>
          </ScrollReveal>
          <ScrollReveal variant="fade-down" duration={1} delay={0.3} className="border-l-2 border-cyan-500 pl-5">
            <p className="font-display text-[21px] font-semibold tracking-[0.02em] text-slate-600">Method</p>
            <p className="mt-3 font-sans text-xl font-semibold leading-8 text-slate-950">
              Open, visual, practical.
            </p>
          </ScrollReveal>
          <ScrollReveal variant="fade-left" duration={1} delay={0.6} className="border-l-2 border-slate-300 pl-5">
            <p className="font-display text-[21px] font-semibold tracking-[0.02em] text-slate-600">Focus</p>
            <p className="mt-3 font-sans text-xl font-semibold leading-8 text-slate-950">
              Quantum intelligence.
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
