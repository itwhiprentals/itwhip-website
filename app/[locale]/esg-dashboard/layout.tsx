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
    title: t('esgDashboardTitle'),
    description: t('esgDashboardDescription'),
    openGraph: {
      title: t('esgDashboardOgTitle'),
      description: t('esgDashboardOgDescription'),
      url: 'https://itwhip.com/esg-dashboard',
      siteName: 'ItWhip',
      type: 'website',
      images: [{ url: 'https://itwhip.com/og/esg-dashboard.png', width: 1200, height: 630, alt: 'ItWhip ESG Car Rental Dashboard' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('esgDashboardTwitterTitle'),
      description: t('esgDashboardTwitterDescription'),
    },
    alternates: {
      canonical: 'https://itwhip.com/esg-dashboard',
    },
  }
}

export default function ESGDashboardLayout({ children }: { children: React.ReactNode }) {
  return children
}
