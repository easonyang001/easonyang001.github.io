import type { ReactNode } from "react";
import { useSeo } from "../lib/seo/useSeo.ts";

interface ToolPageLayoutProps {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  /** Plain-text description for meta tags -- `description` above is often JSX. */
  seoDescription?: string;
  panel: ReactNode;
  children: ReactNode;
  /** Canonical path for this page, e.g. "/lab/bloch-sphere". */
  path: string;
}

export default function ToolPageLayout({
  eyebrow,
  title,
  description,
  seoDescription,
  panel,
  children,
  path,
}: ToolPageLayoutProps) {
  useSeo({ title, description: seoDescription, path });

  return (
    <div className="section-container border-t border-border">
      <div className="max-w-prose">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className={`${eyebrow ? "mt-4" : ""} text-h2 text-text-primary`}>{title}</h1>
        {description}
      </div>

      <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        <div className="order-2 w-full min-w-0 shrink-0 rounded-lg border border-panel-border bg-panel-bg p-6 lg:order-1 lg:w-[320px]">
          {panel}
        </div>
        <div className="order-1 min-w-0 flex-1 lg:order-2">{children}</div>
      </div>
    </div>
  );
}
