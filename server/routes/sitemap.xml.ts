import { defineEventHandler, setHeader } from 'h3'
import { getProducts } from '~/data/products'

const withPrefix = (prefix: string, path: string) => {
  if (path === '/') return prefix || ''
  return `${prefix}${path}`
}

const normalizePath = (path: string) => {
  if (!path) return '/'
  return path.startsWith('/') ? path : `/${path}`
}

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const siteUrl = String(config.public.siteUrl || 'https://onestyleforever.com').replace(/\/+$/, '')
  const now = new Date().toISOString()

  const localePrefixes = ['', '/ro', '/en']
  const publicPaths = [
    '/',
    '/catalog',
    '/about',
    '/contacts',
    '/faq',
    '/shipping',
    '/returns',
    '/size-guide',
    '/care',
    '/privacy',
    '/orders'
  ]

  const productIds = getProducts('ru').map((item) => item.id)

  const allPaths = new Set<string>()
  for (const prefix of localePrefixes) {
    for (const path of publicPaths) {
      const localized = withPrefix(prefix, path)
      allPaths.add(normalizePath(localized || '/'))
    }

    for (const id of productIds) {
      allPaths.add(normalizePath(withPrefix(prefix, `/product/${id}`)))
    }
  }

  const urls = [...allPaths]
    .sort((a, b) => a.localeCompare(b))
    .map((path) => {
      const loc = `${siteUrl}${path === '/' ? '' : path}`
      const priority = path === '/' ? '1.0' : path.includes('/product/') ? '0.9' : '0.8'
      return [
        '<url>',
        `<loc>${loc}</loc>`,
        `<lastmod>${now}</lastmod>`,
        '<changefreq>daily</changefreq>',
        `<priority>${priority}</priority>`,
        '</url>'
      ].join('')
    })
    .join('')

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>'
  ].join('')

  setHeader(event, 'Content-Type', 'application/xml; charset=UTF-8')
  return xml
})

