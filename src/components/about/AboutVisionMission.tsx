const MISSION_ITEMS = [
  "Advance quantum information science",
  "Develop practical quantum optimization methods",
  "Explore quantum machine learning",
  "Bridge theory and engineering",
  "Support open, reproducible science",
];

const PHILOSOPHY_ITEMS = ["Rigorous", "Reproducible", "Practical", "Collaborative", "Transparent"];

export default function AboutVisionMission() {
  return (
    <section className="section-container border-t border-border">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div>
          <p className="section-kicker">Vision</p>
          <p className="mt-4 max-w-prose text-body-lg text-text-secondary">
            To become a recognized independent research institute advancing quantum technologies
            through research, engineering, and open collaboration.
          </p>
        </div>

        <div>
          <p className="section-kicker">Mission</p>
          <ul className="mt-4 space-y-3">
            {MISSION_ITEMS.map((item) => (
              <li key={item} className="flex gap-3 text-body text-text-secondary">
                <span className="text-accent">—</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-12 border-t border-border pt-12">
        <p className="section-kicker">Research Philosophy</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {PHILOSOPHY_ITEMS.map((item) => (
            <span
              key={item}
              className="rounded-md border border-border px-3 py-1.5 text-small text-text-secondary"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
