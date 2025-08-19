// app/contact/page.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import { 
  IoCallOutline,
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
  IoDocumentTextOutline,
  IoLogoTwitter,
  IoLogoLinkedin,
  IoLogoFacebook,
  IoLogoInstagram,
  IoHomeOutline,
  IoPeopleOutline
} from 'react-icons/io5'

export default function ContactPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'general',
    message: '',
    userType: 'rider'
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
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitStatus('success')
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'general',
        message: '',
        userType: 'rider'
      })
      
      // Reset status after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000)
    }, 1500)
  }

  const contactMethods = [
    {
      icon: IoCallOutline,
      title: 'Phone Support',
      description: '24/7 support for riders',
      contact: '(480) 555-0199',
      action: 'tel:+14805550199',
      available: 'Available 24/7'
    },
    {
      icon: IoMailOutline,
      title: 'Email Support',
      description: 'General inquiries',
      contact: 'support@itwhip.com',
      action: 'mailto:support@itwhip.com',
      available: 'Response within 24 hours'
    },
    {
      icon: IoBusinessOutline,
      title: 'Hotel Partnerships',
      description: 'For hotel executives',
      contact: 'partners@itwhip.com',
      action: 'mailto:partners@itwhip.com',
      available: 'Business hours'
    },
    {
      icon: IoCarOutline,
      title: 'Driver Support',
      description: 'Driver applications & support',
      contact: 'drivers@itwhip.com',
      action: 'mailto:drivers@itwhip.com',
      available: 'Mon-Fri 9AM-6PM MST'
    }
  ]

  const offices = [
    {
      city: 'Phoenix Headquarters',
      address: '2390 E Camelback Rd',
      cityState: 'Phoenix, AZ 85016',
      phone: '(480) 555-0100',
      type: 'Main Office'
    },
    {
      city: 'Scottsdale Operations',
      address: '7373 E Doubletree Ranch Rd',
      cityState: 'Scottsdale, AZ 85258',
      phone: '(480) 555-0200',
      type: 'Operations Center'
    }
  ]

  const faqs = [
    {
      question: 'How do I get a booking code?',
      answer: 'Booking codes are provided when you reserve a room at any of our partner hotels. The code will be in your confirmation email.'
    },
    {
      question: 'Which hotels offer ItWhip service?',
      answer: 'We partner with premium hotels including Four Seasons, The Phoenician, Fairmont, and other luxury properties in Phoenix and Scottsdale.'
    },
    {
      question: 'What if my ride is late?',
      answer: 'Our average pickup time is under 4 minutes. If your driver is delayed, you\'ll receive real-time updates and compensation if applicable.'
    },
    {
      question: 'How do I become a driver?',
      answer: 'Visit our driver portal or email drivers@itwhip.com. You\'ll need a luxury vehicle (less than 3 years old) and pass our background check.'
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
                Contact Us
              </h1>
              <span className="hidden sm:inline-block ml-2 px-2 py-1 text-xs text-amber-600 bg-amber-100 dark:bg-amber-900/20 rounded">
                24/7 Support
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <a href="#faqs" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                FAQs
              </a>
              <a href="#offices" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                Offices
              </a>
              <Link href="/support" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                Support Center
              </Link>
              <a 
                href="tel:+14805550199"
                className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg font-semibold hover:bg-amber-700"
              >
                Call Now
              </a>
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
                href="#faqs" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoHelpCircleOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">FAQs</span>
              </a>
              <a 
                href="#offices" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoLocationOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Offices</span>
              </a>
              <Link 
                href="/support" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoHeadsetOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Support</span>
              </Link>
              <a 
                href="tel:+14805550199"
                className="flex items-center space-x-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold whitespace-nowrap min-w-fit"
              >
                <IoCallOutline className="w-4 h-4 flex-shrink-0" />
                <span>Call Now</span>
              </a>
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
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                How Can We Help?
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400">
                Our team is here to assist with rides, hotel partnerships, or any questions about ItWhip services.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Contact Methods */}
        <section className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {contactMethods.map((method, idx) => (
                <a
                  key={idx}
                  href={method.action}
                  className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-lg transition group"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center group-hover:bg-amber-200 dark:group-hover:bg-amber-800/30 transition">
                      <method.icon className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base mb-1">
                        {method.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {method.description}
                      </p>
                      <p className="text-sm font-medium text-amber-600 group-hover:text-amber-700">
                        {method.contact}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {method.available}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Offices */}
        <section className="py-8 sm:py-12 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 sm:p-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Send Us a Message
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
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          I am a...
                        </label>
                        <select
                          value={formData.userType}
                          onChange={(e) => setFormData({...formData, userType: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                          <option value="rider">Hotel Guest / Rider</option>
                          <option value="hotel">Hotel Executive</option>
                          <option value="driver">Driver / Interested Driver</option>
                          <option value="media">Media / Press</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
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
                        <option value="general">General Inquiry</option>
                        <option value="booking">Booking Issue</option>
                        <option value="partnership">Hotel Partnership</option>
                        <option value="driver">Driver Application</option>
                        <option value="support">Technical Support</option>
                        <option value="billing">Billing Question</option>
                        <option value="feedback">Feedback</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Message *
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="Please tell us how we can help..."
                      />
                    </div>

                    {submitStatus === 'success' && (
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                        <div className="flex items-center space-x-2">
                          <IoCheckmarkCircle className="w-5 h-5 text-green-600" />
                          <p className="text-sm text-green-800 dark:text-green-300">
                            Thank you! We'll respond within 24 hours.
                          </p>
                        </div>
                      </div>
                    )}

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

              {/* Office Locations */}
              <div className="space-y-6">
                <div id="offices">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Our Offices
                  </h2>
                  
                  <div className="space-y-4">
                    {offices.map((office, idx) => (
                      <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 shadow-sm">
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
                            <a href={`tel:${office.phone.replace(/[^\d]/g, '')}`} className="text-sm text-amber-600 hover:text-amber-700 mt-2 inline-block">
                              {office.phone}
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Business Hours */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 sm:p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <IoTimeOutline className="w-5 h-5 text-amber-600 mr-2" />
                    Support Hours
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Rider Support:</span>
                      <span className="font-medium text-gray-900 dark:text-white">24/7</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Hotel Partners:</span>
                      <span className="font-medium text-gray-900 dark:text-white">Mon-Fri 8AM-6PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Driver Support:</span>
                      <span className="font-medium text-gray-900 dark:text-white">Mon-Fri 9AM-6PM</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">All times in MST (Mountain Standard Time)</p>
                  </div>
                </div>

                {/* Social Media */}
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Follow Us
                  </h3>
                  <div className="flex space-x-4">
                    <a href="https://twitter.com/itwhip" className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center hover:bg-amber-100 dark:hover:bg-amber-900/20 transition">
                      <IoLogoTwitter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </a>
                    <a href="https://linkedin.com/company/itwhip" className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center hover:bg-amber-100 dark:hover:bg-amber-900/20 transition">
                      <IoLogoLinkedin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </a>
                    <a href="https://facebook.com/itwhip" className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center hover:bg-amber-100 dark:hover:bg-amber-900/20 transition">
                      <IoLogoFacebook className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </a>
                    <a href="https://instagram.com/itwhip" className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center hover:bg-amber-100 dark:hover:bg-amber-900/20 transition">
                      <IoLogoInstagram className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section id="faqs" className="py-8 sm:py-12 bg-gray-50 dark:bg-gray-950">
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

            <div className="mt-8 text-center">
              <Link href="/how-it-works" className="text-amber-600 hover:text-amber-700 font-medium">
                View all FAQs →
              </Link>
            </div>
          </div>
        </section>

        {/* Emergency Contact */}
        <section className="py-6 sm:py-8 bg-red-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="text-white mb-4 sm:mb-0">
                <h3 className="font-bold text-lg mb-1">Emergency Support</h3>
                <p className="text-sm text-red-100">For urgent ride issues or safety concerns</p>
              </div>
              <a href="tel:+14805550911" className="px-6 py-3 bg-white text-red-600 rounded-lg font-bold hover:bg-red-50 transition">
                Call (480) 555-0911
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-xs sm:text-sm text-gray-500">
              <p>© 2024 ItWhip Technologies, Inc. All rights reserved.</p>
              <div className="mt-4 space-x-3 sm:space-x-4">
                <Link href="/terms" className="hover:text-gray-700 dark:hover:text-gray-300">Terms</Link>
                <Link href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300">Privacy</Link>
                <Link href="/about" className="hover:text-gray-700 dark:hover:text-gray-300">About</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}