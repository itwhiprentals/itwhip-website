// app/rideshare/[partnerSlug]/SectionEditors.tsx
// Bottom sheet editors for each section of the landing page

'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import BottomSheet from '@/app/components/BottomSheet'
import { useEditMode, EditableSection } from './EditModeContext'
import {
  IoTextOutline,
  IoImageOutline,
  IoAppsOutline,
  IoDocumentTextOutline,
  IoHelpCircleOutline,
  IoShareSocialOutline,
  IoCheckmarkOutline,
  IoCheckmarkCircle,
  IoAddOutline,
  IoTrashOutline,
  IoCarOutline,
  IoCameraOutline,
  IoCloudUploadOutline,
  IoMailOutline,
  IoCallOutline,
  IoGlobeOutline,
  IoLogoInstagram,
  IoLogoFacebook,
  IoLogoLinkedin,
  IoLogoTiktok,
  IoLogoYoutube,
  IoChevronBack,
  IoChevronForward,
  IoWarningOutline,
  IoSparkles,
  IoLocationOutline,
  IoStar,
  IoStarOutline
} from 'react-icons/io5'
import { FaXTwitter } from 'react-icons/fa6'
import { SiUber, SiLyft, SiDoordash, SiInstacart } from 'react-icons/si'
import { decodeVIN, isValidVIN } from '@/app/lib/utils/vin-decoder'
import VinScanner from '@/app/components/VinScanner'
import DesktopVinScanModal from '@/app/components/DesktopVinScanModal'

// Detect if device is mobile
function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (window.innerWidth <= 768 && 'ontouchstart' in window)
}
import { mapBodyClassToCarType } from '@/app/lib/data/vehicle-features'
import { CAR_COLORS } from '@/app/host/cars/[id]/edit/types'

// Hero Section Editor
function HeroEditor() {
  const { data, updateData, saveSection, closeSheet, isSaving } = useEditMode()
  const [localData, setLocalData] = useState({
    headline: data?.headline || '',
    subheadline: data?.subheadline || '',
    bio: data?.bio || ''
  })

  const handleSave = async () => {
    const success = await saveSection('hero', localData)
    if (success) {
      closeSheet()
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Headline
        </label>
        <input
          type="text"
          value={localData.headline}
          onChange={(e) => setLocalData({ ...localData, headline: e.target.value })}
          placeholder="Your compelling headline"
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <p className="mt-1 text-[11px] text-gray-500">Main headline displayed on your landing page</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Subheadline
        </label>
        <input
          type="text"
          value={localData.subheadline}
          onChange={(e) => setLocalData({ ...localData, subheadline: e.target.value })}
          placeholder="Supporting text"
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <p className="mt-1 text-[11px] text-gray-500">Secondary text that supports your headline</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Bio / Description
        </label>
        <textarea
          value={localData.bio}
          onChange={(e) => setLocalData({ ...localData, bio: e.target.value })}
          placeholder="Tell customers about your business..."
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
        />
        <p className="mt-1 text-[11px] text-gray-500">A brief description of your business</p>
      </div>

      <div className="flex gap-2 pt-3">
        <button
          onClick={closeSheet}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <IoCheckmarkOutline className="w-4 h-4" />
          )}
          Save
        </button>
      </div>
    </div>
  )
}

