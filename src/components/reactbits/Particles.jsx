import { useEffect, useRef } from "react";

/**
 * A lightweight canvas constellation field: drifting dots that link with
 * faint lines when close together. Dependency-free (no OGL/Three).
 * Inspired by ReactBits' Particles background.
 */
export default function Particles({ className = "", color = "139, 92, 246", linkDistance = 130 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;
    let points = [];
    let raf;

    const resize = () => {
      width = canvas.width = canvas.offsetWidth * dpr;
      height = canvas.height = canvas.offsetHeight * dpr;
      const count = Math.min(90, Math.floor((width * height) / 22000));
      points = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      }));
    };

    const step = () => {
      ctx.clearRect(0, 0, width, height);

      points.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.3 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, 0.55)`;
        ctx.fill();
      });

      const maxDist = linkDistance * dpr;
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.strokeStyle = `rgba(${color}, ${0.14 * (1 - dist / maxDist)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(step);
    };

    resize();
    step();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [color, linkDistance]);

  return <canvas ref={canvasRef} className={`h-full w-full ${className}`} />;
}
