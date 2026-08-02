import { Download } from "lucide-react";
import type { ReactNode } from "react";

interface FigureFrameProps {
  heading?: string | null;
  caption?: string | null;
  isSynthetic?: boolean;
  onDownload?: () => void;
  children: ReactNode;
}

export default function FigureFrame({ heading, caption, isSynthetic, onDownload, children }: FigureFrameProps) {
  return (
    <div className="glass-card p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          {heading && <h4 className="text-h4 text-text-primary">{heading}</h4>}
          {isSynthetic && (
            <span className="mt-2 inline-block rounded-md bg-accent-subtle px-2 py-1 font-mono text-mono-label uppercase text-accent">
              Synthetic Data
            </span>
          )}
        </div>
        {onDownload && (
          <button
            onClick={onDownload}
            className="flex shrink-0 items-center gap-1.5 text-small font-medium text-text-secondary transition-colors duration-150 hover:text-accent"
            aria-label="Download data as CSV"
          >
            <Download size={14} />
          </button>
        )}
      </div>
      <div className="mt-6">{children}</div>
      {caption && <p className="mt-4 text-small text-text-secondary">{caption}</p>}
    </div>
  );
}
