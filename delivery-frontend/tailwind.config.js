/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: "#2563EB", // Un beau bleu moderne
        secondary: "#1E293B", // Un gris foncé/bleu nuit
        accent: "#F59E0B", // Orange pour les actions
      }
    },
  },
  plugins: [],
}