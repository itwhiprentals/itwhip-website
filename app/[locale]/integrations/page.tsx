import { Metadata } from 'next'
import IntegrationsContent from './IntegrationsContent'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SeoMeta' })

  return {
    title: t('integrationsTitle'),
    description: t('integrationsDescription'),
    openGraph: {
      title: t('integrationsOgTitle'),
      description: t('integrationsOgDescription'),
      url: 'https://itwhip.com/integrations',
      type: 'website',
    },
    alternates: {
      canonical: 'https://itwhip.com/integrations',
    },
  }
}

export default function IntegrationsPage() {
  return <IntegrationsContent />
}
