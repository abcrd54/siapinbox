import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101828",
        paper: "#f7f9fc",
        line: "#d9e2ec",
        brand: "#0f766e",
        accent: "#2563eb",
        warn: "#b45309",
        danger: "#be123c",
        success: "#047857",
        muted: "#667085"
      },
      boxShadow: {
        panel: "0 16px 48px rgba(16, 24, 40, 0.08)",
        focus: "0 0 0 4px rgba(37, 99, 235, 0.12)"
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
};

export default config;
