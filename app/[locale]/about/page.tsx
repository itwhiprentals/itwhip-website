import { Metadata } from 'next'
import AboutContent from './AboutContent'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SeoMeta' })

  return {
    title: t('aboutTitle'),
    description: t('aboutDescription'),
    openGraph: {
      title: t('aboutOgTitle'),
      description: t('aboutOgDescription'),
      url: 'https://itwhip.com/about',
      type: 'website',
    },
    alternates: {
      canonical: 'https://itwhip.com/about',
    },
  }
}

export default function AboutPage() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ItWhip',
    url: 'https://itwhip.com',
    logo: 'https://itwhip.com/logo.png',
    description: 'Peer-to-peer car rental marketplace in Phoenix, Arizona. Rent cars from local owners with full insurance coverage.',
    foundingDate: '2024',
    areaServed: {
      '@type': 'State',
      name: 'Arizona',
      containedInPlace: { '@type': 'Country', name: 'United States' }
    },
    sameAs: [
      'https://www.instagram.com/itwhip',
      'https://www.facebook.com/itwhip'
    ]
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://itwhip.com' },
      { '@type': 'ListItem', position: 2, name: 'About', item: 'https://itwhip.com/about' }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <AboutContent />
    </>
  )
}
