// app/host-benefits/layout.tsx
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
    title: t('hostBenefitsTitle'),
    description: t('hostBenefitsDescription'),
    keywords: 'car sharing host benefits, P2P car rental earnings, Turo alternative benefits, list car Phoenix benefits, car sharing insurance Arizona, host earnings Phoenix, passive income car sharing, car rental host perks',
    openGraph: {
      title: t('hostBenefitsOgTitle'),
      description: t('hostBenefitsOgDescription'),
      url: 'https://itwhip.com/host-benefits',
      siteName: 'ItWhip',
      type: 'website',
      images: [
      {
        url: 'https://itwhip.com/og-host-benefits.jpg',
        width: 1200,
        height: 630,
        alt: 'ItWhip Host Benefits - Earn Up to 90%',
      }
    ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('hostBenefitsTwitterTitle'),
      description: t('hostBenefitsTwitterDescription'),
    },
    alternates: {
      canonical: 'https://itwhip.com/host-benefits',
    },
  }
}

export default function HostBenefitsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}