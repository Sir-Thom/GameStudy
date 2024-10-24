/** @type {import('tailwindcss').Config} */
const { blackA, mauve, violet } = require("@radix-ui/colors");
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
				...blackA,
				...mauve,
				...violet,
			},

    },
  },
  plugins: [],
};
