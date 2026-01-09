// app/how-it-works/layout.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How It Works | Peer-to-Peer Car Sharing & Rideshare Rentals | ItWhip',
  description: 'Rent cars from local Phoenix hosts or become a host. Peer-to-peer car sharing and rideshare-ready vehicles. Earn up to 90% or manage a fleet without owning a car.',
  keywords: [
    'peer to peer car rental Phoenix',
    'rideshare rental Phoenix',
    'Uber rental car Phoenix',
    'Lyft rental Phoenix',
    'car sharing Arizona',
    'Turo alternative Phoenix',
    'rent car from owner',
    'rideshare vehicle rental',
    'gig economy car rental',
    'fleet manager car sharing',
    'earn money with car',
    'list your car for rent'
  ],
  openGraph: {
    title: 'How It Works | Peer-to-Peer Car Sharing & Rideshare | ItWhip',
    description: 'Rent cars from local Phoenix owners, list your car to earn up to 90%, or become a fleet manager. Rideshare-ready vehicles with full insurance.',
    url: 'https://itwhip.com/how-it-works',
    siteName: 'ItWhip',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How It Works | ItWhip P2P & Rideshare',
    description: 'P2P car rental in Phoenix. Rent, host, or manage a fleet. Rideshare-ready vehicles available.',
  },
  alternates: {
    canonical: 'https://itwhip.com/how-it-works'
  }
}

