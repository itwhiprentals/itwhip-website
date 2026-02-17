import { Metadata } from 'next'
import HostUniversityContent from './HostUniversityContent'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SeoMeta' })

  return {
    title: t('hostUniversityTitle'),
    description: t('hostUniversityDescription'),
    openGraph: {
      title: t('hostUniversityOgTitle'),
      description: t('hostUniversityOgDescription'),
      url: 'https://itwhip.com/host-university',
      type: 'website',
    },
    alternates: {
      canonical: 'https://itwhip.com/host-university',
    },
  }
}

export default function HostUniversityPage() {
  return <HostUniversityContent />
}
