import type { ReactNode } from "react";

interface ToolPageLayoutProps {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  panel: ReactNode;
  children: ReactNode;
}

export default function ToolPageLayout({
  eyebrow,
  title,
  description,
  panel,
  children,
}: ToolPageLayoutProps) {
  return (
    <div className="section-container border-t border-border">
      <div className="max-w-prose">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 text-h2 text-text-primary">{title}</h1>
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
