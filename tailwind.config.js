/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
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
        panel: {
          bg: "#0B1220",
          border: "#1E293B",
          divider: "#172033",
        },
        readout: {
          bg: "#060B18",
        },
        magma: {
          0: "#000004",
          1: "#3B0F70",
          2: "#8C2981",
          3: "#DE4968",
          4: "#FE9F6D",
          5: "#FCFDBF",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        display: ["44px", { lineHeight: "0.95", letterSpacing: "-0.035em", fontWeight: "500" }],
        "display-lg": ["112px", { lineHeight: "0.95", letterSpacing: "-0.035em", fontWeight: "500" }],
        h2: ["34px", { lineHeight: "1.05", letterSpacing: "-0.025em", fontWeight: "500" }],
        "h2-lg": ["56px", { lineHeight: "1.05", letterSpacing: "-0.025em", fontWeight: "500" }],
        h3: ["19px", { lineHeight: "1.35", letterSpacing: "-0.005em", fontWeight: "500" }],
        h4: ["16px", { lineHeight: "1.40", fontWeight: "500" }],
        "body-lg": ["17px", { lineHeight: "1.60" }],
        "body-lg-lg": ["18px", { lineHeight: "1.60" }],
        body: ["16px", { lineHeight: "1.65" }],
        small: ["13px", { lineHeight: "1.50" }],
        "mono-label": ["15px", { lineHeight: "1.40", letterSpacing: "0.16em", fontWeight: "500" }],
      },
      maxWidth: {
        content: "1200px",
        prose: "720px",
      },
      borderRadius: {
        panel: "4px",
      },
      backgroundImage: {
        grid:
          "linear-gradient(to right, rgba(148,163,184,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.04) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
