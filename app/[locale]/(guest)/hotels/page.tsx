// app/(guest)/hotels/page.tsx
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import HotelsClient from './HotelsClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SeoMeta' })

  return {
    title: t('hotelsPageTitle'),
    description: t('hotelsPageDescription'),
    keywords: ['Phoenix hotels', 'Scottsdale hotels', 'hotel transportation', 'instant rides', 'luxury hotels Arizona'],
    openGraph: {
      title: t('hotelsPageTitle'),
      description: t('hotelsPageDescription'),
      url: 'https://itwhip.com/hotels',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('hotelsPageTitle'),
      description: t('hotelsPageDescription'),
    },
    alternates: {
      canonical: 'https://itwhip.com/hotels',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function HotelsPage() {
  return <HotelsClient />
}
