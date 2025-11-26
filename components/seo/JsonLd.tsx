// components/seo/JsonLd.tsx
'use client'

interface FAQItem {
  question: string
  answer: string
}

interface HowToStep {
  name: string
  text: string
}

interface BenefitItem {
  name: string
  description: string
}

interface JsonLdProps {
  type: 'faq' | 'howto' | 'itemlist'
  // FAQ props
  faqs?: FAQItem[]
  // HowTo props
  howToName?: string
  howToDescription?: string
  howToSteps?: HowToStep[]
  // ItemList props
  listName?: string
  listItems?: BenefitItem[]
}

export default function JsonLd({ 
  type, 
  faqs, 
  howToName, 
  howToDescription, 
  howToSteps,
  listName,
  listItems 
}: JsonLdProps) {
  
  // FAQ Schema
  if (type === 'faq' && faqs && faqs.length > 0) {
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    }

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    )
  }

  // HowTo Schema
  if (type === 'howto' && howToSteps && howToSteps.length > 0) {
    const howToSchema = {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: howToName || 'How to List Your Car on ITWhip',
      description: howToDescription || 'Step-by-step guide to listing your car and earning money on ITWhip.',
      step: howToSteps.map((step, idx) => ({
        '@type': 'HowToStep',
        position: idx + 1,
        name: step.name,
        text: step.text
      }))
    }

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
    )
  }

  // ItemList Schema
  if (type === 'itemlist' && listItems && listItems.length > 0) {
    const itemListSchema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: listName || 'Host Benefits',
      numberOfItems: listItems.length,
      itemListElement: listItems.map((item, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: item.name,
        description: item.description
      }))
    }

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
    )
  }

  return null
}

// Pre-built data exports for easy usage
export const listYourCarFAQs: FAQItem[] = [
  {
    question: 'How do the earnings tiers work?',
    answer: 'Your earnings percentage depends on the insurance you bring. Platform Coverage (40%) uses our insurance, P2P Coverage (75%) requires peer-to-peer insurance like State Farm, and Commercial Coverage (90%) requires commercial auto insurance. All tiers include $1M liability coverage.'
  },
  {
    question: 'What is included in every tier?',
    answer: 'Every tier includes: $1M liability coverage, 48-hour payments, guest verification, 24/7 support, Mileage Forensics™ tracking, ESG impact dashboard, and tax documentation. The only difference is your earnings percentage and deductible amount.'
  },
  {
    question: 'How fast do I get paid?',
    answer: 'ITWhip pays hosts within 48 hours of trip completion via direct deposit. This is the fastest payment speed in the industry.'
  },
  {
    question: 'What is Mileage Forensics™?',
    answer: 'Mileage Forensics™ is our GPS + OBD-II verified trip tracking system. It eliminates disputes, prevents fraud, and provides insurance-grade documentation for every rental.'
  }
]

export const listYourCarHowTo: HowToStep[] = [
  {
    name: 'Apply Online',
    text: 'Complete our 5-minute application with your vehicle details, photos, and insurance information.'
  },
  {
    name: 'Choose Your Tier',
    text: 'Select your earnings tier based on the insurance you bring: Platform Coverage (40%), P2P Coverage (75%), or Commercial Coverage (90%).'
  },
  {
    name: 'Add Photos',
    text: 'Upload high-quality photos of your vehicle. We provide guidelines to help your listing stand out.'
  },
  {
    name: 'Start Earning',
    text: 'Once approved, your car is live. Get paid within 48 hours of each completed trip.'
  }
]

export const hostBenefitsList: BenefitItem[] = [
  { name: 'Up to 90% Earnings', description: 'Keep most of your rental income based on your insurance tier' },
  { name: '$1M Insurance Included', description: 'Liability coverage on every rental at no extra cost' },
  { name: '48-Hour Payments', description: 'Fastest payouts in the industry, direct to your bank' },
  { name: '$8K-25K Tax Savings', description: 'Depreciation, expenses, and mileage deductions' },
  { name: 'Mileage Forensics™', description: 'GPS-verified trips protect hosts and prevent fraud' },
  { name: 'ESG Impact Dashboard', description: 'Track your environmental contribution in real-time' },
  { name: '24/7 Host Support', description: 'We handle guest issues so you don\'t have to' },
  { name: 'Guest Verification', description: 'Multi-point screening ensures quality renters' }
]