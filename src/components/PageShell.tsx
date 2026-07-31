import type { ReactNode } from "react";

interface PageShellProps {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
}

export default function PageShell({ eyebrow, title, description, children }: PageShellProps) {
  return (
    <section className="section-container border-t border-border">
      <div className="max-w-prose">
        <div className="eyebrow">
          <span className="eyebrow-rule" />
          <span>{eyebrow}</span>
        </div>
        <h1 className="mt-4 text-h2 md:text-h2-lg text-text-primary">{title}</h1>
        {description && (
          <p className="mt-4 text-body-lg text-text-secondary">{description}</p>
        )}
      </div>

      {children && <div className="mt-12">{children}</div>}
    </section>
  );
}