// Photo Editor - Upload or take photo for hero/logo
function PhotoEditor() {
  const { data, saveSection, closeSheet, isSaving } = useEditMode()
  const [previewUrl, setPreviewUrl] = useState<string | null>(data?.heroImage || null)
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(data?.logo || null)
  const [enableFilter, setEnableFilter] = useState<boolean>(data?.heroImageFilter ?? false)
  const [isUploading, setIsUploading] = useState(false)
  const heroInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'hero' | 'logo') => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      if (type === 'hero') {
        setPreviewUrl(reader.result as string)
      } else {
        setLogoPreviewUrl(reader.result as string)
      }
    }
    reader.readAsDataURL(file)

    // Upload to server
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const res = await fetch('/api/partner/upload-image', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })
      const result = await res.json()

      if (result.success && result.url) {
        if (type === 'hero') {
          setPreviewUrl(result.url)
        } else {
          setLogoPreviewUrl(result.url)
        }
      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    const success = await saveSection('photo', {
      heroImage: previewUrl,
      heroImageFilter: enableFilter,
      logo: logoPreviewUrl
    })
    if (success) {
      closeSheet()
    }
  }

  return (
    <div className="space-y-4">
      {/* Hero Image */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Hero Background Image
        </label>
        <div
          className="relative w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden cursor-pointer hover:border-orange-500 transition-colors"
          onClick={() => heroInputRef.current?.click()}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Hero preview"
              className="w-full h-full object-cover transition-all duration-300"
              style={enableFilter ? { filter: 'brightness(1.05) contrast(1.08) saturate(1.15)' } : {}}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <IoImageOutline className="w-8 h-8 mb-1" />
              <span className="text-xs">Click to upload hero image</span>
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {/* Filter Toggle - Only show when image exists */}
          {previewUrl && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setEnableFilter(!enableFilter)
              }}
              className="absolute top-2 right-2 flex items-center gap-0.5 p-0.5 bg-black/70 rounded-full text-[9px] font-medium transition-all"
              title={enableFilter ? 'Click to show original' : 'Click to apply filter'}
            >
              {/* Toggle pill */}
              <span className={`px-2 py-1 rounded-full transition-all ${!enableFilter ? 'bg-white text-gray-800' : 'text-white/70'}`}>
                Original
              </span>
              <span className={`px-2 py-1 rounded-full transition-all flex items-center gap-1 ${enableFilter ? 'bg-orange-500 text-white' : 'text-white/70'}`}>
                <IoSparkles className="w-2.5 h-2.5" />
                Filter
              </span>
            </button>
          )}
        </div>
        <input
          ref={heroInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, 'hero')}
          className="hidden"
        />
        <div className="flex gap-2 mt-1.5">
          <button
            onClick={() => heroInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-xs transition-colors"
          >
            <IoCloudUploadOutline className="w-3.5 h-3.5" />
            Upload
          </button>
          <button
            onClick={() => {
              heroInputRef.current?.setAttribute('capture', 'environment')
              heroInputRef.current?.click()
            }}
            className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-xs transition-colors"
          >
            <IoCameraOutline className="w-3.5 h-3.5" />
            Take Photo
          </button>
        </div>
      </div>

      {/* Logo / Personal Photo */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Company Logo or Personal Photo
        </label>
        <div className="flex items-center gap-3">
          <div
            className="relative w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden cursor-pointer hover:border-orange-500 transition-colors"
            onClick={() => logoInputRef.current?.click()}
          >
            {logoPreviewUrl ? (
              <img src={logoPreviewUrl} alt="Logo preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <IoImageOutline className="w-6 h-6" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1.5">
              Square image works best (e.g., 200x200)
            </p>
            <button
              onClick={() => logoInputRef.current?.click()}
              className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-xs transition-colors"
            >
              Change Logo/Photo
            </button>
          </div>
        </div>
        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, 'logo')}
          className="hidden"
        />
      </div>

      <div className="flex gap-2 pt-3">
        <button
          onClick={closeSheet}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving || isUploading}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <IoCheckmarkOutline className="w-4 h-4" />
          )}
          Save
        </button>
      </div>
    </div>
  )
}

// Platform icons for services
const PLATFORM_ICONS = {
  uber: { icon: <SiUber className="w-3 h-3 text-white" />, bg: 'bg-black' },
  lyft: { icon: <SiLyft className="w-3 h-3 text-white" />, bg: 'bg-[#FF00BF]' },
  doordash: { icon: <SiDoordash className="w-3 h-3 text-white" />, bg: 'bg-[#FF3008]' },
  instacart: { icon: <SiInstacart className="w-3 h-3 text-white" />, bg: 'bg-[#43B02A]' },
}

