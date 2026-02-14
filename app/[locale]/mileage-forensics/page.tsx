// app/mileage-forensics/page.tsx
import { Metadata } from 'next'
import MileageForensicsContent from './MileageForensicsContent'

export const metadata: Metadata = {
  title: 'Mileage Forensics\u2122 | GPS-Verified Trip Tracking Phoenix, Scottsdale | ItWhip Arizona',
  description: 'Fraud-proof mileage tracking for P2P car sharing in Phoenix, Scottsdale, and Tempe. GPS + OBD-II verified trips protect hosts, guests, and insurance rates. Arizona\'s most transparent car sharing platform.',
  keywords: [
    'mileage tracking car sharing',
    'GPS verified trips Phoenix',
    'fraud prevention car rental Arizona',
    'OBD tracking rental car',
    'P2P car sharing protection',
    'Arizona car sharing mileage',
    'car rental mileage verification',
    'trip tracking Phoenix',
    'vehicle tracking Scottsdale'
  ],
  openGraph: {
    title: 'Mileage Forensics\u2122 | GPS-Verified Trip Tracking | ItWhip Arizona',
    description: 'GPS + OBD-II verified trip data. Fraud-proof tracking that protects hosts, guests, and insurers in Phoenix, Scottsdale, and Tempe.',
    url: 'https://itwhip.com/mileage-forensics',
    siteName: 'ItWhip',
    type: 'website',
    images: [
      {
        url: 'https://itwhip.com/og/mileage-forensics.png',
        width: 1200,
        height: 630,
        alt: 'ItWhip Mileage Forensics - GPS-Verified Trip Tracking'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mileage Forensics\u2122 | ItWhip Arizona',
    description: 'GPS + OBD-II verified trip data. Fraud-proof tracking for P2P car sharing.',
  },
  alternates: {
    canonical: 'https://itwhip.com/mileage-forensics',
  },
}

export default function MileageForensicsPage() {
  // FAQ Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Mileage Forensics\u2122?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Mileage Forensics\u2122 is ItWhip\'s proprietary GPS + OBD-II trip verification system. It tracks every mile driven during rentals with forensic-grade accuracy, eliminating disputes and protecting hosts, guests, and insurance rates.'
        }
      },
      {
        '@type': 'Question',
        name: 'How does GPS trip tracking work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Every trip is tracked with precise GPS coordinates and verified against OBD-II odometer data. Trip start/end locations, routes taken, and exact mileage are recorded and stored for 6+ years per Arizona law.'
        }
      },
      {
        '@type': 'Question',
        name: 'Does Mileage Forensics\u2122 prevent fraud?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. By capturing verified trip data from multiple sources (GPS + OBD-II), Mileage Forensics\u2122 eliminates odometer tampering, false mileage claims, and unauthorized usage. Anomaly detection flags suspicious patterns automatically.'
        }
      },
      {
        '@type': 'Question',
        name: 'Is Mileage Forensics\u2122 compliant with Arizona law?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Mileage Forensics\u2122 exceeds all record-keeping requirements under Arizona\'s P2P car sharing legislation (A.R.S. \u00a7 28-9601\u20139613). Trip data is retained for 6+ years and available for insurance claims and audits.'
        }
      }
    ]
  }

  // Article Schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Mileage Forensics\u2122 - GPS-Verified Trip Tracking for P2P Car Sharing',
    description: 'Fraud-proof mileage tracking for peer-to-peer car sharing in Arizona. GPS + OBD-II verified trips protect hosts, guests, and insurance rates.',
    author: {
      '@type': 'Organization',
      name: 'ItWhip'
    },
    publisher: {
      '@type': 'Organization',
      name: 'ItWhip',
      url: 'https://itwhip.com'
    },
    datePublished: '2025-01-01',
    dateModified: '2025-11-28',
    mainEntityOfPage: 'https://itwhip.com/mileage-forensics'
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <MileageForensicsContent />
    </>
  )
}
