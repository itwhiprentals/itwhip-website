// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

// Viewport configuration (separated from metadata)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  // ============================================
  // PRIMARY SEO - P2P Car Sharing Focus
  // ============================================
  title: 'ITWhip - Peer-to-Peer Car Sharing in Arizona | Rent from Local Owners',
  description: 'Connect directly with Arizona vehicle owners for unique rentals. Hosts keep up to 90% of earnings with built-in protection plans. Phoenix, Scottsdale, Tempe & beyond.',
  
  // Google Search Console Verification - KEEP THIS
  verification: {
    google: 'BHWkhY02dx7jq6OPC5fLJXDEL7_PaiyguPwn2GnnpLw',
  },
  
  // ============================================
  // OPEN GRAPH - Facebook, LinkedIn
  // ============================================
  openGraph: {
    title: 'ITWhip – Arizona\'s Peer-to-Peer Car Sharing Platform',
    description: 'Rent unique cars from locals or earn up to 90% sharing yours. Fully insured P2P car sharing in Phoenix, Scottsdale, Tempe & more.',
    url: 'https://itwhip.com',
    siteName: 'ITWhip',
    images: [
      {
        url: 'https://itwhip.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ITWhip - Peer-to-Peer Car Sharing in Arizona',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  // ============================================
  // TWITTER CARD
  // ============================================
  twitter: {
    card: 'summary_large_image',
    title: 'ITWhip – Peer-to-Peer Car Sharing in Arizona',
    description: 'Skip the rental counter. Rent from locals or list your car and earn up to 90%. Fully insured.',
    images: ['https://itwhip.com/og-image.jpg'],
    creator: '@itwhip',
    site: '@itwhip',
  },
  
  // ============================================
  // KEYWORDS - P2P Car Sharing Focus
  // ============================================
  keywords: 'peer to peer car rental Phoenix, Turo alternative Arizona, rent car from owner Phoenix, P2P car sharing Scottsdale, list your car Phoenix, car sharing Arizona, rent my car Phoenix, local car rentals Tempe, Mesa car sharing, Chandler vehicle rental, Arizona car sharing platform, earn money with your car Phoenix',
  
  // ============================================
  // AUTHOR & PUBLISHER
  // ============================================
  authors: [{ name: 'ITWhip' }],
  creator: 'ITWhip',
  publisher: 'ITWhip',
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
  
  // App-specific - UPDATED
  applicationName: 'ITWhip',
  referrer: 'origin-when-cross-origin',
  category: 'car rental',
  classification: 'Peer-to-Peer Car Sharing Marketplace',
  
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
        {/* Theme color */}
        <meta name="theme-color" content="#7c3aed" />
        <link rel="canonical" href="https://itwhip.com" />
        
        {/* ============================================
            SCHEMA 1: Organization - P2P Car Sharing Platform
            ============================================ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'ITWhip',
              alternateName: 'ITWhip Peer-to-Peer Car Sharing',
              url: 'https://itwhip.com',
              logo: 'https://itwhip.com/logo.png',
              description: 'Arizona\'s peer-to-peer car sharing marketplace. Rent unique vehicles directly from local owners or list your car and earn up to 90%.',
              foundingDate: '2024',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Phoenix',
                addressRegion: 'AZ',
                postalCode: '85001',
                addressCountry: 'US'
              },
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                email: 'support@itwhip.com',
                availableLanguage: 'English'
              },
              sameAs: [
                'https://www.facebook.com/itwhip',
                'https://twitter.com/itwhip',
                'https://instagram.com/itwhiptech',
                'https://linkedin.com/company/itwhip'
              ],
              areaServed: [
                {
                  '@type': 'State',
                  name: 'Arizona'
                },
                {
                  '@type': 'City',
                  name: 'Phoenix'
                },
                {
                  '@type': 'City',
                  name: 'Scottsdale'
                },
                {
                  '@type': 'City',
                  name: 'Tempe'
                },
                {
                  '@type': 'City',
                  name: 'Mesa'
                },
                {
                  '@type': 'City',
                  name: 'Chandler'
                }
              ]
            })
          }}
        />
        
        {/* ============================================
            SCHEMA 2: Car Rental Service
            FIXED: Changed Product to Service (no offers/reviews required)
            ============================================ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'AutoRental',
              name: 'ITWhip Car Sharing',
              description: 'Peer-to-peer car sharing marketplace in Arizona. Rent directly from local vehicle owners.',
              url: 'https://itwhip.com',
              priceRange: '$30-$500/day',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Phoenix',
                addressRegion: 'AZ',
                addressCountry: 'US'
              },
              areaServed: {
                '@type': 'State',
                name: 'Arizona'
              },
              hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: 'Vehicle Categories',
                itemListElement: [
                  {
                    '@type': 'OfferCatalog',
                    name: 'Economy Cars',
                    description: 'Affordable daily rentals from local owners'
                  },
                  {
                    '@type': 'OfferCatalog',
                    name: 'SUVs & Trucks',
                    description: 'Spacious vehicles for families and adventures'
                  },
                  {
                    '@type': 'OfferCatalog',
                    name: 'Luxury & Exotic',
                    description: 'Premium vehicles for special occasions'
                  },
                  {
                    '@type': 'OfferCatalog',
                    name: 'Electric Vehicles',
                    description: 'Eco-friendly EV rentals with high ESG impact scores'
                  }
                ]
              }
            })
          }}
        />
        
        {/* ============================================
            SCHEMA 3: Website with SearchAction
            ============================================ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'ITWhip',
              url: 'https://itwhip.com',
              description: 'Peer-to-peer car sharing in Arizona',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://itwhip.com/rentals/search?q={search_term_string}'
                },
                'query-input': 'required name=search_term_string'
              }
            })
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}