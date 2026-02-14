// app/[locale]/layout.tsx
// Locale-aware layout — wraps all guest-facing pages with translation provider
import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Suspense } from 'react'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { setRequestLocale, getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import Script from 'next/script'
import PageTracker from '@/app/components/PageTracker'
import { Providers } from '@/app/providers'
import SetHtmlLang from '@/app/components/SetHtmlLang'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' },
  ],
}

const ogLocaleMap: Record<string, string> = {
  en: 'en_US',
  es: 'es_MX',
  fr: 'fr_FR',
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SeoMeta' })

  return {
    metadataBase: new URL('https://itwhip.com'),

    title: t('homeTitle'),
    description: t('homeDescription'),

    verification: {
      google: 'BHWkhY02dx7jq6OPC5fLJXDEL7_PaiyguPwn2GnnpLw',
    },

    openGraph: {
      title: t('homeOgTitle'),
      description: t('homeOgDescription'),
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
      locale: ogLocaleMap[locale] || 'en_US',
      type: 'website',
    },

    twitter: {
      card: 'summary_large_image',
      title: t('homeTwitterTitle'),
      description: t('homeTwitterDescription'),
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
}

// Schema definitions
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
    availableLanguage: ['English', 'Spanish', 'French']
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

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <>
      <SetHtmlLang locale={locale} />
      <Script
        id="org-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Script
        id="auto-rental-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(autoRentalSchema) }}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
      <NextIntlClientProvider messages={messages}>
        <Providers>
          {children}
        </Providers>
      </NextIntlClientProvider>
      <Analytics />
      <Suspense fallback={null}>
        <PageTracker />
      </Suspense>
    </>
  )
}
