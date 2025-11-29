// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  
  devServer: {
    port: 3001,
  },
  plugins: ["~/plugins/pinia.ts", "~/plugins/axios.ts"],
  css: ['~/assets/css/main.css'],
  modules: [
    "@nuxt/ui",
    "magic-regexp",
    "@formkit/auto-animate",
    "@nuxt/image",
    "@nuxtjs/google-fonts",
    "@vueuse/nuxt",
  ],
  ui: {
    theme: {
      colors: ['primary', 'success', 'warning', 'error']
    }
  },
  colorMode: {
    preference: 'light',
    fallback: 'light'
  },
  googleFonts: {
    families: { Poppins: [400, 700, 800] },
    display: 'swap',
    preload: true,
  },
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
        }
      ]
    }
  },
  routeRules: {
    '/': { prerender: true }
  }
});