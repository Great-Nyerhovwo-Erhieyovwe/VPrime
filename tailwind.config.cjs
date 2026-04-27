/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", // we'll toggle dark mode via a class
  theme: {
    extend: {
      colors: {
        primary: "#0a0f33",   // deep navy
        accent: "#00d8ff",    // neon cyan
        glass: "rgba(255,255,255,0.08)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};