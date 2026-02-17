import { Metadata } from 'next'
import CoverageContent from './CoverageContent'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SeoMeta' })

  return {
    title: t('coverageTitle'),
    description: t('coverageDescription'),
    openGraph: {
      title: t('coverageOgTitle'),
      description: t('coverageOgDescription'),
      url: 'https://itwhip.com/coverage',
      type: 'website',
    },
    alternates: {
      canonical: 'https://itwhip.com/coverage',
    },
  }
}

export default function CoveragePage() {
  return <CoverageContent />
}
