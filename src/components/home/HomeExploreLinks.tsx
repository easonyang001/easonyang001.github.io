import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const links = [
  {
    title: "Research",
    href: "/research",
    description: "Core directions.",
  },
  {
    title: "Lab",
    href: "/lab",
    description: "Interactive tools.",
  },
  {
    title: "Publications",
    href: "/publications",
    description: "Papers and records.",
  },
  {
    title: "News",
    href: "/news",
    description: "Recent updates.",
  },
];

export default function HomeExploreLinks() {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <img
        src="/visuals/go-deeper-quantum-network.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-slate-950/68" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/42 via-transparent to-slate-950/70" />
      <div className="relative mx-auto w-full max-w-content px-6 py-24 md:px-12 md:py-32">
        <div className="border-t border-white/20 pt-14">
          <div className="grid gap-8">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-end">
              <div>
                <p className="font-mono text-mono-label uppercase text-white/65">Next</p>
                <h2 className="mt-4 text-h2 text-white">Go deeper from here.</h2>
              </div>
              <p className="max-w-prose text-body-lg text-white/78">
                Choose a direction. Keep the homepage light.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                {links.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="group rounded-lg border border-white/18 bg-slate-950/58 p-6 backdrop-blur-sm transition-colors duration-150 hover:border-white/35 hover:bg-slate-950/72"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-h3 text-white">{item.title}</h3>
                      <ArrowRight
                        size={17}
                        strokeWidth={1.7}
                        className="text-orange-300 transition-transform duration-150 group-hover:translate-x-1"
                      />
                    </div>
                    <p className="mt-3 text-small leading-7 text-white/68">{item.description}</p>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
