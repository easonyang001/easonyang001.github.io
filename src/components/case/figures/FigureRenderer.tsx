import { isKnownFigure, type KnownFigure } from "../../../types/figures.ts";
import SeriesFigure from "./SeriesFigure.tsx";
import PointsFigure from "./PointsFigure.tsx";
import MatrixFigure from "./MatrixFigure.tsx";
import BarsFigure from "./BarsFigure.tsx";
import TableFigure from "./TableFigure.tsx";
import BeforeAfterFigure from "./BeforeAfterFigure.tsx";
import ImageFigure from "./ImageFigure.tsx";
import NoteFigure from "./NoteFigure.tsx";

/** Unrecognized figure types are skipped, not rejected -- see contract/README.md. */
export default function FigureRenderer({ figure }: { figure: { type: string } }) {
  if (!isKnownFigure(figure)) return null;
  return <KnownFigureRenderer figure={figure} />;
}

export function KnownFigureRenderer({ figure }: { figure: KnownFigure }) {
  switch (figure.type) {
    case "series":
      return <SeriesFigure figure={figure} />;
    case "points":
      return <PointsFigure figure={figure} />;
    case "matrix":
      return <MatrixFigure figure={figure} />;
    case "bars":
      return <BarsFigure figure={figure} />;
    case "table":
      return <TableFigure figure={figure} />;
    case "beforeAfter":
      return <BeforeAfterFigure figure={figure} />;
    case "image":
      return <ImageFigure figure={figure} />;
    case "note":
      return <NoteFigure figure={figure} />;
  }
}
