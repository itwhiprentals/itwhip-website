// app/help/chloe/page.tsx
// Comprehensive help page about Choé AI assistant - SaaS Landing Page Design

import { Metadata } from 'next'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  ChoeStyles,
  ChoeHero,
  ChoeAbout,
  ChoeHowItWorks,
  ChoeShowcase,
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
    url: 'https://itwhip.com/help/chloe',
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
    canonical: 'https://itwhip.com/help/chloe'
  }
}

export default function ChoeHelpPage() {
  return (
    <>
      {/* Global styles for Choé page */}
      <ChoeStyles />

      <div className="choe-page min-h-screen bg-white dark:bg-[#0f0f0f] transition-colors overflow-x-hidden">
        <Header />

        {/* Hero Section */}
        <ChoeHero />

        {/* What is Choé */}
        <ChoeAbout />

        {/* How it works - 7 step flow */}
        <ChoeHowItWorks />

        {/* Screenshots showing Choé in action */}
        <ChoeShowcase />

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
    </>
  )
}
