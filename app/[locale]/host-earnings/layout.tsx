// app/host-earnings/layout.tsx
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
    title: t('hostEarningsTitle'),
    description: t('hostEarningsDescription'),
    openGraph: {
      title: t('hostEarningsOgTitle'),
      description: t('hostEarningsOgDescription'),
      url: 'https://itwhip.com/host-earnings',
      siteName: 'ItWhip',
      type: 'website',
      images: [
      {
        url: 'https://itwhip.com/og/host-earnings.png',
        width: 1200,
        height: 630,
        alt: 'ItWhip Host Earnings Calculator - Earn Up to 90%'
      }
    ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('hostEarningsTwitterTitle'),
      description: t('hostEarningsTwitterDescription'),
    },
    alternates: {
      canonical: 'https://itwhip.com/host-earnings',
    },
  }
}

export default function HostEarningsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}