// Services Editor - Updated to match landing page services tab
function ServicesEditor() {
  const { data, saveSection, closeSheet, isSaving } = useEditMode()
  const [localData, setLocalData] = useState({
    enableRideshare: data?.enableRideshare ?? true,
    enableRentals: data?.enableRentals ?? false,
    enableSales: data?.enableSales ?? false,
    enableLeasing: data?.enableLeasing ?? false,
    enableRentToOwn: data?.enableRentToOwn ?? false
  })

  const handleSave = async () => {
    const success = await saveSection('services', localData)
    if (success) {
      closeSheet()
    }
  }

  // Services with availability status and platform icons
  const services = [
    {
      key: 'enableRideshare',
      label: 'Rideshare Rentals',
      description: 'Vehicles ready for Uber, Lyft, DoorDash and more',
      available: true,
      platforms: ['uber', 'lyft', 'doordash', 'instacart'],
      price: 'from $249/week'
    },
    {
      key: 'enableRentals',
      label: 'Standard Rentals',
      description: 'Quality vehicles for personal trips and daily use',
      available: true,
      price: 'from $45/day'
    },
    {
      key: 'enableSales',
      label: 'Vehicle Sales',
      description: 'Quality pre-owned vehicles available for purchase',
      available: false,
      contactSales: true,
      price: 'Contact Sales'
    },
    {
      key: 'enableLeasing',
      label: 'Vehicle Leasing',
      description: 'Long-term leasing options for personal and business',
      available: false,
      contactSales: true,
      price: 'Contact Sales'
    },
    {
      key: 'enableRentToOwn',
      label: 'Rent-to-Own',
      description: 'Build equity while you rent with ownership options',
      available: false,
      contactSales: true,
      price: 'Contact Sales'
    }
  ]

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-600 dark:text-gray-400">
        Select the services you offer. Some services require sales approval.
      </p>

      <div className="space-y-2">
        {services.map((service) => (
          <label
            key={service.key}
            className={`flex items-start gap-2.5 p-3 border rounded-lg transition-colors ${
              service.available
                ? 'border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800'
                : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50'
            }`}
          >
            <input
              type="checkbox"
              checked={localData[service.key as keyof typeof localData]}
              onChange={(e) => setLocalData({ ...localData, [service.key]: e.target.checked })}
              disabled={!service.available}
              className="mt-0.5 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 disabled:opacity-50"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-sm font-medium ${service.available ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-500'}`}>
                  {service.label}
                </p>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded whitespace-nowrap ${
                  service.contactSales
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                    : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                }`}>
                  {service.price}
                </span>
              </div>
              <p className={`text-xs ${service.available ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-600'}`}>
                {service.description}
              </p>

              {/* Platform icons for rideshare */}
              {service.platforms && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[9px] text-gray-500 uppercase">Works with:</span>
                  <div className="flex gap-1">
                    {service.platforms.map((p) => {
                      const platform = PLATFORM_ICONS[p as keyof typeof PLATFORM_ICONS]
                      return (
                        <div key={p} className={`w-5 h-5 rounded-full flex items-center justify-center ${platform.bg}`}>
                          {platform.icon}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Contact sales badge */}
              {service.contactSales && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1.5">
                  Contact sales to enable this service
                </p>
              )}
            </div>
          </label>
        ))}
      </div>

      <div className="flex gap-2 pt-3">
        <button
          onClick={closeSheet}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <IoCheckmarkOutline className="w-4 h-4" />
          )}
          Save
        </button>
      </div>
    </div>
  )
}

// Policies Editor
function PoliciesEditor() {
  const { data, saveSection, closeSheet, isSaving } = useEditMode()
  const [policies, setPolicies] = useState({
    refundPolicy: data?.policies?.refundPolicy || '',
    cancellationPolicy: data?.policies?.cancellationPolicy || '',
    bookingRequirements: data?.policies?.bookingRequirements || '',
    additionalTerms: data?.policies?.additionalTerms || ''
  })

  const handleSave = async () => {
    const success = await saveSection('policies', { policies })
    if (success) {
      closeSheet()
    }
  }

  const policyFields = [
    { key: 'refundPolicy' as const, label: 'Refund Policy', placeholder: 'Describe your refund policy...' },
    { key: 'cancellationPolicy' as const, label: 'Cancellation Policy', placeholder: 'Describe your cancellation policy...' },
    { key: 'bookingRequirements' as const, label: 'Booking Requirements', placeholder: 'List requirements for booking (age, license, etc.)...' },
    { key: 'additionalTerms' as const, label: 'Additional Terms', placeholder: 'Any additional terms and conditions...' }
  ]

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-600 dark:text-gray-400">
        Define your rental policies, terms, and conditions.
      </p>

      <div className="space-y-3 max-h-[50vh] overflow-y-auto">
        {policyFields.map((field) => (
          <div key={field.key} className="space-y-1">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              {field.label}
            </label>
            <textarea
              value={policies[field.key]}
              onChange={(e) => setPolicies({ ...policies, [field.key]: e.target.value })}
              placeholder={field.placeholder}
              rows={2}
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-3">
        <button
          onClick={closeSheet}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <IoCheckmarkOutline className="w-4 h-4" />
          )}
          Save
        </button>
      </div>
    </div>
  )
}

// FAQs Editor
function FAQsEditor() {
  const { data, saveSection, closeSheet, isSaving } = useEditMode()
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>(
    data?.faqs || []
  )

  const handleSave = async () => {
    const success = await saveSection('faqs', { faqs })
    if (success) {
      closeSheet()
    }
  }

  const addFaq = () => {
    setFaqs([...faqs, { question: '', answer: '' }])
  }

  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index))
  }

  const updateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = [...faqs]
    updated[index] = { ...updated[index], [field]: value }
    setFaqs(updated)
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-600 dark:text-gray-400">
        Add frequently asked questions to help customers.
      </p>

      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
        {faqs.map((faq, index) => (
          <div key={index} className="p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">FAQ {index + 1}</span>
              <button
                onClick={() => removeFaq(index)}
                className="p-0.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              >
                <IoTrashOutline className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              value={faq.question}
              onChange={(e) => updateFaq(index, 'question', e.target.value)}
              placeholder="Question"
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <textarea
              value={faq.answer}
              onChange={(e) => updateFaq(index, 'answer', e.target.value)}
              placeholder="Answer"
              rows={2}
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>
        ))}
      </div>

      <button
        onClick={addFaq}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-sm border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg hover:border-orange-500 hover:text-orange-600 transition-colors"
      >
        <IoAddOutline className="w-4 h-4" />
        Add FAQ
      </button>

      <div className="flex gap-2 pt-3">
        <button
          onClick={closeSheet}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <IoCheckmarkOutline className="w-4 h-4" />
          )}
          Save
        </button>
      </div>
    </div>
  )
}

