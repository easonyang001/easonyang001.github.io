/**
 * A muted-tone text with an animated light sweep passing across it on loop.
 * Inspired by ReactBits' ShinyText.
 */
export default function ShinyText({ text, className = "", speed = 3 }) {
  return (
    <span
      className={`inline-block animate-shine bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(110deg, rgba(248,250,252,0.35) 0%, rgba(248,250,252,0.35) 40%, #ffffff 50%, rgba(248,250,252,0.35) 60%, rgba(248,250,252,0.35) 100%)",
        backgroundSize: "200% 100%",
        animationDuration: `${speed}s`,
      }}
    >
      {text}
    </span>
  );
}
