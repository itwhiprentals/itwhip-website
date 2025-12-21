// app/(guest)/dashboard/components/VerificationAlert.tsx
// ✅ 3-STATE DOCUMENT VERIFICATION ALERT SYSTEM
// State 1: Not Uploaded (Yellow - Action Required)
// State 2: Uploaded, Pending Review (Blue - In Progress)
// State 3: Verified (No Alert - Success)
// ✅ UPDATED: Now checks only 2 documents (Driver's License + Selfie)

'use client'

import { useMemo } from 'react'

// ========== SVG ICONS ==========
const AlertCircle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const Clock = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const CheckCircle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const Upload = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
)

const FileText = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const Phone = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
)

// ========== TYPES ==========
interface DocumentVerificationState {
  emailVerified: boolean
  phoneVerified: boolean
  phoneNumber?: string | null
  documentsVerified: boolean
  driversLicenseUrl: string | null
  selfieUrl: string | null
}

interface VerificationAlertProps {
  verificationState: DocumentVerificationState
  onNavigate: (path: string) => void
}

type AlertState = 'NOT_UPLOADED' | 'PENDING_REVIEW' | 'VERIFIED'

interface AlertConfig {
  state: AlertState
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  bgColor: string
  borderColor: string
  buttonText: string
  buttonColor: string
  showAlert: boolean
}

// ========== MAIN COMPONENT ==========
export default function VerificationAlert({ 
  verificationState, 
  onNavigate 
}: VerificationAlertProps) {
  
  // ========== DETERMINE ALERT STATE ==========
  const alertConfig: AlertConfig = useMemo(() => {
    const { 
      documentsVerified, 
      driversLicenseUrl, 
      selfieUrl 
    } = verificationState

    // ✅ STATE 3: VERIFIED - No alert needed
    if (documentsVerified) {
      return {
        state: 'VERIFIED',
        title: '',
        description: '',
        icon: CheckCircle,
        iconColor: '',
        bgColor: '',
        borderColor: '',
        buttonText: '',
        buttonColor: '',
        showAlert: false
      }
    }

    // Check if both required documents are uploaded (2 documents only)
    const allDocsUploaded = !!(driversLicenseUrl && selfieUrl)

    // ⏳ STATE 2: UPLOADED, PENDING REVIEW
    if (allDocsUploaded && !documentsVerified) {
      return {
        state: 'PENDING_REVIEW',
        title: 'Documents Under Review',
        description: 'Your documents have been submitted and are being reviewed by our team. We\'ll notify you once verification is complete.',
        icon: Clock,
        iconColor: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        buttonText: 'View Status',
        buttonColor: 'bg-blue-600 hover:bg-blue-700',
        showAlert: true
      }
    }

    // ❌ STATE 1: NOT UPLOADED - Action required
    return {
      state: 'NOT_UPLOADED',
      title: 'Document Verification Required',
      description: 'Please upload your driver\'s license and selfie to complete your profile and unlock all features.',
      icon: AlertCircle,
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      buttonText: 'Upload Documents',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
      showAlert: true
    }
  }, [verificationState])

  // Don't render if verified
  if (!alertConfig.showAlert) {
    return null
  }

  const Icon = alertConfig.icon

  // Check if phone is missing
  const hasPhone = !!verificationState.phoneNumber

  return (
    <div
      className={`${alertConfig.bgColor} border-2 ${alertConfig.borderColor} rounded-lg p-3 sm:p-4 mt-4 transition-all duration-300 animate-fadeIn shadow-md`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start justify-between flex-wrap gap-3">
        {/* Left Section: Icon + Text */}
        <div className="flex items-start flex-1 min-w-0">
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${alertConfig.iconColor} mr-2 sm:mr-3 flex-shrink-0 mt-0.5`} />
          <div className="min-w-0 flex-1">
            <p className={`font-medium text-sm sm:text-base ${
              alertConfig.state === 'NOT_UPLOADED' 
                ? 'text-yellow-900 dark:text-yellow-100' 
                : 'text-blue-900 dark:text-blue-100'
            }`}>
              {alertConfig.title}
            </p>
            <p className={`text-xs sm:text-sm mt-1 ${
              alertConfig.state === 'NOT_UPLOADED'
                ? 'text-yellow-700 dark:text-yellow-300'
                : 'text-blue-700 dark:text-blue-300'
            }`}>
              {alertConfig.description}
            </p>

            {/* ✅ Show document checklist for NOT_UPLOADED state */}
            {alertConfig.state === 'NOT_UPLOADED' && (
              <div className="mt-3 space-y-1.5">
                {/* Phone Number */}
                <div className="flex items-center text-xs">
                  {hasPhone ? (
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-red-400 dark:border-red-500 mr-2" />
                  )}
                  <span className={hasPhone ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300 font-medium'}>
                    Phone Number {hasPhone ? '✓' : '(Required)'}
                  </span>
                </div>
                {/* Driver's License */}
                <div className="flex items-center text-xs">
                  {verificationState.driversLicenseUrl ? (
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-yellow-400 dark:border-yellow-500 mr-2" />
                  )}
                  <span className={verificationState.driversLicenseUrl ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'}>
                    Driver's License {verificationState.driversLicenseUrl && '✓'}
                  </span>
                </div>
                {/* Selfie */}
                <div className="flex items-center text-xs">
                  {verificationState.selfieUrl ? (
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-yellow-400 dark:border-yellow-500 mr-2" />
                  )}
                  <span className={verificationState.selfieUrl ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'}>
                    Selfie with License {verificationState.selfieUrl && '✓'}
                  </span>
                </div>
              </div>
            )}

            {/* ⏳ Show review timeline for PENDING_REVIEW state */}
            {alertConfig.state === 'PENDING_REVIEW' && (
              <div className="mt-3 flex items-center space-x-2 text-xs text-blue-700 dark:text-blue-300">
                <Clock className="w-4 h-4" />
                <span>Typical review time: 24-48 hours</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Action Button - Smaller size for better UX */}
        <button
          onClick={() => onNavigate('/profile?tab=documents')}
          className={`px-2.5 sm:px-3 py-1.5 sm:py-2 ${alertConfig.buttonColor} text-white rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex items-center space-x-1.5 active:scale-95 flex-shrink-0`}
          aria-label={alertConfig.buttonText}
        >
          {alertConfig.state === 'NOT_UPLOADED' ? (
            <>
              <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{alertConfig.buttonText}</span>
              <span className="sm:hidden">Upload</span>
            </>
          ) : (
            <>
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{alertConfig.buttonText}</span>
              <span className="sm:hidden">View</span>
            </>
          )}
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}