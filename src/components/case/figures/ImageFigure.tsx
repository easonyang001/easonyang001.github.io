import FigureFrame from "./FigureFrame.tsx";
import type { ImageFigure as ImageFigureType } from "../../../types/figures.ts";

export default function ImageFigure({ figure }: { figure: ImageFigureType }) {
  return (
    <FigureFrame heading={figure.heading} caption={figure.caption}>
      <img src={figure.src} alt={figure.alt} className="w-full rounded-panel" />
      <p className="mt-2 text-small text-text-muted">Source data: {figure.sourceData}</p>
    </FigureFrame>
  );
}
