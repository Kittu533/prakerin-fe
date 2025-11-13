// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  devServer: {
    port: 5173,
  },
  // runtimeConfig: {
  //   API_TOKEN: process.env.NUXT_API_TOKEN, // private
  //   public: {
  //     API_TYPE: process.env.NUXT_PUBLIC_API_TYPE,
  //     SERVICE_AUTH: process.env.NUXT_PUBLIC_SERVICE_AUTH,
  //     SERVICE_USER: process.env.NUXT_PUBLIC_SERVICE_USER,
  //     SERVICE_INTERNSHIP: process.env.NUXT_PUBLIC_SERVICE_INTERNSHIP,
  //     SERVICE_ACTIVITY: process.env.NUXT_PUBLIC_SERVICE_ACTIVITY,
  //     SERVICE_DOCUMENT: process.env.NUXT_PUBLIC_SERVICE_DOCUMENT,
  //     SERVICE_REPORT: process.env.NUXT_PUBLIC_SERVICE_REPORT,
  //   },
  // },
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
  colorMode: {
    preference: 'light',
    fallback: 'light',
    dataValue: 'light',
    classSuffix: '',
  },
  googleFonts: {
    families: { Manrope: [400, 700, 800] },
    display: 'swap',
    preload: true,
  },
  app: {
    head: {
      title: 'Selamat Datang di SIM Prakerin',
      htmlAttrs: { lang: 'id' },
    }
  },
  
  routeRules: {
    '/': { prerender: true }
  }
});