/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pastel: {
          bg: '#f0f4f9',
          card: '#ffffff',
          cardWarm: '#fdfbf7',
          border: '#e2e8f0',
          blue: '#e0e7ff',
          purple: '#f3e8ff',
          yellow: '#fef3c7',
          pink: '#fce7f3',
          green: '#dcfce7',
        },
        navy: {
          bg: '#0b0f19',
          card: '#151c2e',
          cardHover: '#1c263e',
          border: '#232d45',
          accent: '#6366f1',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -2px rgba(99, 102, 241, 0.05), 0 1px 4px -1px rgba(0, 0, 0, 0.03)',
        'soft-md': '0 8px 24px -6px rgba(99, 102, 241, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 16px 32px -8px rgba(99, 102, 241, 0.12), 0 8px 16px -4px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
