import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import HostDashboardContent from './HostDashboardContent'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SeoMeta' })

  return {
    title: t('hostDashboardTitle'),
    description: t('hostDashboardDescription'),
    alternates: {
      canonical: 'https://itwhip.com/host-dashboard',
    },
    openGraph: {
      title: t('hostDashboardTitle'),
      description: t('hostDashboardDescription'),
      url: 'https://itwhip.com/host-dashboard',
      type: 'website',
    },
  }
}

export default function HostDashboardPage() {
  return <HostDashboardContent />
}
