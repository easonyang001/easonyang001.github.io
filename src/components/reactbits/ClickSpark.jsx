import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

let sparkId = 0;

/**
 * Bursts a handful of particles from the click point.
 * Inspired by ReactBits' ClickSpark.
 */
export default function ClickSpark({ children, className = "", color = "#8B5CF6", count = 8 }) {
  const [bursts, setBursts] = useState([]);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = sparkId++;
    const burst = {
      id,
      originX: e.clientX - rect.left,
      originY: e.clientY - rect.top,
      particles: Array.from({ length: count }, (_, i) => (i / count) * Math.PI * 2),
    };
    setBursts((prev) => [...prev, burst]);
    setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== id));
    }, 600);
  };

  return (
    <div onClick={handleClick} className={`relative ${className}`}>
      {children}
      <div className="pointer-events-none absolute inset-0 overflow-visible">
        <AnimatePresence>
          {bursts.map((burst) =>
            burst.particles.map((angle, i) => (
              <motion.span
                key={`${burst.id}-${i}`}
                className="absolute h-1 w-1 rounded-full"
                style={{ left: burst.originX, top: burst.originY, backgroundColor: color }}
                initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                animate={{
                  opacity: 0,
                  x: Math.cos(angle) * 30,
                  y: Math.sin(angle) * 30,
                  scale: 0,
                }}
                transition={{ duration: 0.55, ease: "easeOut" }}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
