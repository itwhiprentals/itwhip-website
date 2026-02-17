import { Metadata } from 'next'
import StatusContent from './StatusContent'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SeoMeta' })

  return {
    title: t('statusTitle'),
    description: t('statusDescription'),
    openGraph: {
      title: t('statusOgTitle'),
      description: t('statusOgDescription'),
      url: 'https://itwhip.com/status',
      type: 'website',
    },
    alternates: {
      canonical: 'https://itwhip.com/status',
    },
  }
}

export default function StatusPage() {
  return <StatusContent />
}
