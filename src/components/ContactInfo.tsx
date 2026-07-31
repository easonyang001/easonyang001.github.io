import { useState } from "react";
import { Mail, Github, MapPin, Copy, Check } from "lucide-react";
import { site } from "../data/site.ts";

export default function ContactInfo() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    if (!site.email) return;
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable; silently ignore.
    }
  };

  return (
    <div className="max-w-prose space-y-6">
      {site.email && (
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent-subtle text-accent">
            <Mail size={18} />
          </div>
          <div className="flex flex-1 flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-mono-label uppercase text-text-muted">Email</p>
              <a
                href={`mailto:${site.email}`}
                className="text-body text-text-primary transition-colors duration-150 hover:text-accent"
              >
                {site.email}
              </a>
            </div>
            <button
              onClick={handleCopyEmail}
              className="inline-flex items-center gap-1.5 text-small font-medium text-text-secondary transition-colors duration-150 hover:text-accent"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy Email"}
            </button>
          </div>
        </div>
      )}

      {site.githubUrl && (
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent-subtle text-accent">
            <Github size={18} />
          </div>
          <div>
            <p className="font-mono text-mono-label uppercase text-text-muted">GitHub</p>
            <a
              href={site.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="text-body text-text-primary transition-colors duration-150 hover:text-accent"
            >
              {site.githubHandle}
            </a>
          </div>
        </div>
      )}

      {site.location && (
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent-subtle text-accent">
            <MapPin size={18} />
          </div>
          <div>
            <p className="font-mono text-mono-label uppercase text-text-muted">Location</p>
            <p className="text-body text-text-primary">{site.location}</p>
          </div>
        </div>
      )}
    </div>
  );
}
