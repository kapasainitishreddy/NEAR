/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Calm, premium palette
        navy: {
          50: '#eef1f8',
          100: '#d7def0',
          800: '#16203b',
          900: '#0e1628',
          950: '#0a0f1d',
        },
        charcoal: {
          700: '#2a2f3a',
          800: '#1f242e',
          900: '#161a22',
        },
        ivory: {
          50: '#fbfaf6',
          100: '#f5f2e9',
          200: '#ece7d8',
        },
        gold: {
          300: '#e7cd8f',
          400: '#d9b466',
          500: '#c79a43',
        },
        lavender: {
          300: '#c3bdf2',
          400: '#a79ef0',
          500: '#8b80e8',
        },
        emerald: {
          300: '#8fe3c4',
          400: '#52c79a',
          500: '#2faa7f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['"Newsreader"', 'Georgia', 'ui-serif', 'serif'],
      },
      boxShadow: {
        soft: '0 6px 24px -8px rgba(10, 15, 29, 0.35)',
        card: '0 2px 10px -4px rgba(10, 15, 29, 0.25)',
        glow: '0 0 0 1px rgba(231, 205, 143, 0.18), 0 10px 40px -12px rgba(231, 205, 143, 0.25)',
      },
      borderRadius: {
        xl2: '1.25rem',
        '3xl': '1.75rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
        shimmer: 'shimmer 2.2s linear infinite',
      },
    },
  },
  plugins: [],
}
