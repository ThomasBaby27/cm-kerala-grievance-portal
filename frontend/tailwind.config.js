/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kerala: {
          dark: '#0B3C26',
          primary: '#137547',
          light: '#25A244',
          accent: '#FFB703',
          bg: '#F8FAF9'
        }
      }
    },
  },
  plugins: [],
}
