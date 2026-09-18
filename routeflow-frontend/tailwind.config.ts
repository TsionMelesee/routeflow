import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
  "./app/**/*.{js,ts,jsx,tsx,mdx}",
  "./components/**/*.{js,ts,jsx,tsx,mdx}",
  "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  "./providers/**/*.{js,ts,jsx,tsx,mdx}",
  "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
],
  theme: {
    extend: {
      colors: {
        ink: "#0F172A",
        canvas: "#F5F6FA",
        surface: "#FFFFFF",
        brand: {
          DEFAULT: "#2A4B8D",
          50: "#EEF2FA",
          100: "#D9E2F3",
          200: "#B3C5E7",
          300: "#8DA8DB",
          400: "#5F80C4",
          500: "#2A4B8D",
          600: "#233F78",
          700: "#1C3263",
          800: "#15264E",
          900: "#0E1938",
        },
        accent: {
          DEFAULT: "#F59E0B",
          50: "#FFFBEB",
          100: "#FEF3C7",
          500: "#F59E0B",
          600: "#D97706",
        },
        border: "#E2E5EC",
        success: { DEFAULT: "#16A34A", bg: "#F0FDF4" },
        warning: { DEFAULT: "#D97706", bg: "#FFFBEB" },
        danger: { DEFAULT: "#DC2626", bg: "#FEF2F2" },
        info: { DEFAULT: "#2563EB", bg: "#EFF6FF" },
        neutral: { DEFAULT: "#64748B", bg: "#F1F5F9" },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "8px",
        control: "6px",
      },
      boxShadow: {
        elevated: "0 4px 16px -4px rgba(15, 23, 42, 0.12), 0 2px 4px -2px rgba(15, 23, 42, 0.08)",
      },
      fontFeatureSettings: {
        tabular: '"tnum" 1, "lnum" 1',
      },
    },
  },
  plugins: [],
};

export default config;
