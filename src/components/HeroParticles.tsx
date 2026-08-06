import { useEffect, useRef } from "react";

/**
 * Sparse atmosphere layer -- desktop/mobile counts and speed tuned per the
 * "Quantum Universe" Hero spec's particle-field numbers. Canvas rather than
 * the reactbits Particles component since the tuning differs (radius,
 * opacity, color), not just a color swap.
 */
const SPEED = 0.06;

interface Point {
  x: number;
  y: number;
  r: number;
  baseOpacity: number;
  phase: number;
  vx: number;
  vy: number;
}

interface HeroParticlesProps {
  desktopCount?: number;
  mobileCount?: number;
}

export default function HeroParticles({ desktopCount = 65, mobileCount = 24 }: HeroParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let points: Point[] = [];

    const seed = () => {
      const count = window.matchMedia("(max-width: 767px)").matches ? mobileCount : desktopCount;
      points = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.5 + Math.random() * 1.1,
        baseOpacity: 0.05 + Math.random() * 0.12,
        phase: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED * 0.6,
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    let frameId = 0;
    let t = 0;

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of points) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(103, 232, 249, ${p.baseOpacity})`;
        ctx.fill();
      }
    };

    const tick = () => {
      t += 1;
      ctx.clearRect(0, 0, width, height);
      for (const p of points) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -5) p.x = width + 5;
        if (p.x > width + 5) p.x = -5;
        if (p.y < -5) p.y = height + 5;
        if (p.y > height + 5) p.y = -5;
        const twinkle = 0.75 + 0.25 * Math.sin(t * 0.01 + p.phase);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(103, 232, 249, ${p.baseOpacity * twinkle})`;
        ctx.fill();
      }
      frameId = requestAnimationFrame(tick);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frameId);
      } else if (!reduced) {
        frameId = requestAnimationFrame(tick);
      }
    };

    if (reduced) {
      drawStatic();
    } else {
      frameId = requestAnimationFrame(tick);
      document.addEventListener("visibilitychange", handleVisibility);
    }

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}