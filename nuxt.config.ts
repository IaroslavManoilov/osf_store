export default defineNuxtConfig({
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n'
  ],

  runtimeConfig: {
    telegramBotToken: '',
    telegramChatId: '',
    resendApiKey: '',
    orderEmailTo: '',
    orderEmailFrom: ''
  },

  app: {
    head: {
      title: 'ONE STYLE FOREVER',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'ONE STYLE FOREVER — modern online clothing store from Moldova.'
        }
      ]
    }
  },

  i18n: {
    vueI18n: './i18n.config.ts',
    defaultLocale: 'ru',
    strategy: 'prefix_except_default',
    langDir: 'locales',
    locales: [
      { code: 'ru', iso: 'ru-RU', name: 'RU', file: 'ru.ts' },
      { code: 'ro', iso: 'ro-RO', name: 'RO', file: 'ro.ts' },
      { code: 'en', iso: 'en-US', name: 'EN', file: 'en.ts' }
    ]
  },

  compatibilityDate: '2025-03-01'
})