// app/tracking/layout.tsx
// Layout with metadata for public tracking page

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
    title: t('trackingTitle'),
    description: t('trackingDescription'),
    openGraph: {
      title: t('trackingOgTitle'),
      description: t('trackingOgDescription'),
      url: 'https://itwhip.com/tracking',
      type: 'website'
    },
    alternates: {
      canonical: 'https://itwhip.com/tracking',
    },
  }
}

export default function TrackingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
