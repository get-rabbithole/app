/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.tsx'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont',
      },
      fontSize: {
        sm: ['13px', '18px'],
      },
      borderRadius: {
        DEFAULT: '7px',
        sm: '4px'
      },
      borderColor: {
        DEFAULT: 'rgba(255, 255, 255, 0.15)'
      }
    },
  },
  plugins: [],
}

