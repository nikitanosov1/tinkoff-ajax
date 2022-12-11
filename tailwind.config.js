/** @type {import('tailwindcss').Config} */
module.exports = {
content: ["./**.html"],
  darkMode: 'class',
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1440px',
    },
    extend: {
      colors: {
        brightRed: 'hsl(12, 88%, 59%)',
        purpleLogo: 'hsl(294,97%,38.6%)',
        pea: '#9c6b30',
        latte: '#8F6331',
        coffee: '#5C3825',
        dust: '#C7AA92',
        milk: '#fdfff5',
      }
    },
  },
  plugins: [],
}
