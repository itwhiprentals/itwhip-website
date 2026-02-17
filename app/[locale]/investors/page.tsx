import { Metadata } from 'next'
import InvestorsContent from './InvestorsContent'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SeoMeta' })

  return {
    title: t('investorsTitle'),
    description: t('investorsDescription'),
    openGraph: {
      title: t('investorsOgTitle'),
      description: t('investorsOgDescription'),
      url: 'https://itwhip.com/investors',
      type: 'website',
    },
    alternates: {
      canonical: 'https://itwhip.com/investors',
    },
  }
}

export default function InvestorsPage() {
  return <InvestorsContent />
}
