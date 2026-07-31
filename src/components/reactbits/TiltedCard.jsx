import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Wraps children in a subtle 3D tilt that follows the cursor.
 * Inspired by ReactBits' TiltedCard.
 */
export default function TiltedCard({ children, className = "", maxTilt = 8 }) {
  const ref = useRef(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const springX = useSpring(px, { stiffness: 150, damping: 20 });
  const springY = useSpring(py, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(springY, [0, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(springX, [0, 1], [-maxTilt, maxTilt]);

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
