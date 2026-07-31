import { motion } from "framer-motion";
import { news } from "../data/news.js";
import SectionHeading from "./SectionHeading.jsx";

export default function News() {
  return (
    <section id="news" className="section-container border-t border-border">
      <SectionHeading index="05" eyebrow="News" title="News" />

      <div className="relative mt-12 border-l border-border pl-8">
        {news.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: i * 0.06, ease: "easeOut" }}
            className="relative mb-8 last:mb-0"
          >
            <span className="absolute -left-[2.35rem] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-accent" />
            <time className="font-mono text-mono-label uppercase text-text-muted">
              {new Date(item.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <h3 className="mt-1 text-h3 text-text-primary">{item.title}</h3>
            <p className="mt-2 text-small text-text-secondary">{item.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
