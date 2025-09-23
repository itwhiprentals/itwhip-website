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
  title: 'ItWhip - Luxury Rides Platform | Hotels Earn From Every Ride',
  description: 'Phoenix premium transportation network. Riders save 60% vs surge pricing. Hotels earn $300K/year from guest rides. Zero investment required.',
  
  // Google Search Console Verification - KEEP THIS
  verification: {
    google: 'BHWkhY02dx7jq6OPC5fLJXDEL7_PaiyguPwn2GnnpLw',
  },
  
  // Open Graph for Facebook, LinkedIn, etc.
  openGraph: {
    title: 'ItWhip - Hotels Rental Car Plaform | Book or List your Car Today',
    description: 'Phoenix\'s premium car rentals network for hotel guests. $300K annual revenue for hotels. Join TODAY and start earning.',
    url: 'https://itwhip.com',
    siteName: 'ItWhip',
    images: [
      {
        url: 'https://itwhip.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ItWhip - Phoenix Premium Transportation Network',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'ItWhip - No Surge. Just Luxury.',
    description: 'Fixed prices on premium rides. Hotels earn 30% commission. Phoenix Sky Harbor to anywhere.',
    images: ['https://itwhip.com/og-image.jpg'],
    creator: '@itwhip',
    site: '@itwhip',
  },
  
  // Additional meta tags - Updated for dual audience
  keywords: 'hotel transportation revenue, luxury airport rides Phoenix, no surge pricing, hotel shuttle alternative, Sky Harbor transportation, premium rides Phoenix, hotel guest transportation, rideshare for hotels',
  authors: [{ name: 'ItWhip Technologies' }],
  creator: 'ItWhip Technologies',
  publisher: 'ItWhip Technologies',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  
  // Favicon and app icons - KEEP THESE
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
  classification: 'Transportation Technology',
  
  // Robots - KEEP FOR SEO
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Additional meta tags that Next.js doesn't handle automatically */}
        <meta name="theme-color" content="#2563eb" />
        <link rel="canonical" href="https://itwhip.com" />
        
        {/* Updated structured data for both audiences */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'ItWhip Technologies',
              url: 'https://itwhip.com',
              logo: 'https://itwhip.com/logo.png',
              description: 'Premium transportation network connecting luxury drivers with riders and hotels in Phoenix',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Phoenix',
                addressRegion: 'AZ',
                addressCountry: 'US'
              },
              sameAs: [
                'https://www.facebook.com/people/Itwhipcom/61573990760395/?mibextid=wwXIfr&rdid=2egGjvDzm0ZkDaJt&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F16A6t34gWx%2F%3Fmibextid%3DwwXIfr',
                'https://twitter.com/itwhip',
                'https://instagram.com/itwhiptech',
                'https://linkedin.com/company/itwhip'
              ],
              areaServed: {
                '@type': 'City',
                name: 'Phoenix, Arizona'
              },
              offers: [
                {
                  '@type': 'Offer',
                  name: 'Luxury Rides',
                  description: 'Fixed-price luxury transportation with no surge pricing',
                  category: 'Transportation Service'
                },
                {
                  '@type': 'Offer',
                  name: 'Hotel Revenue Program',
                  description: 'Hotels earn 30% commission on guest rides',
                  category: 'B2B Service'
                }
              ]
            })
          }}
        />
        
        {/* Additional schema for Hotel Industry */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Service',
              name: 'Hotel Transportation Revenue Program',
              provider: {
                '@type': 'Organization',
                name: 'ItWhip Technologies'
              },
              description: 'Transform shuttle costs into revenue. Hotels earn 30% commission on every guest ride.',
              areaServed: 'Phoenix, Arizona',
              hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: 'Hotel Partnership Programs',
                itemListElement: [
                  {
                    '@type': 'Offer',
                    name: 'Revenue Share Program',
                    description: '30% commission on all guest rides'
                  },
                  {
                    '@type': 'Offer',
                    name: 'Zero Investment',
                    description: 'No upfront costs or vehicle purchases'
                  }
                ]
              }
            })
          }}
        />
        
        {/* Google Analytics or other tracking scripts can go here */}
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
        
        {/* You can add any persistent scripts or components here */}
      </body>
    </html>
  )
}