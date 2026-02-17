// app/help/choe/page.tsx
// Comprehensive help page about Choé AI assistant - SaaS Landing Page Design

import { Metadata, Viewport } from 'next'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { getTranslations } from 'next-intl/server'
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

// Override status bar color to match Choé page theme
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f0f0f' },
  ],
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SeoMeta' })

  return {
    title: t('helpChoeTitle'),
    description: t('helpChoeDescription'),
    openGraph: {
      title: t('helpChoeOgTitle'),
      description: t('helpChoeOgDescription'),
      url: 'https://itwhip.com/help/choe',
      type: 'website',
      images: [
      {
        url: '/images/choe-logo.png',
        width: 512,
        height: 512,
        alt: 'Choé AI Logo'
      }
    ],
    },
    twitter: {
      card: 'summary',
      title: t('helpChoeTwitterTitle'),
      description: t('helpChoeTwitterDescription'),
    },
    alternates: {
      canonical: 'https://itwhip.com/help/choe',
    },
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
