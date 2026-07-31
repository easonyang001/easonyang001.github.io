import { useParams } from "react-router-dom";
import DetailPageLayout from "../../components/DetailPageLayout.tsx";
import NotFoundPage from "../NotFoundPage.tsx";
import { people } from "../../data/people.ts";

export default function PersonDetailPage() {
  const { slug } = useParams();
  const person = people.find((p) => p.slug === slug);

  if (!person) return <NotFoundPage />;

  const meta = [
    { label: "Role", value: person.role },
    ...(person.email ? [{ label: "Email", value: person.email }] : []),
    ...(person.githubUrl ? [{ label: "GitHub", value: person.githubUrl }] : []),
  ];

  return (
    <DetailPageLayout eyebrow="People" title={person.name} meta={meta}>
      {person.interests.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {person.interests.map((interest) => (
            <span
              key={interest}
              className="rounded-md border border-border px-2 py-1 font-mono text-mono-label uppercase text-text-secondary"
            >
              {interest}
            </span>
          ))}
        </div>
      )}
    </DetailPageLayout>
  );
}
