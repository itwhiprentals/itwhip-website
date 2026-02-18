// app/security/intelligence/page.tsx
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import ThreatIntelligenceClient from './ThreatIntelligenceClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SeoMeta' })

  return {
    title: t('securityIntelligenceTitle'),
    description: t('securityIntelligenceDescription'),
    keywords: ['threat intelligence', 'security analytics', 'attack monitoring', 'vulnerability tracking', 'cybersecurity dashboard'],
    openGraph: {
      title: t('securityIntelligenceTitle'),
      description: t('securityIntelligenceDescription'),
      url: 'https://itwhip.com/security/intelligence',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('securityIntelligenceTitle'),
      description: t('securityIntelligenceDescription'),
    },
    alternates: {
      canonical: 'https://itwhip.com/security/intelligence',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function ThreatIntelligencePage() {
  return <ThreatIntelligenceClient />
}
