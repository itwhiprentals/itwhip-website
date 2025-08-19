// app/how-it-works/page.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import { 
  IoCarSportOutline,
  IoQrCodeOutline,
  IoPhonePortraitOutline,
  IoLocationOutline,
  IoShieldCheckmarkOutline,
  IoSparklesOutline,
  IoCheckmarkCircle,
  IoArrowForwardOutline,
  IoBusinessOutline,
  IoAirplaneOutline,
  IoTimeOutline,
  IoWalletOutline,
  IoStarOutline,
  IoFlashOutline,
  IoRocketOutline,
  IoInformationCircleOutline,
  IoHelpCircleOutline,
  IoBookOutline
} from 'react-icons/io5'

export default function HowItWorksPage() {
  const router = useRouter()
  const [activeStep, setActiveStep] = useState(1)
  
  // Header state management for main nav
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Header handlers for main nav
  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/')
  }

  const steps = [
    {
      number: 1,
      title: 'Book Your Hotel',
      description: 'Reserve your stay at any of our premium partner properties',
      icon: IoBusinessOutline,
      details: 'When you book with our partner hotels, you automatically gain access to instant luxury rides throughout your stay.'
    },
    {
      number: 2,
      title: 'Get Your Code',
      description: 'Receive your exclusive booking code with your hotel confirmation',
      icon: IoQrCodeOutline,
      details: 'Your booking code arrives via email and SMS. This code unlocks member rates and premium vehicles.'
    },
    {
      number: 3,
      title: 'Request Instant Rides',
      description: 'Open the app and enter your booking code to access luxury vehicles',
      icon: IoPhonePortraitOutline,
      details: 'Skip surge pricing with fixed rates. Choose from Tesla, Mercedes, and BMW vehicles.'
    },
    {
      number: 4,
      title: 'Enjoy VIP Service',
      description: 'Your luxury vehicle arrives in minutes, charged directly to your room',
      icon: IoSparklesOutline,
      details: 'Professional drivers, premium vehicles, and seamless billing to your hotel folio.'
    }
  ]

  const features = [
    {
      icon: IoShieldCheckmarkOutline,
      title: 'No Surge Pricing',
      description: 'Fixed rates to the airport, even during peak times'
    },
    {
      icon: IoCarSportOutline,
      title: 'Luxury Fleet',
      description: 'Tesla, Mercedes, BMW, and other premium vehicles'
    },
    {
      icon: IoTimeOutline,
      title: 'Instant Pickup',
      description: 'Average wait time under 4 minutes at partner hotels'
    },
    {
      icon: IoWalletOutline,
      title: 'Room Charging',
      description: 'All rides automatically billed to your hotel room'
    },
    {
      icon: IoAirplaneOutline,
      title: 'Airport Priority',
      description: 'Dedicated pickup zones at Sky Harbor Airport'
    },
    {
      icon: IoStarOutline,
      title: 'VIP Drivers',
      description: 'Professional drivers with 4.9+ star ratings'
    }
  ]

  const faqs = [
    {
      question: 'Which hotels offer instant rides?',
      answer: 'Premium properties including Four Seasons, The Phoenician, Fairmont, and select luxury hotels in Phoenix, Scottsdale, and surrounding areas.'
    },
    {
      question: 'How do I get a booking code?',
      answer: 'Book directly with any partner hotel or through their official website. Your booking code is included in your confirmation email.'
    },
    {
      question: 'Can I use this without a hotel booking?',
      answer: 'ItWhip is an exclusive service for hotel guests. You must have an active reservation at a partner property to access instant rides.'
    },
    {
      question: 'How much do rides cost?',
      answer: 'Fixed rates starting at $29 to the airport. No surge pricing, ever. All rides are automatically charged to your hotel room.'
    },
    {
      question: 'What vehicles are available?',
      answer: 'Our fleet includes Tesla Model S/X, Mercedes S-Class, BMW 7 Series, and other luxury vehicles. All less than 3 years old.'
    },
    {
      question: 'How fast is pickup?',
      answer: 'Average pickup time is under 4 minutes at partner hotels. Airport pickups are coordinated with your flight arrival.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Main Header Component with Full Navigation - Fixed */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          handleGetAppClick={handleGetAppClick}
          handleSearchClick={handleSearchClick}
        />
      </div>

      {/* Page Title Section - Fixed below main header */}
      <div className="fixed top-14 md:top-16 left-0 right-0 z-40 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <IoRocketOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                How It Works
              </h1>
              <span className="hidden sm:inline-block ml-2 px-2 py-1 text-xs text-amber-600 bg-amber-100 dark:bg-amber-900/20 rounded">
                4 Simple Steps
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <a href="#steps" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                Steps
              </a>
              <a href="#features" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                Features
              </a>
              <a href="#faqs" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                FAQs
              </a>
              <Link 
                href="/"
                className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg font-semibold hover:bg-amber-700"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Quick Navigation - Fixed */}
      <div className="md:hidden fixed top-[106px] left-0 right-0 z-30 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center">
          <div className="flex-1 overflow-x-auto">
            <div className="flex">
              <a 
                href="#steps" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoBookOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Steps</span>
              </a>
              <a 
                href="#features" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoSparklesOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Features</span>
              </a>
              <a 
                href="#faqs" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoHelpCircleOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">FAQs</span>
              </a>
              <Link 
                href="/"
                className="flex items-center space-x-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold whitespace-nowrap min-w-fit"
              >
                <IoCarSportOutline className="w-4 h-4 flex-shrink-0" />
                <span>Book Now</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto mt-[150px] md:mt-[112px] pb-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-amber-50 to-white dark:from-gray-950 dark:to-gray-900 py-8 sm:py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-amber-100 dark:bg-amber-900/20 rounded-full mb-4 sm:mb-6">
                <IoSparklesOutline className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                <span className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 font-medium">
                  Exclusive for Hotel Guests
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Instant Luxury Rides
                <span className="block text-amber-600 mt-2">For Premium Hotel Guests</span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">
                Skip the surge pricing. Book your hotel, get your code, and enjoy instant access to 
                luxury vehicles throughout your stay.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Link href="/" className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition shadow-lg">
                  Find Hotels with Instant Rides
                </Link>
                <a href="#steps" className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition border border-gray-300 dark:border-gray-600">
                  See How It Works
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section id="steps" className="py-8 sm:py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Four Simple Steps
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                From hotel booking to luxury ride in minutes
              </p>
            </div>

            {/* Desktop Steps */}
            <div className="hidden lg:grid lg:grid-cols-4 gap-8 mb-12">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className={`relative cursor-pointer transition-all ${
                    activeStep === step.number ? 'scale-105' : 'opacity-75 hover:opacity-100'
                  }`}
                  onClick={() => setActiveStep(step.number)}
                >
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                      activeStep === step.number
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                        : 'bg-gray-200 dark:bg-gray-800'
                    }`}>
                      <step.icon className={`w-10 h-10 ${
                        activeStep === step.number ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {step.description}
                    </p>
                  </div>
                  {step.number < 4 && (
                    <div className="hidden lg:block absolute top-10 left-full w-full">
                      <IoArrowForwardOutline className="w-6 h-6 text-gray-400 mx-auto" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile Steps */}
            <div className="lg:hidden space-y-4 mb-8">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    activeStep === step.number
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => setActiveStep(step.number)}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      activeStep === step.number
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                        : 'bg-gray-200 dark:bg-gray-800'
                    }`}>
                      <step.icon className={`w-6 h-6 ${
                        activeStep === step.number ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Step {step.number}: {step.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Active Step Details */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 sm:p-8 max-w-3xl mx-auto">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full flex items-center justify-center">
                  {steps[activeStep - 1] && (() => {
                    const StepIcon = steps[activeStep - 1].icon
                    return <StepIcon className="w-6 h-6 text-white" />
                  })()}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {steps[activeStep - 1]?.title}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {steps[activeStep - 1]?.details}
              </p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-8 sm:py-12 lg:py-16 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Why Hotel Guests Love ItWhip
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Premium service exclusively for premium hotel guests
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {features.map((feature, idx) => (
                <div key={idx} className="text-center p-4 sm:p-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full mb-3 sm:mb-4">
                    <feature.icon className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section id="faqs" className="py-8 sm:py-12 lg:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 shadow-sm">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-r from-amber-600 to-amber-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
              Ready for Instant Luxury Rides?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-amber-100 mb-6 sm:mb-8">
              Book your stay at a premium partner hotel and skip the surge pricing forever
            </p>
            <Link href="/" className="inline-block px-6 sm:px-8 py-3 bg-white text-amber-600 rounded-lg font-bold hover:bg-amber-50 transition shadow-lg text-sm sm:text-base">
              View Partner Hotels
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-xs sm:text-sm text-gray-500">
              <p>© 2024 ItWhip. Exclusive luxury rides for premium hotel guests.</p>
              <div className="mt-3 sm:mt-4 space-x-3 sm:space-x-4">
                <Link href="/terms" className="hover:text-gray-700 dark:hover:text-gray-300">Terms</Link>
                <Link href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300">Privacy</Link>
                <Link href="/contact" className="hover:text-gray-700 dark:hover:text-gray-300">Contact</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}