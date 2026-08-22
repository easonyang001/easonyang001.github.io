import { useSeo } from "../lib/seo/useSeo.ts";

type FontPreset = {
  name: string;
  subtitle: string;
  titleFont: string;
  bodyFont: string;
  monoFont: string;
  description: string;
  accent: string;
};

const FONT_PRESETS: FontPreset[] = [
  {
    name: "Luxury Editorial",
    subtitle: "Best if you want a more premium, magazine-like feel.",
    titleFont: '"Cormorant Garamond", serif',
    bodyFont: '"Inter", system-ui, sans-serif',
    monoFont: '"IBM Plex Mono", ui-monospace, monospace',
    description:
      "High-contrast, elegant, and slightly dramatic. The headings feel more artistic while the body stays clean.",
    accent: "TEXTURED",
  },
  {
    name: "Modern Tech",
    subtitle: "The safest match for a quantum or AI brand.",
    titleFont: '"Sora", sans-serif',
    bodyFont: '"Inter Tight", system-ui, sans-serif',
    monoFont: '"IBM Plex Mono", ui-monospace, monospace',
    description:
      "Crisp and contemporary with good clarity. This is the most balanced option if you want polish without looking ornate.",
    accent: "BALANCED",
  },
  {
    name: "Academic Clean",
    subtitle: "Feels serious, readable, and slightly more traditional.",
    titleFont: '"Spectral", serif',
    bodyFont: '"Source Sans 3", system-ui, sans-serif',
    monoFont: '"JetBrains Mono", ui-monospace, monospace',
    description:
      "A calmer research-institute look. Useful if you want the site to feel credible and paper-like rather than brand-forward.",
    accent: "SERIOUS",
  },
  {
    name: "Future Product",
    subtitle: "Sharper and more design-forward.",
    titleFont: '"Space Grotesk", sans-serif',
    bodyFont: '"Manrope", system-ui, sans-serif',
    monoFont: '"IBM Plex Mono", ui-monospace, monospace',
    description:
      "More geometric and slightly more futuristic. Good if you want the site to feel like a polished software product.",
    accent: "SYSTEMS",
  },
  {
    name: "Distinctive Luxury",
    subtitle: "The most characterful option here.",
    titleFont: '"Fraunces", serif',
    bodyFont: '"Inter", system-ui, sans-serif',
    monoFont: '"IBM Plex Mono", ui-monospace, monospace',
    description:
      "A warmer, more editorial voice with real personality. It stands out the most if you want the brand to be memorable.",
    accent: "SIGNATURE",
  },
];

function FontCard({ preset }: { preset: FontPreset }) {
  return (
    <article className="relative overflow-hidden rounded-[30px] border border-white/12 bg-[linear-gradient(180deg,rgba(8,15,32,0.94),rgba(6,10,22,0.9))] p-6 shadow-[0_24px_90px_rgba(2,6,23,0.45)] ring-1 ring-white/[0.05] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.08),transparent_26%),radial-gradient(circle_at_82%_16%,rgba(139,92,246,0.14),transparent_20%)]" />
      <div className="relative">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.24em] text-white/48">
              {preset.accent}
            </p>
            <h2 className="mt-3 text-[32px] leading-[0.96] text-white" style={{ fontFamily: preset.titleFont }}>
              {preset.name}
            </h2>
          </div>
          <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.28em] text-white/70">
            Preview
          </span>
        </div>

        <p className="mt-3 max-w-prose text-[16px] leading-7 text-slate-300" style={{ fontFamily: preset.bodyFont }}>
          {preset.subtitle}
        </p>

        <div className="mt-6 rounded-[24px] border border-white/10 bg-black/25 p-5">
          <h3 className="text-[36px] leading-[1.02] text-white" style={{ fontFamily: preset.titleFont }}>
            A clear signal for the future.
          </h3>
          <p className="mt-4 text-[15px] leading-7 text-slate-300" style={{ fontFamily: preset.bodyFont }}>
            {preset.description}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["Quantum", "Research", "Design", "Typography"].map((item) => (
              <span
                key={item}
                className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-slate-300"
                style={{ fontFamily: preset.monoFont }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/45" style={{ fontFamily: preset.monoFont }}>
              Headings
            </p>
            <p className="mt-2 text-[18px] leading-6 text-white" style={{ fontFamily: preset.titleFont }}>
              {preset.name}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/45" style={{ fontFamily: preset.monoFont }}>
              Body
            </p>
            <p className="mt-2 text-[15px] leading-6 text-slate-300" style={{ fontFamily: preset.bodyFont }}>
              Smooth, readable copy with decent contrast.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/45" style={{ fontFamily: preset.monoFont }}>
              Mono
            </p>
            <p className="mt-2 font-mono text-[14px] leading-6 text-slate-300" style={{ fontFamily: preset.monoFont }}>
              `0123456789` / labels / code
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function FontLabPage() {
  useSeo({
    title: "Font Lab",
    description: "A typography comparison page for choosing the best font pairing for the site.",
    path: "/fonts",
  });

  return (
    <section className="section-container border-t border-border">
      <div className="max-w-3xl">
        <p className="eyebrow">Typography</p>
        <h1 className="mt-4 text-h2 text-text-primary">Choose the font direction</h1>
        <p className="mt-4 text-body-lg text-text-secondary">
          I put the main candidates on one page so you can compare them directly in the browser.
          Pick the one that feels most like the brand you want.
        </p>
      </div>

      <div className="mt-12 grid gap-6">
        {FONT_PRESETS.map((preset) => (
          <FontCard key={preset.name} preset={preset} />
        ))}
      </div>
    </section>
  );
}
