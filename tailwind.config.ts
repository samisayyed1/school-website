import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "vip-hero":
          "radial-gradient(ellipse at top left, #0E6B52 0%, #0B4F3C 45%, #082F25 100%)",
      },
      colors: {
        // VIP School brand palette
        vip: {
          emerald: "#0B4F3C",
          emeraldDark: "#082F25",
          emeraldMid: "#0E6B52",
          gold: "#C9A24B",
          goldSoft: "#E5C77E",
          cream: "#FAF7F1",
          ink: "#0F1E1A",
          muted: "#5C6A66",
        },
        // Legacy starter palette (used by dashboard)
        lamaSky: "#C3EBFA",
        lamaSkyLight: "#EDF9FD",
        lamaPurple: "#CFCEFF",
        lamaPurpleLight: "#F1F0FF",
        lamaYellow: "#FAE27C",
        lamaYellowLight: "#FEFCE8",
      },
      fontFamily: {
        display: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 6px 24px -8px rgba(11, 79, 60, 0.18)",
        gold: "0 8px 30px -10px rgba(201, 162, 75, 0.55)",
      },
    },
  },
  plugins: [],
};
export default config;
