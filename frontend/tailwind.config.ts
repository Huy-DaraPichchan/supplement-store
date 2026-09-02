import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#bc1a8d",
          50: "#fdf2f8",
          100: "#fce7f3",
          200: "#fbcfe8",
          300: "#f9a8d4",
          400: "#f472b6",
          500: "#bc1a8d", // custom primary
          600: "#a3157a",
          700: "#861063",
          800: "#6b0c4e",
          900: "#4a082f",
        },
      },
    },
  },
  plugins: [],
};
export default config;