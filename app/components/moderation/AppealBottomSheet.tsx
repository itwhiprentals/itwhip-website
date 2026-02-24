// app/components/moderation/AppealBottomSheet.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import CommunityGuidelinesSheet from './CommunityGuidelinesSheet'

// SVG Icons
const XCircle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const AlertCircle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const Upload = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
)

const CheckCircle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const Trash = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const ChevronDown = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

const Clock = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const Shield = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const Ban = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
)

const Phone = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
)

// Format category names properly
function formatWarningCategory(category: string): string {
  if (!category) return 'Policy Violation'
  
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

interface AppealEligibility {
  canAppeal: boolean
  reason?: string
  appealsUsed: number
  maxAppeals: number
  remainingAppeals?: number
  existingAppeal?: any
  allAppeals?: any[]
  isCleared?: boolean
  hasDeniedAppeal?: boolean
}

interface Warning {
  id: string
  category: string | null
  reason: string
  issuedAt: string
  expiresAt?: string
  daysRemaining?: number
  appealEligibility: AppealEligibility
  hasDeniedAppeal?: boolean
}

interface ModerationInfo {
  hasActiveIssues: boolean
  accountStatus: string
  activeWarningCount: number
  totalHistoricalWarnings: number
  suspension?: {
    id: string
    level: string
    reason: string
    suspendedAt: string
    expiresAt?: string
    daysRemaining?: number
    isPermanent: boolean
    appealEligibility: AppealEligibility
  }
  warnings?: Warning[]
  restrictions: {
    canBookLuxury: boolean
    canBookPremium: boolean
    requiresManualApproval: boolean
    canInstantBook: boolean
  }
}

interface AppealBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  guestId: string
  moderationId?: string
  onSuccess?: () => void
}

// Memo shown on first-warning card — tells guest they can dismiss by reading guidelines
function GuidelinesDismissMemo({ onReadGuidelines }: { onReadGuidelines: () => void }) {
  return (
    <div className="mt-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3">
      <p className="text-xs text-green-800 dark:text-green-300 mb-2">
        <strong>First warning?</strong> You can dismiss this warning by reading and acknowledging the Community Guidelines.
      </p>
      <button
        onClick={onReadGuidelines}
        className="text-xs font-medium text-green-700 dark:text-green-300 border border-green-400 dark:border-green-600 rounded-lg px-3 py-1.5 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
      >
        Read Guidelines
      </button>
    </div>
  )
}

