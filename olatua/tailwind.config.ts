import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0A1B24",
        surface: "#123442",
        foam: "#EEF2F0",
        "foam-dim": "rgba(238,242,240,0.62)",
        "foam-faint": "rgba(238,242,240,0.45)",
        line: "rgba(238,242,240,0.14)",
        marea: "#1C8A73",
        cielo: "#2C7DA0",
        arena: "#D8C7A0",
        coral: "#FF5630",
        good: "#13895A",
        caution: "#CF9018",
        big: "#DF4D28",
        flat: "#86A09F",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: { card: "14px" },
    },
  },
  plugins: [],
};

export default config;
