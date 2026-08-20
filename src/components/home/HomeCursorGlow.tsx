import { useEffect, useRef } from "react";

const GLOW_SIZE = 220;
const GLOW_OFFSET = GLOW_SIZE / 2;

export default function HomeCursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ x: -9999, y: -9999 });
  const currentRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let frame = 0;

    const tick = () => {
      const glow = glowRef.current;
      if (!glow) return;

      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.12;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.12;

      glow.style.transform = `translate3d(${currentRef.current.x - GLOW_OFFSET}px, ${
        currentRef.current.y - GLOW_OFFSET
      }px, 0)`;

      frame = window.requestAnimationFrame(tick);
    };

    const handleMove = (event: PointerEvent) => {
      targetRef.current = { x: event.clientX, y: event.clientY };
      currentRef.current = {
        x: currentRef.current.x === -9999 ? event.clientX : currentRef.current.x,
        y: currentRef.current.y === -9999 ? event.clientY : currentRef.current.y,
      };

      const glow = glowRef.current;
      if (glow) glow.classList.add("home-cursor-glow--visible");
    };

    const handleLeave = () => {
      const glow = glowRef.current;
      if (glow) glow.classList.remove("home-cursor-glow--visible");
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", handleLeave);
    frame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handleMove);
      document.documentElement.removeEventListener("pointerleave", handleLeave);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      className="home-cursor-glow pointer-events-none fixed left-0 top-0 z-[4]"
    />
  );
}
