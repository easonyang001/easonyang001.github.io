import { site } from "../data/site.ts";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-content px-6 py-10 md:px-12">
        <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <div>
            <img src="/brand/logo.png" alt={site.name} className="h-16 w-auto" />
            <p className="mt-2 text-small text-text-secondary">
              {site.name} {site.tagline}
            </p>
          </div>
          <p className="font-mono text-mono-label uppercase text-text-muted">
            &copy; 2026 Mrama Institute. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
