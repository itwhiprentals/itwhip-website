// app/blog/layout.tsx
// Blog layout with only blog-specific JSON-LD schemas
// Organization, LocalBusiness, and WebSite schemas are in app/layout.tsx (DO NOT DUPLICATE)

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

// Blog Schema - NO blogPost array (individual pages handle their own schemas)
const blogSchema = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'ItWhip Blog',
  description: 'Expert insights on peer-to-peer car rental in Arizona. Tips for hosts, insurance guides, ESG tracking, and Phoenix car sharing news.',
  url: 'https://itwhip.com/blog',
  publisher: {
    '@type': 'Organization',
    name: 'ItWhip'
  },
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
      {/* Blog-specific JSON-LD only */}
      {/* Organization/LocalBusiness/WebSite schemas are in root layout - DO NOT ADD HERE */}
      {/* Individual blog posts add their own BlogPosting schema - DO NOT LIST HERE */}
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