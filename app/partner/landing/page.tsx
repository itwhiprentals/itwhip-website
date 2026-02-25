// app/partner/landing/page.tsx
// Partner Landing Page Editor - Customize public-facing partner page

'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  IoEyeOutline,
  IoLinkOutline,
  IoCheckmarkCircleOutline,
  IoInformationCircleOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
  IoSendOutline,
  IoAlertCircleOutline,
  IoBusinessOutline
} from 'react-icons/io5'
import {
  TabNavigation,
  ContentTab,
  SocialTab,
  BrandingTab,
  ServicesTab,
  PoliciesTab,
  FAQsTab,
  LandingPageData,
  TabType,
  DEFAULT_LANDING_DATA
} from './components'

export default function PartnerLandingPage() {
  const t = useTranslations('PartnerLanding')
  const searchParams = useSearchParams()
  const [data, setData] = useState<LandingPageData>(DEFAULT_LANDING_DATA)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [saveMessageType, setSaveMessageType] = useState<'success' | 'error'>('success')
  const [activeTab, setActiveTab] = useState<TabType>('content')
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)
  const [isBusinessHost, setIsBusinessHost] = useState<boolean | null>(null)
  const [businessApprovalStatus, setBusinessApprovalStatus] = useState('NONE')
  const [businessRejectedReason, setBusinessRejectedReason] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showBusinessGatePopup, setShowBusinessGatePopup] = useState(false)

  // Handle tab query parameter from URL (e.g., from preview mode quick links)
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && ['content', 'social', 'branding', 'services', 'policies', 'faqs'].includes(tabParam)) {
      setActiveTab(tabParam as TabType)
    }
  }, [searchParams])

  useEffect(() => {
    fetchLandingData()
  }, [])

  // Show business gate popup for 2 minutes when not a business host
  useEffect(() => {
    if (isBusinessHost === false) {
      setShowBusinessGatePopup(true)
      const timer = setTimeout(() => setShowBusinessGatePopup(false), 2 * 60 * 1000)
      return () => clearTimeout(timer)
    }
  }, [isBusinessHost])

  const fetchLandingData = async () => {
    try {
      const res = await fetch('/api/partner/landing')
      const result = await res.json()
      if (result.success) {
        setIsBusinessHost(result.isBusinessHost ?? false)
        setBusinessApprovalStatus(result.businessApprovalStatus || 'NONE')
        setBusinessRejectedReason(result.businessRejectedReason || null)
        if (result.data) {
          setData(result.data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch landing data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Submit landing page for business approval
  const handleSubmitForApproval = async () => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/partner/landing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submitForApproval' })
      })
      const result = await res.json()
      if (result.success) {
        setBusinessApprovalStatus('PENDING')
        setSaveMessageType('success')
        setSaveMessage(t('submittedForReview'))
        setTimeout(() => setSaveMessage(null), 5000)
      } else {
        setSaveMessageType('error')
        setSaveMessage(result.error || t('failedToSubmit'))
        setTimeout(() => setSaveMessage(null), 5000)
      }
    } catch {
      setSaveMessageType('error')
      setSaveMessage(t('failedToSubmit'))
      setTimeout(() => setSaveMessage(null), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Per-tab save function - only saves specific fields for that tab
  const handleTabSave = async (tabName: string, tabData: Partial<LandingPageData>) => {
    setIsSaving(true)
    setSaveMessage(null)

    try {
      const res = await fetch('/api/partner/landing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tabData)
      })

      const result = await res.json()

      if (result.success) {
        setSaveMessageType('success')
        setSaveMessage(t('tabSavedSuccess', { tabName }))
        setTimeout(() => setSaveMessage(null), 3000)
      } else {
        setSaveMessageType('error')
        setSaveMessage(result.error || t('failedToSave'))
      }
    } catch {
      setSaveMessageType('error')
      setSaveMessage(t('failedToSave'))
    } finally {
      setIsSaving(false)
    }
  }

  // Tab-specific save handlers
  const saveContent = () => handleTabSave('Content', {
    slug: data.slug,
    headline: data.headline,
    subheadline: data.subheadline,
    bio: data.bio
  })

  const saveSocial = () => handleTabSave('Contact & Social', {
    supportEmail: data.supportEmail,
    supportPhone: data.supportPhone,
    website: data.website,
    instagram: data.instagram,
    facebook: data.facebook,
    twitter: data.twitter,
    linkedin: data.linkedin,
    tiktok: data.tiktok,
    youtube: data.youtube,
    showEmail: data.showEmail,
    showPhone: data.showPhone,
    showWebsite: data.showWebsite
  })

  const saveBranding = () => handleTabSave('Branding', {
    logo: data.logo,
    heroImage: data.heroImage,
    primaryColor: data.primaryColor
  })

  const saveServices = () => handleTabSave('Services', {
    enableRideshare: data.enableRideshare,
    enableRentals: data.enableRentals,
    enableSales: data.enableSales,
    enableLeasing: data.enableLeasing,
    enableRentToOwn: data.enableRentToOwn
  })

  const savePolicies = () => handleTabSave('Policies', {
    policies: data.policies
  })

  const saveFaqs = () => handleTabSave('FAQs', {
    faqs: data.faqs
  })

  // Update data helper
  const handleDataChange = (updates: Partial<LandingPageData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  // Generate preview token and open preview page
  const handlePreview = async () => {
    setIsGeneratingPreview(true)
    try {
      const res = await fetch('/api/partner/preview-token', { method: 'POST' })
      const result = await res.json()

      if (result.success && result.previewUrl) {
        // Open preview in new tab with token
        window.open(result.previewUrl, '_blank')
      } else {
        setSaveMessageType('error')
        setSaveMessage(result.error || t('failedToGeneratePreview'))
        setTimeout(() => setSaveMessage(null), 3000)
      }
    } catch {
      setSaveMessageType('error')
      setSaveMessage(t('failedToGeneratePreview'))
      setTimeout(() => setSaveMessage(null), 3000)
    } finally {
      setIsGeneratingPreview(false)
    }
  }

  // Determine if editing is disabled (not business host OR pending review)
  const isEditingDisabled = isBusinessHost === false || businessApprovalStatus === 'PENDING'

  if (isLoading) {
    return (
      <div className="p-3 sm:p-4 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-4 space-y-4 sm:space-y-6 relative">
      {/* Business Gate Popup — shows for 2 minutes, then fades to grayed-out preview */}
      {isBusinessHost === false && showBusinessGatePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 sm:p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-4">
              <IoBusinessOutline className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('businessFeature')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {t('businessGateDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/partner/settings?tab=company"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {t('goToCompanySettings')}
              </Link>
              <button
                onClick={() => setShowBusinessGatePopup(false)}
                className="inline-flex items-center justify-center px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('previewEditor')}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Non-business host preview banner */}
      {isBusinessHost === false && !showBusinessGatePopup && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <IoBusinessOutline className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-orange-800 dark:text-orange-300">{t('previewMode')}</p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">
                  {t('previewModeDescription')}
                </p>
              </div>
            </div>
            <Link
              href="/partner/settings?tab=company"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0"
            >
              {t('enableBusinessHost')}
            </Link>
          </div>
        </div>
      )}

      {/* Approval Status Banners — only show when business host is enabled */}
      {isBusinessHost === true && businessApprovalStatus === 'NONE' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <IoInformationCircleOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">{t('readyToGoLive')}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                  {t('readyToGoLiveDescription')}
                </p>
              </div>
            </div>
            <button
              onClick={handleSubmitForApproval}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <IoSendOutline className="w-4 h-4" />
              )}
              {isSubmitting ? t('submitting') : t('submitForReview')}
            </button>
          </div>
        </div>
      )}

      {isBusinessHost === true && businessApprovalStatus === 'PENDING' && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <IoTimeOutline className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{t('underReview')}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                {t('underReviewDescription')}
              </p>
            </div>
          </div>
        </div>
      )}

      {isBusinessHost === true && businessApprovalStatus === 'REJECTED' && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <IoAlertCircleOutline className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300">{t('reviewNotApproved')}</p>
                {businessRejectedReason && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                    {t('reason', { reason: businessRejectedReason })}
                  </p>
                )}
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {t('resubmitFeedback')}
                </p>
              </div>
            </div>
            <button
              onClick={handleSubmitForApproval}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <IoSendOutline className="w-4 h-4" />
              )}
              {isSubmitting ? t('submitting') : t('resubmitForReview')}
            </button>
          </div>
        </div>
      )}

      {isBusinessHost === true && businessApprovalStatus === 'APPROVED' && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-300">{t('approved')}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                {t('approvedDescription')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('landingPage')}</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
            {t('customizeDescription')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {data.slug && (
            <button
              onClick={handlePreview}
              disabled={isGeneratingPreview}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-sm bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors"
            >
              {isGeneratingPreview ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <IoEyeOutline className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
              <span className="hidden sm:inline">{isGeneratingPreview ? t('loadingPreview') : t('previewPage')}</span>
              <span className="sm:hidden">{isGeneratingPreview ? '...' : t('preview')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`p-4 rounded-lg ${
          saveMessageType === 'success'
            ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {saveMessage}
        </div>
      )}

      {/* Page URL */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <IoLinkOutline className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{t('yourLandingPageUrl')}</p>
              {/* Tooltip for publishing requirements */}
              <div className="relative group">
                <IoInformationCircleOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help" />
                <div className="absolute left-0 top-6 z-50 hidden group-hover:block w-64 sm:w-72">
                  <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg p-3 shadow-lg">
                    <p className="font-medium mb-2">{t('publishingRequirements')}</p>
                    <ul className="space-y-1">
                      <li className="flex items-center gap-2">
                        {data.publishingRequirements?.hasApproval ? (
                          <IoCheckmarkCircleOutline className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                        ) : (
                          <IoCloseCircleOutline className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                        )}
                        <span>{t('accountApproved')}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        {data.publishingRequirements?.hasValidSlug ? (
                          <IoCheckmarkCircleOutline className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                        ) : (
                          <IoCloseCircleOutline className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                        )}
                        <span>{t('validUrlSlug')}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        {data.publishingRequirements?.hasVehicles ? (
                          <IoCheckmarkCircleOutline className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                        ) : (
                          <IoCloseCircleOutline className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                        )}
                        <span>{t('activeVehicles', { count: data.publishingRequirements?.vehicleCount || 0 })}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        {data.publishingRequirements?.hasService ? (
                          <IoCheckmarkCircleOutline className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                        ) : (
                          <IoCloseCircleOutline className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                        )}
                        <span>{t('rideshareOrRentals')}</span>
                      </li>
                    </ul>
                    {!data.isPublished && (
                      <p className="mt-2 pt-2 border-t border-gray-700 dark:border-gray-600 text-gray-300">
                        {t('completeRequirements')}
                      </p>
                    )}
                    <div className="absolute left-3 -top-1 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm sm:text-lg font-medium text-gray-900 dark:text-white truncate">
              itwhip.com/rideshare/{data.slug || t('defaultSlug')}
            </p>
          </div>
          {data.isPublished ? (
            <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex-shrink-0">
              <IoCheckmarkCircleOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {t('published')}
            </span>
          ) : (
            <span className="inline-flex px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 flex-shrink-0">
              {t('draft')}
            </span>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        faqCount={data.faqs.length}
      />

      {/* Tab Content */}
      <fieldset disabled={isEditingDisabled} className={isEditingDisabled ? 'opacity-60 pointer-events-none' : ''}>
        {activeTab === 'content' && (
          <ContentTab
            data={data}
            onChange={handleDataChange}
            onSave={saveContent}
            isSaving={isSaving}
          />
        )}

        {activeTab === 'social' && (
          <SocialTab
            data={data}
            onChange={handleDataChange}
            onSave={saveSocial}
            isSaving={isSaving}
          />
        )}

        {activeTab === 'branding' && (
          <BrandingTab
            data={data}
            onChange={handleDataChange}
            onSave={saveBranding}
            isSaving={isSaving}
          />
        )}

        {activeTab === 'services' && (
          <ServicesTab
            data={data}
            onChange={handleDataChange}
            onSave={saveServices}
            isSaving={isSaving}
          />
        )}

        {activeTab === 'policies' && (
          <PoliciesTab
            data={data}
            onChange={handleDataChange}
            onSave={savePolicies}
            isSaving={isSaving}
          />
        )}

        {activeTab === 'faqs' && (
          <FAQsTab
            data={data}
            onChange={handleDataChange}
            onSave={saveFaqs}
            isSaving={isSaving}
          />
        )}
      </fieldset>
    </div>
  )
}
