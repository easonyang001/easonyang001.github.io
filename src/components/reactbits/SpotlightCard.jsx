import { useRef } from "react";

/**
 * A card wrapper that renders a radial glow following the cursor.
 * Inspired by ReactBits' SpotlightCard.
 */
export default function SpotlightCard({
  children,
  className = "",
  contentClassName = "",
  spotlightColor = "rgba(37, 99, 235, 0.22)",
  as: Tag = "div",
  ...rest
}) {
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    const card = ref.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--spotlight-x", `${e.clientX - rect.left}px`);
    card.style.setProperty("--spotlight-y", `${e.clientY - rect.top}px`);
  };

  return (
    <Tag
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`group relative overflow-hidden ${className}`}
      {...rest}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(420px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), " +
            spotlightColor +
            ", transparent 70%)",
        }}
      />
      <div className={`relative z-10 ${contentClassName}`}>{children}</div>
    </Tag>
  );
}
