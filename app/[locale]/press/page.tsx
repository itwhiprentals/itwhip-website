import { Metadata } from 'next'
import PressContent from './PressContent'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SeoMeta' })

  return {
    title: t('pressTitle'),
    description: t('pressDescription'),
    openGraph: {
      title: t('pressOgTitle'),
      description: t('pressOgDescription'),
      url: 'https://itwhip.com/press',
      type: 'website',
    },
    alternates: {
      canonical: 'https://itwhip.com/press',
    },
  }
}

export default function PressPage() {
  return <PressContent />
}
