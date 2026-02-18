import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SeoMeta' })

  return {
    title: t('hostInsuranceTitle'),
    description: t('hostInsuranceDescription'),
    keywords: ['car sharing insurance', 'host protection plan', 'peer to peer car rental insurance', 'turo alternative insurance', 'vehicle rental coverage'],
    openGraph: {
      title: t('hostInsuranceTitle'),
      description: t('hostInsuranceDescription'),
      url: 'https://itwhip.com/host-insurance',
      type: 'website',
    },
    alternates: {
      canonical: 'https://itwhip.com/host-insurance',
    },
  }
}

export default function HostInsuranceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
