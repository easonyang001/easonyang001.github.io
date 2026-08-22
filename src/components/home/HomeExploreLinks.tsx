import type { CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ScrollReveal from "./ScrollReveal.tsx";

type ExploreItem = {
  title: string;
  href: string;
  external?: boolean;
};

type ExploreGroup = {
  title: string;
  accent: string;
  description: string;
  items: ExploreItem[];
};

const exploreGroups: ExploreGroup[] = [
  {
    title: "Fundamentals",
    accent: "rgba(56, 189, 248, 0.38)",
    description: "Core building blocks for quantum state intuition and circuit design.",
    items: [
      { title: "Bloch Sphere", href: "/lab/bloch-sphere" },
      { title: "Circuit Playground", href: "/lab/circuit" },
    ],
  },
  {
    title: "Quantum AI",
    accent: "rgba(167, 139, 250, 0.36)",
    description: "Learning systems shaped by quantum feature maps, classifiers, and trainability.",
    items: [
      { title: "Variational Quantum Classifier", href: "/lab/vqc" },
      { title: "Quantum Kernel Explorer", href: "/lab/quantum-kernel" },
      { title: "Barren Plateau Demo", href: "/lab/barren-plateau" },
    ],
  },
  {
    title: "Quantum Simulation",
    accent: "rgba(45, 212, 191, 0.36)",
    description: "Molecular and combinatorial simulation tools for energy landscapes and chemistry.",
    items: [
      { title: "H₂ Ground State · VQE", href: "/lab/vqe-h2" },
      { title: "QUBO Solver", href: "/lab/qubo" },
      { title: "Annealing Simulator", href: "/lab/annealing" },
    ],
  },
  {
    title: "Interactive Lab",
    accent: "rgba(251, 146, 60, 0.34)",
    description: "Playable environments and immersive systems for hands-on exploration.",
    items: [
      { title: "System Recovery", href: "/lab/system-recovery" },
      { title: "LAB 01 · First-Person Lab", href: "/quantum-lab.html", external: true },
    ],
  },
];

function ExploreCard({
  group,
  index,
}: {
  group: ExploreGroup;
  index: number;
}) {
  return (
    <ScrollReveal
      variant={index % 2 === 0 ? "fade-left" : "fade-right"}
      duration={1}
      delay={index * 0.16}
    >
      <article
        style={{ "--card-accent": group.accent } as CSSProperties}
        className="home-explore-card relative flex h-full min-h-[280px] flex-col overflow-hidden rounded-[26px] border border-white/14 bg-slate-950/72 p-7 shadow-[0_20px_70px_rgba(2,6,23,0.38)] backdrop-blur-3xl"
      >
        <span className="home-explore-card__wash" aria-hidden="true" />
        <span className="home-explore-card__glow" aria-hidden="true" />
        <div className="relative flex h-full flex-col">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.24em] text-white/48">
                Explore
              </p>
              <h3 className="mt-2 text-h3 text-white">{group.title}</h3>
            </div>
            <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/14 bg-white/8 text-white/84 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
              <ArrowRight size={16} strokeWidth={1.8} />
            </span>
          </div>

          <p className="mt-4 max-w-md text-small text-white/68">{group.description}</p>

          <div className="mt-6 flex-1 border-t border-white/10 pt-5">
            <div className="space-y-2">
              {group.items.map((item) => {
                const itemClassName =
                  "group flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3.5 text-left transition-all duration-200 hover:border-white/18 hover:bg-white/[0.08] hover:translate-x-0.5";

                const content = (
                  <>
                    <span className="text-[15px] font-medium text-white/88 transition-colors duration-150 group-hover:text-white">
                      {item.title}
                    </span>
                    <ArrowRight
                      size={15}
                      strokeWidth={1.8}
                      className="shrink-0 text-white/42 transition-transform duration-150 group-hover:translate-x-1 group-hover:text-white/80"
                    />
                  </>
                );

                return item.external ? (
                  <a
                    key={item.href}
                    href={item.href}
                    className={itemClassName}
                  >
                    {content}
                  </a>
                ) : (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={itemClassName}
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </article>
    </ScrollReveal>
  );
}

export default function HomeExploreLinks() {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <img
        src="/visuals/go-deeper-quantum-network.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-[0.24]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(2,6,23,0)_0%,rgba(2,6,23,0.06)_16%,rgba(2,6,23,0.12)_34%,rgba(2,6,23,0.34)_58%,rgba(2,6,23,0.2)_78%,rgba(2,6,23,0.08)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(120,119,198,0.14),transparent_42%),radial-gradient(circle_at_18%_20%,rgba(56,189,248,0.1),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(167,139,250,0.08),transparent_32%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[62%] bg-[radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.34),transparent_45%),radial-gradient(circle_at_18%_100%,rgba(56,189,248,0.14),transparent_30%),radial-gradient(circle_at_82%_100%,rgba(251,146,60,0.12),transparent_28%)] opacity-90 mix-blend-screen" />

      <div className="relative mx-auto w-full max-w-content px-6 py-24 md:px-12 md:py-32">
        <div className="border-t border-white/10 pt-14">
          <div className="grid gap-8">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-end">
              <div>
                <ScrollReveal variant="fade-up" duration={1} delay={0.3}>
                  <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.28em] text-white/48">
                    LAB
                  </p>
                </ScrollReveal>
                <ScrollReveal variant="fade-up" duration={1} delay={0.45}>
                  <h2 className="mt-4 text-h2 text-white">Lab directory.</h2>
                </ScrollReveal>
              </div>
              <ScrollReveal variant="fade-right" duration={1} delay={0.6}>
                <p className="max-w-prose text-body-lg text-white/78">
                  Choose a lab path. Keep the homepage light.
                </p>
              </ScrollReveal>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {exploreGroups.map((group, index) => (
                <ExploreCard key={group.title} group={group} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
