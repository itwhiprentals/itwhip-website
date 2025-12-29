// app/contact/ContactContent.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import { 
  IoMailOutline,
  IoLocationOutline,
  IoChatbubblesOutline,
  IoTimeOutline,
  IoBusinessOutline,
  IoCarOutline,
  IoHelpCircleOutline,
  IoSendOutline,
  IoCheckmarkCircle,
  IoWarningOutline,
  IoHeadsetOutline,
  IoLogoTwitter,
  IoLogoLinkedin,
  IoLogoFacebook,
  IoLogoInstagram,
  IoFlashOutline,
  IoGlobeOutline,
  IoShieldCheckmarkOutline
} from 'react-icons/io5'

export default function ContactContent() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: '',
    userType: 'guest'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
  // Header state management for main nav
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Header handlers for main nav
  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    
    try {
      const response = await fetch('/api/contact/general', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({
          name: '',
          email: '',
          subject: 'general',
          message: '',
          userType: 'guest'
        })
        
        // Reset status after 5 seconds
        setTimeout(() => setSubmitStatus('idle'), 5000)
      } else {
        setSubmitStatus('error')
        console.error('Form submission error:', data.error)
        
        // Show error message
        alert(data.error || 'Failed to send message. Please try again.')
        
        // Reset error status after 5 seconds
        setTimeout(() => setSubmitStatus('idle'), 5000)
      }
    } catch (error) {
      console.error('Network error:', error)
      setSubmitStatus('error')
      alert('Network error. Please check your connection and try again.')
      
      // Reset error status after 5 seconds  
      setTimeout(() => setSubmitStatus('idle'), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactReasons = [
    {
      icon: IoFlashOutline,
      title: 'Quick Response',
      description: 'Average response time under 2 hours during business hours'
    },
    {
      icon: IoGlobeOutline,
      title: 'Digital-First Platform',
      description: 'As an online platform, we optimize support through digital channels'
    },
    {
      icon: IoShieldCheckmarkOutline,
      title: 'Tracked & Secure',
      description: 'All inquiries are tracked and prioritized for quality service'
    },
    {
      icon: IoHeadsetOutline,
      title: 'Callback Available',
      description: 'Complex issues receive priority callback from specialized teams'
    }
  ]

  const inquiryTypes = [
    {
      icon: IoCarOutline,
      title: 'Ride Support',
      description: 'Booking issues, cancellations, or ride assistance',
      response: '1-2 hours'
    },
    {
      icon: IoBusinessOutline,
      title: 'Hotel Partnerships',
      description: 'Partnership opportunities and integration',
      response: '24 hours'
    },
    {
      icon: IoCarOutline,
      title: 'Driver/Host Inquiries',
      description: 'Join our network as a driver or list your vehicle',
      response: '48 hours'
    },
    {
      icon: IoMailOutline,
      title: 'General Questions',
      description: 'Platform information and other inquiries',
      response: '24 hours'
    }
  ]

  const offices = [
    {
      city: 'Phoenix Headquarters',
      address: '2390 E Camelback Rd',
      cityState: 'Phoenix, AZ 85016',
      type: 'Technology Center',
      note: 'Digital operations only'
    },
    {
      city: 'Scottsdale Hub',
      address: '7373 E Doubletree Ranch Rd',
      cityState: 'Scottsdale, AZ 85258',
      type: 'Support Operations',
      note: 'No walk-in service'
    }
  ]

  const faqs = [
    {
      question: 'Why is contact only available through the form?',
      answer: 'As a technology platform, we\'ve optimized our support through digital channels. This allows us to track, prioritize, and resolve inquiries efficiently while maintaining service quality across all time zones.'
    },
    {
      question: 'How quickly will I receive a response?',
      answer: 'Response times vary by inquiry type: Urgent ride issues (1-2 hours), General questions (24 hours), Partnership inquiries (24-48 hours). Complex issues may receive a callback from our specialized team.'
    },
    {
      question: 'What if I have an emergency during a ride?',
      answer: 'For true emergencies, always call 911 first. For urgent ride issues, submit a form marked as "urgent" and our team will prioritize your case for immediate callback.'
    },
    {
      question: 'Can I visit your office locations?',
      answer: 'Our offices are technology and operations centers without public reception areas. All support is handled digitally to ensure consistent, high-quality service for all users.'
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
              <IoChatbubblesOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Contact Support
              </h1>
              <span className="hidden sm:inline-block ml-2 px-2 py-1 text-xs text-amber-600 bg-amber-100 dark:bg-amber-900/20 rounded">
                Digital Support
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <a href="#faqs" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                FAQs
              </a>
              <a href="#form" className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg font-semibold hover:bg-amber-700">
                Send Message
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto mt-[106px] md:mt-[112px] pb-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-amber-50 to-white dark:from-gray-950 dark:to-gray-900 py-8 sm:py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Get Support Anytime
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-8">
                Our digital-first support system ensures fast, tracked responses to all inquiries. 
                Submit your message below and our specialized team will respond based on priority.
              </p>
              
              {/* Why Digital Support */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-2xl mx-auto">
                <div className="flex items-start space-x-3">
                  <IoGlobeOutline className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Why We Use Digital Support
                    </p>
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      As a technology platform operating across multiple time zones, digital support allows us to 
                      provide consistent, high-quality service 24/7. Every inquiry is tracked, prioritized, and 
                      routed to the right specialist for faster resolution.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Digital Contact */}
        <section className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {contactReasons.map((reason, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 shadow-sm">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center mb-3">
                      <reason.icon className="w-6 h-6 text-amber-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base mb-2">
                      {reason.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {reason.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Inquiry Types */}
        <section className="py-8 sm:py-12 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                How Can We Help?
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Select your inquiry type below for fastest routing
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {inquiryTypes.map((type, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/20 dark:to-amber-800/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <type.icon className="w-6 h-6 text-amber-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                      {type.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                      {type.description}
                    </p>
                    <div className="inline-flex items-center text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                      <IoTimeOutline className="w-3 h-3 mr-1" />
                      Response: {type.response}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section id="form" className="py-8 sm:py-12 bg-white dark:bg-black">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Send Your Message
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      I am a...
                    </label>
                    <select
                      value={formData.userType}
                      onChange={(e) => setFormData({...formData, userType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="guest">Guest / Traveler</option>
                      <option value="hotel">Hotel Partner</option>
                      <option value="driver">Driver / Vehicle Owner</option>
                      <option value="corporate">Corporate Client</option>
                      <option value="media">Media / Press</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject *
                    </label>
                    <select
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="general">General Question</option>
                      <option value="booking">Booking / Ride Issue</option>
                      <option value="partnership">Partnership Opportunity</option>
                      <option value="driver">Driver / Host Application</option>
                      <option value="support">Technical Support</option>
                      <option value="billing">Billing / Payment</option>
                      <option value="feedback">Feedback / Suggestion</option>
                      <option value="urgent">Urgent Issue</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Please provide details about your inquiry. Include booking numbers, dates, or any relevant information that will help us assist you better."
                  />
                </div>

                {submitStatus === 'success' && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-2">
                      <IoCheckmarkCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-300">
                          Message sent successfully!
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                          We'll respond based on the priority of your inquiry. Check your email for updates.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                    <div className="flex items-center space-x-2">
                      <IoWarningOutline className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-red-800 dark:text-red-300">
                          Failed to send message
                        </p>
                        <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                          Please check your connection and try again.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    <strong>Note:</strong> For urgent safety issues during an active ride, prioritize your safety first. 
                    Mark your inquiry as "Urgent Issue" and we'll prioritize callback within 1 hour during business hours.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <IoSendOutline className="w-5 h-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Office Locations */}
        <section className="py-8 sm:py-12 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Our Locations
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {offices.map((office, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IoLocationOutline className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {office.city}
                      </h3>
                      <p className="text-xs text-amber-600 mb-2">{office.type}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {office.address}<br />
                        {office.cityState}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 italic">
                        {office.note}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
                <strong>Note:</strong> Our offices are technology centers without public reception. 
                All support is handled digitally for consistent service quality.
              </p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section id="faqs" className="py-8 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 text-center">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-start">
                    <IoHelpCircleOutline className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                    {faq.question}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 ml-7">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Media */}
        <section className="py-8 sm:py-12 bg-white dark:bg-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Connect With Us
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Follow us for updates, news, and travel tips
              </p>
              <div className="flex justify-center space-x-4">
                <a href="https://twitter.com/itwhip" className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center hover:bg-amber-100 dark:hover:bg-amber-900/20 transition">
                  <IoLogoTwitter className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </a>
                <a href="https://linkedin.com/company/itwhip" className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center hover:bg-amber-100 dark:hover:bg-amber-900/20 transition">
                  <IoLogoLinkedin className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </a>
                <a href="https://facebook.com/itwhip" className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center hover:bg-amber-100 dark:hover:bg-amber-900/20 transition">
                  <IoLogoFacebook className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </a>
                <a href="https://instagram.com/itwhip" className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center hover:bg-amber-100 dark:hover:bg-amber-900/20 transition">
                  <IoLogoInstagram className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-xs sm:text-sm text-gray-500">
              <p>© 2024 ItWhip Technologies, Inc. All rights reserved.</p>
              <div className="mt-4 space-x-3 sm:space-x-4">
                <Link href="/terms" className="hover:text-gray-700 dark:hover:text-gray-300">Terms</Link>
                <Link href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300">Privacy</Link>
                <Link href="/about" className="hover:text-gray-700 dark:hover:text-gray-300">About</Link>
                <Link href="/how-it-works" className="hover:text-gray-700 dark:hover:text-gray-300">How It Works</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}