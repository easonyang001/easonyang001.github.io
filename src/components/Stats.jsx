import { motion } from "framer-motion";
import CountUp from "./reactbits/CountUp.jsx";
import { researchAreas } from "../data/research.js";
import { projects } from "../data/projects.js";
import { publications } from "../data/publications.js";

const stats = [
  { label: "Research Areas", value: researchAreas.length },
  { label: "Active Projects", value: projects.length },
  { label: "Publications", value: publications.length },
  { label: "Founded", value: 2026, isYear: true },
];

export default function Stats() {
  return (
    <section className="relative border-t border-line bg-surface/30">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-10 px-6 py-14 md:grid-cols-4 md:px-10 lg:px-16">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
            className="text-center md:text-left"
          >
            <p className="font-mono text-4xl font-semibold text-text-primary md:text-5xl">
              {stat.isYear ? stat.value : <CountUp end={stat.value} />}
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-widest2 text-text-secondary">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
