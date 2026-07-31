import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Link2, Quote } from "lucide-react";
import { publications } from "../data/publications.js";
import SectionHeading from "./SectionHeading.jsx";
import SpotlightCard from "./reactbits/SpotlightCard.jsx";

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
    <section id="publications" className="section-container border-t border-line">
      <SectionHeading index="03" eyebrow="Publications" title="Publications" />

      <div className="relative mt-14 border-l border-line pl-8">
        {publications.map((pub, i) => (
          <motion.div
            key={pub.title}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
            className="relative mb-10 last:mb-0"
          >
            <span className="absolute -left-[2.35rem] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-accent shadow-glow" />

            <SpotlightCard className="glass-card p-6 hover:border-accent/30">
              <div className="flex flex-wrap items-center gap-3 font-mono text-xs font-medium text-text-secondary">
                <span className="text-accent">{pub.year}</span>
                <span>&middot;</span>
                <span>{pub.conference}</span>
              </div>

              <h3 className="mt-3 text-lg font-semibold text-text-primary">
                {pub.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                {pub.abstract}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={pub.pdfUrl}
                  className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs font-semibold text-text-primary transition-colors duration-300 hover:border-accent hover:text-accent"
                >
                  <FileText size={14} /> PDF
                </a>
                <a
                  href={pub.doiUrl}
                  className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs font-semibold text-text-primary transition-colors duration-300 hover:border-accent hover:text-accent"
                >
                  <Link2 size={14} /> DOI
                </a>
                <button
                  onClick={() => handleCopyBibtex(pub.bibtex, i)}
                  className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs font-semibold text-text-primary transition-colors duration-300 hover:border-accent hover:text-accent"
                >
                  <Quote size={14} />
                  {copiedIndex === i ? "Copied!" : "BibTeX"}
                </button>
              </div>
            </SpotlightCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
