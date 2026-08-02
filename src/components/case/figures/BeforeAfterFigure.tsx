import { KnownFigureRenderer } from "./FigureRenderer.tsx";
import type { BeforeAfterFigure as BeforeAfterFigureType } from "../../../types/figures.ts";

export default function BeforeAfterFigure({ figure }: { figure: BeforeAfterFigureType }) {
  return (
    <div>
      {figure.heading && <h4 className="text-h4 text-text-primary">{figure.heading}</h4>}
      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <p className="mb-2 font-mono text-mono-label uppercase text-text-muted">{figure.before.label}</p>
          <KnownFigureRenderer figure={figure.before.figure} />
        </div>
        <div>
          <p className="mb-2 font-mono text-mono-label uppercase text-text-muted">{figure.after.label}</p>
          <KnownFigureRenderer figure={figure.after.figure} />
        </div>
      </div>
      {figure.caption && <p className="mt-4 text-small text-text-secondary">{figure.caption}</p>}
    </div>
  );
}
