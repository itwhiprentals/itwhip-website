// app/security/certification/details/page.tsx

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Layout Components
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'

// Page Components
import TUNavigationBar from './components/TUNavigationBar'
import TULevelsExplainer from './components/TULevelsExplainer'
import ESGBreakdown from './components/ESGBreakdown'
import ComplianceMatrix from './components/ComplianceMatrix'
import ShieldBoosterSection from './components/ShieldBoosterSection'
import ROIComparison from './components/ROIComparison'

// Icons
import {
  IoShieldCheckmarkOutline,
  IoTrophyOutline,
  IoLeafOutline,
  IoBusinessOutline,
  IoCalculatorOutline,
  IoRocketOutline,
  IoArrowBackOutline,
  IoCheckmarkCircleOutline,
  IoFlashOutline,
  IoTrendingUpOutline,
  IoCashOutline,
  IoAnalyticsOutline,
  IoInfiniteOutline,
  IoGlobeOutline,
  IoDocumentTextOutline,
  IoWarningOutline,
  IoTimerOutline,
  IoStarOutline,
  IoSparklesOutline
} from 'react-icons/io5'

export default function TUDetailsPage() {
  const router = useRouter()
  
  // Header state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Section tracking
  const [activeSection, setActiveSection] = useState('overview')
  
  // Section refs
  const overviewRef = useRef<HTMLDivElement>(null)
  const levelsRef = useRef<HTMLDivElement>(null)
  const esgRef = useRef<HTMLDivElement>(null)
  const complianceRef = useRef<HTMLDivElement>(null)
  const shieldRef = useRef<HTMLDivElement>(null)
  const roiRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  
  // Header handlers
  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/portal/login')
  }
  
  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: 'overview', ref: overviewRef },
        { id: 'levels', ref: levelsRef },
        { id: 'esg', ref: esgRef },
        { id: 'compliance', ref: complianceRef },
        { id: 'shield', ref: shieldRef },
        { id: 'roi', ref: roiRef },
        { id: 'cta', ref: ctaRef }
      ]
      
      const scrollPosition = window.scrollY + window.innerHeight / 3
      
      sections.forEach(section => {
        if (section.ref.current) {
          const { top, bottom } = section.ref.current.getBoundingClientRect()
          const elementTop = window.scrollY + top
          const elementBottom = window.scrollY + bottom
          
          if (scrollPosition >= elementTop && scrollPosition <= elementBottom) {
            setActiveSection(section.id)
          }
        }
      })
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>, section: string) => {
    setActiveSection(section)
    if (ref.current) {
      const yOffset = -100
      const y = ref.current.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <Header 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        handleGetAppClick={handleGetAppClick}
        handleSearchClick={handleSearchClick}
      />
      
      {/* Navigation Bar */}
      <TUNavigationBar 
        activeSection={activeSection}
        scrollToSection={scrollToSection}
        refs={{
          overviewRef,
          levelsRef,
          esgRef,
          complianceRef,
          shieldRef,
          roiRef,
          ctaRef
        }}
      />
      
      {/* Back Link */}
      <div className="fixed top-20 left-4 z-40 hidden lg:block">
        <Link 
          href="/security/certification"
          className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
        >
          <IoArrowBackOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Back to Certification</span>
        </Link>
      </div>
      
      {/* Main Content */}
      <main className="pt-32 md:pt-28">
        
        {/* Overview Section */}
        <section ref={overviewRef} id="overview" className="py-20 bg-gradient-to-br from-purple-950 via-indigo-950 to-purple-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-purple-500/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <IoShieldCheckmarkOutline className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-semibold text-purple-300">TECHNOLOGY UNIFIED CERTIFICATION</span>
              </div>
              
              <h1 suppressHydrationWarning className="text-5xl md:text-6xl font-black text-white mb-6">
                The Only Certification That
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mt-2">
                  Pays You Back
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                TU certification exceeds SOC 2, ISO 27001, and PCI DSS standards while generating 
                $500K+ annual revenue through transportation and ESG monetization.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-3xl font-bold text-white">3</div>
                  <div className="text-sm text-gray-300">Protection Levels</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-3xl font-bold text-white">24/7</div>
                  <div className="text-sm text-gray-300">Continuous Validation</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-400">+$500K</div>
                  <div className="text-sm text-gray-300">Annual Revenue</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-3xl font-bold text-purple-400">100%</div>
                  <div className="text-sm text-gray-300">Compliance Coverage</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Why TU Exists */}
        <section className="py-20 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Why Traditional Compliance Fails Hotels
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                You're paying for certifications that check once a year and never generate revenue
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                <IoWarningOutline className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Outdated Validation
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  SOC 2 audits annually, ISO 27001 every 3 years. Hackers attack every second.
                </p>
                <div className="text-sm font-semibold text-red-600">
                  Cost: $180K/year, Protection: Minimal
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                <IoTimerOutline className="w-12 h-12 text-orange-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Zero Revenue Return
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Traditional certifications are pure cost centers that never pay back.
                </p>
                <div className="text-sm font-semibold text-orange-600">
                  ROI: -100%, Value: Checkbox only
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                <IoBusinessOutline className="w-12 h-12 text-blue-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Missing Opportunities
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No ESG tracking, no transportation revenue, no operational tools.
                </p>
                <div className="text-sm font-semibold text-blue-600">
                  Lost Revenue: $500K+/year
                </div>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 rounded-full px-6 py-3">
                <IoCheckmarkCircleOutline className="w-6 h-6 text-green-600" />
                <span className="text-lg font-semibold text-green-800 dark:text-green-400">
                  TU validates every second and generates revenue while doing it
                </span>
              </div>
            </div>
          </div>
        </section>
        
        {/* TU Levels Section */}
        <section ref={levelsRef} id="levels" className="py-20 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Choose Your Protection Level
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Three tiers designed for different property sizes and security needs
              </p>
            </div>
            
            <TULevelsExplainer />
          </div>
        </section>
        
        {/* ESG Integration Section */}
        <section ref={esgRef} id="esg" className="py-20 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                ESG Integration That Makes Money
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Track emissions, generate reports, and monetize your sustainability data
              </p>
            </div>
            
            <ESGBreakdown />
          </div>
        </section>
        
        {/* Compliance Matrix Section */}
        <section ref={complianceRef} id="compliance" className="py-20 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                One Certification Replaces Everything
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                See how TU exceeds all traditional compliance standards
              </p>
            </div>
            
            <ComplianceMatrix />
          </div>
        </section>
        
        {/* Shield Booster Section */}
        <section ref={shieldRef} id="shield" className="py-20 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Keep Your Existing Certifications
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Add TU as a revenue layer on top of what you already have
              </p>
            </div>
            
            <ShieldBoosterSection />
          </div>
        </section>
        
        {/* ROI Comparison Section */}
        <section ref={roiRef} id="roi" className="py-20 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                The Math That Changes Everything
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Calculate your savings and revenue potential with TU certification
              </p>
            </div>
            
            <ROIComparison />
          </div>
        </section>
        
        {/* CTA Section */}
        <section ref={ctaRef} id="cta" className="py-20 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Turn Compliance Into Revenue?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join 487+ hotels already generating $500K+ annually from certification
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href="/security/certification"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105"
              >
                Configure Your TU Level →
              </Link>
              <Link
                href="/demo"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg font-bold text-lg hover:bg-white/20 transition-all"
              >
                Schedule Expert Call
              </Link>
            </div>
            
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <IoFlashOutline className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-sm text-gray-300">24-Hour Setup</p>
              </div>
              <div className="text-center">
                <IoTrendingUpOutline className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-sm text-gray-300">Revenue Day One</p>
              </div>
              <div className="text-center">
                <IoInfiniteOutline className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-sm text-gray-300">Continuous Protection</p>
              </div>
            </div>
          </div>
        </section>
        
      </main>
      
      <Footer />
    </div>
  )
}