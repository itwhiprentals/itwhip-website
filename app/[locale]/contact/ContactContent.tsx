// app/contact/ContactContent.tsx

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
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
  IoFlashOutline,
  IoGlobeOutline,
  IoShieldCheckmarkOutline
} from 'react-icons/io5'

export default function ContactContent() {
  const t = useTranslations('Contact')
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
      title: t('reason1Title'),
      description: t('reason1Desc')
    },
    {
      icon: IoGlobeOutline,
      title: t('reason2Title'),
      description: t('reason2Desc')
    },
    {
      icon: IoShieldCheckmarkOutline,
      title: t('reason3Title'),
      description: t('reason3Desc')
    },
    {
      icon: IoHeadsetOutline,
      title: t('reason4Title'),
      description: t('reason4Desc')
    }
  ]

  const inquiryTypes = [
    {
      icon: IoCarOutline,
      title: t('rideSupportTitle'),
      description: t('rideSupportDesc'),
      response: t('rideSupportResponse')
    },
    {
      icon: IoBusinessOutline,
      title: t('hotelTitle'),
      description: t('hotelDesc'),
      response: t('hotelResponse')
    },
    {
      icon: IoCarOutline,
      title: t('driverTitle'),
      description: t('driverDesc'),
      response: t('driverResponse')
    },
    {
      icon: IoMailOutline,
      title: t('generalTitle'),
      description: t('generalDesc'),
      response: t('generalResponse')
    }
  ]

  const offices = [
    {
      city: t('office1City'),
      address: t('office1Address'),
      cityState: t('office1CityState'),
      type: t('office1Type'),
      note: t('office1Note')
    },
    {
      city: t('office2City'),
      address: t('office2Address'),
      cityState: t('office2CityState'),
      type: t('office2Type'),
      note: t('office2Note')
    }
  ]

  const faqs = [
    {
      question: t('faqQ1'),
      answer: t('faqA1')
    },
    {
      question: t('faqQ2'),
      answer: t('faqA2')
    },
    {
      question: t('faqQ3'),
      answer: t('faqA3')
    },
    {
      question: t('faqQ4'),
      answer: t('faqA4')
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
                {t('pageTitle')}
              </h1>
              <span className="hidden sm:inline-block ml-2 px-2 py-1 text-xs text-amber-600 bg-amber-100 dark:bg-amber-900/20 rounded">
                {t('digitalSupportBadge')}
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <a href="#faqs" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                {t('navFaqs')}
              </a>
              <a href="#form" className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg font-semibold hover:bg-amber-700">
                {t('navSendMessage')}
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
                {t('heroHeading')}
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-8">
                {t('heroSubheading')}
              </p>

              {/* Why Digital Support */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-2xl mx-auto">
                <div className="flex items-start space-x-3">
                  <IoGlobeOutline className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                      {t('whyDigitalSupportTitle')}
                    </p>
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      {t('whyDigitalSupportText')}
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
                {t('sectionHelpTitle')}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {t('sectionHelpSubtitle')}
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
                      {type.response}
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
                {t('formTitle')}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('formNameLabel')}
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
                      {t('formEmailLabel')}
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
                      {t('formUserTypeLabel')}
                    </label>
                    <select
                      value={formData.userType}
                      onChange={(e) => setFormData({...formData, userType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="guest">{t('formUserTypeGuest')}</option>
                      <option value="hotel">{t('formUserTypeHotel')}</option>
                      <option value="driver">{t('formUserTypeDriver')}</option>
                      <option value="corporate">{t('formUserTypeCorporate')}</option>
                      <option value="media">{t('formUserTypeMedia')}</option>
                      <option value="other">{t('formUserTypeOther')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('formSubjectLabel')}
                    </label>
                    <select
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="general">{t('formSubjectGeneral')}</option>
                      <option value="booking">{t('formSubjectBooking')}</option>
                      <option value="partnership">{t('formSubjectPartnership')}</option>
                      <option value="driver">{t('formSubjectDriver')}</option>
                      <option value="support">{t('formSubjectSupport')}</option>
                      <option value="billing">{t('formSubjectBilling')}</option>
                      <option value="feedback">{t('formSubjectFeedback')}</option>
                      <option value="urgent">{t('formSubjectUrgent')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('formMessageLabel')}
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder={t('formMessagePlaceholder')}
                  />
                </div>

                {submitStatus === 'success' && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-2">
                      <IoCheckmarkCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-300">
                          {t('formSuccessTitle')}
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                          {t('formSuccessText')}
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
                          {t('formErrorTitle')}
                        </p>
                        <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                          {t('formErrorText')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    {t('formUrgentNote')}
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
                      <span>{t('formSending')}</span>
                    </>
                  ) : (
                    <>
                      <IoSendOutline className="w-5 h-5" />
                      <span>{t('formSubmitButton')}</span>
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
              {t('locationsTitle')}
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
                {t('locationsDisclaimer')}
              </p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section id="faqs" className="py-8 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 text-center">
              {t('faqsTitle')}
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

      </div>

      <Footer />
    </div>
  )
}