/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // This line is crucial
  ],
  theme: {
    extend: {},
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.no-spinners': {
          '-moz-appearance': 'textfield',
          '&::-webkit-outer-spin-button': {
            '-webkit-appearance': 'none',
            margin: 0,
          },
          '&::-webkit-inner-spin-button': {
            '-webkit-appearance': 'none',
            margin: 0,
          },
        },
      }
      addUtilities(newUtilities, ['responsive', 'hover'])
    }
  ],
}