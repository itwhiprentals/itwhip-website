import { Metadata } from 'next'
import GDSContent from './GDSContent'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SeoMeta' })

  return {
    title: t('gdsTitle'),
    description: t('gdsDescription'),
    openGraph: {
      title: t('gdsOgTitle'),
      description: t('gdsOgDescription'),
      url: 'https://itwhip.com/gds',
      type: 'website',
    },
    alternates: {
      canonical: 'https://itwhip.com/gds',
    },
  }
}

export default function GDSPage() {
  return <GDSContent />
}
