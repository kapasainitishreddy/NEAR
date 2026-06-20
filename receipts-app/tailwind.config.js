/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Theme-aware tokens (channels live in CSS vars, set per data-theme).
        // navy = canvas/background, charcoal = raised surfaces, gold = accent.
        navy: {
          50: 'rgb(var(--navy-50) / <alpha-value>)',
          100: 'rgb(var(--navy-100) / <alpha-value>)',
          800: 'rgb(var(--navy-800) / <alpha-value>)',
          900: 'rgb(var(--navy-900) / <alpha-value>)',
          950: 'rgb(var(--navy-950) / <alpha-value>)',
        },
        charcoal: {
          700: 'rgb(var(--charcoal-700) / <alpha-value>)',
          800: 'rgb(var(--charcoal-800) / <alpha-value>)',
          900: 'rgb(var(--charcoal-900) / <alpha-value>)',
        },
        gold: {
          300: 'rgb(var(--accent-300) / <alpha-value>)',
          400: 'rgb(var(--accent-400) / <alpha-value>)',
          500: 'rgb(var(--accent-500) / <alpha-value>)',
        },
        // Static accents that read well on every (dark) theme.
        ivory: {
          50: '#fbfaf6',
          100: '#f5f2e9',
          200: '#ece7d8',
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
        sans: [
          '"Inter Variable"',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        serif: ['"Newsreader"', 'Georgia', 'ui-serif', 'serif'],
      },
      boxShadow: {
        soft: '0 6px 24px -8px rgba(0, 0, 0, 0.45)',
        card: '0 2px 10px -4px rgba(0, 0, 0, 0.3)',
        glow: '0 0 0 1px rgb(var(--accent-300) / 0.18), 0 10px 40px -12px rgb(var(--accent-300) / 0.3)',
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
