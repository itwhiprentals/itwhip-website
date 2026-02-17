// app/list-your-car/layout.tsx
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
    title: t('listYourCarTitle'),
    description: t('listYourCarDescription'),
    keywords: 'list your car Phoenix, rent my car Arizona, peer to peer car sharing Phoenix, Turo alternative Arizona, car sharing host Phoenix, earn money with car Scottsdale, P2P car rental Tempe, list car for rent Mesa, passive income car Phoenix',
    openGraph: {
      title: t('listYourCarOgTitle'),
      description: t('listYourCarOgDescription'),
      url: 'https://itwhip.com/list-your-car',
      siteName: 'ItWhip',
      images: [
        {
          url: 'https://itwhip.com/og-list-your-car.jpg',
          width: 1200,
          height: 630,
          alt: t('listYourCarOgImageAlt'),
        }
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('listYourCarTwitterTitle'),
      description: t('listYourCarTwitterDescription'),
      images: ['https://itwhip.com/og-list-your-car.jpg'],
      creator: '@itwhip',
      site: '@itwhip',
    },
    alternates: {
      canonical: 'https://itwhip.com/list-your-car',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function ListYourCarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
