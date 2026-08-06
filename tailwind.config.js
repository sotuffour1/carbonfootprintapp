/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2E7D32',
          light: '#4CAF50',
          dark: '#1B5E20',
          50: '#E8F5E9',
        },
        secondary: {
          DEFAULT: '#00838F',
          light: '#00ACC1',
          dark: '#006064',
          50: '#E0F7FA',
        },
        warning: {
          DEFAULT: '#F9A825',
          light: '#FBC02D',
          dark: '#F57F17',
        },
        danger: {
          DEFAULT: '#C62828',
          light: '#E53935',
          dark: '#B71C1C',
        },
        bgLight: '#FAFAFA',
        bgDark: '#121212',
        cardDark: '#1E1E1E',
        nearBlack: '#1A1A1A',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
