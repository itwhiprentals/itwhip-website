import { Metadata } from 'next'
import AboutContent from './AboutContent'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SeoMeta' })

  return {
    title: t('aboutTitle'),
    description: t('aboutDescription'),
    openGraph: {
      title: t('aboutOgTitle'),
      description: t('aboutOgDescription'),
      url: 'https://itwhip.com/about',
      type: 'website',
    },
    alternates: {
      canonical: 'https://itwhip.com/about',
    },
  }
}

export default function AboutPage() {
  return <AboutContent />
}
