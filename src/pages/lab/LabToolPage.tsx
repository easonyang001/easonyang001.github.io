import { useParams } from "react-router-dom";
import PageShell from "../../components/PageShell.tsx";
import NotFoundPage from "../NotFoundPage.tsx";
import { labTools } from "../../data/labTools.ts";

export default function LabToolPage() {
  const { toolSlug } = useParams();
  const tool = labTools.find((t) => t.slug === toolSlug);

  if (!tool) return <NotFoundPage />;

  return (
    <PageShell eyebrow="Lab" title={tool.name} description={tool.description}>
      <div className="glass-card p-8">
        <p className="font-mono text-mono-label uppercase text-accent">{tool.status}</p>
        <p className="mt-4 text-body-lg text-text-secondary">
          This tool is under construction. Full functionality lands in a later build.
        </p>
      </div>
    </PageShell>
  );
}
