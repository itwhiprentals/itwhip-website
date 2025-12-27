// app/partner/landing/page.tsx
// Partner Landing Page Editor - Customize public-facing partner page

'use client'

import { useState, useEffect } from 'react'
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
  IoLinkOutline
} from 'react-icons/io5'

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
}

interface FAQ {
  id: string
  question: string
  answer: string
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
    isPublished: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'content' | 'branding' | 'faqs'>('content')

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

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage(null)

    try {
      const res = await fetch('/api/partner/landing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await res.json()

      if (result.success) {
        setSaveMessage('Changes saved successfully!')
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

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Landing Page</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Customize your public-facing partner page
          </p>
        </div>
        <div className="flex items-center gap-2">
          {data.slug && (
            <a
              href={`/rideshare/${data.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <IoEyeOutline className="w-5 h-5" />
              Preview
            </a>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors"
          >
            <IoSaveOutline className="w-5 h-5" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
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
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3">
          <IoLinkOutline className="w-5 h-5 text-gray-400" />
          <div className="flex-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">Your Landing Page URL</p>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              itwhip.com/rideshare/{data.slug || 'your-company-slug'}
            </p>
          </div>
          {data.isPublished ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <IoCheckmarkCircleOutline className="w-4 h-4" />
              Published
            </span>
          ) : (
            <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
              Draft
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('content')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'content'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <IoTextOutline className="w-4 h-4" />
              Content
            </div>
          </button>
          <button
            onClick={() => setActiveTab('branding')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'branding'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <IoColorPaletteOutline className="w-4 h-4" />
              Branding
            </div>
          </button>
          <button
            onClick={() => setActiveTab('faqs')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'faqs'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <IoCreateOutline className="w-4 h-4" />
              FAQs ({data.faqs.length})
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
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

            <div>
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
          </div>
        </div>
      )}

      {/* Branding Tab */}
      {activeTab === 'branding' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Logo
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                {data.logo ? (
                  <div className="space-y-4">
                    <img
                      src={data.logo}
                      alt="Company logo"
                      className="max-h-24 mx-auto object-contain"
                    />
                    <button
                      onClick={() => setData(prev => ({ ...prev, logo: null }))}
                      className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      Remove Logo
                    </button>
                  </div>
                ) : (
                  <div>
                    <IoImageOutline className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Drag & drop or click to upload
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      PNG, JPG up to 2MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Hero Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hero Image
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                {data.heroImage ? (
                  <div className="space-y-4">
                    <img
                      src={data.heroImage}
                      alt="Hero"
                      className="max-h-24 mx-auto object-cover rounded"
                    />
                    <button
                      onClick={() => setData(prev => ({ ...prev, heroImage: null }))}
                      className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div>
                    <IoImageOutline className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Drag & drop or click to upload
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Recommended: 1920x600px
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
        </div>
      )}
    </div>
  )
}