export default function AppealBottomSheet({ 
  isOpen, 
  onClose, 
  guestId, 
  moderationId,
  onSuccess 
}: AppealBottomSheetProps) {
  const [loading, setLoading] = useState(true)
  const [moderationInfo, setModerationInfo] = useState<ModerationInfo | null>(null)
  const [selectedModerationId, setSelectedModerationId] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [evidence, setEvidence] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [expandedWarnings, setExpandedWarnings] = useState<Set<string>>(new Set())
  const [showGuidelinesFromAppeal, setShowGuidelinesFromAppeal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      fetchModerationInfo()
      setReason('')
      setEvidence([])
      setSelectedModerationId(moderationId || null)
      setExpandedWarnings(new Set())
    }
  }, [isOpen, moderationId])

  const fetchModerationInfo = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/guest/moderation')
      
      if (response.ok) {
        const data = await response.json()
        setModerationInfo(data)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to load moderation information')
      }
    } catch (err) {
      console.error('Failed to fetch moderation info:', err)
      setError('Failed to load moderation information')
    } finally {
      setLoading(false)
    }
  }

  // ✅ FIX: Deduplicate warnings by ID
  const getDeduplicatedWarnings = (): Warning[] => {
    if (!moderationInfo?.warnings) return []
    
    const seenIds = new Set<string>()
    const uniqueWarnings: Warning[] = []
    
    for (const warning of moderationInfo.warnings) {
      if (!seenIds.has(warning.id)) {
        seenIds.add(warning.id)
        uniqueWarnings.push(warning)
      }
    }
    
    return uniqueWarnings
  }

  const toggleWarningExpanded = (warningId: string) => {
    const newExpanded = new Set(expandedWarnings)
    if (newExpanded.has(warningId)) {
      newExpanded.delete(warningId)
    } else {
      newExpanded.add(warningId)
    }
    setExpandedWarnings(newExpanded)
  }

  const handleSelectWarning = (modId: string) => {
    setSelectedModerationId(modId)
    setReason('')
    setEvidence([])
    setError(null)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (evidence.length >= 5) {
      alert('Maximum 5 files allowed')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'guest_appeals')
      formData.append('folder', 'guest_appeals')

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      )
      const data = await res.json()
      if (data.secure_url) {
        setEvidence(prev => [...prev, data.secure_url])
      } else {
        throw new Error('Upload failed')
      }
    } catch (err) {
      console.error('Evidence upload failed:', err)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeEvidence = (index: number) => {
    setEvidence(evidence.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for your appeal')
      return
    }

    if (!selectedModerationId) {
      alert('Please select which warning or suspension to appeal')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/guest/appeals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: reason.trim(),
          evidence: evidence.length > 0 ? evidence : undefined,
          moderationId: selectedModerationId
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message || 'Appeal submitted successfully!')
        setReason('')
        setEvidence([])
        setSelectedModerationId(null)
        if (onSuccess) onSuccess()
        onClose()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to submit appeal')
      }
    } catch (err) {
      console.error('Appeal submission error:', err)
      setError('Failed to submit appeal. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const getAppealStatusBadge = (eligibility: AppealEligibility) => {
    if (eligibility.reason === 'ALREADY_CLEARED') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-600 text-white">
          <CheckCircle className="w-3 h-3 mr-1" />
          Already Cleared
        </span>
      )
    }
    if (eligibility.reason === 'EXISTING_APPEAL') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white">
          <Clock className="w-3 h-3 mr-1" />
          Pending Review
        </span>
      )
    }
    if (eligibility.reason === 'LIMIT_REACHED') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-600 text-white">
          2/2 Appeals Used
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-600 text-white">
        {eligibility.appealsUsed}/2 Appeals Used
      </span>
    )
  }

  const getSpecificModeration = () => {
    if (!moderationId || !moderationInfo) return null
    
    if (moderationInfo.suspension?.id === moderationId) {
      return { type: 'suspension', data: moderationInfo.suspension }
    }
    
    // ✅ FIX: Use deduplicated warnings
    const deduplicatedWarnings = getDeduplicatedWarnings()
    const warning = deduplicatedWarnings.find(w => w.id === moderationId)
    if (warning) {
      return { type: 'warning', data: warning }
    }
    
    return null
  }

  const specificModeration = moderationId ? getSpecificModeration() : null

  // ✅ FIX: Use deduplicated warnings for display
  const displayWarnings = getDeduplicatedWarnings()

  const getModalTitle = () => {
    if (specificModeration) {
      return specificModeration.type === 'suspension' ? 'Appeal Suspension' : 'Appeal Warning'
    }
    if (moderationInfo?.accountStatus === 'BANNED') {
      return 'Account Banned'
    }
    if (moderationInfo?.accountStatus === 'SUSPENDED') {
      return 'Account Suspended'
    }
    if (moderationInfo?.accountStatus === 'WARNED') {
      return 'Account Warnings & Appeals'
    }
    return 'Account Status'
  }

  const getModalSubtitle = () => {
    if (specificModeration) {
      return 'Review the details below and submit your appeal'
    }
    if (moderationInfo?.accountStatus === 'BANNED') {
      return 'Your account has been permanently banned'
    }
    if (moderationInfo?.accountStatus === 'SUSPENDED') {
      return 'Your account is currently suspended'
    }
    if ((moderationInfo?.activeWarningCount ?? 0) > 0) {
      return `${displayWarnings.length} active warning${displayWarnings.length > 1 ? 's' : ''}`
    }
    return null
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 md:inset-0 z-50 flex md:items-center md:justify-center pointer-events-none">
        <div className="bg-white dark:bg-gray-800 w-full md:max-w-3xl md:mx-auto rounded-t-2xl md:rounded-2xl shadow-2xl pointer-events-auto max-h-[85vh] flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                {getModalTitle()}
              </h2>
              {getModalSubtitle() && (
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {getModalSubtitle()}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2"
              aria-label="Close"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
                    <button
                      onClick={fetchModerationInfo}
                      className="text-sm text-red-600 dark:text-red-400 underline hover:no-underline mt-2 font-medium"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            ) : !moderationInfo?.hasActiveIssues ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                  Account in Good Standing
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your account has no active warnings or restrictions.
                </p>
              </div>
            ) : (
              <>
                {specificModeration ? (
                  <>
                    {specificModeration.type === 'suspension' && (
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-400 dark:border-orange-600 rounded-xl shadow-md overflow-hidden">
                        <div className="p-4 md:p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
                                  <Shield className="w-5 h-5 text-orange-700 dark:text-orange-400" />
                                </div>
                                <h3 className="text-base md:text-lg font-bold text-orange-900 dark:text-orange-100">
                                  {(specificModeration.data as any).level === 'HARD' ? 'Hard Suspension' : 'Soft Suspension'}
                                </h3>
                              </div>
                              <p className="text-sm text-orange-800 dark:text-orange-200 mb-3 leading-relaxed">
                                {specificModeration.data.reason}
                              </p>
                              <div className="flex items-center gap-3 flex-wrap">
                                {specificModeration.data.daysRemaining && (
                                  <span className="inline-flex items-center text-xs font-semibold text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/40 px-3 py-1 rounded-full">
                                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                                    {specificModeration.data.daysRemaining} days remaining
                                  </span>
                                )}
                                {getAppealStatusBadge(specificModeration.data.appealEligibility)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {specificModeration.type === 'warning' && (
                      <div className="bg-white dark:bg-gray-700 border border-yellow-400 md:border-2 dark:border-yellow-600 rounded-xl shadow-sm md:shadow-md overflow-hidden">
                        <div className="p-3 md:p-5">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5 md:mb-2">
                                <div className="p-1.5 md:p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg">
                                  <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-yellow-700 dark:text-yellow-400" />
                                </div>
                                <h4 className="font-bold text-gray-900 dark:text-white text-xs md:text-base">
                                  {formatWarningCategory((specificModeration.data as any).category || 'Policy Violation')}
                                </h4>
                              </div>
                              <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 mb-2 md:mb-3 leading-relaxed">
                                {specificModeration.data.reason}
                              </p>
                              <div className="flex items-center gap-3 flex-wrap">
                                {specificModeration.data.daysRemaining !== null && specificModeration.data.daysRemaining !== undefined && (
                                  <span className="inline-flex items-center text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 px-3 py-1 rounded-full">
                                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                                    {specificModeration.data.daysRemaining} days left
                                  </span>
                                )}
                                {getAppealStatusBadge(specificModeration.data.appealEligibility)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* BANNED CARD */}
                    {moderationInfo.accountStatus === 'BANNED' && moderationInfo.suspension && (
                      <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30 border-2 border-red-500 dark:border-red-600 rounded-xl shadow-md overflow-hidden">
                        <div className="p-4 md:p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
                                  <Ban className="w-5 h-5 text-red-700 dark:text-red-400" />
                                </div>
                                <h3 className="text-base md:text-lg font-bold text-red-900 dark:text-red-100">
                                  Permanently Banned
                                </h3>
                              </div>
                              <p className="text-sm text-red-800 dark:text-red-200 mb-3 leading-relaxed">
                                {moderationInfo.suspension.reason}
                              </p>
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="inline-flex items-center text-xs font-semibold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/40 px-3 py-1 rounded-full">
                                  <Ban className="w-3.5 h-3.5 mr-1.5" />
                                  Permanent Ban
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 p-3 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-700 rounded-lg">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">
                              Permanent bans cannot be appealed through the standard process. Please contact support for assistance.
                            </p>
                            <a 
                              href="/support"
                              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
                            >
                              <Phone className="w-4 h-4" />
                              Contact Support
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SUSPENSION CARD */}
                    {moderationInfo.accountStatus === 'SUSPENDED' && moderationInfo.suspension && (
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-400 dark:border-orange-600 rounded-xl shadow-md overflow-hidden">
                        <div className="p-4 md:p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
                                  <Shield className="w-5 h-5 text-orange-700 dark:text-orange-400" />
                                </div>
                                <h3 className="text-base md:text-lg font-bold text-orange-900 dark:text-orange-100">
                                  {moderationInfo.suspension.level === 'HARD' ? 'Hard Suspension' : 'Soft Suspension'}
                                </h3>
                              </div>
                              <p className="text-sm text-orange-800 dark:text-orange-200 mb-3 leading-relaxed">
                                {moderationInfo.suspension.reason}
                              </p>
                              <div className="flex items-center gap-3 flex-wrap">
                                {moderationInfo.suspension.daysRemaining && (
                                  <span className="inline-flex items-center text-xs font-semibold text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/40 px-3 py-1 rounded-full">
                                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                                    {moderationInfo.suspension.daysRemaining} days remaining
                                  </span>
                                )}
                                {getAppealStatusBadge(moderationInfo.suspension.appealEligibility)}
                              </div>
                            </div>
                          </div>

                          {moderationInfo.suspension.appealEligibility.canAppeal && (
                            <button
                              onClick={() => handleSelectWarning(moderationInfo.suspension!.id)}
                              className={`w-full px-4 py-3 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                                selectedModerationId === moderationInfo.suspension.id
                                  ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-md'
                                  : 'bg-white dark:bg-gray-700 text-orange-700 dark:text-orange-300 border-2 border-orange-400 dark:border-orange-600 hover:bg-orange-50 dark:hover:bg-gray-600'
                              }`}
                            >
                              {selectedModerationId === moderationInfo.suspension.id ? '✓ Selected for Appeal' : 'Appeal This Suspension'}
                            </button>
                          )}

                          {moderationInfo.suspension.appealEligibility.reason === 'EXISTING_APPEAL' && (
                            <div className="mt-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                              <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
                                <Clock className="w-3.5 h-3.5 inline mr-1" />
                                Your appeal is under review. We'll notify you within 24-48 hours.
                              </p>
                            </div>
                          )}

                          <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <p className="text-[10px] text-gray-600 dark:text-gray-400">
                              Note: Active warnings are hidden while your account is suspended.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* WARNINGS SECTION - ✅ Using deduplicated warnings */}
                    {moderationInfo.accountStatus === 'WARNED' && displayWarnings.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                            Active Warnings
                          </h3>
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full">
                            {displayWarnings.length} warning{displayWarnings.length > 1 ? 's' : ''}
                          </span>
                        </div>

                        {displayWarnings.map((warning) => (
                          <div
                            key={warning.id}
                            className="bg-white dark:bg-gray-700 border border-yellow-400 md:border-2 dark:border-yellow-600 rounded-xl shadow-sm md:shadow-md overflow-hidden hover:shadow-md md:hover:shadow-lg transition-shadow"
                          >
                            <div className="p-3 md:p-5">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1.5 md:mb-2">
                                    <div className="p-1.5 md:p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg">
                                      <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-yellow-700 dark:text-yellow-400" />
                                    </div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-xs md:text-base">
                                      {formatWarningCategory(warning.category || 'Policy Violation')}
                                    </h4>
                                  </div>
                                  <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 mb-2 md:mb-3 leading-relaxed">
                                    {warning.reason}
                                  </p>
                                  <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                                    {warning.daysRemaining !== null && warning.daysRemaining !== undefined && (
                                      <span className="inline-flex items-center text-[10px] md:text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 px-2 md:px-3 py-0.5 md:py-1 rounded-full">
                                        <Clock className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1 md:mr-1.5" />
                                        {warning.daysRemaining} days left
                                      </span>
                                    )}
                                    {getAppealStatusBadge(warning.appealEligibility)}
                                  </div>
                                </div>

                                <button
                                  onClick={() => toggleWarningExpanded(warning.id)}
                                  className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                >
                                  <ChevronDown
                                    className={`w-4 h-4 md:w-5 md:h-5 transition-transform ${
                                      expandedWarnings.has(warning.id) ? 'rotate-180' : ''
                                    }`}
                                  />
                                </button>
                              </div>

                              {expandedWarnings.has(warning.id) && (
                                <div className="mt-4 pt-4 border-t-2 border-gray-200 dark:border-gray-600">
                                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">
                                    <strong className="text-gray-900 dark:text-white">Issued:</strong>{' '}
                                    {new Date(warning.issuedAt).toLocaleDateString('en-US', { 
                                      month: 'long', 
                                      day: 'numeric', 
                                      year: 'numeric' 
                                    })}
                                  </p>
                                  
                                  {warning.appealEligibility.allAppeals && warning.appealEligibility.allAppeals.length > 0 && (
                                    <div className="bg-gray-50 dark:bg-gray-600 rounded-lg p-3">
                                      <p className="text-xs font-bold text-gray-900 dark:text-white mb-2">
                                        Appeal History:
                                      </p>
                                      <div className="space-y-2">
                                        {warning.appealEligibility.allAppeals.map((appeal: any, idx: number) => (
                                          <div key={appeal.id} className="flex items-start gap-2 text-xs">
                                            <span className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                                              appeal.status === 'APPROVED' ? 'bg-green-500' :
                                              appeal.status === 'DENIED' ? 'bg-red-500' :
                                              'bg-blue-500'
                                            }`} />
                                            <span className="text-gray-700 dark:text-gray-300">
                                              <strong className="text-gray-900 dark:text-white">Appeal #{idx + 1}:</strong>{' '}
                                              {appeal.status}
                                              {appeal.reviewedAt && ` on ${new Date(appeal.reviewedAt).toLocaleDateString()}`}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {warning.appealEligibility.canAppeal && (
                                <button
                                  onClick={() => handleSelectWarning(warning.id)}
                                  className={`mt-3 md:mt-4 w-full px-4 py-2.5 md:py-3 rounded-lg text-xs md:text-sm font-semibold transition-all shadow-sm ${
                                    selectedModerationId === warning.id
                                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-md'
                                      : 'bg-white dark:bg-gray-600 text-yellow-700 dark:text-yellow-300 border border-yellow-400 md:border-2 dark:border-yellow-600 hover:bg-yellow-50 dark:hover:bg-gray-500'
                                  }`}
                                >
                                  {selectedModerationId === warning.id ? '✓ Selected for Appeal' : 'Appeal This Warning'}
                                </button>
                              )}

                              {/* Guidelines dismiss memo — only for first warning */}
                              {displayWarnings.length === 1 && (
                                <GuidelinesDismissMemo onReadGuidelines={() => setShowGuidelinesFromAppeal(true)} />
                              )}

                              {warning.appealEligibility.reason === 'EXISTING_APPEAL' && (
                                <div className="mt-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                                  <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
                                    <Clock className="w-3.5 h-3.5 inline mr-1" />
                                    Your appeal is under review. We'll notify you within 24-48 hours.
                                  </p>
                                </div>
                              )}

                              {warning.appealEligibility.reason === 'LIMIT_REACHED' && (
                                <div className="mt-3 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg p-3">
                                  <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
                                    Both appeal attempts used (2/2).{' '}
                                    <a href="/support" className="text-blue-600 dark:text-blue-400 underline hover:no-underline font-semibold">
                                      Contact Support
                                    </a>
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* APPEAL FORM */}
                {selectedModerationId && moderationInfo.accountStatus !== 'BANNED' && (
                  <div className="space-y-3 md:space-y-4">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                      Submit Your Appeal
                    </h3>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Your Appeal *
                      </label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white resize-none text-sm"
                        rows={4}
                        placeholder="Explain why you believe this action should be reconsidered. Be specific and provide details that support your case."
                        disabled={submitting}
                        maxLength={2000}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                        {reason.length} / 2,000
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Supporting Evidence (Optional)
                      </label>

                      {evidence.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {evidence.map((url, index) => (
                            <div key={index} className="relative">
                              <img
                                src={url}
                                alt={`Evidence ${index + 1}`}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                              <button
                                onClick={() => removeEvidence(index)}
                                disabled={submitting}
                                className="absolute -top-1.5 -right-1.5 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 rounded-full w-5 h-5 flex items-center justify-center text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {evidence.length < 5 && (
                        <>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={submitting || uploading}
                            className="hidden"
                          />
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={submitting || uploading}
                            className="w-full px-4 py-2.5 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors text-sm"
                          >
                            <div className="flex items-center justify-center text-gray-500 dark:text-gray-400">
                              <Upload className="w-4 h-4 mr-2" />
                              <span>{uploading ? 'Uploading...' : `Upload Photo (${evidence.length}/5)`}</span>
                            </div>
                          </button>
                        </>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Each action allows 2 appeal attempts. Appeals are typically reviewed within 24-48 hours.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {!loading && !error && moderationInfo?.hasActiveIssues && selectedModerationId && moderationInfo.accountStatus !== 'BANNED' && (
            <div className="border-t-2 border-gray-200 dark:border-gray-700 p-4 md:p-6 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedModerationId(null)}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !reason.trim()}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                >
                  {submitting ? 'Submitting...' : 'Submit Appeal'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Guidelines sheet opened from within appeal sheet */}
      <CommunityGuidelinesSheet
        isOpen={showGuidelinesFromAppeal}
        onClose={() => setShowGuidelinesFromAppeal(false)}
        canAcknowledge={true}
        guestId={guestId}
        onAcknowledge={() => {
          setShowGuidelinesFromAppeal(false)
          onClose()
          if (onSuccess) onSuccess()
        }}
      />
    </>
  )
}