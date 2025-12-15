// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
      colors: {
        primary: {
          DEFAULT: '#039855',
          50: '#E6F7EF',
          100: '#CCEFDF',
          200: '#99DFBF',
          300: '#66CF9F',
          400: '#33BF7F',
          500: '#039855',
          600: '#027A44',
          700: '#025C33',
          800: '#013E22',
          900: '#011F11',
        },
        secondary: '#FFC107',
        'background-light': '#f5f5f5',
        'background-dark': '#151e33',
      },
      fontFamily: {
        display: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '1rem',
        lg: '1.25rem',
        xl: '3rem',
        full: '9999px',
      },
    },
  },
  content: [
    './app.vue',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
    './app/**/*.{vue,js,ts}',
    // Nuxt UI
    './node_modules/@nuxt/ui/dist/**/*.{mjs,js,ts,vue}',
  ],
}
