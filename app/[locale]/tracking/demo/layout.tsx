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
    title: t('trackingDemoTitle'),
    description: t('trackingDemoDescription'),
    openGraph: {
      title: t('trackingDemoTitle'),
      description: t('trackingDemoDescription'),
      url: 'https://itwhip.com/tracking/demo',
      type: 'website',
    },
    alternates: {
      canonical: 'https://itwhip.com/tracking/demo',
    },
  }
}

export default function TrackingDemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
