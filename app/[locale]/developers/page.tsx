import { Metadata } from 'next'
import DevelopersContent from './DevelopersContent'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SeoMeta' })

  return {
    title: t('developersTitle'),
    description: t('developersDescription'),
    openGraph: {
      title: t('developersOgTitle'),
      description: t('developersOgDescription'),
      url: 'https://itwhip.com/developers',
      type: 'website',
    },
    alternates: {
      canonical: 'https://itwhip.com/developers',
    },
  }
}

export default function DevelopersPage() {
  return <DevelopersContent />
}
