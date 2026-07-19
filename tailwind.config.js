/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          terracotta: "#E05638",
          terracottaDark: "#C44125",
          terracottaLight: "#FFF2EE",
          borderTerracotta: "#F4CBBF",
          charcoal: "#231F20",
          charcoalLight: "#3D383A",
          parchment: "#FDFBF7",
          parchmentDark: "#F7F2E8",
          gold: "#C8963E",
          goldLight: "#F8F1E1",
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
