// app/host/cars/[id]/components/ComplianceWarningBanner.tsx

'use client'

import { useState } from 'react'
import { IoWarningOutline, IoAlertCircleOutline } from 'react-icons/io5'
import { getGapSeverity } from '@/app/lib/compliance/declaration-helpers'
import type { DeclarationType } from '@/app/types/compliance'
import UpdateDeclarationModal from './UpdateDeclarationModal'

interface ActiveClaim {
  id: string
  type: string
  status: string
  createdAt: string
  estimatedCost?: number
}

interface ComplianceWarningBannerProps {
  carId: string
  declaration: DeclarationType
  actualAvgGap: number
  allowedGap: number
  hasActiveClaim: boolean
  activeClaim?: ActiveClaim
  earningsTier: number
  insuranceType: string
  onSuccess: () => void
}

export default function ComplianceWarningBanner({
  carId,
  declaration,
  actualAvgGap,
  allowedGap,
  hasActiveClaim,
  activeClaim,
  earningsTier,
  insuranceType,
  onSuccess
}: ComplianceWarningBannerProps) {
  const [showModal, setShowModal] = useState(false)
  
  const severity = getGapSeverity(actualAvgGap, declaration)
  const exceedsBy = Math.round(actualAvgGap - allowedGap)
  
  const isCritical = severity === 'CRITICAL' || severity === 'VIOLATION'
  
  const bgClass = isCritical 
    ? 'bg-red-50 dark:bg-red-900/20' 
    : 'bg-yellow-50 dark:bg-yellow-900/20'
  
  const borderClass = isCritical
    ? 'border-red-200 dark:border-red-800'
    : 'border-yellow-200 dark:border-yellow-800'
  
  const textClass = isCritical
    ? 'text-red-800 dark:text-red-300'
    : 'text-yellow-800 dark:text-yellow-300'
  
  const subTextClass = isCritical
    ? 'text-red-700 dark:text-red-400'
    : 'text-yellow-700 dark:text-yellow-400'

  const StatusIcon = isCritical ? IoAlertCircleOutline : IoWarningOutline

  return (
    <>
      <div className={`${bgClass} border ${borderClass} rounded-xl p-4 md:p-5 mb-4 md:mb-6`}>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
          <div className="flex items-start gap-3 flex-1">
            <StatusIcon className={`w-5 h-5 md:w-6 md:h-6 ${textClass} flex-shrink-0 mt-0.5`} />
            
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm md:text-base font-semibold ${textClass} mb-1`}>
                {isCritical ? 'Critical Non-Compliance' : 'Usage Compliance Warning'}
              </h3>
              
              <p className={`text-xs md:text-sm ${subTextClass} mb-2`}>
                Your average mileage gap of <span className="font-semibold">{Math.round(actualAvgGap)} miles</span> exceeds 
                the <span className="font-semibold">{allowedGap}-mile limit</span> for "{declaration}" mode 
                by <span className="font-semibold">{exceedsBy} miles</span>.
              </p>
              
              <p className={`text-xs ${subTextClass}`}>
                {isCritical ? (
                  <>
                    <span className="font-medium">Claim Risk:</span> Insurance claims may be denied if mileage gaps suggest 
                    personal use during declared rental-only periods. Update your declaration to match actual usage.
                  </>
                ) : (
                  <>
                    <span className="font-medium">Impact:</span> Current usage may affect claim approval. 
                    Consider updating your declaration to match actual vehicle use.
                  </>
                )}
              </p>
            </div>
          </div>
          
          {/* Button - Always Enabled (will show lock screen in modal if needed) */}
          <button
            onClick={() => setShowModal(true)}
            className={`w-full md:w-auto px-4 py-2 rounded-lg font-medium text-sm transition-colors flex-shrink-0 ${
              isCritical
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
            }`}
          >
            Update Declaration
          </button>
        </div>
        
        <div className={`mt-3 pt-3 border-t ${borderClass} md:hidden`}>
          <p className={`text-xs ${subTextClass} flex items-center gap-1.5`}>
            <span className="font-medium">Note:</span>
            <span>Earnings tier (based on insurance) will not change.</span>
          </p>
        </div>
      </div>

      {/* Modal - Will show lock screen if hasActiveClaim is true */}
      {showModal && (
        <UpdateDeclarationModal
          carId={carId}
          currentDeclaration={declaration}
          actualAvgGap={actualAvgGap}
          earningsTier={earningsTier}
          insuranceType={insuranceType as any}
          hasActiveClaim={hasActiveClaim}
          activeClaim={activeClaim}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            onSuccess()
          }}
        />
      )}
    </>
  )
}