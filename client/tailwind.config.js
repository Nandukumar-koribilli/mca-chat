/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#EFF2EE',
        card: '#FFFFFF',
        brand: {
          dark: '#1C1D21',
          charcoal: '#2D2E33',
          purple: '#8E84F5',
          'purple-hover': '#7B70EC',
          'purple-light': '#EEEAFC',
          'purple-text': '#6356E5',
          green: '#A2F08D',
          'green-dark': '#133919',
          'green-light': '#E7F9EE',
          'green-text': '#16A34A',
          lavender: '#9C94FB',
          'amber-light': '#FEF4E8',
          'amber-text': '#D97706',
          muted: '#7E838D',
          border: 'rgba(0, 0, 0, 0.06)'
        }
      },
      borderRadius: {
        '2.5xl': '20px',
        '3xl': '24px',
        '4xl': '28px'
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.03), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 10px 25px -3px rgba(0, 0, 0, 0.06), 0 4px 10px -2px rgba(0, 0, 0, 0.03)',
        'pill': '0 2px 8px rgba(0, 0, 0, 0.06)'
      }
    },
  },
  plugins: [],
}
