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
          '/host/dashboard',
          '/host/cars',
          '/host/bookings',
          '/host/earnings',
          '/partner/',
          '/dashboard/',
          '/messages/',
          '/_next/',
          '/static/',
        ],
      },
    ],
    sitemap: 'https://itwhip.com/sitemap.xml',
  }
}
