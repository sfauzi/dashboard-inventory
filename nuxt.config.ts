// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: true,
  nitro: {
    // preset: "static"
    preset: 'node-server'
  },
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
      socketUrl: process.env.SOCKET_URL || 'http://localhost:3000',
    },
  },
  supabase: {
    redirect: false,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/*'],
    },
  },
  routeRules: {
    '/login': { ssr: false },
    '/dashboard': { ssr: false },
    '/barang': { ssr: false },
    '/transaksi': { ssr: false },
    '/users': { ssr: false },
  },
  css: ['~/assets/css/main.css'],
  modules: [
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxtjs/google-fonts',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
  ],
  googleFonts: {
    families: {
      Manrope: true,
      Mansalva: true,
      Rubik: true,
      "DM Sans": true,
    },
  },
})