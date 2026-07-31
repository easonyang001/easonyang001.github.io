import { motion } from "framer-motion";

/**
 * Reveals text word-by-word (or char-by-char) with a staggered slide-up,
 * clipped by an overflow-hidden mask. Inspired by ReactBits' SplitText.
 */
export default function SplitText({
  text,
  as: Tag = "span",
  className = "",
  splitBy = "words",
  delay = 0,
  staggerDelay = 0.045,
  once = true,
}) {
  const pieces = splitBy === "chars" ? Array.from(text) : text.split(" ");
  const separator = " ";

  return (
    <Tag className={className}>
      {pieces.map((piece, i) => (
        <span key={i} className="inline-block overflow-hidden align-top">
          <motion.span
            className="inline-block"
            initial={{ y: "110%", opacity: 0 }}
            whileInView={{ y: "0%", opacity: 1 }}
            viewport={{ once, amount: 0.6 }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
              delay: delay + i * staggerDelay,
            }}
          >
            {piece}
            {splitBy === "words" && i < pieces.length - 1 ? separator : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
