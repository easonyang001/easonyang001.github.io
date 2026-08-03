import { useParams } from "react-router-dom";
import DetailPageLayout from "../../components/DetailPageLayout.tsx";
import NotFoundPage from "../NotFoundPage.tsx";
import { projects } from "../../data/projects.ts";

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const project = projects.find((p) => p.slug === slug);

  if (!project) return <NotFoundPage />;

  const meta = [
    { label: "Status", value: project.status },
    { label: "Year", value: String(project.year) },
    ...(project.technologies.length > 0 ? [{ label: "Technologies", value: project.technologies.join(", ") }] : []),
    ...(project.researchAreas.length > 0 ? [{ label: "Research Areas", value: project.researchAreas.join(", ") }] : []),
  ];

  return (
    <DetailPageLayout title={project.title} meta={meta}>
      <p className="text-body-lg text-text-secondary">{project.summary}</p>

      {project.readMoreUrl && (
        <a
          href={project.readMoreUrl}
          className="mt-8 inline-block text-small font-medium text-accent transition-colors duration-150 hover:text-accent-hover"
        >
          Read More &rarr;
        </a>
      )}
    </DetailPageLayout>
  );
}
