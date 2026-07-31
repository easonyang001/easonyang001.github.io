import { motion } from "framer-motion";
import { news } from "../data/news.js";
import SectionHeading from "./SectionHeading.jsx";

export default function News() {
  return (
    <section id="news" className="section-container border-t border-line">
      <SectionHeading index="05" eyebrow="News" title="News" />

      <div className="relative mt-14 border-l border-line pl-8">
        {news.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
            className="relative mb-8 last:mb-0"
          >
            <span className="absolute -left-[2.35rem] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-accent shadow-glow" />
            <time className="font-mono text-xs font-medium text-text-secondary">
              {new Date(item.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <h3 className="mt-1 text-lg font-semibold text-text-primary">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {item.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
