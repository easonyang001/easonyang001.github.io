import type { CSSProperties } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import ScrollReveal from "./ScrollReveal.tsx";

const links = [
  {
    title: "Research",
    href: "/research",
    accent: "rgba(56, 189, 248, 0.38)",
  },
  {
    title: "Lab",
    href: "/lab",
    accent: "rgba(45, 212, 191, 0.36)",
  },
  {
    title: "Publications",
    href: "/publications",
    accent: "rgba(167, 139, 250, 0.34)",
  },
  {
    title: "News",
    href: "/news",
    accent: "rgba(251, 146, 60, 0.34)",
  },
  {
    title: "Quantum Lab 3D",
    href: "/quantum-lab-3d.html",
    accent: "rgba(45, 212, 191, 0.36)",
    external: true,
  },
];

export default function HomeExploreLinks() {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <img
        src="/visuals/go-deeper-quantum-network.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-[0.26]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(2,6,23,0)_0%,rgba(2,6,23,0.04)_14%,rgba(2,6,23,0.1)_28%,rgba(2,6,23,0.28)_52%,rgba(2,6,23,0.18)_78%,rgba(2,6,23,0.06)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(120,119,198,0.14),transparent_42%),radial-gradient(circle_at_18%_20%,rgba(56,189,248,0.1),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(167,139,250,0.08),transparent_32%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[62%] bg-[radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.34),transparent_45%),radial-gradient(circle_at_18%_100%,rgba(56,189,248,0.14),transparent_30%),radial-gradient(circle_at_82%_100%,rgba(251,146,60,0.12),transparent_28%)] opacity-90 mix-blend-screen" />
      <div className="relative mx-auto w-full max-w-content px-6 py-24 md:px-12 md:py-32">
        <div className="border-t border-white/10 pt-14">
          <div className="grid gap-8">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-end">
              <div>
                <ScrollReveal variant="fade-up" duration={1} delay={0.3}>
                  <h2 className="mt-4 text-h2 text-white">Go deeper from here.</h2>
                </ScrollReveal>
              </div>
              <ScrollReveal variant="fade-right" duration={1} delay={0.6}>
                <p className="max-w-prose text-body-lg text-white/78">
                  Choose a direction. Keep the homepage light.
                </p>
              </ScrollReveal>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {links.map((item, index) => {
                const cardClassName =
                  "home-explore-card home-cta-link group block h-full w-full rounded-lg border border-white/18 bg-slate-950/72 px-7 py-8 md:px-8 md:py-9 backdrop-blur-3xl transition duration-300 min-h-[170px]";
                const cardContent = (
                  <>
                    <span className="home-explore-card__wash" aria-hidden="true" />
                    <span className="home-explore-card__glow" aria-hidden="true" />
                    <div className="flex h-full min-h-[78px] items-center justify-between gap-6">
                      <h3 className="text-h3 text-white">
                        <span className="home-cta-link__label">{item.title}</span>
                      </h3>
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/16 bg-white/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition duration-300 group-hover:border-white/32 group-hover:bg-white/14 group-hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_0_28px_var(--card-accent)]">
                        <ChevronRight
                          size={16}
                          strokeWidth={2}
                          className="home-cta-link__icon text-orange-300"
                        />
                      </span>
                    </div>
                  </>
                );

                return (
                  <ScrollReveal
                    key={item.href}
                    variant={index % 2 === 0 ? "fade-left" : "fade-right"}
                    duration={1}
                    delay={index * 0.3}
                  >
                    {item.external ? (
                      <a
                        href={item.href}
                        style={{ "--card-accent": item.accent } as CSSProperties}
                        className={cardClassName}
                      >
                        {cardContent}
                      </a>
                    ) : (
                      <Link
                        to={item.href}
                        style={{ "--card-accent": item.accent } as CSSProperties}
                        className={cardClassName}
                      >
                        {cardContent}
                      </Link>
                    )}
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
