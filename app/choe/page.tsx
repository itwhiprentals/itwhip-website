// app/choe/page.tsx — Standalone fullscreen Choé AI chat page
// SSR landing state for SEO — client renders on top via z-stacking

import type { Metadata, Viewport } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import ChoePageClient from './ChoePageClient'

// Same viewport pattern as /help/choe — server-rendered meta tags that Safari reads
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' },
  ],
}

export const metadata: Metadata = {
  title: 'Choé | AI Car Booking Assistant | ItWhip',
  description:
    'Chat with Choé, your AI-powered car rental assistant. Search luxury cars, SUVs, trucks and more in Phoenix, Scottsdale, Tempe and across Arizona. Natural language booking — just describe what you need.',
  openGraph: {
    title: 'Choé | AI Car Booking Assistant | ItWhip',
    description:
      'Chat with Choé to find and book the perfect car in Arizona. Describe what you need in plain English — Choé handles the rest.',
    url: 'https://itwhip.com/choe',
    type: 'website',
    images: [
      {
        url: '/images/choe-logo.png',
        width: 512,
        height: 512,
        alt: 'Choé AI Car Booking Assistant',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Choé | AI Car Booking Assistant | ItWhip',
    description:
      'Chat with Choé to find and book the perfect car in Arizona. Just describe what you need.',
    images: ['/images/choe-logo.png'],
  },
  alternates: {
    canonical: 'https://itwhip.com/choe',
  },
}

// JSON-LD structured data for search engines
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Choé',
  alternateName: 'Choé AI Car Booking Assistant',
  description:
    'AI-powered car rental assistant that helps you find and book vehicles in Arizona through natural language conversation.',
  url: 'https://itwhip.com/choe',
  applicationCategory: 'TravelApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free to use — pay only for your rental',
  },
  creator: {
    '@type': 'Organization',
    name: 'ItWhip',
    url: 'https://itwhip.com',
  },
  featureList: [
    'Natural language car search',
    'AI-powered booking assistance',
    'Real-time availability and pricing',
    'Delivery and pickup coordination',
    'Insurance and add-on selection',
  ],
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://itwhip.com/choe?q={search_term}',
    'query-input': 'required name=search_term',
  },
  screenshot: '/images/choe-logo.png',
}

// Prompt suggestions — rendered as crawlable links
const examplePrompts = [
  { label: 'SUV in Phoenix under $50/day', q: 'SUV+in+Phoenix+under+50' },
  { label: 'No deposit cars in Scottsdale', q: 'No+deposit+cars+in+Scottsdale' },
  { label: 'Tesla for next weekend', q: 'Tesla+for+next+weekend' },
  { label: 'Convertible for a date night', q: 'Convertible+for+a+date+night' },
  { label: 'Something spacious for 6 people', q: 'Something+spacious+for+6+people' },
  { label: 'Luxury car in Tempe', q: 'Luxury+car+in+Tempe' },
]

export default function ChoePage() {
  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="relative min-h-[100dvh]">
        {/* SSR landing — sits behind client, visible to crawlers */}
        <div id="choe-ssr-landing" className="absolute inset-0 -z-10" aria-hidden="false">
          <div className="max-w-2xl mx-auto px-4 py-12 text-center">
            <Image
              src="/images/choe-logo.png"
              alt="Choé AI Car Booking Assistant"
              width={80}
              height={80}
              className="mx-auto mb-4 rounded-xl"
              priority
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Choé — AI Car Booking Assistant
            </h1>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Tell Choé what you&apos;re looking for in plain English and she&apos;ll find
              the perfect rental car for you across Phoenix, Scottsdale, Tempe, and all of
              Arizona. Search, compare, and book — all through conversation.
            </p>

            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Try asking
            </h2>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {examplePrompts.map((prompt) => (
                <Link
                  key={prompt.q}
                  href={`/choe?q=${prompt.q}`}
                  className="px-3 py-1.5 bg-violet-50 text-violet-700 text-sm rounded-full hover:bg-violet-100 transition-colors"
                >
                  {prompt.label}
                </Link>
              ))}
            </div>

            <div className="text-sm text-gray-500 space-y-2">
              <p>
                Choé can search by price, location, vehicle type, features, dates,
                and more. She&apos;ll show you real-time availability, handle insurance
                selection, arrange delivery, and walk you through checkout.
              </p>
              <p>
                <Link href="/help/choe" className="text-violet-600 underline underline-offset-2">
                  Learn more about Choé
                </Link>
                {' | '}
                <Link href="/rentals/search" className="text-violet-600 underline underline-offset-2">
                  Browse all cars
                </Link>
              </p>
            </div>

            <noscript>
              <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                Choé requires JavaScript to run. Please enable JavaScript or{' '}
                <a href="/rentals/search" className="underline">browse cars manually</a>.
              </div>
            </noscript>
          </div>
        </div>

        {/* Interactive client — renders on top, covers SSR content */}
        <ChoePageClient />
      </div>
    </>
  )
}
