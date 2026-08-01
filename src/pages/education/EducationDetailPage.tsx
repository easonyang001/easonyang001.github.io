import { useParams } from "react-router-dom";
import PageShell from "../../components/PageShell.tsx";
import NotFoundPage from "../NotFoundPage.tsx";
import { education } from "../../data/education.ts";

export default function EducationDetailPage() {
  const { slug } = useParams();
  const lesson = education.find((l) => l.slug === slug);

  if (!lesson) return <NotFoundPage />;

  return (
    <PageShell title={lesson.title}>
      <p className="max-w-prose text-body-lg text-text-secondary">{lesson.description}</p>
    </PageShell>
  );
}
