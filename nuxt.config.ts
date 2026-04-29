// https://nuxt.com/docs/api/configuration/nuxt-config
const devtoolsEnabled = process.env.NUXT_ENABLE_DEVTOOLS === "true";
const isProduction = process.env.NODE_ENV === "production";
const publicApiUrl = process.env.NUXT_PUBLIC_API_URL;
const prakerinApiUrl = process.env.PRAKERIN_API_URL;
const safePublicApiUrl =
  isProduction && publicApiUrl?.startsWith("http://") ? "/api" : publicApiUrl;

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: devtoolsEnabled },

  devServer: {
    port: 3001,
  },

  // Runtime config - accessible via useRuntimeConfig()
  runtimeConfig: {
    // Private keys (server-side only)
    apiSecret: "",
    apiProxyTarget: prakerinApiUrl || (isProduction ? "" : "http://localhost:3000/api"),
    // Public keys (exposed to client)
    public: {
      apiUrl: safePublicApiUrl || (isProduction ? "/api" : "http://localhost:3000/api"),
      dev: !isProduction,
    },
  },

  plugins: [
    "~/plugins/pinia.ts",
    "~/plugins/axios.ts",
    "~/plugins/sweetalert.client.ts",
  ],
  css: ["~/assets/css/main.css"],
  modules: [
    "@nuxt/ui",
    // "magic-regexp", // Disabled: Not compatible with Nuxt 4
    "@formkit/auto-animate",
    "@nuxtjs/google-fonts",
    "@vueuse/nuxt",
    "@nuxtjs/leaflet",
  ],
  vite: {
    build: {
      sourcemap: false,
      chunkSizeWarningLimit: 2048,
    },
  },
  ui: {
    theme: {
      colors: [
        "primary",
        "secondary",
        "success",
        "warning",
        "error",
        "info",
        "neutral",
      ],
    },
  },
  colorMode: {
    preference: "light",
    fallback: "light",
  },
  googleFonts: {
    families: {
      "Plus Jakarta Sans": [300, 400, 500, 600, 700, 800],
    },
    display: "swap",
    preload: true,
  },
  routeRules: {
    // Remove prerender for "/" to fix "closed or destroyed stream" error
  },
});
