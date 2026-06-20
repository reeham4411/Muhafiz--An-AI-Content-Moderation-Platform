/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        // Base surfaces
        canvas: "#FAFAF8",        // soft off-white background
        surface: "#FFFFFF",       // card white
        "surface-muted": "#F4F4F1",
        border: {
          DEFAULT: "#E5E7E3",
          strong: "#D4D7D1",
        },
        // Text
        ink: {
          DEFAULT: "#1C2226",     // charcoal-slate body text
          muted: "#5B6460",
          faint: "#8A938E",
        },
        // Brand / accent system
        teal: {
          50: "#EFFBF9", 100: "#D6F3EE", 300: "#7FCFC2",
          500: "#14938A", 600: "#0F766E", 700: "#0C5C56", 900: "#073C38",
        },
        emerald: {
          50: "#ECFDF5", 100: "#D1FAE5", 300: "#6EE7B7",
          500: "#10B981", 600: "#059669", 700: "#047857",
        },
        amber: {
          50: "#FFFBEB", 100: "#FEF3C7", 300: "#FCD34D",
          500: "#F59E0B", 600: "#D97706", 700: "#B45309",
        },
        coral: {
          50: "#FDF3F1", 100: "#FBE2DD", 300: "#F0A99A",
          500: "#E96E58", 600: "#E25C4D", 700: "#B8402F",
        },
        slate: {
          50: "#F8F9F8", 100: "#EEF0EE", 300: "#C3C9C4",
          500: "#76817B", 600: "#5B6460", 700: "#414945", 900: "#1C2226",
        },
      },
      fontFamily: {
        display: ["var(--font-sora)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jbmono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgba(28,34,38,0.04), 0 4px 16px -4px rgba(28,34,38,0.06)",
        card: "0 1px 3px 0 rgba(28,34,38,0.05), 0 8px 24px -8px rgba(28,34,38,0.08)",
        lifted: "0 4px 12px -2px rgba(28,34,38,0.08), 0 16px 40px -12px rgba(28,34,38,0.12)",
        glow: "0 0 0 1px rgba(15,118,110,0.08), 0 8px 30px -8px rgba(15,118,110,0.25)",
      },
      keyframes: {
        "blob-float": {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(20px, -30px) scale(1.05)" },
          "66%": { transform: "translate(-15px, 15px) scale(0.97)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "blob-float": "blob-float 18s ease-in-out infinite",
        "blob-float-slow": "blob-float 26s ease-in-out infinite",
        "fade-up": "fade-up 0.5s ease-out forwards",
        "fade-in": "fade-in 0.4s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};
