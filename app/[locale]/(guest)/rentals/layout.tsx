// app/(guest)/rentals/layout.tsx

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
    title: t('rentalsLayoutTitle'),
    description: t('rentalsLayoutDescription'),
    keywords: 'car rental, peer to peer car sharing, rent a car, Phoenix car rental, airport car rental',
    alternates: {
      canonical: 'https://itwhip.com/rentals',
    },
    openGraph: {
      title: t('rentalsLayoutTitle'),
      description: t('rentalsLayoutDescription'),
      url: 'https://itwhip.com/rentals',
      siteName: 'ItWhip',
      locale: 'en_US',
      type: 'website',
    },
  }
}

export default function RentalsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
}