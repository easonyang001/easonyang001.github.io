import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

interface CharRevealProps {
  text: string;
  className?: string;
  startDelayMs?: number;
  staggerMs?: number;
  wordGapMs?: number;
  charDurationMs?: number;
}

export default function CharReveal({
  text,
  className = "",
  startDelayMs = 500,
  staggerMs = 32,
  wordGapMs = 220,
  charDurationMs = 360,
}: CharRevealProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [started, setStarted] = useState(reduced);

  const words = useMemo(() => text.split(" "), [text]);

  useEffect(() => {
    if (reduced || !inView || started) return;
    const id = window.setTimeout(() => setStarted(true), startDelayMs);
    return () => window.clearTimeout(id);
  }, [inView, reduced, started, startDelayMs]);

  if (reduced) {
    return (
      <h2 ref={ref} className={className}>
        {text}
      </h2>
    );
  }

  return (
    <h2 ref={ref} className={className} aria-label={text}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="block">
        {words.map((word, wordIndex) => (
          <span key={`${word}-${wordIndex}`} className="block whitespace-nowrap">
            {Array.from(word).map((char, charIndex) => {
              const delay = startDelayMs + wordIndex * wordGapMs + charIndex * staggerMs;

              return (
                <motion.span
                  key={`${word}-${wordIndex}-${char}-${charIndex}`}
                  aria-hidden="true"
                  className="inline-block"
                  initial={{ opacity: 0, y: 8, filter: "blur(3px)" }}
                  animate={
                    started
                      ? { opacity: 1, y: 0, filter: "blur(0px)" }
                      : { opacity: 0, y: 8, filter: "blur(3px)" }
                  }
                  transition={{
                    duration: charDurationMs / 1000,
                    delay: delay / 1000,
                    ease: [0.25, 1, 0.5, 1],
                  }}
                >
                  {char}
                </motion.span>
              );
            })}
          </span>
        ))}
      </span>
    </h2>
  );
}
