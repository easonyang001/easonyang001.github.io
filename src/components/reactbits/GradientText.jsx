/**
 * Text filled with a moving violet-to-fuchsia gradient.
 * Inspired by ReactBits' GradientText.
 */
export default function GradientText({ text, children, className = "", animate = true }) {
  return (
    <span
      className={`inline-block bg-accent-gradient bg-clip-text text-transparent ${
        animate ? "animate-shine" : ""
      } ${className}`}
      style={{ backgroundSize: "200% 100%" }}
    >
      {text ?? children}
    </span>
  );
}
