// app/partner/landing/page.tsx
// Partner Landing Page Editor - Customize public-facing partner page

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  IoEyeOutline,
  IoLinkOutline,
  IoCheckmarkCircleOutline,
  IoInformationCircleOutline,
  IoCloseCircleOutline
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
  const searchParams = useSearchParams()
  const [data, setData] = useState<LandingPageData>(DEFAULT_LANDING_DATA)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('content')
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)

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

  const fetchLandingData = async () => {
    try {
      const res = await fetch('/api/partner/landing')
      const result = await res.json()
      if (result.success && result.data) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch landing data:', error)
    } finally {
      setIsLoading(false)
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
        setSaveMessage(`${tabName} saved successfully!`)
        setTimeout(() => setSaveMessage(null), 3000)
      } else {
        setSaveMessage(result.error || 'Failed to save changes')
      }
    } catch {
      setSaveMessage('Failed to save changes')
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
        setSaveMessage(result.error || 'Failed to generate preview')
        setTimeout(() => setSaveMessage(null), 3000)
      }
    } catch {
      setSaveMessage('Failed to generate preview')
      setTimeout(() => setSaveMessage(null), 3000)
    } finally {
      setIsGeneratingPreview(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Landing Page</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
            Customize your public-facing partner page
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
              <span className="hidden sm:inline">{isGeneratingPreview ? 'Loading...' : 'Preview Page'}</span>
              <span className="sm:hidden">{isGeneratingPreview ? '...' : 'Preview'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`p-4 rounded-lg ${
          saveMessage.includes('success')
            ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {saveMessage}
        </div>
      )}

      {/* Page URL */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <IoLinkOutline className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Your Landing Page URL</p>
              {/* Tooltip for publishing requirements */}
              <div className="relative group">
                <IoInformationCircleOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help" />
                <div className="absolute left-0 top-6 z-50 hidden group-hover:block w-64 sm:w-72">
                  <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg p-3 shadow-lg">
                    <p className="font-medium mb-2">Publishing Requirements:</p>
                    <ul className="space-y-1">
                      <li className="flex items-center gap-2">
                        {data.publishingRequirements?.hasApproval ? (
                          <IoCheckmarkCircleOutline className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                        ) : (
                          <IoCloseCircleOutline className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                        )}
                        <span>Account approved</span>
                      </li>
                      <li className="flex items-center gap-2">
                        {data.publishingRequirements?.hasValidSlug ? (
                          <IoCheckmarkCircleOutline className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                        ) : (
                          <IoCloseCircleOutline className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                        )}
                        <span>Valid URL slug set</span>
                      </li>
                      <li className="flex items-center gap-2">
                        {data.publishingRequirements?.hasVehicles ? (
                          <IoCheckmarkCircleOutline className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                        ) : (
                          <IoCloseCircleOutline className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                        )}
                        <span>At least 1 active vehicle ({data.publishingRequirements?.vehicleCount || 0} active)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        {data.publishingRequirements?.hasService ? (
                          <IoCheckmarkCircleOutline className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                        ) : (
                          <IoCloseCircleOutline className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                        )}
                        <span>Rideshare or Rentals enabled</span>
                      </li>
                    </ul>
                    {!data.isPublished && (
                      <p className="mt-2 pt-2 border-t border-gray-700 dark:border-gray-600 text-gray-300">
                        Complete all requirements to publish your page.
                      </p>
                    )}
                    <div className="absolute left-3 -top-1 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm sm:text-lg font-medium text-gray-900 dark:text-white truncate">
              itwhip.com/rideshare/{data.slug || 'your-company-slug'}
            </p>
          </div>
          {data.isPublished ? (
            <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex-shrink-0">
              <IoCheckmarkCircleOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Published
            </span>
          ) : (
            <span className="inline-flex px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 flex-shrink-0">
              Draft
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
    </div>
  )
}
