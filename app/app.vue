<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()
const siteUrl = String(config.public.siteUrl || 'https://onestyleforever.com').replace(/\/+$/, '')

const canonicalUrl = computed(() => {
  const rawPath = String(route.path || '/')
  const normalizedPath = rawPath === '/' ? '/' : rawPath.replace(/\/+$/, '')
  return `${siteUrl}${normalizedPath}`
})

useHead(() => ({
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl.value
    }
  ],
  meta: [
    {
      property: 'og:url',
      content: canonicalUrl.value
    }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'ONE STYLE FOREVER',
        url: siteUrl,
        logo: `${siteUrl}/logo-mark.png`,
        sameAs: [
          'https://www.instagram.com/iaroslav_manoilov_/',
          'https://t.me/iaroslav_manoilov'
        ],
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: '+37368514544',
            contactType: 'customer support',
            availableLanguage: ['ru', 'ro', 'en']
          }
        ]
      })
    }
  ]
}))
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
    <AppToast />
  </NuxtLayout>
</template>
