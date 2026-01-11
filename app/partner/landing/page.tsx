// app/partner/landing/page.tsx
// Partner Landing Page Editor - Customize public-facing partner page

'use client'

import { useState, useEffect, useRef } from 'react'
import {
  IoGlobeOutline,
  IoImageOutline,
  IoCreateOutline,
  IoSaveOutline,
  IoEyeOutline,
  IoColorPaletteOutline,
  IoTextOutline,
  IoAddCircleOutline,
  IoTrashOutline,
  IoReorderThreeOutline,
  IoCheckmarkCircleOutline,
  IoLinkOutline,
  IoCallOutline,
  IoLogoInstagram,
  IoLogoFacebook,
  IoLogoTwitter,
  IoLogoLinkedin,
  IoLogoTiktok,
  IoLogoYoutube,
  IoCloudUploadOutline,
  IoDocumentTextOutline,
  IoRefreshOutline,
  IoCloseCircleOutline,
  IoShieldCheckmarkOutline,
  IoCarSportOutline,
  IoKeyOutline,
  IoCartOutline,
  IoCalendarOutline,
  IoSwapHorizontalOutline,
  IoSettingsOutline
} from 'react-icons/io5'

interface Policies {
  refundPolicy: string
  cancellationPolicy: string
  bookingRequirements: string
  additionalTerms: string
}

interface LandingPageData {
  slug: string
  companyName: string
  logo: string | null
  heroImage: string | null
  headline: string
  subheadline: string
  bio: string
  supportEmail: string
  supportPhone: string
  primaryColor: string
  faqs: FAQ[]
  isPublished: boolean
  // Social Media & Website
  website: string
  instagram: string
  facebook: string
  twitter: string
  linkedin: string
  tiktok: string
  youtube: string
  // Visibility Settings
  showEmail: boolean
  showPhone: boolean
  showWebsite: boolean
  // Policies
  policies: Policies
  // Service Settings - which tabs appear on landing page
  enableRideshare: boolean
  enableRentals: boolean
  enableSales: boolean
  enableLeasing: boolean
  enableRentToOwn: boolean
}

interface FAQ {
  id: string
  question: string
  answer: string
}

// Default policies for fallback
const DEFAULT_POLICIES: Policies = {
  refundPolicy: '',
  cancellationPolicy: '',
  bookingRequirements: '',
  additionalTerms: ''
}

