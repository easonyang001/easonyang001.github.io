import { Link } from "react-router-dom";
import HomeSection from "./HomeSection.tsx";
import { projects } from "../../data/projects.ts";

export default function HomeProjects() {
  const featured = projects.slice(0, 3);

  return (
    <HomeSection
      title="Projects"
      description="Applied research translating theory into working systems."
      viewAllHref="/projects"
      viewAllLabel={`All ${projects.length} projects`}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {featured.map((project) => (
          <Link key={project.slug} to={`/projects/${project.slug}`} className="glass-card flex flex-col p-8">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-h3 text-text-primary">{project.title}</h3>
              <span className="shrink-0 rounded-md bg-accent-subtle px-2 py-1 font-mono text-mono-label uppercase text-accent">
                {project.status}
              </span>
            </div>
            <p className="mt-3 flex-1 text-small text-text-secondary">{project.summary}</p>
          </Link>
        ))}
      </div>
    </HomeSection>
  );
}
