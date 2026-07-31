import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ01#$%&*+=-_/\\<>~^";

function scramble(target, revealCount) {
  return target
    .split("")
    .map((char, i) => {
      if (char === " ") return " ";
      if (i < revealCount) return char;
      return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    })
    .join("");
}

/**
 * Scrambles through random glyphs before resolving to the target text,
 * left to right. Inspired by ReactBits' DecryptedText.
 */
export default function DecryptedText({
  text,
  className = "",
  speed = 35,
  revealDelay = 0,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = useState(() => scramble(text, 0));

  useEffect(() => {
    if (!inView) return;

    let intervalId;
    let frame = 0;
    const holdFrames = 8;

    const startTimeout = setTimeout(() => {
      intervalId = setInterval(() => {
        frame++;
        const revealCount = Math.max(0, frame - holdFrames);
        if (revealCount >= text.length) {
          setDisplay(text);
          clearInterval(intervalId);
          return;
        }
        setDisplay(scramble(text, revealCount));
      }, speed);
    }, revealDelay);

    return () => {
      clearTimeout(startTimeout);
      clearInterval(intervalId);
    };
  }, [inView, text, speed, revealDelay]);

  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true">{display}</span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
