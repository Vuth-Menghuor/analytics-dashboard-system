// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@pinia/nuxt", "@nuxt/ui", "@nuxtjs/i18n"],
  css: ["~/assets/css/main.css"],
  icon: {
    clientBundle: {
      scan: true,
    },
    serverBundle: {
      collections: ["lucide"],
    },
  },
  i18n: {
    defaultLocale: "en",
    strategy: "no_prefix",
    locales: [
      { code: "en", name: "English", file: "en.json" },
      { code: "km", name: "ខ្មែរ", file: "km.json" },
    ],
    langDir: "../app/locales",
  },
  runtimeConfig: {
    public: {
      apiBaseUrl:
        process.env.NUXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api",
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID || "",
    },
  },
});
