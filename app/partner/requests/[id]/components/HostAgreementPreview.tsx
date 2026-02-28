// app/partner/requests/[id]/components/HostAgreementPreview.tsx
// Dynamic accordion preview for host-uploaded agreement sections
// Renders AI-extracted sections in the same style as AgreementFullPreview

'use client'

import { useState } from 'react'
import {
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoCloseOutline,
  IoPeopleOutline,
  IoCarOutline,
  IoWalletOutline,
  IoShieldOutline,
  IoWarningOutline,
  IoDocumentTextOutline,
  IoCalendarOutline,
  IoLocationOutline,
  IoKeyOutline,
  IoScaleOutline,
  IoCloseCircleOutline,
  IoLockClosedOutline,
  IoCreateOutline,
  IoGlobeOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoCallOutline,
  IoMailOutline
} from 'react-icons/io5'

// Section data from AI extraction
export interface AgreementSection {
  id: string
  title: string
  content: string
  icon: string
}

interface HostAgreementPreviewProps {
  sections: AgreementSection[]
  hostName?: string
  onClose: () => void
  /** Render inline (embedded accordion) instead of modal overlay */
  inline?: boolean
}

// Map icon string keys to actual icon components
const ICON_MAP: Record<string, typeof IoPeopleOutline> = {
  people: IoPeopleOutline,
  car: IoCarOutline,
  wallet: IoWalletOutline,
  shield: IoShieldOutline,
  warning: IoWarningOutline,
  document: IoDocumentTextOutline,
  calendar: IoCalendarOutline,
  location: IoLocationOutline,
  key: IoKeyOutline,
  scale: IoScaleOutline,
  close: IoCloseCircleOutline,
  lock: IoLockClosedOutline,
  create: IoCreateOutline,
  globe: IoGlobeOutline,
  checkmark: IoCheckmarkCircleOutline,
  time: IoTimeOutline,
  call: IoCallOutline,
  mail: IoMailOutline
}

/** Accordion section wrapper — same pattern as AgreementFullPreview */
function Section({
  icon: Icon,
  title,
  children,
  isOpen,
  onToggle
}: {
  icon: typeof IoPeopleOutline
  title: string
  children: React.ReactNode
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon className="w-4.5 h-4.5 flex-shrink-0 text-gray-700 dark:text-gray-300" />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
            {title}
          </span>
        </div>
        {isOpen ? (
          <IoChevronUpOutline className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
        ) : (
          <IoChevronDownOutline className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
          {children}
        </div>
      )}
    </div>
  )
}

export default function HostAgreementPreview({
  sections,
  hostName,
  onClose,
  inline = false
}: HostAgreementPreviewProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set())

  const toggle = (key: string) => {
    setOpenSections(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const isOpen = (key: string) => openSections.has(key)

  const sectionsList = (
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {sections.map((section) => {
        const IconComponent = ICON_MAP[section.icon] || IoDocumentTextOutline
        return (
          <Section
            key={section.id}
            icon={IconComponent}
            title={section.title}
            isOpen={isOpen(section.id)}
            onToggle={() => toggle(section.id)}
          >
            {section.content}
          </Section>
        )
      })}
    </div>
  )

  // Inline mode — embedded accordion (same pattern as AgreementFullPreview)
  if (inline) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {hostName ? `${hostName}'s Agreement` : 'Rental Agreement'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {sections.length} sections extracted from uploaded PDF
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <IoCloseOutline className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {sectionsList}
      </div>
    )
  }

  // Modal mode — full-screen overlay
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-2xl my-8 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 rounded-t-lg px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {hostName ? `${hostName}'s Agreement` : 'Rental Agreement'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {sections.length} sections extracted from uploaded PDF
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <IoCloseOutline className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {sectionsList}

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  )
}
