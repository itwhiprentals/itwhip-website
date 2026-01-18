// app/partner/landing/components/ContentTab.tsx
// Content editing tab for landing page

'use client'

import { IoSaveOutline } from 'react-icons/io5'
import { LandingPageData } from './types'

interface ContentTabProps {
  data: LandingPageData
  onChange: (updates: Partial<LandingPageData>) => void
  onSave: () => void
  isSaving: boolean
}

export default function ContentTab({ data, onChange, onSave, isSaving }: ContentTabProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
      {/* Company Slug Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Company Slug (Your Landing Page URL)
        </label>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">itwhip.com/rideshare/</span>
          <input
            type="text"
            value={data.slug}
            onChange={(e) => {
              const sanitized = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
              onChange({ slug: sanitized })
            }}
            placeholder="your-company-slug"
            className="w-full sm:flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Minimum 3 characters. Only lowercase letters, numbers, and hyphens. Reserved words like &quot;admin&quot;, &quot;api&quot;, etc. are not allowed.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Headline
          </label>
          <input
            type="text"
            value={data.headline}
            onChange={(e) => onChange({ headline: e.target.value })}
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
            onChange={(e) => onChange({ subheadline: e.target.value })}
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
          onChange={(e) => onChange({ bio: e.target.value })}
          rows={4}
          placeholder="Tell potential renters about your fleet and what makes you different..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <IoSaveOutline className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Content'}
        </button>
      </div>
    </div>
  )
}
