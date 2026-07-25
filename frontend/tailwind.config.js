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
        brand: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6e0ff',
          300: '#adc2ff',
          400: '#7594ff',
          500: '#3b5cff', // Brand blue/purple color (Hubspot/Linear hybrid style)
          600: '#253eff',
          700: '#1525eb',
          800: '#101bbd',
          900: '#131c94',
          950: '#0b0f54',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617', // High contrast slate/zinc dark mode
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 4px 30px rgba(0, 0, 0, 0.03)',
        'premium-hover': '0 10px 40px rgba(0, 0, 0, 0.06)',
        'glass-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        'glass-dark': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      }
    },
  },
  plugins: [],
}
