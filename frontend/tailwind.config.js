/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        ink: {
          950: '#0a0c10',
          900: '#111419',
          850: '#161a21',
          800: '#1c212a',
          750: '#232935',
          700: '#2b3240',
          600: '#3a4251',
          500: '#4d5666',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0, 0, 0, 0.4)',
        raised: '0 10px 24px -12px rgba(0, 0, 0, 0.75)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out both',
      },
    },
  },
  plugins: [],
};
