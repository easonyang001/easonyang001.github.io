import { Link } from "react-router-dom";
import PageShell from "../../components/PageShell.tsx";
import { people } from "../../data/people.ts";

export default function PeoplePage() {
  return (
    <PageShell title="People">
      <div className="flex flex-wrap gap-6">
        {people.map((person) => (
          <Link key={person.slug} to={`/people/${person.slug}`} className="glass-card w-full max-w-xs p-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-subtle text-h4 text-accent">
              {person.avatarInitials}
            </div>
            <h2 className="mt-5 text-h3 text-text-primary">{person.name}</h2>
            <p className="mt-1 text-small font-medium text-accent">{person.role}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {person.interests.map((interest) => (
                <span
                  key={interest}
                  className="rounded-md border border-border px-2 py-1 font-mono text-mono-label uppercase text-text-secondary"
                >
                  {interest}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
