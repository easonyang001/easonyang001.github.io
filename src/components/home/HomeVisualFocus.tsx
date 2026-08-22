import type { CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ScrollReveal from "./ScrollReveal.tsx";

const hardwareLinks = [
  {
    title: "Quantum chip 1",
    image: "/visuals/quantum-chip-1.png",
    accent: "rgba(168, 85, 247, 0.42)",
  },
  {
    title: "Quantum chip 2",
    image: "/visuals/quantum-chip-2.png",
    accent: "rgba(59, 130, 246, 0.34)",
  },
  {
    title: "Quantum processor",
    image: "/visuals/quantum-processor.png",
    accent: "rgba(34, 197, 94, 0.30)",
  },
];

export default function HomeVisualFocus() {
  return (
    <section id="explore-research" className="bg-background text-text-primary scroll-mt-24">
      <div className="mx-auto w-full max-w-content px-6 py-24 md:px-12 md:py-32">
        <div className="grid gap-6 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] md:items-end">
          <ScrollReveal variant="fade-up" duration={1} delay={0}>
            <h2 className="text-h2 text-text-primary">Quantum Systems</h2>
          </ScrollReveal>
        </div>

        <div className="mt-12 grid gap-8">
          <ScrollReveal variant="blur" duration={1} delay={0.15}>
            <a
              href="/quantum-lab.html"
              className="group grid overflow-hidden rounded-lg border border-border bg-surface transition-colors duration-150 hover:border-border-strong hover:bg-surface-raised lg:grid-cols-[minmax(360px,1fr)_minmax(0,0.86fr)]"
            >
              <img
                src="/visuals/quantum-computer.png"
                alt=""
                className="home-visual-card__image h-full min-h-[460px] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
              />
              <div className="home-visual-card__panel flex flex-col justify-center p-8 md:p-10">
                <h3 className="mt-5 text-h2 text-text-primary">
                  A clear signal for the future.
                </h3>
                <span className="home-cta-link mt-8 w-fit text-small font-medium text-accent transition-colors duration-150 group-hover:text-accent-hover">
                  <span className="home-cta-link__label">Open the lab</span>
                  <ArrowRight
                    size={15}
                    strokeWidth={1.7}
                    className="home-cta-link__icon transition-transform duration-150"
                  />
                </span>
              </div>
            </a>
          </ScrollReveal>

          <div className="grid gap-5 lg:grid-cols-3">
            {hardwareLinks.map((item) => (
              <ScrollReveal
                key={item.title}
                variant={item.title === "Quantum chip 1" ? "fade-left" : item.title === "Quantum chip 2" ? "fade-up" : "fade-right"}
                duration={1}
                delay={item.title === "Quantum chip 1" ? 0 : item.title === "Quantum chip 2" ? 0.3 : 0.6}
              >
                <Link
                  to="/projects"
                  style={{ "--card-accent": item.accent } as CSSProperties}
                  className="home-visual-chip group overflow-hidden rounded-lg border border-border bg-surface transition-colors duration-150 hover:border-border-strong hover:bg-surface-raised"
                >
                  <img
                    src={item.image}
                    alt=""
                    className="home-visual-chip__image h-56 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                  <div className="home-visual-chip__panel p-6">
                    <h3 className="mt-4 text-h3 text-text-primary">{item.title}</h3>
                    <span className="home-cta-link mt-6 w-fit text-small font-medium text-accent transition-colors duration-150 group-hover:text-accent-hover">
                      <span className="home-cta-link__label">Open</span>
                      <ArrowRight
                        size={15}
                        strokeWidth={1.7}
                        className="home-cta-link__icon transition-transform duration-150"
                      />
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
