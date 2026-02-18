// app/blog/layout.tsx
// Blog layout with only blog-specific JSON-LD schemas
// Organization, LocalBusiness, and WebSite schemas are in app/layout.tsx (DO NOT DUPLICATE)

import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getCanonicalUrl, getAlternateLanguages } from '@/app/lib/seo/alternates'

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
      url: getCanonicalUrl('/blog', locale),
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
      canonical: getCanonicalUrl('/blog', locale),
      languages: getAlternateLanguages('/blog'),
    },
  }
}

// Locale to inLanguage mapping
function getInLanguage(locale: string): string {
  const map: Record<string, string> = { en: 'en-US', es: 'es-419', fr: 'fr-FR' }
  return map[locale] || 'en-US'
}

export default async function BlogLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Blog Schema with locale-aware language
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'ItWhip Blog',
    description: 'Expert insights on peer-to-peer car rental in Arizona. Tips for hosts, insurance guides, ESG tracking, and Phoenix car sharing news.',
    url: getCanonicalUrl('/blog', locale),
    publisher: {
      '@type': 'Organization',
      name: 'ItWhip'
    },
    inLanguage: getInLanguage(locale)
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
        item: getCanonicalUrl('/blog', locale)
      }
    ]
  }

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