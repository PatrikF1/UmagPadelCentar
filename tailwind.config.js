/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'padel-bg': "url('/background.jpeg')",
      },
      fontFamily: {
        sans: ['Inter var', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0f1fe',
          200: '#b9e3fe',
          300: '#7cccfd',
          400: '#36b3f9',
          500: '#0c98eb',
          600: '#0178c8',
          700: '#0262a2',
          800: '#065186',
          900: '#0b446e',
        },
        form: {
          input: '#1a365d',
          label: '#2d3748',
          border: '#2a4365',
          hover: '#2c5282',
          focus: '#2b6cb0',
        }
      },
    },
  },
  plugins: [],
}

