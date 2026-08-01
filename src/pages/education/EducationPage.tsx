import { Link } from "react-router-dom";
import PageShell from "../../components/PageShell.tsx";
import { education } from "../../data/education.ts";

export default function EducationPage() {
  const count = education.length;

  return (
    <PageShell eyebrow={`${count} ${count === 1 ? "Lesson" : "Lessons"}`} title="Education">
      {education.length === 0 ? (
        <p className="text-body-lg text-text-secondary">
          Lessons are in development. Check back soon.
        </p>
      ) : (
        <ul className="divide-y divide-border border-t border-border">
          {education.map((lesson) => (
            <li key={lesson.slug}>
              <Link
                to={`/education/${lesson.slug}`}
                className="flex items-center justify-between gap-4 py-6 transition-colors duration-150 hover:text-accent"
              >
                <div>
                  <h2 className="text-h3 text-text-primary">{lesson.title}</h2>
                  <p className="mt-1 text-small text-text-secondary">{lesson.description}</p>
                </div>
                <span className="shrink-0 rounded-md bg-accent-subtle px-2 py-1 font-mono text-mono-label uppercase text-accent">
                  {lesson.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
