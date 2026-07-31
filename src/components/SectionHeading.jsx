import { motion } from "framer-motion";

export default function SectionHeading({ index, eyebrow, title, description, align = "left" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}
    >
      <div className={`eyebrow ${align === "center" ? "justify-center" : ""}`}>
        {index && <span className="eyebrow-index">{index}</span>}
        <span className="eyebrow-rule" />
        <span>{eyebrow}</span>
      </div>
      <h2 className="mt-5 text-3xl font-semibold tracking-tight text-text-primary md:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-base leading-relaxed text-text-secondary md:text-lg">
          {description}
        </p>
      )}
    </motion.div>
  );
}
