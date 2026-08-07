import { Link } from "react-router-dom";
import { site } from "../../data/site.ts";

export default function HomeAbout() {
  return (
    <section className="bg-white text-slate-950">
      <div className="mx-auto grid min-h-screen w-full max-w-content content-center gap-12 px-6 py-24 md:px-12 md:py-32">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.72fr)] lg:items-end">
          <div>
            <p className="font-mono text-mono-label uppercase text-slate-500">About the Institute</p>
            <h2 className="mt-5 max-w-[780px] text-[clamp(2.6rem,5.6vw,6.5rem)] font-medium leading-none text-slate-950">
              Quantum research, made visible.
            </h2>
          </div>

          <div className="lg:pb-3">
            <p className="text-xl leading-8 text-slate-600">{site.aboutBlurb}</p>
            <p className="mt-5 text-lg leading-8 text-slate-700">
              Taiwan x France. Intelligent systems. Open tools.
            </p>
            <Link
              to="/about"
              className="mt-7 inline-block text-small font-semibold text-orange-600 transition-colors duration-150 hover:text-orange-700"
            >
              Full story &rarr;
            </Link>
          </div>
        </div>

        <figure className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-sm">
          <img
            src="/visuals/institute-team.png"
            alt={`${site.name} research team in a quantum laboratory`}
            className="h-auto w-full object-contain"
          />
          <figcaption className="border-t border-slate-200 px-5 py-4 font-mono text-mono-label uppercase text-slate-500">
            Taiwan x France research initiative
          </figcaption>
        </figure>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="border-l-2 border-orange-500 pl-5">
            <p className="font-mono text-mono-label uppercase text-slate-500">Mission</p>
            <p className="mt-3 text-lg font-semibold leading-7 text-slate-950">
              Theory to working systems.
            </p>
          </div>
          <div className="border-l-2 border-cyan-500 pl-5">
            <p className="font-mono text-mono-label uppercase text-slate-500">Method</p>
            <p className="mt-3 text-lg font-semibold leading-7 text-slate-950">
              Open, visual, practical.
            </p>
          </div>
          <div className="border-l-2 border-slate-300 pl-5">
            <p className="font-mono text-mono-label uppercase text-slate-500">Focus</p>
            <p className="mt-3 text-lg font-semibold leading-7 text-slate-950">
              Quantum intelligence.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
