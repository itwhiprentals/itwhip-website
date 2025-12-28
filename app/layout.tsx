// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover', // Allow content to extend under status bar
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#030712' },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL('https://itwhip.com'),
  
  title: 'Peer to Peer Car Rental Arizona | Hosts Earn 90% | ItWhip',
  description: 'Arizona\'s #1 peer-to-peer car rental platform. Rent unique cars from local Phoenix owners or list your car and earn up to 90%. $1M insurance included. Phoenix, Scottsdale, Tempe, Mesa, Chandler.',
  
  verification: {
    google: 'BHWkhY02dx7jq6OPC5fLJXDEL7_PaiyguPwn2GnnpLw',
  },
  
  openGraph: {
    title: 'Peer to Peer Car Rental Arizona | ItWhip',
    description: 'Rent unique cars from local owners or earn up to 90% sharing yours. $1M insurance included. Phoenix, Scottsdale, Tempe & more.',
    url: 'https://itwhip.com',
    siteName: 'ItWhip',
    images: [
      {
        url: 'https://itwhip.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ItWhip - Peer to Peer Car Rental Arizona',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Peer to Peer Car Rental Arizona | ItWhip',
    description: 'Skip the rental counter. Rent from local owners or list your car and earn up to 90%. $1M insurance included.',
    images: ['https://itwhip.com/og-image.jpg'],
    creator: '@itwhip',
    site: '@itwhip',
  },
  
  keywords: [
    'peer to peer car rental Arizona',
    'peer to peer car rental Phoenix',
    'P2P car rental Arizona',
    'Turo alternative Arizona',
    'rent car from owner Phoenix',
    'car sharing Arizona',
    'list your car Phoenix',
    'rent my car Phoenix',
    'local car rentals Scottsdale',
    'Mesa car sharing',
    'Chandler car rental',
    'Tempe vehicle rental',
    'earn money with your car Arizona',
    'Arizona car sharing platform'
  ],
  
  authors: [{ name: 'ItWhip' }],
  creator: 'ItWhip',
  publisher: 'ItWhip',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  
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

  // iOS Add to Home Screen - transparent status bar
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ItWhip',
  },

  applicationName: 'ItWhip',
  referrer: 'origin-when-cross-origin',
  category: 'car rental',
  classification: 'Peer-to-Peer Car Sharing Marketplace',
  
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

// ============================================
// SCHEMA DEFINITIONS
// Each schema is standalone - no @id cross-references
// to prevent Google's Rich Results Test from expanding/duplicating
// ============================================

// Schema 1: Organization
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ItWhip',
  alternateName: 'ItWhip Peer-to-Peer Car Rental Arizona',
  url: 'https://itwhip.com',
  image: 'https://itwhip.com/logo.png',
  logo: {
    '@type': 'ImageObject',
    url: 'https://itwhip.com/logo.png',
    width: 512,
    height: 512
  },
  description: 'Arizona\'s #1 peer-to-peer car rental platform. Rent unique vehicles directly from local owners or list your car and earn up to 90%.',
  foundingDate: '2024',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '1 N 1st St',
    addressLocality: 'Phoenix',
    addressRegion: 'AZ',
    postalCode: '85004',
    addressCountry: 'US'
  },
  telephone: '+1-305-399-9069',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    telephone: '+1-305-399-9069',
    email: 'info@itwhip.com',
    url: 'https://itwhip.com/contact',
    availableLanguage: ['English', 'Spanish']
  },
  sameAs: [
    'https://www.facebook.com/itwhip',
    'https://twitter.com/itwhip',
    'https://instagram.com/itwhiptech',
    'https://linkedin.com/company/itwhip'
  ],
  areaServed: [
    { '@type': 'State', name: 'Arizona' },
    { '@type': 'City', name: 'Phoenix' },
    { '@type': 'City', name: 'Scottsdale' },
    { '@type': 'City', name: 'Tempe' },
    { '@type': 'City', name: 'Mesa' },
    { '@type': 'City', name: 'Chandler' },
    { '@type': 'City', name: 'Gilbert' },
    { '@type': 'City', name: 'Glendale' },
    { '@type': 'City', name: 'Tucson' }
  ]
}

// Schema 2: AutoRental with aggregateRating (standalone - no parentOrganization reference)
const autoRentalSchema = {
  '@context': 'https://schema.org',
  '@type': 'AutoRental',
  name: 'ItWhip - Peer to Peer Car Rental Arizona',
  description: 'Arizona\'s #1 peer-to-peer car rental marketplace. Rent directly from local vehicle owners. Hosts earn up to 90%.',
  url: 'https://itwhip.com',
  priceRange: '$$',
  image: 'https://itwhip.com/og-image.jpg',
  telephone: '+1-305-399-9069',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '1 N 1st St',
    addressLocality: 'Phoenix',
    addressRegion: 'AZ',
    postalCode: '85004',
    addressCountry: 'US'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 33.4484,
    longitude: -112.0740
  },
  areaServed: {
    '@type': 'State',
    name: 'Arizona'
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    bestRating: '5',
    worstRating: '1',
    ratingCount: '182',
    reviewCount: '182'
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '00:00',
    closes: '23:59'
  },
  currenciesAccepted: 'USD',
  paymentAccepted: 'Credit Card, Debit Card'
}

// Schema 3: WebSite with SearchAction (standalone - no publisher reference)
const webSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'ItWhip',
  url: 'https://itwhip.com',
  description: 'Peer to peer car rental in Arizona. Rent from local owners or list your car and earn up to 90%.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://itwhip.com/rentals/search?q={search_term_string}'
    },
    'query-input': 'required name=search_term_string'
  },
  inLanguage: 'en-US'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme color is set via viewport export and can be overridden per-page */}
        {/* REMOVED: Hardcoded canonical - let each page set its own */}

        {/* Preconnect to image CDNs - used across all pages */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />

        {/* Schema 1: Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema)
          }}
        />
        
        {/* Schema 2: AutoRental (with aggregateRating) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(autoRentalSchema)
          }}
        />
        
        {/* Schema 3: WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webSiteSchema)
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