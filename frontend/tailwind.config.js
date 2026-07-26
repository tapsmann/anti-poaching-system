/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        zim: {
          50: '#f0f7f0',
          100: '#dcebdc',
          200: '#b8d7b8',
          300: '#8fc08f',
          400: '#5fa35f',
          500: '#2d6a3f',
          600: '#1a5c2a',
          700: '#154a22',
          800: '#0f3a1a',
          900: '#0a2a12',
        },
        gold: {
          50: '#fbf3e0',
          100: '#f5e8c0',
          200: '#edda9a',
          300: '#e5cc74',
          400: '#dbbd4e',
          500: '#c9a84c',
          600: '#b8973a',
          700: '#a8892f',
        },
        earth: {
          50: '#f5f0e6',    // Cream background
          100: '#e8ddd0',   // Sand
          200: '#d4c5b8',
          300: '#bdaa9a',
          400: '#a1887f',
          500: '#8d6e63',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      }
    },
  },
  plugins: [],
};