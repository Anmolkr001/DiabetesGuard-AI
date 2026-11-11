/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        healthcare: {
          blue: '#1976D2',
          teal: '#00897B',
          red: '#E53935',
          amber: '#F57C00',
          green: '#43A047',
          neutral: '#263238'
        }
      }
    },
  },
  plugins: [],
}

