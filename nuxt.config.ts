export default defineNuxtConfig({
  devtools: { enabled: true },

  vite: {
    optimizeDeps: {
      include: ['@vue/devtools-core', '@vue/devtools-kit']
    }
  },

  css: ['~/assets/css/main.css'],

  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n'
  ],

  runtimeConfig: {
    telegramBotToken: process.env.NUXT_TELEGRAM_BOT_TOKEN || '',
    telegramBotUsername: process.env.NUXT_TELEGRAM_BOT_USERNAME || '',
    telegramChatId: process.env.NUXT_TELEGRAM_CHAT_ID || '',
    resendApiKey: process.env.NUXT_RESEND_API_KEY || '',
    orderEmailTo: process.env.NUXT_ORDER_EMAIL_TO || '',
    orderEmailFrom: process.env.NUXT_ORDER_EMAIL_FROM || '',
    orderTrackSecret: process.env.NUXT_ORDER_TRACK_SECRET || '',
    orderOtpSecret: process.env.NUXT_ORDER_OTP_SECRET || '',
    orderOtpTelegramChatId: process.env.NUXT_ORDER_OTP_TELEGRAM_CHAT_ID || '',
    cleanupSecret: process.env.NUXT_CLEANUP_SECRET || '',
    adminKey: process.env.NUXT_ADMIN_KEY || '',
    stripeSecretKey: process.env.NUXT_STRIPE_SECRET_KEY || '',
    stripeWebhookSecret: process.env.NUXT_STRIPE_WEBHOOK_SECRET || '',
    maibProjectId: process.env.NUXT_MAIB_PROJECT_ID || '',
    maibProjectSecret: process.env.NUXT_MAIB_PROJECT_SECRET || '',
    maibSignatureKey: process.env.NUXT_MAIB_SIGNATURE_KEY || '',
    maibApiBaseUrl: process.env.NUXT_MAIB_API_BASE_URL || 'https://api.maibmerchants.md/v1',
    supabaseUrl: process.env.NUXT_SUPABASE_URL || '',
    supabaseServiceRoleKey: process.env.NUXT_SUPABASE_SERVICE_ROLE_KEY || '',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://onestyleforever.com',
      vercelEnvUrl: process.env.NUXT_PUBLIC_VERCEL_ENV_URL || '',
      stripePublishableKey: process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.NUXT_SUPABASE_URL || '',
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || ''
    }
  },

  app: {
    head: {
      title: 'OSF',
      titleTemplate: 'OSF',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'ONE STYLE FOREVER — modern online clothing store from Moldova.'
        }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo-mark.png' },
        { rel: 'apple-touch-icon', href: '/logo-mark.png' }
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

  compatibilityDate: '2026-04-06'
})
