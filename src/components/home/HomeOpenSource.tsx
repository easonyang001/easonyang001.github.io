import HomeSection from "./HomeSection.tsx";
import EmptyState from "../EmptyState.tsx";
import { openSource } from "../../data/openSource.ts";

export default function HomeOpenSource() {
  return (
    <HomeSection
      title="Open Source"
      description="Tools and libraries we publish as we build them."
      viewAllHref="/opensource"
      viewAllLabel="Visit the repository index"
    >
      {openSource.length === 0 ? (
        <EmptyState
          title="Coming soon"
          description="No public repositories yet — check back as our tools mature."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {openSource.slice(0, 3).map((repo) => (
            <div key={repo.slug} className="glass-card p-8">
              <h3 className="text-h3 text-text-primary">{repo.name}</h3>
              <p className="mt-2 text-small text-text-secondary">{repo.description}</p>
            </div>
          ))}
        </div>
      )}
    </HomeSection>
  );
}