export default function HowItWorksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // HowTo Schema - Guest (Renting a Car)
  const howToRentSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': 'How to Rent a Car on ItWhip',
    'description': 'Rent a car from local Phoenix owners in 3 simple steps with full insurance coverage.',
    'totalTime': 'PT10M',
    'estimatedCost': {
      '@type': 'MonetaryAmount',
      'currency': 'USD',
      'value': '45'
    },
    'step': [
      {
        '@type': 'HowToStep',
        'position': 1,
        'name': 'Find Your Perfect Car',
        'text': 'Browse cars from local Phoenix owners. Filter by type, price, features, and ESG impact score. View real photos and verified reviews.',
        'url': 'https://itwhip.com/how-it-works#step-1'
      },
      {
        '@type': 'HowToStep',
        'position': 2,
        'name': 'Quick Verification',
        'text': 'Upload your driver\'s license photo, take a quick selfie for identity match, pass instant background check. One-time setup for all future rentals.',
        'url': 'https://itwhip.com/how-it-works#step-2'
      },
      {
        '@type': 'HowToStep',
        'position': 3,
        'name': 'Pick Up & Drive',
        'text': 'Meet your host at 50+ Arizona hotels, Phoenix Sky Harbor Airport, or request delivery. $1M liability coverage and 24/7 roadside assistance included.',
        'url': 'https://itwhip.com/how-it-works#step-3'
      }
    ]
  }

  // HowTo Schema - Host (Listing a Car)
  const howToListSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': 'How to List Your Car on ItWhip',
    'description': 'Start earning up to 90% by listing your car on ItWhip. 5-minute application, choose your insurance tier, get paid in 48 hours.',
    'totalTime': 'PT5M',
    'estimatedCost': {
      '@type': 'MonetaryAmount',
      'currency': 'USD',
      'value': '0'
    },
    'step': [
      {
        '@type': 'HowToStep',
        'position': 1,
        'name': 'List Your Vehicle',
        'text': '5-minute application. Upload photos, set your price. Vehicles must be 2015 or newer with under 130,000 miles and clean title.',
        'url': 'https://itwhip.com/how-it-works#host-step-1'
      },
      {
        '@type': 'HowToStep',
        'position': 2,
        'name': 'Choose Your Insurance Tier',
        'text': 'BASIC (40%): We provide all insurance. STANDARD (75%): You bring P2P insurance. PREMIUM (90%): You bring commercial insurance. $1M liability on all tiers.',
        'url': 'https://itwhip.com/how-it-works#host-step-2'
      },
      {
        '@type': 'HowToStep',
        'position': 3,
        'name': 'Get Paid in 48 Hours',
        'text': 'Industry\'s fastest payments via direct deposit. Track earnings in real-time. Automated 1099 tax documentation provided.',
        'url': 'https://itwhip.com/how-it-works#host-step-3'
      }
    ]
  }

  // HowTo Schema - Fleet Manager (No Car Required)
  const howToFleetSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': 'How to Become a Fleet Manager on ItWhip',
    'description': 'Earn commission on car rentals without owning a vehicle. Invite car owners to your fleet and earn 10-30% on every booking.',
    'totalTime': 'PT10M',
    'estimatedCost': {
      '@type': 'MonetaryAmount',
      'currency': 'USD',
      'value': '0'
    },
    'step': [
      {
        '@type': 'HowToStep',
        'position': 1,
        'name': 'Sign Up as Fleet Manager',
        'text': 'Create your fleet manager account and get your personalized page at itwhip.com/fleet/[your-slug]. No vehicle ownership required.',
        'url': 'https://itwhip.com/how-it-works#fleet-step-1'
      },
      {
        '@type': 'HowToStep',
        'position': 2,
        'name': 'Invite Car Owners',
        'text': 'Share your referral link on social media and invite car owners in your network. Negotiate commission splits with each partner (default 70/30).',
        'url': 'https://itwhip.com/how-it-works#fleet-step-2'
      },
      {
        '@type': 'HowToStep',
        'position': 3,
        'name': 'Earn on Every Booking',
        'text': 'Track all managed vehicles in your dashboard. Earn 10-30% commission on bookings. Get paid via Stripe Connect.',
        'url': 'https://itwhip.com/how-it-works#fleet-step-3'
      }
    ]
  }

  // FAQPage Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'How is ItWhip different from Turo?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'ItWhip is a peer-to-peer car sharing platform focused on Arizona. We offer transparent insurance tiers where YOU choose your earnings (40-90%), $1M liability coverage on all trips, advanced Mileage Forensics™ fraud prevention, and ESG impact tracking. We also partner directly with 50+ Arizona hotels for convenient guest pickup.'
        }
      },
      {
        '@type': 'Question',
        'name': 'What insurance is included?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Every trip includes $1M liability coverage regardless of your tier. Physical damage coverage (collision & comprehensive), roadside assistance, and loss of use compensation are also included. Your tier determines who\'s primary: BASIC uses platform insurance, STANDARD/PREMIUM use your insurance with platform as backup.'
        }
      },
      {
        '@type': 'Question',
        'name': 'How do the insurance tiers work?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Your earnings are determined by the insurance you bring: BASIC (40%) - we provide all coverage, STANDARD (75%) - you bring P2P insurance like State Farm or Getaround coverage, PREMIUM (90%) - you bring commercial auto insurance. Higher tiers also get lower deductibles ($2,500 → $1,500 → $1,000).'
        }
      },
      {
        '@type': 'Question',
        'name': 'How much can I earn as a host?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Earnings vary by vehicle and tier. At the 90% tier: Economy cars average $800-1,400/month, standard vehicles $1,200-2,000/month, luxury $2,000-4,000/month based on 15-20 rental days.'
        }
      },
      {
        '@type': 'Question',
        'name': 'When do hosts get paid?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Within 48 hours of trip completion via direct deposit - the fastest in the industry. You can track all earnings in real-time through your host dashboard. We also provide automated 1099 tax documentation.'
        }
      },
      {
        '@type': 'Question',
        'name': 'What is Mileage Forensics™?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Our proprietary system that tracks odometer readings between trips to verify usage patterns, detect potential fraud, and ensure hosts are using vehicles according to their declared usage type. This protects both hosts and insurance partners.'
        }
      },
      {
        '@type': 'Question',
        'name': 'What happens if there\'s damage?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Our FNOL (First Notice of Loss) system captures all information insurers need. Report damage within 24 hours through the app with photos. Claims are typically resolved within 48-72 hours. Your deductible depends on your tier: BASIC $2,500, STANDARD $1,500, PREMIUM $1,000.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Is ItWhip available outside Arizona?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Currently, we\'re focused on the Phoenix metro area and Arizona. We operate under Arizona\'s P2P car sharing legislation (A.R.S. § 28-9601). Expansion to other states is planned for 2025.'
        }
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToRentSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToFleetSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  )
}