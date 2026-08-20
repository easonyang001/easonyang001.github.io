import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type RevealVariant = "fade-up" | "fade-down" | "fade-left" | "fade-right" | "fade" | "rotate" | "blur";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
  variant?: RevealVariant;
}

const VARIANT_STYLES: Record<RevealVariant, { opacity: number; x: number; y: number; rotate: number; filter: string }> = {
  "fade-up": { opacity: 0, x: 0, y: 30, rotate: 0, filter: "blur(0px)" },
  "fade-down": { opacity: 0, x: 0, y: -15, rotate: 0, filter: "blur(0px)" },
  "fade-left": { opacity: 0, x: -30, y: 0, rotate: 0, filter: "blur(0px)" },
  "fade-right": { opacity: 0, x: 30, y: 0, rotate: 0, filter: "blur(0px)" },
  fade: { opacity: 0, x: 0, y: 0, rotate: 0, filter: "blur(0px)" },
  rotate: { opacity: 0, x: 0, y: 0, rotate: 10, filter: "blur(0px)" },
  blur: { opacity: 0, x: 0, y: 0, rotate: 0, filter: "blur(12px)" },
};

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  duration = 1,
  once = true,
  amount = 0.55,
  variant = "fade-up",
}: ScrollRevealProps) {
  const reduced = useReducedMotion();
  const initial = reduced ? false : VARIANT_STYLES[variant];

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={reduced ? undefined : { opacity: 1, x: 0, y: 0, rotate: 0, filter: "blur(0px)" }}
      viewport={{ once, amount }}
      transition={{
        duration: reduced ? 0 : duration,
        delay,
        ease: [0.25, 1, 0.5, 1],
      }}
      style={reduced ? undefined : { filter: VARIANT_STYLES[variant].filter }}
    >
      {children}
    </motion.div>
  );
}
