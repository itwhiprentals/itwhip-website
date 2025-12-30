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
      name: howToName || 'How to List Your Car on ItWhip',
      description: howToDescription || 'Step-by-step guide to listing your car and earning money on ItWhip.',
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
    answer: 'ItWhip pays hosts within 48 hours of trip completion via direct deposit. This is the fastest payment speed in the industry.'
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

// Renter-focused FAQs for rental search and booking pages
export const renterFAQs: FAQItem[] = [
  {
    question: 'How do I rent a car on ItWhip?',
    answer: 'Browse available cars in your area, select your dates, and book instantly. You can pick up from the host location or request delivery. Payment is processed securely through the platform.'
  },
  {
    question: 'What insurance coverage do I have as a renter?',
    answer: 'Every ItWhip rental includes $1M liability coverage. You can add comprehensive and collision coverage at checkout for full protection during your trip.'
  },
  {
    question: 'Can I cancel my reservation?',
    answer: 'Yes, cancellation policies vary by listing. Most hosts offer free cancellation up to 24-48 hours before pickup. Check the specific listing for exact terms.'
  },
  {
    question: 'What happens if the car breaks down?',
    answer: 'ItWhip provides 24/7 roadside assistance for all rentals. Contact our support team and we will arrange towing, a replacement vehicle, or other assistance.'
  },
  {
    question: 'Are there mileage limits?',
    answer: 'Mileage limits vary by listing. Many hosts offer unlimited miles, while others include a daily allowance with excess mileage fees. Check the listing details before booking.'
  },
  {
    question: 'How do I return the car?',
    answer: 'Return the car to the agreed pickup location with the same fuel level. Use the app to document the condition with photos. The host has 24 hours to confirm the return.'
  }
]

// Insurance-related FAQs
export const insuranceFAQs: FAQItem[] = [
  {
    question: 'What insurance is included with ItWhip rentals?',
    answer: 'Every rental includes $1M liability coverage at no extra cost. This protects you from third-party claims for bodily injury and property damage during your trip.'
  },
  {
    question: 'Should I add additional coverage?',
    answer: 'Additional coverage protects the rental vehicle itself from damage. If you have personal auto insurance or a credit card that covers rentals, you may already be covered. Otherwise, we recommend adding our protection plan.'
  },
  {
    question: 'What is the deductible for damage claims?',
    answer: 'Deductibles vary by host tier: Platform Coverage has a $2,500 deductible, P2P Coverage has $1,000, and Commercial Coverage has $500. Adding our protection plan can reduce or eliminate your deductible.'
  },
  {
    question: 'How do I file a claim?',
    answer: 'Document any damage with photos in the app immediately. Contact ItWhip support within 24 hours to file a claim. Our team will guide you through the process and coordinate with insurance.'
  }
]

// Arizona-specific FAQs
export const arizonaRentalFAQs: FAQItem[] = [
  {
    question: 'Where can I rent a car with ItWhip in Arizona?',
    answer: 'ItWhip serves the entire Phoenix metropolitan area including Phoenix, Scottsdale, Tempe, Mesa, Chandler, Gilbert, Glendale, and Peoria. We also serve Tucson and Flagstaff.'
  },
  {
    question: 'Can I pick up a car at Phoenix Sky Harbor Airport?',
    answer: 'Yes, many ItWhip hosts offer airport pickup and drop-off at Phoenix Sky Harbor (PHX). Filter by airport delivery to find hosts who provide this service.'
  },
  {
    question: 'Are there special requirements for renting in Arizona?',
    answer: 'Standard requirements apply: valid driver\'s license, minimum age 21 (25 for luxury vehicles), and a clean driving record. Arizona residents and visitors are both welcome.'
  },
  {
    question: 'What about Arizona vehicle registration and taxes?',
    answer: 'All ItWhip vehicles are properly registered in Arizona. Rental taxes and fees are included in your quoted price - no hidden charges at pickup.'
  }
]

// Pricing and payment FAQs
export const pricingFAQs: FAQItem[] = [
  {
    question: 'How is the rental price determined?',
    answer: 'Hosts set their own daily rates based on vehicle type, age, and demand. Prices include the base rate plus ItWhip service fee. Insurance and delivery are optional add-ons.'
  },
  {
    question: 'When am I charged for the rental?',
    answer: 'Your card is authorized when you book but only charged 24 hours before pickup. This ensures the host confirms availability and gives you time to cancel if needed.'
  },
  {
    question: 'Is there a security deposit?',
    answer: 'A hold of $200-500 may be placed on your card depending on the vehicle. This is released within 3-5 business days after return if there is no damage.'
  },
  {
    question: 'Can I extend my rental?',
    answer: 'Yes, request an extension through the app before your scheduled return time. Extensions are subject to availability and the host\'s approval. Pricing is pro-rated at the daily rate.'
  }
]

// How to rent a car steps
export const rentCarHowTo: HowToStep[] = [
  {
    name: 'Search Available Cars',
    text: 'Enter your location and dates to browse available vehicles. Filter by vehicle type, price, features, and delivery options.'
  },
  {
    name: 'Choose Your Car',
    text: 'Review photos, features, host ratings, and pricing. Check the cancellation policy and any mileage limits before booking.'
  },
  {
    name: 'Book Instantly',
    text: 'Complete your booking with secure payment. Add insurance coverage if needed. Receive confirmation with pickup details.'
  },
  {
    name: 'Pick Up and Drive',
    text: 'Meet the host at the agreed location or receive delivery. Document the car condition in the app and start your trip.'
  }
]