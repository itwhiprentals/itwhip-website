// app/security/certification/details/layout.tsx

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
    title: t('securityCertificationTitle'),
    description: t('securityCertificationDescription'),
    keywords: 'TU certification, compliance automation, ESG reporting, SOC 2 alternative, ISO 27001, security certification, hotel compliance, revenue generating compliance',
    openGraph: {
      title: t('securityCertificationTitle'),
      description: t('securityCertificationDescription'),
      type: 'website',
      url: 'https://itwhip.com/security/certification/details',
      images: [
        {
          url: 'https://itwhip.com/images/tu-certification-og.jpg',
          width: 1200,
          height: 630,
          alt: 'TU Certification Framework'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: t('securityCertificationTitle'),
      description: t('securityCertificationDescription'),
      images: ['https://itwhip.com/images/tu-certification-twitter.jpg']
    },
    alternates: {
      canonical: 'https://itwhip.com/security/certification/details'
    }
  }
}

export default function TUDetailsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
}