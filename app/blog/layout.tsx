// app/blog/layout.tsx
// Blog layout with Organization, LocalBusiness, and WebSite JSON-LD schemas

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | ItWhip Blog',
    default: 'ItWhip Blog | P2P Car Rental Insights & Arizona Car Sharing Tips'
  },
  description: 'Expert insights on peer-to-peer car rental in Arizona. Tips for hosts earning up to 90%, insurance guides, ESG tracking, and Phoenix car sharing news.',
  keywords: [
    'peer to peer car rental blog',
    'car sharing tips arizona',
    'turo alternative blog',
    'p2p car rental guide',
    'host earnings car sharing',
    'phoenix car rental tips',
    'car sharing insurance guide',
    'esg car rental'
  ],
  openGraph: {
    title: 'ItWhip Blog | P2P Car Rental Insights',
    description: 'Expert insights on peer-to-peer car rental in Arizona. Tips for hosts, insurance guides, and Phoenix car sharing news.',
    url: 'https://itwhip.com/blog',
    siteName: 'ItWhip',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://itwhip.com/og/blog.png',
        width: 1200,
        height: 630,
        alt: 'ItWhip Blog - P2P Car Rental Insights'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ItWhip Blog | P2P Car Rental Insights',
    description: 'Expert insights on peer-to-peer car rental in Arizona.',
    images: ['https://itwhip.com/og/blog.png']
  },
  alternates: {
    canonical: 'https://itwhip.com/blog'
  },
  robots: {
    index: true,
    follow: true
  }
}

// Organization Schema - Company information
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'CarRental'],
  '@id': 'https://itwhip.com/#organization',
  name: 'ItWhip',
  alternateName: 'ItWhip Car Sharing',
  description: 'Arizona\'s peer-to-peer car sharing platform. Rent cars from local owners with $1M insurance coverage. Hosts earn up to 90%.',
  url: 'https://itwhip.com',
  logo: {
    '@type': 'ImageObject',
    url: 'https://itwhip.com/logo.png',
    width: 512,
    height: 512
  },
  image: 'https://itwhip.com/og-image.png',
  email: 'support@itwhip.com',
  foundingDate: '2019',
  founders: [
    {
      '@type': 'Person',
      name: 'Chris'
    }
  ],
  sameAs: [
    'https://facebook.com/itwhip',
    'https://instagram.com/itwhip',
    'https://linkedin.com/company/itwhip',
    'https://twitter.com/itwhip'
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: 'support@itwhip.com',
    availableLanguage: ['English', 'Spanish']
  },
  areaServed: {
    '@type': 'State',
    name: 'Arizona',
    containsPlace: [
      { '@type': 'City', name: 'Phoenix' },
      { '@type': 'City', name: 'Scottsdale' },
      { '@type': 'City', name: 'Tempe' },
      { '@type': 'City', name: 'Mesa' },
      { '@type': 'City', name: 'Chandler' },
      { '@type': 'City', name: 'Glendale' },
      { '@type': 'City', name: 'Gilbert' },
      { '@type': 'City', name: 'Peoria' },
      { '@type': 'City', name: 'Surprise' },
      { '@type': 'City', name: 'Tucson' }
    ]
  },
  slogan: 'Hosts earn up to 90%. Guests save more.',
  knowsAbout: [
    'Peer-to-peer car rental',
    'Car sharing insurance',
    'Vehicle rental marketplace',
    'ESG tracking',
    'Mileage forensics'
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Car Rental Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Peer-to-Peer Car Rental',
          description: 'Rent cars directly from local owners in Arizona'
        }
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Vehicle Listing for Hosts',
          description: 'List your car and earn up to 90% of rental income'
        }
      }
    ]
  }
}

