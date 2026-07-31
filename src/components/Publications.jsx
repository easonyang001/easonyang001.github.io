import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Link2, Quote } from "lucide-react";
import { publications } from "../data/publications.js";
import SectionHeading from "./SectionHeading.jsx";

export default function Publications() {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopyBibtex = async (bibtex, index) => {
    try {
      await navigator.clipboard.writeText(bibtex);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      // Clipboard unavailable; silently ignore.
    }
  };

  return (
    <section id="publications" className="section-container border-t border-border">
      <SectionHeading index="03" eyebrow="Publications" title="Publications" />

      <div className="relative mt-12 border-l border-border pl-8">
        {publications.map((pub, i) => (
          <motion.div
            key={pub.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: i * 0.06, ease: "easeOut" }}
            className="relative mb-10 last:mb-0"
          >
            <span className="absolute -left-[2.35rem] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-accent" />

            <div className="glass-card p-8">
              <div className="flex flex-wrap items-center gap-3 font-mono text-mono-label uppercase text-text-muted">
                <span className="text-accent">{pub.year}</span>
                <span>&middot;</span>
                <span>{pub.conference}</span>
              </div>

              <h3 className="mt-3 text-h3 text-text-primary">{pub.title}</h3>
              <p className="mt-3 max-w-prose text-small text-text-secondary">
                {pub.abstract}
              </p>

              <div className="mt-5 flex flex-wrap gap-5">
                <a
                  href={pub.pdfUrl}
                  className="inline-flex items-center gap-1.5 text-small font-medium text-text-secondary transition-colors duration-150 hover:text-accent"
                >
                  <FileText size={14} /> PDF
                </a>
                <a
                  href={pub.doiUrl}
                  className="inline-flex items-center gap-1.5 text-small font-medium text-text-secondary transition-colors duration-150 hover:text-accent"
                >
                  <Link2 size={14} /> DOI
                </a>
                <button
                  onClick={() => handleCopyBibtex(pub.bibtex, i)}
                  className="inline-flex items-center gap-1.5 text-small font-medium text-text-secondary transition-colors duration-150 hover:text-accent"
                >
                  <Quote size={14} />
                  {copiedIndex === i ? "Copied!" : "BibTeX"}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
