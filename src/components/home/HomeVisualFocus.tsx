import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const hardwareLinks = [
  {
    title: "Quantum chip 1",
    label: "01 / Quantum chip",
    image: "/visuals/quantum-chip-1.png",
    description: "Device-level signal.",
  },
  {
    title: "Quantum chip 2",
    label: "02 / Quantum chip",
    image: "/visuals/quantum-chip-2.png",
    description: "Scaling and layout.",
  },
  {
    title: "Quantum processor",
    label: "03 / Quantum processor",
    image: "/visuals/quantum-processor.png",
    description: "Control to compute.",
  },
];

export default function HomeVisualFocus() {
  return (
    <section className="bg-background text-text-primary">
      <div className="mx-auto w-full max-w-content px-6 py-24 md:px-12 md:py-32">
        <div className="grid gap-6 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] md:items-end">
          <h2 className="text-h2 text-text-primary">Quantum Systems</h2>
          <p className="max-w-prose text-body-lg text-text-secondary">
            Computer first. Chips and processor below.
          </p>
        </div>

        <div className="mt-12 grid gap-8">
          <Link
            to="/research"
            className="group grid overflow-hidden rounded-lg border border-border bg-surface transition-colors duration-150 hover:border-border-strong hover:bg-surface-raised lg:grid-cols-[minmax(360px,1fr)_minmax(0,0.86fr)]"
          >
            <img
              src="/visuals/quantum-computer.png"
              alt=""
              className="h-full min-h-[460px] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            />
            <div className="flex flex-col justify-center p-8 md:p-10">
              <p className="font-mono text-mono-label uppercase text-text-muted">
                Quantum computer
              </p>
              <h3 className="mt-5 text-h2 text-text-primary">
                A clear signal for the future.
              </h3>
              <p className="mt-5 text-lg leading-8 text-text-secondary">
                The homepage stays visual. Research details sit one click deeper.
              </p>
              <span className="mt-8 inline-flex w-fit items-center gap-2 text-small font-medium text-accent transition-colors duration-150 group-hover:text-accent-hover">
                Explore research
                <ArrowRight size={15} strokeWidth={1.7} className="transition-transform duration-150 group-hover:translate-x-1" />
              </span>
            </div>
          </Link>

          <div className="grid gap-5 lg:grid-cols-3">
            {hardwareLinks.map((item) => (
              <Link
                key={item.title}
                to="/projects"
                className="group overflow-hidden rounded-lg border border-border bg-surface transition-colors duration-150 hover:border-border-strong hover:bg-surface-raised"
              >
                <img
                  src={item.image}
                  alt=""
                  className="h-56 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
                <div className="p-6">
                  <p className="font-mono text-mono-label uppercase text-text-muted">{item.label}</p>
                  <h3 className="mt-4 text-h3 text-text-primary">{item.title}</h3>
                  <p className="mt-3 text-small leading-7 text-text-secondary">
                    {item.description}
                  </p>
                  <span className="mt-6 inline-flex w-fit items-center gap-2 text-small font-medium text-accent transition-colors duration-150 group-hover:text-accent-hover">
                    Open
                    <ArrowRight size={15} strokeWidth={1.7} className="transition-transform duration-150 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
