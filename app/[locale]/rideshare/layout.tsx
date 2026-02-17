// app/rideshare/layout.tsx
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
    title: t('rideshareTitle'),
    description: t('rideshareDescription'),
    keywords: 'rideshare rentals, uber car rental, lyft vehicle rental, doordash car, phoenix rideshare, arizona rideshare vehicles, rideshare car phoenix, uber approved cars',
    alternates: {
      canonical: 'https://itwhip.com/rideshare',
    },
    openGraph: {
      title: t('rideshareOgTitle'),
      description: t('rideshareOgDescription'),
      url: 'https://itwhip.com/rideshare',
      images: ['/rideshare/hero-prius-highway.jpg'],
      type: 'website',
      siteName: 'ItWhip',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('rideshareTwitterTitle'),
      description: t('rideshareTwitterDescription'),
    },
  }
}

export default function RideshareLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
