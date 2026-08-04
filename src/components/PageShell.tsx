import type { ReactNode } from "react";
import { useSeo } from "../lib/seo/useSeo.ts";

interface PageShellProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  /** Canonical path for this page, e.g. "/contact". */
  path: string;
}

export default function PageShell({ eyebrow, title, description, children, path }: PageShellProps) {
  useSeo({ title, description, path });

  return (
    <section className="section-container border-t border-border">
      <div className="max-w-prose">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className={`${eyebrow ? "mt-4" : ""} text-h2 md:text-h2-lg text-text-primary`}>{title}</h1>
        {description && (
          <p className="mt-4 text-body-lg text-text-secondary">{description}</p>
        )}
      </div>

      {children && <div className="mt-12">{children}</div>}
    </section>
  );
}