// LocalBusiness Schema - For Google Maps and local SEO
const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'CarRental',
  '@id': 'https://itwhip.com/#localbusiness',
  name: 'ItWhip - Peer-to-Peer Car Sharing',
  description: 'Rent cars from local Arizona owners. $1M insurance coverage. Hosts earn up to 90%. Available in Phoenix, Scottsdale, Tempe, and across Arizona.',
  url: 'https://itwhip.com',
  logo: 'https://itwhip.com/logo.png',
  image: 'https://itwhip.com/og-image.png',
  telephone: '+1-480-555-0123', // Update with real number when available
  email: 'support@itwhip.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Phoenix',
    addressRegion: 'AZ',
    addressCountry: 'US'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 33.4484,
    longitude: -112.0740
  },
  areaServed: [
    {
      '@type': 'City',
      name: 'Phoenix',
      sameAs: 'https://en.wikipedia.org/wiki/Phoenix,_Arizona'
    },
    {
      '@type': 'City',
      name: 'Scottsdale',
      sameAs: 'https://en.wikipedia.org/wiki/Scottsdale,_Arizona'
    },
    {
      '@type': 'City',
      name: 'Tempe',
      sameAs: 'https://en.wikipedia.org/wiki/Tempe,_Arizona'
    },
    {
      '@type': 'City',
      name: 'Mesa',
      sameAs: 'https://en.wikipedia.org/wiki/Mesa,_Arizona'
    },
    {
      '@type': 'City',
      name: 'Chandler'
    },
    {
      '@type': 'City',
      name: 'Gilbert'
    },
    {
      '@type': 'City',
      name: 'Glendale'
    },
    {
      '@type': 'City',
      name: 'Tucson'
    }
  ],
  priceRange: '$$',
  currenciesAccepted: 'USD',
  paymentAccepted: 'Credit Card, Debit Card',
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    ],
    opens: '00:00',
    closes: '23:59'
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '150',
    bestRating: '5',
    worstRating: '1'
  },
  sameAs: [
    'https://facebook.com/itwhip',
    'https://instagram.com/itwhip',
    'https://linkedin.com/company/itwhip',
    'https://twitter.com/itwhip'
  ]
}

// WebSite Schema - For sitelinks search box
const webSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://itwhip.com/#website',
  name: 'ItWhip',
  alternateName: 'ItWhip Car Sharing',
  description: 'Arizona\'s peer-to-peer car sharing platform',
  url: 'https://itwhip.com',
  publisher: {
    '@id': 'https://itwhip.com/#organization'
  },
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

// Blog Schema - For the blog section
const blogSchema = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  '@id': 'https://itwhip.com/blog/#blog',
  name: 'ItWhip Blog',
  description: 'Expert insights on peer-to-peer car rental in Arizona. Tips for hosts, insurance guides, ESG tracking, and Phoenix car sharing news.',
  url: 'https://itwhip.com/blog',
  publisher: {
    '@id': 'https://itwhip.com/#organization'
  },
  blogPost: [
    {
      '@type': 'BlogPosting',
      headline: 'Turo vs ItWhip: Best P2P Car Rental in Arizona (2025)',
      url: 'https://itwhip.com/blog/turo-vs-itwhip-arizona-2025'
    },
    {
      '@type': 'BlogPosting',
      headline: 'Is Renting Out Your Car Worth It in Arizona?',
      url: 'https://itwhip.com/blog/renting-out-car-worth-it'
    },
    {
      '@type': 'BlogPosting',
      headline: 'P2P Car Rental Insurance Explained: 40%, 75%, 90% Tiers',
      url: 'https://itwhip.com/blog/p2p-insurance-tiers'
    },
    {
      '@type': 'BlogPosting',
      headline: 'ESG Car Sharing: What It Means and Why It Matters',
      url: 'https://itwhip.com/blog/esg-car-sharing'
    },
    {
      '@type': 'BlogPosting',
      headline: 'Phoenix Airport Car Rental Alternatives: Skip the Counter',
      url: 'https://itwhip.com/blog/phoenix-airport-alternatives'
    }
  ],
  inLanguage: 'en-US'
}

// Breadcrumb Schema for blog section
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://itwhip.com'
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Blog',
      item: 'https://itwhip.com/blog'
    }
  ]
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webSiteSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />
      
      {children}
    </>
  )
}