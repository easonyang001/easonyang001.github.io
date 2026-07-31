/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "#020617",
        surface: "#0F172A",
        "surface-raised": "#131C31",
        border: "#1E293B",
        "border-strong": "#334155",
        accent: "#8B5CF6",
        "accent-hover": "#A78BFA",
        "accent-subtle": "rgba(139, 92, 246, 0.12)",
        accent2: "#D946EF",
        text: {
          primary: "#F8FAFC",
          secondary: "#94A3B8",
          muted: "#64748B",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        h1: ["40px", { lineHeight: "1.05", letterSpacing: "-0.02em", fontWeight: "500" }],
        "h1-lg": ["60px", { lineHeight: "1.05", letterSpacing: "-0.02em", fontWeight: "500" }],
        h2: ["30px", { lineHeight: "1.15", letterSpacing: "-0.015em", fontWeight: "500" }],
        "h2-lg": ["36px", { lineHeight: "1.15", letterSpacing: "-0.015em", fontWeight: "500" }],
        h3: ["20px", { lineHeight: "1.30", letterSpacing: "-0.01em", fontWeight: "500" }],
        h4: ["16px", { lineHeight: "1.40", fontWeight: "500" }],
        "body-lg": ["17px", { lineHeight: "1.60" }],
        "body-lg-lg": ["18px", { lineHeight: "1.60" }],
        body: ["16px", { lineHeight: "1.65" }],
        small: ["14px", { lineHeight: "1.50" }],
        "mono-label": ["12px", { lineHeight: "1.40", letterSpacing: "0.08em", fontWeight: "500" }],
      },
      maxWidth: {
        content: "1200px",
        prose: "720px",
      },
      backgroundImage: {
        grid:
          "linear-gradient(to right, rgba(148,163,184,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.04) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
