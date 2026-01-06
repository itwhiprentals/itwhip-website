// app/security/certification/page.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

// Fix the Header and Footer imports - they're in app/components not @/components
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'

// Import all 10 new certification components - these paths are correct
import { CertificationHero } from '@/app/components/certification/CertificationHero'
import { GhostDashboard } from '@/app/components/certification/GhostDashboard'
import { TripleStreamMonitor } from '@/app/components/certification/TripleStreamMonitor'
import { HackerTransparency } from '@/app/components/certification/HackerTransparency'
import { MonopolyMath } from '@/app/components/certification/MonopolyMath'
import { ComplianceReplacer } from '@/app/components/certification/ComplianceReplacer'
import { RevenueActivator } from '@/app/components/certification/RevenueActivator'
import { StakeholderTabs } from '@/app/components/certification/StakeholderTabs'
import { SocialProofWall } from '@/app/components/certification/SocialProofWall'
import { CertificationGateway } from '@/app/components/certification/CertificationGateway'

// Import existing security components to reuse
import SecurityObjections from '@/app/components/security/SecurityObjections'

// Icons for navigation
import {
  IoShieldCheckmarkOutline,
  IoStatsChartOutline,
  IoPulseOutline,
  IoBugOutline,
  IoCalculatorOutline,
  IoDocumentTextOutline,
  IoCashOutline,
  IoPeopleOutline,
  IoTrophyOutline,
  IoRocketOutline,
  IoArrowForwardOutline,
  IoBookOutline
} from 'react-icons/io5'

interface UserJourney {
  timeOnPage: number
  sectionsViewed: string[]
  calculatorUsed: boolean
  dashboardRevealed: boolean
  roiCalculated: number | null
  selectedTier: string | null
  source: string | null
}

