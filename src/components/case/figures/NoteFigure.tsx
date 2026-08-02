import FigureFrame from "./FigureFrame.tsx";
import type { NoteFigure as NoteFigureType } from "../../../types/figures.ts";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Minimal, safe markdown: paragraphs on blank lines, **bold** only. */
function renderMarkdown(markdown: string): string {
  return markdown
    .split(/\n{2,}/)
    .map((para) => `<p>${escapeHtml(para).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</p>`)
    .join("");
}

export default function NoteFigure({ figure }: { figure: NoteFigureType }) {
  return (
    <FigureFrame heading={figure.heading} caption={figure.caption}>
      <div
        className="max-w-prose text-body text-text-secondary [&_p+p]:mt-3 [&_strong]:text-text-primary [&_strong]:font-medium"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(figure.markdown) }}
      />
    </FigureFrame>
  );
}
