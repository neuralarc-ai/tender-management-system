import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F5EEE6", // Soft warm beige (matches Helium aesthetic)
        foreground: "#3D4A4A",  // Muted dark teal-gray
        
        // Helium-Inspired Color Palette (Muted & Sophisticated)
        passion: {
          DEFAULT: "#D97854", // Muted coral/terracotta (softer than before)
          light: "#E8A88F",    // Light coral
          dark: "#C4674A",     // Deep coral
        },
        aurora: {
          DEFAULT: "#E8C4A8", // Warm peachy beige
          light: "#F2D9C4",
          dark: "#D4B095",
        },
        quantum: {
          DEFAULT: "#A599C4", // Muted lavender/purple
          light: "#C4BBDB",
          dark: "#8A7FA8",
        },
        neural: {
          DEFAULT: "#3D4A4A", // Muted dark teal-gray (not pure black)
          light: "#5A6A6A",
          dark: "#2A3535",
        },
        drift: {
          DEFAULT: "#88B5B8", // Muted teal/cyan
          light: "#A8CDD0",
          dark: "#6A9598",
        },
        solar: {
          DEFAULT: "#E8C47F", // Muted gold/sand
          light: "#F2D9A8",
          dark: "#D4B066",
        },
        verdant: {
          DEFAULT: "#4A6A6A", // Deep teal/forest
          light: "#668080",
          dark: "#3A5555",
        },
        salmon: {
          DEFAULT: "#D4A5A5", // Soft salmon pink
          light: "#E8C4C4",
          dark: "#C48F8F",
        },
        
        // Semantic color mappings
        primary: {
          DEFAULT: "#D97854",  // Muted coral
          foreground: "#ffffff",
          light: "#E8A88F",
          dark: "#C4674A",
        },
        secondary: {
          DEFAULT: "#A599C4",  // Muted lavender
          foreground: "#ffffff",
          light: "#C4BBDB",
          dark: "#8A7FA8",
        },
        accent: {
          DEFAULT: "#88B5B8",  // Muted teal
          foreground: "#3D4A4A",
          light: "#A8CDD0",
          dark: "#6A9598",
        },
        destructive: {
          DEFAULT: "#D97854",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#F5EEE6",
          foreground: "#6b7280",
        },
        success: {
          DEFAULT: "#4A6A6A",  // Deep teal
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: "#E8C47F",  // Muted gold
          foreground: "#3D4A4A",
        },
        info: {
          DEFAULT: "#88B5B8",  // Muted teal
          foreground: "#3D4A4A",
        },
      },
    },
  },
  plugins: [],
};
export default config;


