// app/partner/landing/components/SocialTab.tsx
// Contact & Social media settings tab

'use client'

import {
  IoSaveOutline,
  IoGlobeOutline,
  IoLogoInstagram,
  IoLogoFacebook,
  IoLogoTwitter,
  IoLogoLinkedin,
  IoLogoTiktok,
  IoLogoYoutube
} from 'react-icons/io5'
import { LandingPageData } from './types'

interface SocialTabProps {
  data: LandingPageData
  onChange: (updates: Partial<LandingPageData>) => void
  onSave: () => void
  isSaving: boolean
}

export default function SocialTab({ data, onChange, onSave, isSaving }: SocialTabProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
      {/* Contact Info */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Support Email
            </label>
            <input
              type="email"
              value={data.supportEmail}
              onChange={(e) => onChange({ supportEmail: e.target.value })}
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
              onChange={(e) => onChange({ supportPhone: e.target.value })}
              placeholder="+1 (555) 123-4567"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Social Media Links */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Social Media & Website</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <IoGlobeOutline className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <input
              type="url"
              value={data.website}
              onChange={(e) => onChange({ website: e.target.value })}
              placeholder="https://yourwebsite.com"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
              <IoLogoInstagram className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </div>
            <input
              type="url"
              value={data.instagram}
              onChange={(e) => onChange({ instagram: e.target.value })}
              placeholder="https://instagram.com/yourcompany"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <IoLogoFacebook className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <input
              type="url"
              value={data.facebook}
              onChange={(e) => onChange({ facebook: e.target.value })}
              placeholder="https://facebook.com/yourcompany"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
              <IoLogoTwitter className="w-5 h-5 text-sky-500 dark:text-sky-400" />
            </div>
            <input
              type="url"
              value={data.twitter}
              onChange={(e) => onChange({ twitter: e.target.value })}
              placeholder="https://twitter.com/yourcompany"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <IoLogoLinkedin className="w-5 h-5 text-blue-700 dark:text-blue-400" />
            </div>
            <input
              type="url"
              value={data.linkedin}
              onChange={(e) => onChange({ linkedin: e.target.value })}
              placeholder="https://linkedin.com/company/yourcompany"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
              <IoLogoTiktok className="w-5 h-5 text-black dark:text-white" />
            </div>
            <input
              type="url"
              value={data.tiktok}
              onChange={(e) => onChange({ tiktok: e.target.value })}
              placeholder="https://tiktok.com/@yourcompany"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <IoLogoYoutube className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <input
              type="url"
              value={data.youtube}
              onChange={(e) => onChange({ youtube: e.target.value })}
              placeholder="https://youtube.com/@yourcompany"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Visibility Settings */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Visibility Settings</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={data.showEmail}
              onChange={(e) => onChange({ showEmail: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show email on landing page</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={data.showPhone}
              onChange={(e) => onChange({ showPhone: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show phone number on landing page</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={data.showWebsite}
              onChange={(e) => onChange({ showWebsite: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show website link on landing page</span>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <IoSaveOutline className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Contact & Social'}
        </button>
      </div>
    </div>
  )
}
