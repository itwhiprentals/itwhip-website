// app/host/dashboard/components/ClaimBanner.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'

// SVG Icons (matching guest style)
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

const XCircle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const CloseIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const UserX = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
  </svg>
)

interface ClaimNotification {
  id: string
  type: 'CLAIM_FILED' | 'CLAIM_APPROVED' | 'CLAIM_REJECTED' | 'GUEST_RESPONSE' | 'GUEST_NO_RESPONSE'
  claimId: string
  bookingCode: string
  guestName?: string
  message: string
  actionUrl?: string
  createdAt: string
  metadata?: {
    reviewNotes?: string
    rejectionReason?: string
    responseDeadline?: string
    guestResponse?: string
    estimatedCost?: number
  }
}

interface ClaimBannerProps {
  notification: ClaimNotification
  onDismiss: (notificationId: string) => void
}

export default function ClaimBanner({ notification, onDismiss }: ClaimBannerProps) {
  const [isDismissing, setIsDismissing] = useState(false)

  const handleDismiss = async () => {
    setIsDismissing(true)
    try {
      await onDismiss(notification.id)
    } catch (error) {
      console.error('Error dismissing notification:', error)
    } finally {
      setIsDismissing(false)
    }
  }

  // Calculate time remaining for guest response
  const calculateTimeRemaining = () => {
    if (notification.metadata?.responseDeadline) {
      const deadline = new Date(notification.metadata.responseDeadline)
      const now = new Date()
      const diff = deadline.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      if (hours <= 0 && minutes <= 0) return 'Expired'
      if (hours > 0) return `${hours}h ${minutes}m remaining`
      return `${minutes}m remaining`
    }
    return null
  }

  // Get banner styling based on notification type
  const getBannerStyle = () => {
    switch (notification.type) {
      case 'CLAIM_FILED':
        return {
          bgColor: 'bg-blue-50 dark:bg-blue-900/10',
          borderColor: 'border-blue-200 dark:border-blue-800',
          iconColor: 'text-blue-600 dark:text-blue-400',
          textColor: 'text-blue-900 dark:text-blue-100',
          icon: Clock
        }
      case 'CLAIM_APPROVED':
        return {
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/10',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          textColor: 'text-yellow-900 dark:text-yellow-100',
          icon: AlertCircle
        }
      case 'CLAIM_REJECTED':
        return {
          bgColor: 'bg-red-50 dark:bg-red-900/10',
          borderColor: 'border-red-200 dark:border-red-800',
          iconColor: 'text-red-600 dark:text-red-400',
          textColor: 'text-red-900 dark:text-red-100',
          icon: XCircle
        }
      case 'GUEST_RESPONSE':
        return {
          bgColor: 'bg-green-50 dark:bg-green-900/10',
          borderColor: 'border-green-200 dark:border-green-800',
          iconColor: 'text-green-600 dark:text-green-400',
          textColor: 'text-green-900 dark:text-green-100',
          icon: CheckCircle
        }
      case 'GUEST_NO_RESPONSE':
        return {
          bgColor: 'bg-orange-50 dark:bg-orange-900/10',
          borderColor: 'border-orange-200 dark:border-orange-800',
          iconColor: 'text-orange-600 dark:text-orange-400',
          textColor: 'text-orange-900 dark:text-orange-100',
          icon: UserX
        }
      default:
        return {
          bgColor: 'bg-gray-50 dark:bg-gray-900/10',
          borderColor: 'border-gray-200 dark:border-gray-800',
          iconColor: 'text-gray-600 dark:text-gray-400',
          textColor: 'text-gray-900 dark:text-gray-100',
          icon: AlertCircle
        }
    }
  }

  const style = getBannerStyle()
  const Icon = style.icon
  const timeRemaining = notification.type === 'CLAIM_APPROVED' ? calculateTimeRemaining() : null

  return (
    <div className={`${style.bgColor} border ${style.borderColor} rounded-lg p-3 mb-6`}>
      <div className="flex items-start gap-3">
        <Icon className={`${style.iconColor} ${style.icon === Clock ? 'animate-pulse' : ''} w-5 h-5 flex-shrink-0 mt-0.5`} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-semibold ${style.textColor}`}>
                {notification.type === 'CLAIM_FILED' && 'Insurance Claim Under Review'}
                {notification.type === 'CLAIM_APPROVED' && 'Claim Approved - Guest Response Pending'}
                {notification.type === 'CLAIM_REJECTED' && 'Claim Rejected'}
                {notification.type === 'GUEST_RESPONSE' && 'Guest Response Received'}
                {notification.type === 'GUEST_NO_RESPONSE' && 'Guest Failed to Respond'}
              </h3>
              
              <p className={`mt-1 text-sm ${style.textColor} opacity-90`}>
                {notification.message}
              </p>

              {/* Time remaining for guest response */}
              {timeRemaining && (
                <div className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${
                  timeRemaining === 'Expired' ? 'text-red-600' : style.iconColor
                }`}>
                  <Clock className="w-3 h-3" />
                  {timeRemaining}
                </div>
              )}

              {/* Action button */}
              {notification.actionUrl && (
                <div className="mt-2.5">
                  <Link
                    href={notification.actionUrl}
                    className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      notification.type === 'GUEST_RESPONSE' 
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : `bg-white dark:bg-gray-800 ${style.textColor} border ${style.borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                    }`}
                  >
                    View Claim Details
                    <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>

            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              disabled={isDismissing}
              className={`flex-shrink-0 p-1 rounded hover:bg-white/50 dark:hover:bg-gray-800/50 ${style.iconColor} hover:${style.textColor} disabled:opacity-50 transition-colors`}
              aria-label="Dismiss notification"
            >
              {isDismissing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
              ) : (
                <CloseIcon />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}