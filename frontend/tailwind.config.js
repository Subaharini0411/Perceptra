/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#060a12',
          900: '#0b1326',
          800: '#111e3b',
          700: '#1b2c52',
          card: '#0f172a',
          border: '#1e293b'
        },
        cyan: {
          450: '#00e5ff'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
