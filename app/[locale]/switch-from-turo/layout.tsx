// app/switch-from-turo/layout.tsx
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
    title: t('switchFromTuroTitle'),
    description: t('switchFromTuroDescription'),
    openGraph: {
      title: t('switchFromTuroOgTitle'),
      description: t('switchFromTuroOgDescription'),
      url: 'https://itwhip.com/switch-from-turo',
      siteName: 'ItWhip',
      type: 'website',
      images: [
      {
        url: 'https://itwhip.com/og/switch-from-turo.png',
        width: 1200,
        height: 630,
        alt: 'Switch from Turo to ItWhip - Earn Up to 90%'
      }
    ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('switchFromTuroTwitterTitle'),
      description: t('switchFromTuroTwitterDescription'),
    },
    alternates: {
      canonical: 'https://itwhip.com/switch-from-turo',
    },
  }
}

export default function SwitchFromTuroLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}