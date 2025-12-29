// app/robots.ts
// Dynamic robots.txt generation for SEO

import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/fleet/',
          '/host/',
          '/partner/',
          '/portal/',
          '/dashboard/',
          '/messages/',
          '/auth/',
          '/sys-2847/',
          '/_next/',
          '/static/',
        ],
      },
    ],
    sitemap: [
      'https://itwhip.com/sitemap.xml',
      'https://itwhip.com/api/sitemap-images',
    ],
  }
}
