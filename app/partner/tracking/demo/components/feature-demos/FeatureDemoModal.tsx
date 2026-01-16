// app/partner/tracking/demo/components/feature-demos/FeatureDemoModal.tsx
'use client'

import { useEffect, useCallback } from 'react'
import { IconType } from 'react-icons'
import { IoCloseOutline } from 'react-icons/io5'
import ProviderBadges from './shared/ProviderBadges'

// Color gradient mapping
const COLOR_GRADIENTS: Record<string, string> = {
  blue: 'from-blue-500 to-blue-700',
  green: 'from-green-500 to-green-700',
  purple: 'from-purple-500 to-purple-700',
  cyan: 'from-cyan-500 to-cyan-700',
  yellow: 'from-yellow-500 to-yellow-700',
  red: 'from-red-500 to-red-700',
  orange: 'from-orange-500 to-orange-700'
}

export interface FeatureConfig {
  id: string
  icon: IconType
  label: string
  description: string
  providers: string[]
  color: string
}

interface FeatureDemoModalProps {
  feature: FeatureConfig | null
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export default function FeatureDemoModal({
  feature,
  isOpen,
  onClose,
  children
}: FeatureDemoModalProps) {
  // Handle ESC key press
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen || !feature) return null

  const Icon = feature.icon
  const gradient = COLOR_GRADIENTS[feature.color] || COLOR_GRADIENTS.blue

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4">
      <div
        className="bg-gray-900 rounded-lg border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 id="modal-title" className="text-base sm:text-lg font-bold text-white truncate">
                  {feature.label}
                </h3>
                {/* ItWhip+ exclusive badge for mileage feature */}
                {feature.id === 'mileage' && (
                  <span className="px-1.5 py-0.5 text-[8px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded">
                    EXCLUSIVE
                  </span>
                )}
                {/* Hardware required badge for kill switch */}
                {feature.id === 'killswitch' && (
                  <span className="px-1.5 py-0.5 text-[8px] font-bold bg-red-600 text-white rounded">
                    REQUIRES MOOVETRAX
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-400 truncate">
                {feature.description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0 ml-2"
            aria-label="Close modal"
          >
            <IoCloseOutline className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          {children}
        </div>

        {/* Modal Footer - Provider Badges */}
        <div className="p-3 sm:p-4 border-t border-gray-700 flex-shrink-0 bg-gray-800/50">
          <ProviderBadges providers={feature.providers} />
        </div>
      </div>
    </div>
  )
}