// Social/Contact Editor - With real social media icons
function SocialEditor() {
  const { data, saveSection, closeSheet, isSaving } = useEditMode()
  const [localData, setLocalData] = useState({
    supportEmail: data?.supportEmail || '',
    supportPhone: data?.supportPhone || '',
    website: data?.website || '',
    instagram: data?.instagram || '',
    facebook: data?.facebook || '',
    twitter: data?.twitter || '',
    linkedin: data?.linkedin || '',
    tiktok: data?.tiktok || '',
    youtube: data?.youtube || '',
    showEmail: data?.showEmail ?? true,
    showPhone: data?.showPhone ?? true,
    showWebsite: data?.showWebsite ?? true
  })

  const handleSave = async () => {
    const success = await saveSection('social', localData)
    if (success) {
      closeSheet()
    }
  }

  // Social media configs with real icons and brand colors
  const socialPlatforms = [
    { key: 'instagram', label: 'Instagram', icon: IoLogoInstagram, color: 'text-pink-500', bgHover: 'hover:bg-pink-50 dark:hover:bg-pink-900/20' },
    { key: 'facebook', label: 'Facebook', icon: IoLogoFacebook, color: 'text-blue-600', bgHover: 'hover:bg-blue-50 dark:hover:bg-blue-900/20' },
    { key: 'twitter', label: 'X (Twitter)', icon: FaXTwitter, color: 'text-gray-900 dark:text-white', bgHover: 'hover:bg-gray-100 dark:hover:bg-gray-800' },
    { key: 'linkedin', label: 'LinkedIn', icon: IoLogoLinkedin, color: 'text-blue-700', bgHover: 'hover:bg-blue-50 dark:hover:bg-blue-900/20' },
    { key: 'tiktok', label: 'TikTok', icon: IoLogoTiktok, color: 'text-gray-900 dark:text-white', bgHover: 'hover:bg-gray-100 dark:hover:bg-gray-800' },
    { key: 'youtube', label: 'YouTube', icon: IoLogoYoutube, color: 'text-red-600', bgHover: 'hover:bg-red-50 dark:hover:bg-red-900/20' }
  ]

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-gray-900 dark:text-white">Contact Information</h4>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={localData.showEmail}
            onChange={(e) => setLocalData({ ...localData, showEmail: e.target.checked })}
            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
          />
          <div className="flex-1 flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
            <IoMailOutline className="w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={localData.supportEmail}
              onChange={(e) => setLocalData({ ...localData, supportEmail: e.target.value })}
              placeholder="Support email"
              className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={localData.showPhone}
            onChange={(e) => setLocalData({ ...localData, showPhone: e.target.checked })}
            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
          />
          <div className="flex-1 flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
            <IoCallOutline className="w-4 h-4 text-gray-400" />
            <input
              type="tel"
              value={localData.supportPhone}
              onChange={(e) => setLocalData({ ...localData, supportPhone: e.target.value })}
              placeholder="Support phone"
              className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={localData.showWebsite}
            onChange={(e) => setLocalData({ ...localData, showWebsite: e.target.checked })}
            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
          />
          <div className="flex-1 flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
            <IoGlobeOutline className="w-4 h-4 text-gray-400" />
            <input
              type="url"
              value={localData.website}
              onChange={(e) => setLocalData({ ...localData, website: e.target.value })}
              placeholder="Website URL"
              className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-3 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-xs font-medium text-gray-900 dark:text-white">Social Media</h4>

        {socialPlatforms.map((social) => {
          const Icon = social.icon
          return (
            <div
              key={social.key}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 ${social.bgHover} transition-colors`}
            >
              <Icon className={`w-4 h-4 ${social.color}`} />
              <input
                type="url"
                value={localData[social.key as keyof typeof localData] as string}
                onChange={(e) => setLocalData({ ...localData, [social.key]: e.target.value })}
                placeholder={`${social.label} URL`}
                className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none"
              />
            </div>
          )
        })}
      </div>

      <div className="flex gap-2 pt-3">
        <button
          onClick={closeSheet}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <IoCheckmarkOutline className="w-4 h-4" />
          )}
          Save
        </button>
      </div>
    </div>
  )
}

// Vehicle Add Editor - Multi-step VIN-based wizard
interface PhotoItem {
  id: string
  url: string
  file?: File
  isHero: boolean
}

interface VehicleFormData {
  vin: string
  make: string
  model: string
  year: number
  trim: string
  transmission: string
  fuelType: string
  driveType: string
  carType: string
  vehicleType: 'RENTAL' | 'RIDESHARE'
  color: string
  licensePlate: string
  currentMileage: number
  city: string
  state: string
  dailyRate: number
  weeklyRate: number
  monthlyRate: number
}

const INITIAL_FORM_DATA: VehicleFormData = {
  vin: '',
  make: '',
  model: '',
  year: new Date().getFullYear(),
  trim: '',
  transmission: 'Automatic',
  fuelType: 'Gasoline',
  driveType: '',
  carType: 'Midsize',
  vehicleType: 'RIDESHARE',
  color: '',
  licensePlate: '',
  currentMileage: 0,
  city: '',
  state: '',
  dailyRate: 0,
  weeklyRate: 0,
  monthlyRate: 0
}

function VehicleAddEditor() {
  const { closeSheet } = useEditMode()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<VehicleFormData>(INITIAL_FORM_DATA)
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const photoInputRef = useRef<HTMLInputElement>(null)

  // VIN decode state
  const [vinDecoding, setVinDecoding] = useState(false)
  const [vinError, setVinError] = useState('')
  const [vinDecoded, setVinDecoded] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [showDesktopScan, setShowDesktopScan] = useState(false)

  // Handle camera button click - mobile vs desktop
  const handleCameraClick = useCallback(() => {
    if (isMobileDevice()) {
      setShowScanner(true)
    } else {
      setShowDesktopScan(true)
    }
  }, [])

  // Handle VIN scan from camera (mobile) or QR code (desktop)
  const handleVinScan = useCallback((scannedVin: string) => {
    setFormData(prev => ({ ...prev, vin: scannedVin }))
    setShowScanner(false)
    setShowDesktopScan(false)
    setVinError('')
    setVinDecoded(false)
    // Auto-trigger decode after a brief delay
    setTimeout(() => {
      document.getElementById('decode-vin-btn')?.click()
    }, 100)
  }, [])

  // Handle VIN decode
  const handleVinDecode = useCallback(async () => {
    const vin = formData.vin.trim().toUpperCase()

    if (!vin || vin.length !== 17) {
      setVinError('VIN must be 17 characters')
      return
    }

    if (!isValidVIN(vin)) {
      setVinError('Invalid VIN format')
      return
    }

    setVinDecoding(true)
    setVinError('')
    setVinDecoded(false)

    try {
      const result = await decodeVIN(vin)

      if (result && result.make) {
        const updates: Partial<VehicleFormData> = {
          vin: vin,
          make: result.make,
          model: result.model || '',
          year: parseInt(result.year) || formData.year
        }

        if (result.trim) updates.trim = result.trim
        if (result.transmission) {
          updates.transmission = result.transmission.toLowerCase().includes('automatic') ? 'Automatic' : 'Manual'
        }
        if (result.fuelType) {
          const fuelLower = result.fuelType.toLowerCase()
          if (fuelLower.includes('electric')) updates.fuelType = 'Electric'
          else if (fuelLower.includes('hybrid')) updates.fuelType = 'Hybrid'
          else if (fuelLower.includes('diesel')) updates.fuelType = 'Diesel'
          else updates.fuelType = 'Gasoline'
        }
        if (result.bodyClass) {
          const mappedType = mapBodyClassToCarType(result.bodyClass, result.make, result.model)
          if (mappedType) updates.carType = mappedType
        }
        if (result.driveType) {
          const driveLower = result.driveType.toLowerCase()
          if (driveLower.includes('all') || driveLower.includes('awd')) updates.driveType = 'AWD'
          else if (driveLower.includes('front') || driveLower.includes('fwd')) updates.driveType = 'FWD'
          else if (driveLower.includes('rear') || driveLower.includes('rwd')) updates.driveType = 'RWD'
          else updates.driveType = result.driveType.toUpperCase()
        }

        setFormData(prev => ({ ...prev, ...updates }))
        setVinDecoded(true)
      } else {
        setVinError('Could not decode VIN')
      }
    } catch (error) {
      console.error('VIN decode error:', error)
      setVinError('Failed to decode VIN')
    } finally {
      setVinDecoding(false)
    }
  }, [formData.vin, formData.year])

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newPhotos: PhotoItem[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) continue

      const id = `temp-${Date.now()}-${i}`
      const url = URL.createObjectURL(file)

      newPhotos.push({
        id,
        url,
        file,
        isHero: photos.length === 0 && i === 0
      })
    }

    setPhotos(prev => [...prev, ...newPhotos])
    e.target.value = ''
  }

  // Set hero photo
  const setHeroPhoto = (photoId: string) => {
    setPhotos(prev => prev.map(p => ({ ...p, isHero: p.id === photoId })))
  }

  // Delete photo
  const deletePhoto = (photoId: string) => {
    setPhotos(prev => {
      const filtered = prev.filter(p => p.id !== photoId)
      if (filtered.length > 0 && !filtered.some(p => p.isHero)) {
        filtered[0].isHero = true
      }
      return filtered
    })
  }

  // Auto-calculate rates
  useEffect(() => {
    if (formData.dailyRate > 0 && !formData.weeklyRate) {
      setFormData(prev => ({ ...prev, weeklyRate: Math.round(prev.dailyRate * 6.5) }))
    }
    if (formData.dailyRate > 0 && !formData.monthlyRate) {
      setFormData(prev => ({ ...prev, monthlyRate: Math.round(prev.dailyRate * 25) }))
    }
  }, [formData.dailyRate])

  // Validate step
  const canProceed = () => {
    switch (currentStep) {
      case 1: return vinDecoded
      case 2: return !!formData.color
      case 3: return photos.length >= 3
      case 4: return formData.dailyRate >= 25
      default: return true
    }
  }

  // Handle submit
  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError('')

    try {
      // Upload photos first
      const uploadedPhotos: { url: string; isHero: boolean }[] = []
      for (const photo of photos) {
        if (photo.file) {
          const formDataUpload = new FormData()
          formDataUpload.append('file', photo.file)
          formDataUpload.append('type', 'vehicle-photo')

          const uploadRes = await fetch('/api/partner/upload', {
            method: 'POST',
            body: formDataUpload
          })

          if (uploadRes.ok) {
            const data = await uploadRes.json()
            uploadedPhotos.push({ url: data.url, isHero: photo.isHero })
          }
        }
      }

      // Submit vehicle
      const response = await fetch('/api/partner/fleet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vin: formData.vin,
          make: formData.make,
          model: formData.model,
          year: formData.year,
          trim: formData.trim || null,
          color: formData.color,
          licensePlate: formData.licensePlate || null,
          transmission: formData.transmission.toLowerCase(),
          fuelType: formData.fuelType.toLowerCase(),
          driveType: formData.driveType || null,
          carType: formData.carType.toLowerCase(),
          vehicleType: formData.vehicleType,
          currentMileage: formData.currentMileage,
          city: formData.city || 'Phoenix',
          state: formData.state || 'AZ',
          dailyRate: formData.dailyRate,
          weeklyRate: formData.weeklyRate || formData.dailyRate * 6.5,
          monthlyRate: formData.monthlyRate || formData.dailyRate * 25,
          photos: uploadedPhotos,
          vinVerificationMethod: 'API'
        })
      })

      const result = await response.json()

      if (result.success) {
        closeSheet()
        window.location.reload()
      } else {
        setSubmitError(result.error || 'Failed to add vehicle')
      }
    } catch (error) {
      console.error('Submit error:', error)
      setSubmitError('Failed to add vehicle')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-4">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
              currentStep > step
                ? 'bg-green-500 text-white'
                : currentStep === step
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}>
              {currentStep > step ? <IoCheckmarkCircle className="w-4 h-4" /> : step}
            </div>
            {step < 5 && (
              <div className={`w-6 h-0.5 mx-0.5 ${currentStep > step ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: VIN Decode */}
      {currentStep === 1 && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              VIN (17 characters) *
            </label>
            <div className="flex gap-2">
              {/* VIN Input with camera button inside */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={formData.vin}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '').slice(0, 17)
                    setFormData(prev => ({ ...prev, vin: value }))
                    setVinError('')
                    if (vinDecoded) setVinDecoded(false)
                  }}
                  placeholder="Enter VIN"
                  maxLength={17}
                  className="w-full pl-2.5 pr-9 py-1.5 text-sm font-mono uppercase border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                />
                {/* Camera button inside input */}
                <button
                  type="button"
                  onClick={handleCameraClick}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded transition-colors"
                  title="Scan VIN barcode"
                >
                  <IoCameraOutline className="w-4 h-4" />
                </button>
              </div>
              <button
                id="decode-vin-btn"
                onClick={handleVinDecode}
                disabled={formData.vin.length !== 17 || vinDecoding}
                className="px-3 py-1.5 text-xs font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {vinDecoding ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <IoSparkles className="w-3 h-3" />
                )}
                Decode
              </button>
            </div>

            {/* VIN Scanner Modal (Mobile) */}
            {showScanner && (
              <VinScanner
                onScan={handleVinScan}
                onClose={() => setShowScanner(false)}
              />
            )}

            {/* Desktop Scan Modal (QR Code) */}
            <DesktopVinScanModal
              isOpen={showDesktopScan}
              onClose={() => setShowDesktopScan(false)}
              onVinReceived={handleVinScan}
            />

            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-gray-500">{formData.vin.length}/17</span>
              {vinError && <span className="text-[10px] text-red-500">{vinError}</span>}
            </div>
          </div>

          {/* Decoded Info */}
          {vinDecoded && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <IoCheckmarkCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800 dark:text-green-300">Vehicle Detected</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {formData.year} {formData.make} {formData.model}
              </p>
              {formData.trim && <p className="text-xs text-gray-600 dark:text-gray-400">{formData.trim}</p>}
              <div className="flex flex-wrap gap-2 mt-2 text-[10px] text-gray-500">
                {formData.transmission && <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">{formData.transmission}</span>}
                {formData.fuelType && <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">{formData.fuelType}</span>}
                {formData.driveType && <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">{formData.driveType}</span>}
              </div>
            </div>
          )}

          {/* Vehicle Type Selection */}
          {vinDecoded && (
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Vehicle Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, vehicleType: 'RIDESHARE' }))}
                  className={`p-2.5 text-xs font-medium rounded-lg border transition-colors ${
                    formData.vehicleType === 'RIDESHARE'
                      ? 'bg-orange-50 dark:bg-orange-900/30 border-orange-500 text-orange-700 dark:text-orange-400'
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <div className="font-semibold">Rideshare</div>
                  <div className="text-[10px] mt-0.5 opacity-75">Uber, Lyft drivers</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, vehicleType: 'RENTAL' }))}
                  className={`p-2.5 text-xs font-medium rounded-lg border transition-colors ${
                    formData.vehicleType === 'RENTAL'
                      ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-500 text-purple-700 dark:text-purple-400'
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <div className="font-semibold">Rental</div>
                  <div className="text-[10px] mt-0.5 opacity-75">Standard rentals</div>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Details */}
      {currentStep === 2 && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Color *</label>
              <select
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Select</option>
                {CAR_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Plate</label>
              <input
                type="text"
                value={formData.licensePlate}
                onChange={(e) => setFormData(prev => ({ ...prev, licensePlate: e.target.value.toUpperCase() }))}
                placeholder="ABC-123"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Mileage</label>
              <input
                type="number"
                value={formData.currentMileage || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, currentMileage: parseInt(e.target.value) || 0 }))}
                placeholder="50000"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Phoenix"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value.toUpperCase().slice(0, 2) }))}
              placeholder="AZ"
              maxLength={2}
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* Step 3: Photos */}
      {currentStep === 3 && (
        <div className="space-y-3">
          <div className={`p-2 rounded-lg text-xs ${
            photos.length >= 3
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
              : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
          }`}>
            {photos.length >= 3 ? (
              <span className="flex items-center gap-1"><IoCheckmarkCircle className="w-3 h-3" /> {photos.length} photos uploaded</span>
            ) : (
              <span className="flex items-center gap-1"><IoWarningOutline className="w-3 h-3" /> {photos.length}/3 minimum</span>
            )}
          </div>

          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo) => (
                <div key={photo.id} className="relative aspect-[4/3] group">
                  <Image src={photo.url} alt="" fill className="object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                    <button
                      onClick={() => setHeroPhoto(photo.id)}
                      className="p-1.5 bg-white/90 rounded-full"
                    >
                      {photo.isHero ? <IoStar className="w-3 h-3 text-yellow-500" /> : <IoStarOutline className="w-3 h-3 text-gray-600" />}
                    </button>
                    <button
                      onClick={() => deletePhoto(photo.id)}
                      className="p-1.5 bg-white/90 rounded-full"
                    >
                      <IoTrashOutline className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                  {photo.isHero && (
                    <div className="absolute bottom-1 left-1 px-1 py-0.5 bg-orange-500 text-white text-[8px] rounded">Main</div>
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => photoInputRef.current?.click()}
            className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:border-orange-500 transition-colors flex items-center justify-center gap-2"
          >
            <IoAddOutline className="w-5 h-5" />
            <span className="text-sm">Add Photos</span>
          </button>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Step 4: Pricing */}
      {currentStep === 4 && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Daily Rate * (min $25)</label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
              <input
                type="number"
                value={formData.dailyRate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, dailyRate: parseFloat(e.target.value) || 0, weeklyRate: 0, monthlyRate: 0 }))}
                placeholder="75"
                min="25"
                className="w-full pl-6 pr-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Weekly <span className="text-[10px] text-gray-400">(~${Math.round(formData.dailyRate * 6.5) || 0})</span>
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input
                  type="number"
                  value={formData.weeklyRate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, weeklyRate: parseFloat(e.target.value) || 0 }))}
                  className="w-full pl-6 pr-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Monthly <span className="text-[10px] text-gray-400">(~${Math.round(formData.dailyRate * 25) || 0})</span>
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input
                  type="number"
                  value={formData.monthlyRate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthlyRate: parseFloat(e.target.value) || 0 }))}
                  className="w-full pl-6 pr-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Review */}
      {currentStep === 5 && (
        <div className="space-y-3">
          {/* Vehicle Summary */}
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            {photos.find(p => p.isHero) && (
              <div className="relative h-24 mb-2 rounded-lg overflow-hidden">
                <Image src={photos.find(p => p.isHero)!.url} alt="" fill className="object-cover" />
              </div>
            )}
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {formData.year} {formData.make} {formData.model}
            </p>
            <p className="text-xs text-gray-500">{formData.trim}</p>
            <div className="flex flex-wrap gap-1 mt-2 text-[10px]">
              <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">{formData.color}</span>
              <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">{formData.transmission}</span>
              <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">{formData.fuelType}</span>
              <span className={`px-1.5 py-0.5 rounded ${formData.vehicleType === 'RIDESHARE' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'}`}>
                {formData.vehicleType}
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-500">Daily</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">${formData.dailyRate}</p>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-500">Weekly</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">${formData.weeklyRate || Math.round(formData.dailyRate * 6.5)}</p>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-500">Monthly</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">${formData.monthlyRate || Math.round(formData.dailyRate * 25)}</p>
            </div>
          </div>

          {/* Location & Photos */}
          <div className="flex justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1"><IoLocationOutline className="w-3 h-3" /> {formData.city || 'Phoenix'}, {formData.state || 'AZ'}</span>
            <span>{photos.length} photos</span>
          </div>

          {submitError && (
            <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-600">
              {submitError}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
        {currentStep > 1 ? (
          <button
            onClick={() => setCurrentStep(prev => prev - 1)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <IoChevronBack className="w-4 h-4" /> Back
          </button>
        ) : (
          <button
            onClick={closeSheet}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
        )}

        {currentStep < 5 ? (
          <button
            onClick={() => setCurrentStep(prev => prev + 1)}
            disabled={!canProceed()}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg"
          >
            Next <IoChevronForward className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <IoCheckmarkOutline className="w-4 h-4" />
            )}
            Add Vehicle
          </button>
        )}
      </div>
    </div>
  )
}

// Main Section Editors Controller
export default function SectionEditors() {
  const { activeSheet, closeSheet } = useEditMode()

  const sheetConfig: Record<Exclude<EditableSection, null>, { title: string; subtitle: string; icon: any }> = {
    hero: { title: 'Hero Section', subtitle: 'Headline, subheadline, and bio', icon: IoTextOutline },
    photo: { title: 'Photos', subtitle: 'Hero image, logo, or personal photo', icon: IoImageOutline },
    benefits: { title: 'Benefits', subtitle: 'Managed automatically', icon: IoAppsOutline },
    services: { title: 'Services', subtitle: 'Choose services you offer', icon: IoAppsOutline },
    vehicles: { title: 'Vehicles', subtitle: 'Manage in Fleet section', icon: IoCarOutline },
    reviews: { title: 'Reviews', subtitle: 'Customer reviews (read-only)', icon: IoTextOutline },
    policies: { title: 'Policies', subtitle: 'Terms and conditions', icon: IoDocumentTextOutline },
    faqs: { title: 'FAQs', subtitle: 'Frequently asked questions', icon: IoHelpCircleOutline },
    social: { title: 'Contact & Social', subtitle: 'Contact info and social links', icon: IoShareSocialOutline },
    addCar: { title: 'Add Vehicle', subtitle: 'VIN decode and setup', icon: IoCarOutline }
  }

  const renderEditor = () => {
    switch (activeSheet) {
      case 'hero':
        return <HeroEditor />
      case 'photo':
        return <PhotoEditor />
      case 'services':
        return <ServicesEditor />
      case 'policies':
        return <PoliciesEditor />
      case 'faqs':
        return <FAQsEditor />
      case 'social':
        return <SocialEditor />
      case 'addCar':
        return <VehicleAddEditor />
      case 'benefits':
      case 'vehicles':
        return (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This section is managed automatically based on your fleet.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
              Go to Fleet section in Partner Dashboard to add or edit vehicles.
            </p>
          </div>
        )
      case 'reviews':
        return (
          <div className="text-center py-6">
            <IoCheckmarkOutline className="w-10 h-10 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-900 dark:text-white font-medium">Reviews Technology Active</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
              Customer reviews are collected automatically after completed rentals.
              This section cannot be edited to maintain authenticity.
            </p>
          </div>
        )
      default:
        return null
    }
  }

  if (!activeSheet) return null

  const config = sheetConfig[activeSheet]

  return (
    <BottomSheet
      isOpen={!!activeSheet}
      onClose={closeSheet}
      title={config.title}
      subtitle={config.subtitle}
      size="large"
    >
      {renderEditor()}
    </BottomSheet>
  )
}
