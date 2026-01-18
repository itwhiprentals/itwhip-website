// app/rideshare/[partnerSlug]/PreviewBanner.tsx
// Preview mode banner for hosts previewing their landing page

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useEditMode } from './EditModeContext'
import {
  IoEyeOutline,
  IoCloseOutline,
  IoArrowBackOutline,
  IoTextOutline,
  IoColorPaletteOutline,
  IoAppsOutline,
  IoDocumentTextOutline,
  IoHelpCircleOutline,
  IoPencilOutline,
  IoShareSocialOutline
} from 'react-icons/io5'

interface PreviewBannerProps {
  slug: string
  isPublished: boolean
  editMode: boolean
  companyName: string
}

// Quick edit sections that can be opened via bottom sheets
const EDIT_SECTIONS = [
  { id: 'hero' as const, label: 'Hero', icon: IoTextOutline },
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
    <div className="sticky top-16 sm:top-20 z-40 bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between gap-3">
          {/* Left side - Preview Mode indicator */}
          <div className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <IoPencilOutline className="w-5 h-5" />
                <span className="font-medium">Edit Mode</span>
              </>
            ) : (
              <>
                <IoEyeOutline className="w-5 h-5" />
                <span className="font-medium">Preview Mode</span>
              </>
            )}
          </div>

          {/* Center - Quick Edit Sections (only in edit mode) */}
          {isEditMode && (
            <div className="hidden md:flex items-center gap-1">
              {EDIT_SECTIONS.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => openSheet(section.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-white/90 hover:text-white hover:bg-white/20 rounded-md transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {section.label}
                  </button>
                )
              })}
            </div>
          )}

          {/* Center - Legacy tab links (only in preview mode without edit) */}
          {!isEditMode && (
            <div className="hidden md:flex items-center gap-1">
              {[
                { id: 'content', label: 'Content', icon: IoTextOutline },
                { id: 'branding', label: 'Branding', icon: IoColorPaletteOutline },
                { id: 'services', label: 'Services', icon: IoAppsOutline },
                { id: 'policies', label: 'Policies', icon: IoDocumentTextOutline },
                { id: 'faqs', label: 'FAQs', icon: IoHelpCircleOutline },
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <Link
                    key={tab.id}
                    href={`/partner/landing?tab=${tab.id}`}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-white/90 hover:text-white hover:bg-white/20 rounded-md transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </Link>
                )
              })}
            </div>
          )}

          {/* Right side - Back to Editor + Close */}
          <div className="flex items-center gap-2">
            <Link
              href="/partner/landing"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-orange-600 text-sm font-medium rounded-lg hover:bg-orange-50 transition-colors"
            >
              <IoArrowBackOutline className="w-4 h-4" />
              <span className="hidden sm:inline">Editor</span>
            </Link>

            <button
              onClick={() => setIsMinimized(true)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              title="Minimize"
            >
              <IoCloseOutline className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile edit buttons (only in edit mode) */}
        {isEditMode && (
          <div className="md:hidden flex items-center gap-1.5 pt-2 overflow-x-auto pb-1 -mx-4 px-4">
            {EDIT_SECTIONS.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => openSheet(section.id)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {section.label}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
