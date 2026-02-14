// app/rideshare/[partnerSlug]/PreviewBanner.tsx
// Preview mode banner for hosts previewing their landing page - Single row design

'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useEditMode } from './EditModeContext'
import {
  IoEyeOutline,
  IoArrowBackOutline,
  IoTextOutline,
  IoAppsOutline,
  IoDocumentTextOutline,
  IoHelpCircleOutline,
  IoPencilOutline,
  IoShareSocialOutline,
  IoImageOutline
} from 'react-icons/io5'

interface PreviewBannerProps {
  slug: string
  isPublished: boolean
  editMode: boolean
  companyName: string
}

// Quick edit sections - compact labels with pen icons
const EDIT_SECTIONS = [
  { id: 'hero' as const, label: 'Hero', icon: IoTextOutline },
  { id: 'photo' as const, label: 'Photo', icon: IoImageOutline },
  { id: 'services' as const, label: 'Services', icon: IoAppsOutline },
  { id: 'policies' as const, label: 'Policies', icon: IoDocumentTextOutline },
  { id: 'faqs' as const, label: 'FAQs', icon: IoHelpCircleOutline },
  { id: 'social' as const, label: 'Contact', icon: IoShareSocialOutline },
]

export default function PreviewBanner({ slug, isPublished, editMode, companyName }: PreviewBannerProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const { openSheet, isEditMode } = useEditMode()

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed top-20 right-4 z-50 p-3 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-lg transition-colors"
        title="Show preview controls"
      >
        <IoEyeOutline className="w-5 h-5" />
      </button>
    )
  }

  return (
    <div className="sticky top-16 z-40 bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-3 py-2">
        {/* Single row layout */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {/* Back button - always first */}
          <Link
            href="/partner/landing"
            className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
            title="Back to Editor"
          >
            <IoArrowBackOutline className="w-4 h-4" />
          </Link>

          {/* Divider */}
          <div className="flex-shrink-0 w-px h-6 bg-white/30" />

          {/* Edit section badges with pen icons */}
          {isEditMode && EDIT_SECTIONS.map((section) => {
            const Icon = section.icon
            return (
              <button
                key={section.id}
                onClick={() => openSheet(section.id)}
                className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-white/15 hover:bg-white/25 rounded-lg transition-colors"
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{section.label}</span>
                <IoPencilOutline className="w-3 h-3 opacity-60" />
              </button>
            )
          })}

          {/* Legacy tab links for non-edit preview mode */}
          {!isEditMode && [
            { id: 'content', label: 'Content', icon: IoTextOutline },
            { id: 'services', label: 'Services', icon: IoAppsOutline },
            { id: 'policies', label: 'Policies', icon: IoDocumentTextOutline },
            { id: 'faqs', label: 'FAQs', icon: IoHelpCircleOutline },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <Link
                key={tab.id}
                href={`/partner/landing?tab=${tab.id}`}
                className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-white/15 hover:bg-white/25 rounded-lg transition-colors"
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
