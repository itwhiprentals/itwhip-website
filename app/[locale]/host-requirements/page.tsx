import { Metadata } from 'next'
import HostRequirementsContent from './HostRequirementsContent'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SeoMeta' })

  return {
    title: t('hostRequirementsTitle'),
    description: t('hostRequirementsDescription'),
    openGraph: {
      title: t('hostRequirementsOgTitle'),
      description: t('hostRequirementsOgDescription'),
      url: 'https://itwhip.com/host-requirements',
      type: 'website',
    },
    alternates: {
      canonical: 'https://itwhip.com/host-requirements',
    },
  }
}

export default function HostRequirementsPage() {
  return <HostRequirementsContent />
}
