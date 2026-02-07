// app/help/choe/page.tsx
// Comprehensive help page about Choé AI assistant

import { Metadata } from 'next'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  ChoeHero,
  ChoeAbout,
  ChoeHowItWorks,
  ChoeFeatures,
  ChoeTripPlanner,
  ChoeCommerce,
  ChoeAuto,
  ChoeDeveloper,
  ChoeSecurity,
  ChoeTips,
  ChoeFAQs,
  ChoeCTA
} from './components'

export const metadata: Metadata = {
  title: 'Meet Choé | AI Car Booking Assistant | ItWhip',
  description: 'Choé (Kow-We) is ItWhip\'s AI-powered car booking assistant. Learn how Choé helps you find the perfect rental car in Arizona through natural conversation.',
  keywords: [
    'choé ai',
    'choe ai',
    'ai car booking',
    'car rental assistant',
    'itwhip ai',
    'conversational booking',
    'arizona car rental',
    'choe.cloud'
  ],
  openGraph: {
    title: 'Meet Choé | AI Car Booking Assistant',
    description: 'Choé is ItWhip\'s AI-powered car booking assistant. Find your perfect rental car through natural conversation.',
    url: 'https://itwhip.com/help/choe',
    type: 'website',
    images: [
      {
        url: '/images/choe-logo.png',
        width: 512,
        height: 512,
        alt: 'Choé AI Logo'
      }
    ]
  },
  twitter: {
    card: 'summary',
    title: 'Meet Choé | AI Car Booking Assistant',
    description: 'Choé is ItWhip\'s AI-powered car booking assistant for Arizona car rentals.',
    images: ['/images/choe-logo.png']
  },
  alternates: {
    canonical: 'https://itwhip.com/help/choe'
  }
}

export default function ChoeHelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Hero Section with gradient background */}
      <ChoeHero />

      {/* What is Choé */}
      <ChoeAbout />

      {/* How it works - 7 step flow */}
      <ChoeHowItWorks />

      {/* Smart Features Grid */}
      <ChoeFeatures />

      {/* BETA: Trip Planner */}
      <ChoeTripPlanner />

      {/* BETA: Conversational Commerce */}
      <ChoeCommerce />

      {/* BETA: CarPlay / Android Auto */}
      <ChoeAuto />

      {/* Developer Platform */}
      <ChoeDeveloper />

      {/* Privacy & Security */}
      <ChoeSecurity />

      {/* Tips for Best Results */}
      <ChoeTips />

      {/* FAQs */}
      <ChoeFAQs />

      {/* Call to Action */}
      <ChoeCTA />

      <Footer />
    </div>
  )
}
