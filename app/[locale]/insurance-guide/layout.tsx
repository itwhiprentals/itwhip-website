// app/insurance-guide/layout.tsx
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
    title: t('insuranceGuideTitle'),
    description: t('insuranceGuideDescription'),
    openGraph: {
      title: t('insuranceGuideOgTitle'),
      description: t('insuranceGuideOgDescription'),
      url: 'https://itwhip.com/insurance-guide',
      siteName: 'ItWhip',
      type: 'website',
    },
    alternates: {
      canonical: 'https://itwhip.com/insurance-guide',
    },
  }
}

export default function InsuranceGuideLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
