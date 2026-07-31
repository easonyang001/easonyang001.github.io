import { Link, useParams } from "react-router-dom";
import DetailPageLayout from "../../components/DetailPageLayout.tsx";
import NotFoundPage from "../NotFoundPage.tsx";
import { researchAreas } from "../../data/research.ts";
import { labTools } from "../../data/labTools.ts";

export default function ResearchDetailPage() {
  const { slug } = useParams();
  const area = researchAreas.find((a) => a.slug === slug);

  if (!area) return <NotFoundPage />;

  const Icon = area.icon;
  const relatedTools = (area.relatedLabTools ?? [])
    .map((toolSlug) => labTools.find((t) => t.slug === toolSlug))
    .filter((t): t is NonNullable<typeof t> => t !== undefined);

  const meta = [
    { label: "Status", value: area.status },
    ...(relatedTools.length > 0
      ? [{ label: "Lab Tools", value: relatedTools.map((t) => t.name).join(", ") }]
      : []),
  ];

  return (
    <DetailPageLayout eyebrow="Research" title={area.title} meta={meta}>
      <Icon size={28} className="text-accent" />
      <p className="mt-6 text-body-lg text-text-secondary">{area.description}</p>

      {relatedTools.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-3">
          {relatedTools.map((tool) => (
            <Link
              key={tool.slug}
              to={`/lab/${tool.slug}`}
              className="rounded-md border border-border px-4 py-2 text-small font-medium text-text-secondary transition-colors duration-150 hover:border-border-strong hover:text-text-primary"
            >
              {tool.name} &rarr;
            </Link>
          ))}
        </div>
      )}
    </DetailPageLayout>
  );
}
