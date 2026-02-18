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
    title: t('hotelSolutionsTitle'),
    description: t('hotelSolutionsDescription'),
    keywords: ['hotel car delivery phoenix', 'hotel car rental partnership', 'concierge car service', 'scottsdale hotel cars', 'guest transportation solutions'],
    openGraph: {
      title: t('hotelSolutionsTitle'),
      description: t('hotelSolutionsDescription'),
      url: 'https://itwhip.com/hotel-solutions',
      type: 'website',
    },
    alternates: {
      canonical: 'https://itwhip.com/hotel-solutions',
    },
  }
}

export default function HotelSolutionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
