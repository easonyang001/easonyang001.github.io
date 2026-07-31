import { motion } from "framer-motion";

export default function SectionHeading({ index, eyebrow, title, description, align = "left" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`max-w-prose ${align === "center" ? "mx-auto text-center" : ""}`}
    >
      <div className={`eyebrow ${align === "center" ? "justify-center" : ""}`}>
        {index && <span className="eyebrow-index">{index}</span>}
        <span className="eyebrow-rule" />
        <span>{eyebrow}</span>
      </div>

      <h2 className="mt-4 text-h2 md:text-h2-lg text-text-primary">{title}</h2>

      {description && (
        <p className="mt-4 text-body-lg text-text-secondary">{description}</p>
      )}
    </motion.div>
  );
}
