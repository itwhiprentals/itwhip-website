// app/security/certification/details/layout.tsx

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TU Certification Framework - Complete Guide | ItWhip',
  description: 'Understand the complete TU (Technology Unified) certification framework. Compare TU-1, TU-2, and TU-3 levels, ESG integration, compliance coverage, and ROI. The only certification that generates revenue while exceeding SOC 2, ISO 27001, and PCI DSS standards.',
  keywords: 'TU certification, compliance automation, ESG reporting, SOC 2 alternative, ISO 27001, security certification, hotel compliance, revenue generating compliance',
  openGraph: {
    title: 'TU Certification - The Only Compliance That Pays You',
    description: 'Turn compliance from a $180K cost into a $500K revenue stream with TU certification.',
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
    title: 'TU Certification - Compliance That Generates Revenue',
    description: 'The only certification that exceeds SOC 2, ISO 27001, and PCI DSS while generating $500K+ annual revenue.',
    images: ['https://itwhip.com/images/tu-certification-twitter.jpg']
  },
  alternates: {
    canonical: 'https://itwhip.com/security/certification/details'
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