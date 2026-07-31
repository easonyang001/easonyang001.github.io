import { Link } from "react-router-dom";

const BORDER_COLOR = "#1E293B";
const ACCENT_COLOR = "#8B5CF6";

interface SimpleBlochSphereProps {
  className?: string;
}

/**
 * Hand-drawn SVG stand-in for the Bloch sphere used behind the hero.
 * No Three.js here by design — the full R3F version lives at /lab/bloch-sphere.
 */
export default function SimpleBlochSphere({ className = "" }: SimpleBlochSphereProps) {
  return (
    <Link
      to="/lab/bloch-sphere"
      aria-label="Open the Bloch Sphere lab tool"
      className={`pointer-events-auto block ${className}`}
    >
      <svg viewBox="0 0 200 200" className="bloch-spin h-full w-full" aria-hidden="true">
        <circle cx="100" cy="100" r="88" stroke={BORDER_COLOR} strokeWidth="1" fill="none" />
        <ellipse cx="100" cy="100" rx="88" ry="26" stroke={BORDER_COLOR} strokeWidth="1" fill="none" />
        <ellipse cx="100" cy="100" rx="26" ry="88" stroke={BORDER_COLOR} strokeWidth="1" fill="none" />
        <ellipse
          cx="100"
          cy="100"
          rx="26"
          ry="88"
          stroke={BORDER_COLOR}
          strokeWidth="1"
          fill="none"
          transform="rotate(60 100 100)"
        />
        <ellipse
          cx="100"
          cy="100"
          rx="26"
          ry="88"
          stroke={BORDER_COLOR}
          strokeWidth="1"
          fill="none"
          transform="rotate(120 100 100)"
        />
        <line x1="100" y1="100" x2="151" y2="49" stroke={ACCENT_COLOR} strokeWidth="1.5" />
        <circle cx="151" cy="49" r="4" fill={ACCENT_COLOR} />
      </svg>
    </Link>
  );
}
