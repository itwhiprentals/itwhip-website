// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

// Viewport configuration (separated from metadata)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  title: 'ItWhip - Beat Airport Surge Pricing | Independent Driver Platform',
  description: 'Connect with independent drivers at Phoenix Sky Harbor. Save 30-40% vs surge pricing. Real-time flight tracking, surge predictions, and guaranteed fair rates.',
  
  // Google Search Console Verification
  verification: {
    google: 'BHWkhY02dx7jq6OPC5fLJXDEL7_PaiyguPwn2GnnpLw',  // Updated with correct code
  },
  
  // Open Graph for Facebook, LinkedIn, etc.
  openGraph: {
    title: 'ItWhip - Your Flight. Your Price. Your Driver.',
    description: 'Beat airport surge pricing with independent drivers. Save 30-40% guaranteed. Real-time flight tracking and surge predictions for Phoenix Sky Harbor.',
    url: 'https://itwhip.com',
    siteName: 'ItWhip',
    images: [
      {
        url: 'https://itwhip.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ItWhip - Independent Driver Platform',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'ItWhip - Beat Airport Surge Pricing',
    description: 'Save 30-40% on airport rides. Connect with independent drivers.',
    images: ['https://itwhip.com/og-image.jpg'],
    creator: '@itwhip',
    site: '@itwhip',
  },
  
  // Additional meta tags
  keywords: 'airport rides, Phoenix Sky Harbor, surge pricing, independent drivers, rideshare alternative, airport transportation, PHX airport',
  authors: [{ name: 'ItWhip' }],
  creator: 'ItWhip',
  publisher: 'ItWhip',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  
  // Favicon and app icons
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
  },
  
  // App-specific
  applicationName: 'ItWhip',
  referrer: 'origin-when-cross-origin',
  category: 'transportation',
  classification: 'Transportation',
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Additional meta tags that Next.js doesn't handle automatically */}
        <meta name="theme-color" content="#2563eb" />
        <link rel="canonical" href="https://itwhip.com" />
        
        {/* Structured data for search engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'ItWhip',
              url: 'https://itwhip.com',
              logo: 'https://itwhip.com/logo.png',
              description: 'Independent driver platform for Phoenix Sky Harbor Airport',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Phoenix',
                addressRegion: 'AZ',
                addressCountry: 'US'
              },
              sameAs: [
                'https://facebook.com/itwhip',
                'https://twitter.com/itwhip',
                'https://instagram.com/itwhip',
                'https://linkedin.com/company/itwhip'
              ],
              areaServed: {
                '@type': 'City',
                name: 'Phoenix, Arizona'
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}