export default function PartnerLandingPage() {
  const [data, setData] = useState<LandingPageData>({
    slug: '',
    companyName: '',
    logo: null,
    heroImage: null,
    headline: '',
    subheadline: '',
    bio: '',
    supportEmail: '',
    supportPhone: '',
    primaryColor: '#f97316',
    faqs: [],
    isPublished: false,
    // Social Media & Website
    website: '',
    instagram: '',
    facebook: '',
    twitter: '',
    linkedin: '',
    tiktok: '',
    youtube: '',
    // Visibility Settings
    showEmail: true,
    showPhone: true,
    showWebsite: true,
    // Policies
    policies: DEFAULT_POLICIES,
    // Service Settings
    enableRideshare: true,
    enableRentals: false,
    enableSales: false,
    enableLeasing: false,
    enableRentToOwn: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'content' | 'social' | 'branding' | 'services' | 'policies' | 'faqs'>('content')

  // Upload states
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isUploadingHero, setIsUploadingHero] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const heroInputRef = useRef<HTMLInputElement>(null)

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
    } catch (error) {
      setSaveMessage('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  // Tab-specific save handlers
  const saveContent = () => handleTabSave('Content', {
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

  const addFAQ = () => {
    setData(prev => ({
      ...prev,
      faqs: [
        ...prev.faqs,
        { id: Date.now().toString(), question: '', answer: '' }
      ]
    }))
  }

  const updateFAQ = (id: string, field: 'question' | 'answer', value: string) => {
    setData(prev => ({
      ...prev,
      faqs: prev.faqs.map(faq =>
        faq.id === id ? { ...faq, [field]: value } : faq
      )
    }))
  }

  const removeFAQ = (id: string) => {
    setData(prev => ({
      ...prev,
      faqs: prev.faqs.filter(faq => faq.id !== id)
    }))
  }

  // Logo upload handler
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Client-side validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Allowed: JPG, PNG, WebP, SVG')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError('File too large. Maximum 2MB')
      return
    }

    setIsUploadingLogo(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/partner/logo', {
        method: 'POST',
        body: formData
      })

      const result = await res.json()

      if (result.success) {
        setData(prev => ({ ...prev, logo: result.logo }))
      } else {
        setUploadError(result.error || 'Failed to upload logo')
      }
    } catch (error) {
      setUploadError('Failed to upload logo')
    } finally {
      setIsUploadingLogo(false)
      // Reset input
      if (logoInputRef.current) {
        logoInputRef.current.value = ''
      }
    }
  }

  // Hero image upload handler
  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Client-side validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Allowed: JPG, PNG, WebP')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File too large. Maximum 5MB')
      return
    }

    setIsUploadingHero(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/partner/hero-image', {
        method: 'POST',
        body: formData
      })

      const result = await res.json()

      if (result.success) {
        setData(prev => ({ ...prev, heroImage: result.heroImage }))
      } else {
        setUploadError(result.error || 'Failed to upload hero image')
      }
    } catch (error) {
      setUploadError('Failed to upload hero image')
    } finally {
      setIsUploadingHero(false)
      // Reset input
      if (heroInputRef.current) {
        heroInputRef.current.value = ''
      }
    }
  }

  // Delete logo handler
  const handleDeleteLogo = async () => {
    if (!data.logo) return

    try {
      const res = await fetch('/api/partner/logo', {
        method: 'DELETE'
      })

      const result = await res.json()

      if (result.success) {
        setData(prev => ({ ...prev, logo: null }))
      } else {
        setUploadError(result.error || 'Failed to delete logo')
      }
    } catch (error) {
      setUploadError('Failed to delete logo')
    }
  }

  // Delete hero image handler
  const handleDeleteHero = async () => {
    if (!data.heroImage) return

    try {
      const res = await fetch('/api/partner/hero-image', {
        method: 'DELETE'
      })

      const result = await res.json()

      if (result.success) {
        setData(prev => ({ ...prev, heroImage: null }))
      } else {
        setUploadError(result.error || 'Failed to delete hero image')
      }
    } catch (error) {
      setUploadError('Failed to delete hero image')
    }
  }

  // Update policy field
  const updatePolicy = (field: keyof Policies, value: string) => {
    setData(prev => ({
      ...prev,
      policies: {
        ...prev.policies,
        [field]: value
      }
    }))
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
            <a
              href={`/rideshare/${data.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            >
              <IoEyeOutline className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Preview Page</span>
              <span className="sm:hidden">Preview</span>
            </a>
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
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <IoLinkOutline className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Your Landing Page URL</p>
              <p className="text-sm sm:text-lg font-medium text-gray-900 dark:text-white truncate">
                itwhip.com/rideshare/{data.slug || 'your-company-slug'}
              </p>
            </div>
          </div>
          {data.isPublished ? (
            <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 w-fit">
              <IoCheckmarkCircleOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Published
            </span>
          ) : (
            <span className="inline-flex px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 w-fit">
              Draft
            </span>
          )}
        </div>
      </div>

      {/* Tabs - Scrollable on mobile */}
      <div className="border-b border-gray-200 dark:border-gray-700 -mx-4 sm:-mx-6 px-4 sm:px-6 overflow-x-auto scrollbar-hide">
        <nav className="flex gap-0 sm:gap-2 min-w-max">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-3 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'content'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <IoTextOutline className="w-4 h-4" />
              <span className="hidden sm:inline">Content</span>
              <span className="sm:hidden">Content</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`px-3 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'social'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <IoCallOutline className="w-4 h-4" />
              <span className="hidden sm:inline">Contact & Social</span>
              <span className="sm:hidden">Contact</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('branding')}
            className={`px-3 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'branding'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <IoColorPaletteOutline className="w-4 h-4" />
              <span>Branding</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-3 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'services'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <IoSettingsOutline className="w-4 h-4" />
              <span>Services</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('policies')}
            className={`px-3 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'policies'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <IoDocumentTextOutline className="w-4 h-4" />
              <span>Policies</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('faqs')}
            className={`px-3 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'faqs'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <IoCreateOutline className="w-4 h-4" />
              <span>FAQs</span>
              {data.faqs.length > 0 && (
                <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
                  {data.faqs.length}
                </span>
              )}
            </div>
          </button>
        </nav>
      </div>

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Headline
              </label>
              <input
                type="text"
                value={data.headline}
                onChange={(e) => setData(prev => ({ ...prev, headline: e.target.value }))}
                placeholder="e.g., Drive with the best fleet in Atlanta"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subheadline
              </label>
              <input
                type="text"
                value={data.subheadline}
                onChange={(e) => setData(prev => ({ ...prev, subheadline: e.target.value }))}
                placeholder="e.g., Premium rideshare-ready vehicles starting at $XX/day"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              About Your Company
            </label>
            <textarea
              value={data.bio}
              onChange={(e) => setData(prev => ({ ...prev, bio: e.target.value }))}
              rows={4}
              placeholder="Tell potential renters about your fleet and what makes you different..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={saveContent}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <IoSaveOutline className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Content'}
            </button>
          </div>
        </div>
      )}

      {/* Contact & Social Tab */}
      {activeTab === 'social' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          {/* Contact Info with Visibility Toggles */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
            <div className="space-y-4">
              {/* Email with Toggle */}
              <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={data.supportEmail}
                    onChange={(e) => setData(prev => ({ ...prev, supportEmail: e.target.value }))}
                    placeholder="support@yourcompany.com"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Visible</span>
                  <button
                    onClick={() => setData(prev => ({ ...prev, showEmail: !prev.showEmail }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      data.showEmail ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      data.showEmail ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Phone with Toggle */}
              <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Support Phone
                  </label>
                  <input
                    type="tel"
                    value={data.supportPhone}
                    onChange={(e) => setData(prev => ({ ...prev, supportPhone: e.target.value }))}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Visible</span>
                  <button
                    onClick={() => setData(prev => ({ ...prev, showPhone: !prev.showPhone }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      data.showPhone ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      data.showPhone ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Website with Toggle */}
              <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <IoGlobeOutline className="w-4 h-4 inline mr-2" />
                    Website
                  </label>
                  <input
                    type="url"
                    value={data.website}
                    onChange={(e) => setData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://yourcompany.com"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Visible</span>
                  <button
                    onClick={() => setData(prev => ({ ...prev, showWebsite: !prev.showWebsite }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      data.showWebsite ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      data.showWebsite ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Social Media Links</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Add your social media links to display on your public page. Leave blank to hide.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Instagram */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <IoLogoInstagram className="w-4 h-4 inline mr-2 text-pink-500" />
                  Instagram
                </label>
                <input
                  type="url"
                  value={data.instagram}
                  onChange={(e) => setData(prev => ({ ...prev, instagram: e.target.value }))}
                  placeholder="https://instagram.com/yourcompany"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Facebook */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <IoLogoFacebook className="w-4 h-4 inline mr-2 text-blue-600" />
                  Facebook
                </label>
                <input
                  type="url"
                  value={data.facebook}
                  onChange={(e) => setData(prev => ({ ...prev, facebook: e.target.value }))}
                  placeholder="https://facebook.com/yourcompany"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Twitter/X */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <IoLogoTwitter className="w-4 h-4 inline mr-2 text-sky-500" />
                  Twitter / X
                </label>
                <input
                  type="url"
                  value={data.twitter}
                  onChange={(e) => setData(prev => ({ ...prev, twitter: e.target.value }))}
                  placeholder="https://twitter.com/yourcompany"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* LinkedIn */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <IoLogoLinkedin className="w-4 h-4 inline mr-2 text-blue-700" />
                  LinkedIn
                </label>
                <input
                  type="url"
                  value={data.linkedin}
                  onChange={(e) => setData(prev => ({ ...prev, linkedin: e.target.value }))}
                  placeholder="https://linkedin.com/company/yourcompany"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* TikTok */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <IoLogoTiktok className="w-4 h-4 inline mr-2" />
                  TikTok
                </label>
                <input
                  type="url"
                  value={data.tiktok}
                  onChange={(e) => setData(prev => ({ ...prev, tiktok: e.target.value }))}
                  placeholder="https://tiktok.com/@yourcompany"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* YouTube */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <IoLogoYoutube className="w-4 h-4 inline mr-2 text-red-600" />
                  YouTube
                </label>
                <input
                  type="url"
                  value={data.youtube}
                  onChange={(e) => setData(prev => ({ ...prev, youtube: e.target.value }))}
                  placeholder="https://youtube.com/@yourcompany"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={saveSocial}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <IoSaveOutline className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Contact & Social'}
            </button>
          </div>
        </div>
      )}

      {/* Branding Tab */}
      {activeTab === 'branding' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          {/* Upload Error */}
          {uploadError && (
            <div className="p-4 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {uploadError}
              <button
                onClick={() => setUploadError(null)}
                className="ml-2 text-red-500 hover:text-red-600"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Logo
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Square format recommended. Max 2MB. JPG, PNG, WebP, or SVG.
              </p>
              <input
                type="file"
                ref={logoInputRef}
                onChange={handleLogoUpload}
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                className="hidden"
              />
              <div
                onClick={() => !isUploadingLogo && logoInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors overflow-hidden ${
                  isUploadingLogo
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 p-6'
                    : data.logo
                    ? 'border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500 p-2'
                    : 'border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500 p-6'
                }`}
              >
                {isUploadingLogo ? (
                  <div className="space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="text-sm text-orange-600 dark:text-orange-400">Uploading...</p>
                  </div>
                ) : data.logo ? (
                  <div className="space-y-2">
                    {/* Checkered background for transparent logos - works in both light/dark mode */}
                    <div
                      className="relative mx-auto rounded-lg overflow-hidden"
                      style={{
                        backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
                        backgroundSize: '16px 16px',
                        backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
                      }}
                    >
                      <img
                        src={data.logo}
                        alt="Company logo"
                        className="w-full h-32 object-contain bg-white/80 dark:bg-gray-900/80"
                      />
                    </div>
                    <div className="flex items-center justify-center gap-4 pt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          logoInputRef.current?.click()
                        }}
                        className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400"
                      >
                        Replace
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteLogo()
                        }}
                        className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <IoCloudUploadOutline className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Click to upload logo
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      400x400px recommended
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Hero Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hero Banner Image
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Wide banner format. Max 5MB. JPG, PNG, or WebP. Auto-cropped to 1920x400px.
              </p>
              <input
                type="file"
                ref={heroInputRef}
                onChange={handleHeroUpload}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
              />
              <div
                onClick={() => !isUploadingHero && heroInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isUploadingHero
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500'
                }`}
              >
                {isUploadingHero ? (
                  <div className="space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="text-sm text-orange-600 dark:text-orange-400">Uploading...</p>
                  </div>
                ) : data.heroImage ? (
                  <div className="space-y-4">
                    <img
                      src={data.heroImage}
                      alt="Hero banner"
                      className="max-h-24 w-full mx-auto object-cover rounded"
                    />
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          heroInputRef.current?.click()
                        }}
                        className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400"
                      >
                        Replace
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteHero()
                        }}
                        className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <IoCloudUploadOutline className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Click to upload hero image
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      1920x400px or wider
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Primary Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Primary Color
            </label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={data.primaryColor}
                onChange={(e) => setData(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="w-12 h-12 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-600"
              />
              <input
                type="text"
                value={data.primaryColor}
                onChange={(e) => setData(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Used for buttons and accents on your page
              </p>
            </div>
          </div>

          {/* Branding Save Button */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button
              onClick={saveBranding}
              disabled={isSaving}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <IoSaveOutline className="w-4 h-4" />
                  Save Branding
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
              Service Offerings
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Choose which services you offer. Tabs only appear if you have vehicles tagged for that service.
            </p>
          </div>

          {/* Helper text */}
          <p className="text-[11px] sm:text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
            At least one service must be enabled. Rideshare is enabled by default.
          </p>

          <div className="space-y-3 sm:space-y-4">
            {/* Rideshare - Default and required if Rentals is off */}
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                  <IoCarSportOutline className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    Rideshare Rentals
                    <span className="text-[10px] px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded">
                      Default
                    </span>
                  </h4>
                  <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                    Uber, Lyft, delivery drivers
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  // Only allow disabling if Rentals is enabled
                  if (data.enableRideshare && !data.enableRentals) return
                  setData(prev => ({ ...prev, enableRideshare: !prev.enableRideshare }))
                }}
                disabled={data.enableRideshare && !data.enableRentals}
                className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                  data.enableRideshare ? 'bg-orange-500' : 'bg-gray-400 dark:bg-gray-500'
                } ${data.enableRideshare && !data.enableRentals ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  data.enableRideshare ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Rentals */}
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <IoKeyOutline className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Standard Rentals</h4>
                  <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                    Personal & business rentals
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  // Only allow disabling if Rideshare is enabled
                  if (data.enableRentals && !data.enableRideshare) return
                  setData(prev => ({ ...prev, enableRentals: !prev.enableRentals }))
                }}
                disabled={data.enableRentals && !data.enableRideshare}
                className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                  data.enableRentals ? 'bg-orange-500' : 'bg-gray-400 dark:bg-gray-500'
                } ${data.enableRentals && !data.enableRideshare ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  data.enableRentals ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Vehicle Sales - Contact Sales */}
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <IoCartOutline className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                    Vehicle Sales
                  </h4>
                  <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                    Sell vehicles to buyers
                  </p>
                </div>
              </div>
              <a
                href="/contact?subject=Vehicle%20Sales"
                className="text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex-shrink-0"
              >
                Contact Sales
              </a>
            </div>

            {/* Leasing - Contact Sales */}
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                  <IoCalendarOutline className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                    Leasing
                  </h4>
                  <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                    Long-term lease agreements
                  </p>
                </div>
              </div>
              <a
                href="/contact?subject=Leasing"
                className="text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex-shrink-0"
              >
                Contact Sales
              </a>
            </div>

            {/* Rent-to-Own - Contact Sales */}
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                  <IoSwapHorizontalOutline className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                    Rent-to-Own
                  </h4>
                  <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                    Flexible ownership programs
                  </p>
                </div>
              </div>
              <a
                href="/contact?subject=Rent-to-Own"
                className="text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors flex-shrink-0"
              >
                Contact Sales
              </a>
            </div>
          </div>

          <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-500 text-center pt-3 sm:pt-4">
            Your landing page will display tabs for each enabled service with vehicles.
          </p>

          {/* Services Save Button */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button
              onClick={saveServices}
              disabled={isSaving}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <IoSaveOutline className="w-4 h-4" />
                  Save Services
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Rental Policies
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Set clear policies for your renters. Leave blank to use default policies.
            </p>
          </div>

          {/* Refund Policy */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <IoRefreshOutline className="w-5 h-5 text-green-500" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Refund Policy
              </label>
            </div>
            <textarea
              value={data.policies.refundPolicy}
              onChange={(e) => updatePolicy('refundPolicy', e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="Describe your refund policy. For example: Full refunds available if cancelled 48+ hours before pickup. Partial refunds for cancellations within 24-48 hours..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-right">
              {data.policies.refundPolicy.length}/2000
            </p>
          </div>

          {/* Cancellation Policy */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <IoCloseCircleOutline className="w-5 h-5 text-red-500" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Cancellation Policy
              </label>
            </div>
            <textarea
              value={data.policies.cancellationPolicy}
              onChange={(e) => updatePolicy('cancellationPolicy', e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="Describe your cancellation policy. For example: Free cancellation up to 48 hours before pickup. Late cancellations or no-shows forfeit the booking amount..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-right">
              {data.policies.cancellationPolicy.length}/2000
            </p>
          </div>

          {/* Booking Requirements */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <IoDocumentTextOutline className="w-5 h-5 text-blue-500" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Booking Requirements
              </label>
            </div>
            <textarea
              value={data.policies.bookingRequirements}
              onChange={(e) => updatePolicy('bookingRequirements', e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="List requirements for renters. For example: Must be 21+ years old, valid driver's license, clean driving record, proof of rideshare platform approval..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-right">
              {data.policies.bookingRequirements.length}/2000
            </p>
          </div>

          {/* Additional Terms */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <IoShieldCheckmarkOutline className="w-5 h-5 text-purple-500" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Additional Terms
              </label>
            </div>
            <textarea
              value={data.policies.additionalTerms}
              onChange={(e) => updatePolicy('additionalTerms', e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="Any additional rules or terms. For example: No smoking, no pets, mileage limits, cleaning fees for excessive mess..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-right">
              {data.policies.additionalTerms.length}/2000
            </p>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-500 text-center pt-4">
            These policies will be displayed on your public landing page. Clear policies help set expectations and reduce disputes.
          </p>

          {/* Policies Save Button */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button
              onClick={savePolicies}
              disabled={isSaving}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <IoSaveOutline className="w-4 h-4" />
                  Save Policies
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* FAQs Tab */}
      {activeTab === 'faqs' && (
        <div className="space-y-4">
          {data.faqs.map((faq, index) => (
            <div
              key={faq.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 font-medium text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Question
                    </label>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => updateFAQ(faq.id, 'question', e.target.value)}
                      placeholder="e.g., What's included in the rental?"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Answer
                    </label>
                    <textarea
                      value={faq.answer}
                      onChange={(e) => updateFAQ(faq.id, 'answer', e.target.value)}
                      rows={3}
                      placeholder="Provide a helpful answer..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeFAQ(faq.id)}
                  className="flex-shrink-0 p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <IoTrashOutline className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={addFAQ}
            className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors flex items-center justify-center gap-2"
          >
            <IoAddCircleOutline className="w-5 h-5" />
            Add FAQ
          </button>

          {/* FAQs Save Button */}
          <div className="pt-4 flex justify-end">
            <button
              onClick={saveFaqs}
              disabled={isSaving}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <IoSaveOutline className="w-4 h-4" />
                  Save FAQs
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
