// app/robots.ts
// Dynamic robots.txt generation for SEO

import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          // Allow public host acquisition pages
          '/host/signup',
          '/host/requirements',
          '/host/fleet-owners',
          '/host/insurance-options',
          '/host/tax-benefits',
          '/host/payouts',
          '/host/login',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/fleet/',
          // Block private host dashboard pages (but allow public acquisition pages above)
          '/host/dashboard/',
          '/host/bookings/',
          '/host/calendar/',
          '/host/cars/',
          '/host/claims/',
          '/host/earnings/',
          '/host/messages/',
          '/host/profile/',
          '/host/settings/',
          '/host/trips/',
          '/host/reviews/',
          '/host/forgot-password/',
          '/host/reset-password/',
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
