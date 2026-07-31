import { motion } from "framer-motion";
import { news } from "../data/news.js";

export default function News() {
  return (
    <section id="news" className="section-container">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="section-heading"
      >
        News
      </motion.h2>

      <div className="mt-12 relative border-l border-white/10 pl-8">
        {news.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
            className="relative mb-8 last:mb-0"
          >
            <span className="absolute -left-[2.35rem] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-accent" />
            <time className="text-xs font-medium text-text-secondary">
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
