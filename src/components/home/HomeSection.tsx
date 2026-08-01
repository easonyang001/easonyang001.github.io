import { Link } from "react-router-dom";
import type { ReactNode } from "react";

interface HomeSectionProps {
  eyebrow?: string;
  title: string;
  description?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  children: ReactNode;
}

export default function HomeSection({
  eyebrow,
  title,
  description,
  viewAllHref,
  viewAllLabel = "View all",
  children,
}: HomeSectionProps) {
  return (
    <section className="section-container border-t border-border">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-4">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 className={`${eyebrow ? "mt-4" : ""} text-h2 text-text-primary`}>{title}</h2>
          {description && <p className="mt-4 text-body-lg text-text-secondary">{description}</p>}
          {viewAllHref && (
            <Link
              to={viewAllHref}
              className="mt-6 inline-block text-small font-medium text-accent transition-colors duration-150 hover:text-accent-hover"
            >
              {viewAllLabel} &rarr;
            </Link>
          )}
        </div>
        <div className="lg:col-span-7 lg:col-start-6">{children}</div>
      </div>
    </section>
  );
}
