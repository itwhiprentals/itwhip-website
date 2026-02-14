// app/(guest)/profile/components/InsuranceHistoryLog.tsx
// ✅ INSURANCE HISTORY TIMELINE - Complete audit trail of all insurance changes
// Shows: ADDED, UPDATED, REMOVED, VERIFIED, EXPIRED with status badges

'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { 
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
  IoShieldCheckmarkOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoCalendarOutline,
  IoDocumentTextOutline,
  IoPersonOutline
} from 'react-icons/io5'

interface InsuranceHistoryEntry {
  id: string
  action: string // ADDED, UPDATED, REMOVED, VERIFIED, EXPIRED
  status: string // ACTIVE, NOT_ACTIVE, EXPIRED, PENDING
  provider: string | null
  policyNumber: string | null
  expiryDate: string | null
  hasRideshare: boolean
  coverageType: string | null
  customCoverage: string | null
  cardFrontUrl: string | null
  cardBackUrl: string | null
  notes: string | null
  verificationStatus: string // UNVERIFIED, PENDING, VERIFIED
  verifiedBy: string | null
  verifiedAt: string | null
  changedBy: string
  changedAt: string
  changeReason: string | null
}

interface InsuranceHistoryLogProps {
  history: InsuranceHistoryEntry[]
  loading?: boolean
}

export default function InsuranceHistoryLog({ history, loading }: InsuranceHistoryLogProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const t = useTranslations('InsuranceHistoryLog')
  const locale = useLocale()

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'ADDED':
        return <IoDocumentTextOutline className="w-5 h-5" />
      case 'UPDATED':
        return <IoTimeOutline className="w-5 h-5" />
      case 'REMOVED':
        return <IoCloseCircleOutline className="w-5 h-5" />
      case 'VERIFIED':
        return <IoCheckmarkCircleOutline className="w-5 h-5" />
      case 'EXPIRED':
        return <IoAlertCircleOutline className="w-5 h-5" />
      default:
        return <IoTimeOutline className="w-5 h-5" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'ADDED':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
      case 'UPDATED':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
      case 'REMOVED':
        return 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
      case 'VERIFIED':
        return 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
      case 'EXPIRED':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
            <IoCheckmarkCircleOutline className="w-3 h-3 mr-1" />
            {t('statusActive')}
          </span>
        )
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
            <IoTimeOutline className="w-3 h-3 mr-1" />
            {t('statusPending')}
          </span>
        )
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
            <IoAlertCircleOutline className="w-3 h-3 mr-1" />
            {t('statusExpired')}
          </span>
        )
      case 'NOT_ACTIVE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
            <IoCloseCircleOutline className="w-3 h-3 mr-1" />
            {t('statusNotActive')}
          </span>
        )
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCoverageLabel = (coverageType: string | null, customCoverage: string | null) => {
    if (!coverageType) return t('na')

    const labels: Record<string, string> = {
      'state_minimum': t('coverageStateMinimum'),
      'basic': t('coverageBasic'),
      'standard': t('coverageStandard'),
      'premium': t('coveragePremium'),
      'custom': customCoverage || t('coverageCustom')
    }

    return labels[coverageType] || coverageType
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="flex space-x-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <IoTimeOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">{t('noHistory')}</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
          {t('addInsuranceToStart')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Timeline Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('title')}
        </h3>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {t('entryCount', { count: history.length })}
        </span>
      </div>

      {/* Timeline */}
      <div className="relative">
        
        {/* Vertical Line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

        {/* Timeline Entries */}
        <div className="space-y-6">
          {history.map((entry, index) => {
            const isExpanded = expandedId === entry.id
            const isLast = index === history.length - 1

            return (
              <div key={entry.id} className="relative pl-12">
                
                {/* Timeline Dot */}
                <div className={`absolute left-0 w-10 h-10 rounded-full flex items-center justify-center ${getActionColor(entry.action)}`}>
                  {getActionIcon(entry.action)}
                </div>

                {/* Content Card */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
                  
                  {/* Header - Always Visible */}
                  <div 
                    onClick={() => toggleExpand(entry.id)}
                    className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {entry.action.charAt(0) + entry.action.slice(1).toLowerCase()}
                          </span>
                          {getStatusBadge(entry.status)}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <IoCalendarOutline className="w-4 h-4" />
                            <span>{formatDate(entry.changedAt)}</span>
                          </div>
                          
                          {entry.provider && (
                            <div className="flex items-center space-x-1">
                              <IoShieldCheckmarkOutline className="w-4 h-4" />
                              <span>{entry.provider}</span>
                            </div>
                          )}
                        </div>

                        {entry.changeReason && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                            {entry.changeReason}
                          </p>
                        )}
                      </div>

                      <button className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        {isExpanded ? (
                          <IoChevronUpOutline className="w-5 h-5" />
                        ) : (
                          <IoChevronDownOutline className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="pt-4 space-y-3">
                        
                        {/* Insurance Details */}
                        {entry.provider && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('provider')}</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {entry.provider}
                              </p>
                            </div>

                            {entry.policyNumber && (
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('policyNumber')}</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                                  {entry.policyNumber}
                                </p>
                              </div>
                            )}

                            {entry.expiryDate && (
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('expiryDate')}</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {new Date(entry.expiryDate).toLocaleDateString(locale, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            )}

                            {entry.coverageType && (
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('coverageType')}</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {getCoverageLabel(entry.coverageType, entry.customCoverage)}
                                </p>
                              </div>
                            )}

                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('rideshare')}</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {entry.hasRideshare ? t('yes') : t('no')}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('verificationStatus')}</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {entry.verificationStatus.charAt(0) + entry.verificationStatus.slice(1).toLowerCase()}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Verification Info */}
                        {entry.verifiedBy && entry.verifiedAt && (
                          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <div className="flex items-start space-x-2">
                              <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                  {t('verifiedByAdmin')}
                                </p>
                                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                                  {t('verifiedByOn', { name: entry.verifiedBy, date: formatDate(entry.verifiedAt) })}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {entry.notes && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('notes')}</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                              {entry.notes}
                            </p>
                          </div>
                        )}

                        {/* Insurance Card Images */}
                        {(entry.cardFrontUrl || entry.cardBackUrl) && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('cardImages')}</p>
                            <div className="grid grid-cols-2 gap-2">
                              {entry.cardFrontUrl && (
                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                  <img
                                    src={entry.cardFrontUrl}
                                    alt="Insurance card front"
                                    className="w-full h-32 object-cover"
                                  />
                                  <p className="text-xs text-center text-gray-600 dark:text-gray-400 py-1 bg-gray-50 dark:bg-gray-700">
                                    {t('front')}
                                  </p>
                                </div>
                              )}
                              {entry.cardBackUrl && (
                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                  <img
                                    src={entry.cardBackUrl}
                                    alt="Insurance card back"
                                    className="w-full h-32 object-cover"
                                  />
                                  <p className="text-xs text-center text-gray-600 dark:text-gray-400 py-1 bg-gray-50 dark:bg-gray-700">
                                    {t('back')}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Change Metadata */}
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <IoPersonOutline className="w-4 h-4" />
                              <span>{t('changedBy', { name: entry.changedBy })}</span>
                            </div>
                            <span>ID: {entry.id.slice(0, 8)}</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                </div>

              </div>
            )
          })}
        </div>

      </div>

    </div>
  )
}