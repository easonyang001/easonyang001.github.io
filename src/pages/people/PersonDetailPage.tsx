import { useParams } from "react-router-dom";
import DetailPageLayout from "../../components/DetailPageLayout.tsx";
import NotFoundPage from "../NotFoundPage.tsx";
import { people } from "../../data/people.ts";

export default function PersonDetailPage() {
  const { slug } = useParams();
  const person = people.find((p) => p.slug === slug);

  if (!person) return <NotFoundPage />;

  const meta = [
    { label: "Role", value: person.roles.join(", ") },
    ...(person.email ? [{ label: "Email", value: person.email }] : []),
    ...(person.githubUrl ? [{ label: "GitHub", value: person.githubUrl }] : []),
    ...(person.scholarUrl ? [{ label: "Google Scholar", value: person.scholarUrl }] : []),
    ...(person.linkedinUrl ? [{ label: "LinkedIn", value: person.linkedinUrl }] : []),
    ...(person.orcid ? [{ label: "ORCID", value: person.orcid }] : []),
  ];

  return (
    <DetailPageLayout title={person.name} meta={meta}>
      {person.avatarUrl ? (
        <img src={person.avatarUrl} alt="" className="mb-6 h-20 w-20 rounded-full object-cover" />
      ) : (
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent-subtle text-h4 text-accent">
          {person.avatarInitials}
        </div>
      )}
      {person.biography && <p className="mb-6 text-body-lg text-text-secondary">{person.biography}</p>}
      {person.researchInterests.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {person.researchInterests.map((interest) => (
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