export default function CertificationPage() {
  const router = useRouter()
  
  // Header state and handlers
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Section refs for scrolling
  const heroRef = useRef<HTMLDivElement>(null)
  const dashboardRef = useRef<HTMLDivElement>(null)
  const streamsRef = useRef<HTMLDivElement>(null)
  const hackersRef = useRef<HTMLDivElement>(null)
  const calculatorRef = useRef<HTMLDivElement>(null)
  const complianceRef = useRef<HTMLDivElement>(null)
  const revenueRef = useRef<HTMLDivElement>(null)
  const stakeholdersRef = useRef<HTMLDivElement>(null)
  const socialRef = useRef<HTMLDivElement>(null)
  const gatewayRef = useRef<HTMLDivElement>(null)
  
  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/portal/login')
  }
  
  // Track user journey for optimization
  const [userJourney, setUserJourney] = useState<UserJourney>({
    timeOnPage: 0,
    sectionsViewed: [],
    calculatorUsed: false,
    dashboardRevealed: false,
    roiCalculated: null,
    selectedTier: null,
    source: null
  })

  // Track which section is in view
  const [activeSection, setActiveSection] = useState<string>('hero')
  
  // Loading state for smooth transitions
  const [isLoading, setIsLoading] = useState(true)

  // Scroll to section handler
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>, section: string) => {
    setActiveSection(section)
    if (ref.current) {
      const yOffset = -170
      const y = ref.current.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  // Track time on page
  useEffect(() => {
    const timer = setInterval(() => {
      setUserJourney(prev => ({
        ...prev,
        timeOnPage: prev.timeOnPage + 1
      }))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Track source
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const source = urlParams.get('source') || document.referrer || 'direct'
    
    setUserJourney(prev => ({
      ...prev,
      source
    }))

    // Remove loading state
    setTimeout(() => setIsLoading(false), 500)
  }, [])

  // Track section views
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { name: 'hero', ref: heroRef },
        { name: 'dashboard', ref: dashboardRef },
        { name: 'streams', ref: streamsRef },
        { name: 'hackers', ref: hackersRef },
        { name: 'calculator', ref: calculatorRef },
        { name: 'compliance', ref: complianceRef },
        { name: 'revenue', ref: revenueRef },
        { name: 'stakeholders', ref: stakeholdersRef },
        { name: 'social', ref: socialRef },
        { name: 'gateway', ref: gatewayRef }
      ]
      
      const scrollPosition = window.scrollY + window.innerHeight / 2
      
      sections.forEach(section => {
        if (section.ref.current) {
          const { top, bottom } = section.ref.current.getBoundingClientRect()
          const elementTop = window.scrollY + top
          const elementBottom = window.scrollY + bottom
          
          if (scrollPosition >= elementTop && scrollPosition <= elementBottom) {
            setActiveSection(section.name)
            
            setUserJourney(prev => ({
              ...prev,
              sectionsViewed: prev.sectionsViewed.includes(section.name) 
                ? prev.sectionsViewed 
                : [...prev.sectionsViewed, section.name]
            }))
          }
        }
      })
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial position
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Save journey data to localStorage for persistence
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('certificationJourney', JSON.stringify(userJourney))
    }
  }, [userJourney])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-indigo-950 to-purple-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-white">Loading Security Certification...</p>
        </div>
      </div>
    )
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
      
      {/* Page Title Bar with Navigation */}
      <div className="fixed top-14 md:top-16 left-0 right-0 z-40 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <IoShieldCheckmarkOutline className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                TU Certification Platform
              </h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={() => scrollToSection(dashboardRef, 'dashboard')} 
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600"
              >
                Dashboard
              </button>
              <button 
                onClick={() => scrollToSection(calculatorRef, 'calculator')} 
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600"
              >
                ROI Calculator
              </button>
              <button 
                onClick={() => scrollToSection(complianceRef, 'compliance')} 
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600"
              >
                Compliance
              </button>
              <button 
                onClick={() => scrollToSection(gatewayRef, 'gateway')} 
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600"
              >
                Get Certified
              </button>
              <a 
                href="/security/certification/details"
                className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg font-semibold hover:bg-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center"
              >
                <IoBookOutline className="w-4 h-4 mr-1" />
                Full Details
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-[106px] left-0 right-0 z-30 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center">
          <div className="flex-1 overflow-x-auto">
            <div className="flex">
              <button 
                onClick={() => scrollToSection(heroRef, 'hero')}
                className={`flex items-center space-x-1.5 px-4 py-3 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit ${
                  activeSection === 'hero' 
                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-purple-600'
                }`}
              >
                <IoShieldCheckmarkOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Overview</span>
              </button>
              <button 
                onClick={() => scrollToSection(dashboardRef, 'dashboard')}
                className={`flex items-center space-x-1.5 px-4 py-3 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit ${
                  activeSection === 'dashboard' 
                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-purple-600'
                }`}
              >
                <IoStatsChartOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Dashboard</span>
              </button>
              <button 
                onClick={() => scrollToSection(calculatorRef, 'calculator')}
                className={`flex items-center space-x-1.5 px-4 py-3 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit ${
                  activeSection === 'calculator' 
                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-purple-600'
                }`}
              >
                <IoCalculatorOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">ROI</span>
              </button>
              <button 
                onClick={() => scrollToSection(gatewayRef, 'gateway')}
                className={`flex items-center space-x-1.5 px-4 py-3 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit ${
                  activeSection === 'gateway' 
                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-purple-600'
                }`}
              >
                <IoRocketOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Get Started</span>
              </button>
              <a 
                href="/security/certification/details"
                className="flex items-center space-x-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-semibold whitespace-nowrap min-w-fit"
              >
                <IoBookOutline className="w-4 h-4 flex-shrink-0" />
                <span>Details</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress Indicator */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-800 z-50">
        <div 
          className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300"
          style={{ 
            width: `${(userJourney.sectionsViewed.length / 10) * 100}%` 
          }}
        />
      </div>

      {/* Side Navigation (Desktop Only) */}
      <nav className="hidden lg:block fixed right-8 top-1/2 transform -translate-y-1/2 z-40">
        <ul className="space-y-2">
          {[
            { id: 'hero', label: 'Overview', ref: heroRef },
            { id: 'dashboard', label: 'Dashboard', ref: dashboardRef },
            { id: 'streams', label: 'Live Activity', ref: streamsRef },
            { id: 'hackers', label: 'Security', ref: hackersRef },
            { id: 'calculator', label: 'ROI Calculator', ref: calculatorRef },
            { id: 'compliance', label: 'Compliance', ref: complianceRef },
            { id: 'revenue', label: 'Revenue', ref: revenueRef },
            { id: 'stakeholders', label: 'For Everyone', ref: stakeholdersRef },
            { id: 'social', label: 'Success Stories', ref: socialRef },
            { id: 'gateway', label: 'Get Started', ref: gatewayRef }
          ].map((section) => (
            <li key={section.id}>
              <button
                onClick={() => scrollToSection(section.ref, section.id)}
                className={`w-3 h-3 rounded-full transition-all ${
                  activeSection === section.id 
                    ? 'bg-purple-600 scale-150' 
                    : userJourney.sectionsViewed.includes(section.id)
                    ? 'bg-purple-400'
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}
                title={section.label}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content - Adjusted padding for navigation */}
      <main className="relative pt-[145px] md:pt-[105px]">
        {/* View Full Details Banner - Added margin top for desktop */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 text-center mt-0 md:mt-8">
          <div className="flex items-center justify-center space-x-2">
            <IoArrowForwardOutline className="w-5 h-5" />
            <span className="text-sm">Want to understand TU certification in detail?</span>
            <a 
              href="/security/certification/details" 
              className="underline font-semibold hover:text-purple-200"
            >
              View comprehensive guide
            </a>
          </div>
        </div>
        
        {/* 1. Hero Section - The Hook */}
        <section ref={heroRef} id="hero">
          <CertificationHero />
        </section>

        {/* 2. Ghost Dashboard - The Trojan Horse */}
        <section ref={dashboardRef} id="dashboard">
          <GhostDashboard />
        </section>

        {/* 3. Triple Stream Monitor - Live Proof */}
        <section ref={streamsRef} id="streams">
          <TripleStreamMonitor />
        </section>

        {/* 4. Hacker Transparency - Build Trust */}
        <section ref={hackersRef} id="hackers">
          <HackerTransparency />
        </section>

        {/* 5. Monopoly Math - Personalized ROI */}
        <section ref={calculatorRef} id="calculator">
          <MonopolyMath />
        </section>

        {/* 6. Compliance Replacer - Visual Proof */}
        <section ref={complianceRef} id="compliance">
          <ComplianceReplacer />
        </section>

        {/* 7. Revenue Activator - Show the Money */}
        <section ref={revenueRef} id="revenue">
          <RevenueActivator />
        </section>

        {/* 8. Stakeholder Tabs - Address Everyone */}
        <section ref={stakeholdersRef} id="stakeholders">
          <StakeholderTabs />
        </section>

        {/* 9. Social Proof Wall - Create FOMO */}
        <section ref={socialRef} id="social">
          <SocialProofWall />
        </section>

        {/* 10. Certification Gateway - Close the Deal */}
        <section ref={gatewayRef} id="gateway">
          <CertificationGateway />
        </section>

        {/* Bonus: FAQ Section using existing component */}
        <section className="py-20 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
              Still Have Questions?
            </h2>
            <SecurityObjections />
          </div>
        </section>

        {/* Final CTA - Last Chance */}
        <section className="py-20 bg-gradient-to-br from-purple-950 via-indigo-950 to-purple-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Join the Compliance Revolution?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              47 hotels are already making money from compliance.
              Don't let your competitors get ahead.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => scrollToSection(gatewayRef, 'gateway')}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105"
              >
                Start Certification Now
              </button>
              <a 
                href="/security/certification/details"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center"
              >
                <IoBookOutline className="w-5 h-5 mr-2" />
                Learn More First
              </a>
            </div>
            
            {/* Journey Stats */}
            {userJourney.timeOnPage > 300 && (
              <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-lg">
                <p className="text-white mb-2">
                  You've been here for {Math.floor(userJourney.timeOnPage / 60)} minutes
                </p>
                <p className="text-yellow-400 text-2xl font-bold">
                  Hotels have lost ${(userJourney.timeOnPage * 0.137).toFixed(2)} while you've been reading
                </p>
                <p className="text-gray-300 mt-2">
                  Don't wait any longer. Start earning instead of losing.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* Floating CTA (appears after 30 seconds) */}
      {userJourney.timeOnPage > 30 && (
        <div className="fixed bottom-8 left-8 z-50 animate-slideUp">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-2xl p-4 text-white max-w-sm">
            <p className="text-sm font-bold mb-2">
              Limited Time Offer
            </p>
            <p className="text-xs mb-3">
              Lock in current pricing before rates increase
            </p>
            <button
              onClick={() => scrollToSection(gatewayRef, 'gateway')}
              className="w-full px-4 py-2 bg-white text-purple-600 rounded font-bold text-sm hover:bg-gray-100 transition-colors"
            >
              Claim Your Spot →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}