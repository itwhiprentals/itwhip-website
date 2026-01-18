// app/rideshare/[partnerSlug]/SectionEditors.tsx
// Bottom sheet editors for each section of the landing page

'use client'

import { useState, useEffect } from 'react'
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
  IoAddOutline,
  IoTrashOutline
} from 'react-icons/io5'

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
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Headline
        </label>
        <input
          type="text"
          value={localData.headline}
          onChange={(e) => setLocalData({ ...localData, headline: e.target.value })}
          placeholder="Your compelling headline"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <p className="mt-1 text-xs text-gray-500">Main headline displayed on your landing page</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Subheadline
        </label>
        <input
          type="text"
          value={localData.subheadline}
          onChange={(e) => setLocalData({ ...localData, subheadline: e.target.value })}
          placeholder="Supporting text"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <p className="mt-1 text-xs text-gray-500">Secondary text that supports your headline</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Bio / Description
        </label>
        <textarea
          value={localData.bio}
          onChange={(e) => setLocalData({ ...localData, bio: e.target.value })}
          placeholder="Tell customers about your business..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
        />
        <p className="mt-1 text-xs text-gray-500">A brief description of your business</p>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={closeSheet}
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <IoCheckmarkOutline className="w-5 h-5" />
          )}
          Save Changes
        </button>
      </div>
    </div>
  )
}

// Services Editor
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

  const services = [
    { key: 'enableRideshare', label: 'Rideshare Rentals', description: 'Rent cars for Uber, Lyft, and other platforms' },
    { key: 'enableRentals', label: 'Traditional Rentals', description: 'Standard daily/weekly car rentals' },
    { key: 'enableSales', label: 'Vehicle Sales', description: 'Sell vehicles to customers' },
    { key: 'enableLeasing', label: 'Leasing', description: 'Long-term vehicle leasing options' },
    { key: 'enableRentToOwn', label: 'Rent-to-Own', description: 'Rent with option to purchase' }
  ]

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Select the services you offer to customers.
      </p>

      <div className="space-y-3">
        {services.map((service) => (
          <label
            key={service.key}
            className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <input
              type="checkbox"
              checked={localData[service.key as keyof typeof localData]}
              onChange={(e) => setLocalData({ ...localData, [service.key]: e.target.checked })}
              className="mt-0.5 w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{service.label}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{service.description}</p>
            </div>
          </label>
        ))}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={closeSheet}
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <IoCheckmarkOutline className="w-5 h-5" />
          )}
          Save Changes
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
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Define your rental policies, terms, and conditions.
      </p>

      <div className="space-y-4 max-h-[50vh] overflow-y-auto">
        {policyFields.map((field) => (
          <div key={field.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {field.label}
            </label>
            <textarea
              value={policies[field.key]}
              onChange={(e) => setPolicies({ ...policies, [field.key]: e.target.value })}
              placeholder={field.placeholder}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={closeSheet}
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <IoCheckmarkOutline className="w-5 h-5" />
          )}
          Save Changes
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
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Add frequently asked questions to help customers.
      </p>

      <div className="space-y-4 max-h-[50vh] overflow-y-auto">
        {faqs.map((faq, index) => (
          <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">FAQ {index + 1}</span>
              <button
                onClick={() => removeFaq(index)}
                className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <IoTrashOutline className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              value={faq.question}
              onChange={(e) => updateFaq(index, 'question', e.target.value)}
              placeholder="Question"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <textarea
              value={faq.answer}
              onChange={(e) => updateFaq(index, 'answer', e.target.value)}
              placeholder="Answer"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>
        ))}
      </div>

      <button
        onClick={addFaq}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg hover:border-orange-500 hover:text-orange-600 transition-colors"
      >
        <IoAddOutline className="w-5 h-5" />
        Add FAQ
      </button>

      <div className="flex gap-3 pt-4">
        <button
          onClick={closeSheet}
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <IoCheckmarkOutline className="w-5 h-5" />
          )}
          Save Changes
        </button>
      </div>
    </div>
  )
}

// Social/Contact Editor
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

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-white">Contact Information</h4>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={localData.showEmail}
            onChange={(e) => setLocalData({ ...localData, showEmail: e.target.checked })}
            className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
          />
          <input
            type="email"
            value={localData.supportEmail}
            onChange={(e) => setLocalData({ ...localData, supportEmail: e.target.value })}
            placeholder="Support email"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={localData.showPhone}
            onChange={(e) => setLocalData({ ...localData, showPhone: e.target.checked })}
            className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
          />
          <input
            type="tel"
            value={localData.supportPhone}
            onChange={(e) => setLocalData({ ...localData, supportPhone: e.target.value })}
            placeholder="Support phone"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={localData.showWebsite}
            onChange={(e) => setLocalData({ ...localData, showWebsite: e.target.checked })}
            className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
          />
          <input
            type="url"
            value={localData.website}
            onChange={(e) => setLocalData({ ...localData, website: e.target.value })}
            placeholder="Website URL"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-gray-900 dark:text-white">Social Media</h4>

        {[
          { key: 'instagram', label: 'Instagram' },
          { key: 'facebook', label: 'Facebook' },
          { key: 'twitter', label: 'X (Twitter)' },
          { key: 'linkedin', label: 'LinkedIn' },
          { key: 'tiktok', label: 'TikTok' },
          { key: 'youtube', label: 'YouTube' }
        ].map((social) => (
          <input
            key={social.key}
            type="url"
            value={localData[social.key as keyof typeof localData] as string}
            onChange={(e) => setLocalData({ ...localData, [social.key]: e.target.value })}
            placeholder={`${social.label} URL`}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        ))}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={closeSheet}
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <IoCheckmarkOutline className="w-5 h-5" />
          )}
          Save Changes
        </button>
      </div>
    </div>
  )
}

// Main Section Editors Controller
export default function SectionEditors() {
  const { activeSheet, closeSheet } = useEditMode()

  const sheetConfig: Record<Exclude<EditableSection, null>, { title: string; subtitle: string; icon: any }> = {
    hero: { title: 'Edit Hero Section', subtitle: 'Headline, subheadline, and bio', icon: IoTextOutline },
    benefits: { title: 'Edit Benefits', subtitle: 'Managed automatically', icon: IoAppsOutline },
    services: { title: 'Edit Services', subtitle: 'Choose services you offer', icon: IoAppsOutline },
    vehicles: { title: 'Edit Vehicles', subtitle: 'Manage in Fleet section', icon: IoImageOutline },
    reviews: { title: 'Reviews', subtitle: 'Reviews are automatic', icon: IoTextOutline },
    policies: { title: 'Edit Policies', subtitle: 'Terms and conditions', icon: IoDocumentTextOutline },
    faqs: { title: 'Edit FAQs', subtitle: 'Frequently asked questions', icon: IoHelpCircleOutline },
    social: { title: 'Contact & Social', subtitle: 'Contact info and social links', icon: IoShareSocialOutline }
  }

  const renderEditor = () => {
    switch (activeSheet) {
      case 'hero':
        return <HeroEditor />
      case 'services':
        return <ServicesEditor />
      case 'policies':
        return <PoliciesEditor />
      case 'faqs':
        return <FAQsEditor />
      case 'social':
        return <SocialEditor />
      case 'benefits':
      case 'vehicles':
      case 'reviews':
        return (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              This section is managed automatically based on your fleet and customer reviews.
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
