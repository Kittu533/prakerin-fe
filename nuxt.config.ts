// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  
  devServer: {
    port: 3001,
  },

  // Runtime config - accessible via useRuntimeConfig()
  runtimeConfig: {
    // Private keys (server-side only)
    apiSecret: '',
    // Public keys (exposed to client)
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3000',
    }
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
      colors: ['primary', 'secondary', 'success', 'warning', 'error', 'info', 'neutral']
    }
  },
  colorMode: {
    preference: 'light',
    fallback: 'light'
  },
  googleFonts: {
    families: { 
      'Plus Jakarta Sans': [300, 400, 500, 600, 700, 800] 
    },
    display: 'swap',
    preload: true,
  },
  routeRules: {
    '/': { prerender: true }
  }
});
