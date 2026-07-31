import { motion } from "framer-motion";
import SplitText from "./reactbits/SplitText.jsx";

export default function SectionHeading({ index, eyebrow, title, description, align = "left" }) {
  return (
    <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`eyebrow ${align === "center" ? "justify-center" : ""}`}
      >
        {index && <span className="eyebrow-index">{index}</span>}
        <span className="eyebrow-rule" />
        <span>{eyebrow}</span>
      </motion.div>

      <h2 className="mt-5 text-3xl font-semibold tracking-tight text-text-primary md:text-4xl lg:text-[2.75rem]">
        <SplitText text={title} splitBy="words" staggerDelay={0.06} />
      </h2>

      {description && (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          className="mt-5 text-base leading-relaxed text-text-secondary md:text-lg"
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}
