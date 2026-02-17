// app/blog/layout.tsx
// Blog layout with only blog-specific JSON-LD schemas
// Organization, LocalBusiness, and WebSite schemas are in app/layout.tsx (DO NOT DUPLICATE)

import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SeoMeta' })

  return {
    title: t('blogTitle'),
    description: t('blogDescription'),
    openGraph: {
      title: t('blogOgTitle'),
      description: t('blogOgDescription'),
      url: 'https://itwhip.com/blog',
      siteName: 'ItWhip',
      type: 'website',
      images: [
      {
        url: 'https://itwhip.com/og/blog.png',
        width: 1200,
        height: 630,
        alt: 'ItWhip Blog - P2P Car Rental Insights'
      }
    ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('blogTwitterTitle'),
      description: t('blogTwitterDescription'),
    },
    alternates: {
      canonical: 'https://itwhip.com/blog',
    },
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