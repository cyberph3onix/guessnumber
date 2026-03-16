import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cosmic: {
          bg: "#020617",
          surface: "rgba(255,255,255,0.03)",
          border: "rgba(255,255,255,0.08)",
        },
        glow: {
          cyan: "#22d3ee",
          pink: "#ec4899",
          violet: "#8b5cf6",
        },
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        geist: ["var(--font-geist-sans)", "sans-serif"],
      },
      backdropBlur: {
        "4xl": "40px",
        "5xl": "60px",
      },
      animation: {
        "aurora-pulse": "auroraPulse 8s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        "shake": "shake 0.5s ease-in-out",
        "success-glow": "successGlow 1s ease-out",
        "ripple": "ripple 0.6s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
      },
      keyframes: {
        auroraPulse: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.05)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(34,211,238,0.2)" },
          "50%": { boxShadow: "0 0 40px rgba(34,211,238,0.4)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-4px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(4px)" },
        },
        successGlow: {
          "0%": { boxShadow: "0 0 0 rgba(34,211,238,0)" },
          "50%": { boxShadow: "0 0 60px rgba(34,211,238,0.6)" },
          "100%": { boxShadow: "0 0 0 rgba(34,211,238,0)" },
        },
        ripple: {
          "0%": { transform: "scale(0.8)", opacity: "1" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
