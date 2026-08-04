import { Github, Linkedin, Mail } from "lucide-react";
import { people } from "../../data/people.ts";

const RESPONSIBILITIES = [
  "Research",
  "Software Engineering",
  "Open-Source Development",
  "Website Development",
  "Education",
  "Institutional Development",
];

export default function AboutFounder() {
  const founder = people[0];
  if (!founder) return null;

  const links = [
    founder.email && { label: "Email", href: `mailto:${founder.email}`, icon: Mail },
    founder.githubUrl && { label: "GitHub", href: founder.githubUrl, icon: Github },
    founder.linkedinUrl && { label: "LinkedIn", href: founder.linkedinUrl, icon: Linkedin },
  ].filter((link): link is { label: string; href: string; icon: typeof Mail } => Boolean(link));

  return (
    <section className="section-container border-t border-border">
      <p className="text-small font-medium text-text-muted">Founder</p>
      <div className="glass-card mt-6 max-w-prose p-8">
        {founder.avatarUrl ? (
          <img src={founder.avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-subtle text-h4 text-accent">
            {founder.avatarInitials}
          </div>
        )}
        <h2 className="mt-5 text-h3 text-text-primary">{founder.name}</h2>
        <p className="mt-1 text-small font-medium text-accent">{founder.roles.join(", ")}</p>
        {founder.biography && <p className="mt-4 text-small text-text-secondary">{founder.biography}</p>}

        {founder.researchInterests.length > 0 && (
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
        )}

        <div className="mt-6 border-t border-border pt-6">
          <p className="text-small font-medium text-text-muted">Responsibilities</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {RESPONSIBILITIES.map((item) => (
              <span
                key={item}
                className="rounded-md border border-border px-2 py-1 text-small text-text-secondary"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {founder.scholarUrl && (
          <a
            href={founder.scholarUrl}
            className="mt-4 inline-block text-small font-medium text-accent hover:text-accent-hover"
          >
            Google Scholar &rarr;
          </a>
        )}
        {founder.orcid && <p className="mt-1 font-mono text-mono-label text-text-muted">ORCID {founder.orcid}</p>}

        {links.length > 0 && (
          <div className="mt-5 flex gap-4 border-t border-border pt-5">
            {links.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                className="flex items-center gap-1.5 text-small font-medium text-text-secondary transition-colors duration-150 hover:text-accent"
              >
                <Icon size={14} /> {label}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
