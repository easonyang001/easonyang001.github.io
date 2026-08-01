import type { ReactNode } from "react";

interface MetaItem {
  label: string;
  value: string;
}

interface DetailPageLayoutProps {
  eyebrow?: string;
  title: string;
  meta?: MetaItem[];
  children?: ReactNode;
}

export default function DetailPageLayout({ eyebrow, title, meta = [], children }: DetailPageLayoutProps) {
  return (
    <section className="section-container border-t border-border">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-8">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className={`${eyebrow ? "mt-4" : ""} text-h2 text-text-primary`}>{title}</h1>
          {children && <div className="mt-8 max-w-prose">{children}</div>}
        </div>

        {meta.length > 0 && (
          <div className="lg:col-span-4">
            <div className="space-y-4 border-t border-border pt-6 lg:border-l lg:border-t-0 lg:border-border lg:pl-8 lg:pt-0">
              {meta.map((item) => (
                <div key={item.label}>
                  <p className="font-mono text-mono-label uppercase text-text-muted">{item.label}</p>
                  <p className="mt-1 text-small text-text-primary">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
