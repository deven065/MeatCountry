import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './providers/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        'heading': ['Oswald', 'sans-serif'],
        'body': ['Montserrat', 'sans-serif'],
        'heritage': ['Playfair Display', 'serif'],
      },
      colors: {
        brand: {
          50: '#fff5f5',
          100: '#ffe3e3',
          200: '#ffc9c9',
          300: '#ffa3a3',
          400: '#ff6b6b',
          500: '#f83e3e',
          600: '#d91e1e',
          700: '#b71717',
          800: '#8f1414',
          900: '#6b1010'
        },
        accent: {
          50: '#fff8eb',
          100: '#ffedc7',
          200: '#ffd98a',
          300: '#ffc04d',
          400: '#ffa820',
          500: '#f98707',
          600: '#dd6302',
          700: '#b74306',
          800: '#94330c',
          900: '#7a2b0d'
        }
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'card': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'hover': '0 8px 24px rgba(0, 0, 0, 0.12)'
      }
    }
  },
  plugins: []
} satisfies Config
