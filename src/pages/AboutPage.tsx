import PageShell from "../components/PageShell.tsx";
import { people } from "../data/people.ts";

export default function AboutPage() {
  const founder = people[0];

  return (
    <PageShell title="About the Institute">
      <p className="max-w-prose text-body-lg text-text-secondary">
        Mrama Institute for Quantum Information and Intelligence is an independent research
        initiative dedicated to advancing quantum information science, quantum machine learning,
        intelligent optimization, and hybrid quantum-classical computing.
      </p>

      <div className="glass-card mt-8 max-w-prose p-8">
        <p className="font-mono text-mono-label uppercase text-text-muted">Mission</p>
        <p className="mt-4 text-body-lg text-text-primary">
          Bridge theoretical research with practical engineering applications.
        </p>
      </div>

      <div className="mt-12 max-w-prose">
        <p className="font-mono text-mono-label uppercase text-text-muted">Organization</p>
        <p className="mt-4 text-body-lg text-text-secondary">
          Mrama Institute is an independent research project, currently led by a single
          researcher, self-funded, and not a registered legal entity. Research is focused on
          practical applications of quantum optimization and quantum machine learning.
        </p>
      </div>

      {founder && (
        <div className="mt-12 max-w-prose">
          <p className="mb-4 font-mono text-mono-label uppercase text-text-muted">Founder</p>
          <div className="glass-card p-8">
            {founder.avatarUrl ? (
              <img src={founder.avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-subtle text-h4 text-accent">
                {founder.avatarInitials}
              </div>
            )}
            <h2 className="mt-5 text-h3 text-text-primary">{founder.name}</h2>
            <p className="mt-1 text-small font-medium text-accent">{founder.roles.join(", ")}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {founder.researchInterests.map((interest) => (
                <span
                  key={interest}
                  className="rounded-md border border-border px-2 py-1 font-mono text-mono-label uppercase text-text-secondary"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
