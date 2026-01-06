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
          // B2B hotel features (keep logic, hide from Google)
          '/hotel-portal/',
          '/hotels/',
          '/corporate/',
        ],
      },
    ],
    sitemap: [
      'https://itwhip.com/sitemap.xml',
      'https://itwhip.com/sitemap-images.xml',
    ],
  }
}
