import ListPageLayout from "../components/ListPageLayout.tsx";
import EmptyState from "../components/EmptyState.tsx";
import { openSource } from "../data/openSource.ts";

export default function OpenSourcePage() {
  return (
    <ListPageLayout
      title="Open Source"
      description="Tools and libraries we publish as we build them."
      path="/opensource"
      resultCount={openSource.length}
    >
      {openSource.length === 0 ? (
        <EmptyState
          title="Coming soon"
          description="No public repositories yet — check back as our tools mature."
        />
      ) : (
        <ul className="divide-y divide-border border-t border-border">
          {openSource.map((repo) => (
            <li key={repo.slug} className="py-6">
              <h2 className="text-h3 text-text-primary">{repo.name}</h2>
              <p className="mt-1 text-small text-text-secondary">{repo.description}</p>
              {repo.repoUrl && (
                <a
                  href={repo.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-small font-medium text-accent transition-colors duration-150 hover:text-accent-hover"
                >
                  View Repository &rarr;
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </ListPageLayout>
  );
}
