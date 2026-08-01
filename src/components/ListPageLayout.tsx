import type { ReactNode } from "react";

interface ListPageLayoutProps {
  eyebrow?: string;
  title: string;
  description?: string;
  filters?: ReactNode;
  resultCount?: number;
  children: ReactNode;
}

export default function ListPageLayout({
  eyebrow,
  title,
  description,
  filters,
  resultCount,
  children,
}: ListPageLayoutProps) {
  return (
    <section className="section-container border-t border-border">
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 lg:grid-cols-12">
        <div className="lg:sticky lg:top-24 lg:col-span-4 lg:self-start">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className={`${eyebrow ? "mt-4" : ""} text-h2 text-text-primary`}>{title}</h1>
          {description && <p className="mt-4 text-body-lg text-text-secondary">{description}</p>}
          {filters && <div className="mt-8">{filters}</div>}
        </div>

        <div className="lg:col-span-7 lg:col-start-6">
          {typeof resultCount === "number" && (
            <p className="mb-6 font-mono text-mono-label uppercase text-text-muted">
              {resultCount} {resultCount === 1 ? "Result" : "Results"}
            </p>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}
