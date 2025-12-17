// app/host/components/PendingBanner.tsx
'use client'

import { useState } from 'react'
import { 
  IoWarningOutline,
  IoInformationCircleOutline,
  IoCloseOutline,
  IoTimeOutline,
  IoDocumentTextOutline,
  IoLockClosedOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5'

interface PendingBannerProps {
  approvalStatus: 'PENDING' | 'NEEDS_ATTENTION' | 'SUSPENDED' | 'REJECTED'
  page: 'dashboard' | 'cars' | 'bookings' | 'earnings' | 'profile'
  pendingActions?: string[]
  restrictionReasons?: string[]
  estimatedApprovalTime?: string
  onActionClick?: () => void
  dismissible?: boolean
}

export default function PendingBanner({
  approvalStatus,
  page,
  pendingActions = [],
  restrictionReasons = [],
  estimatedApprovalTime = '2-3 business days',
  onActionClick,
  dismissible = false
}: PendingBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) return null

  // Determine banner configuration based on status and page
  const getBannerConfig = () => {
    switch (approvalStatus) {
      case 'PENDING':
        return getPendingConfig()
      case 'NEEDS_ATTENTION':
        return getNeedsAttentionConfig()
      case 'SUSPENDED':
        return getSuspendedConfig()
      case 'REJECTED':
        return getRejectedConfig()
      default:
        return null
    }
  }

  const getPendingConfig = () => {
    const configs: Record<string, any> = {
      dashboard: {
        icon: IoTimeOutline,
        iconColor: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        title: 'Account Pending',
        message: 'Your application is under review. We\'ll email you once approved (typically 2-3 business days).',
        action: null,
        showProgress: false
      },
      cars: {
        icon: IoLockClosedOutline,
        iconColor: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        title: 'Listing Restricted',
        message: 'You cannot add vehicles until your account is approved. Your application is currently under review.',
        action: {
          label: 'View Status',
          url: '/host/dashboard'
        },
        showProgress: true
      },
      bookings: {
        icon: IoInformationCircleOutline,
        iconColor: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        title: 'Booking Access Restricted',
        message: 'You\'ll be able to manage bookings once your account is approved and you list your first vehicle.',
        action: {
          label: 'Check Verification Status',
          url: '/host/dashboard'
        },
        showProgress: true
      },
      earnings: {
        icon: IoInformationCircleOutline,
        iconColor: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        title: 'Earnings Dashboard Preview',
        message: 'This is a preview of your future earnings dashboard. Start earning once your account is approved!',
        action: null,
        showProgress: true
      },
      profile: {
        icon: IoTimeOutline,
        iconColor: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        title: 'Account Pending',
        message: 'Some fields are locked until your account is approved.',
        action: null,
        showProgress: false
      }
    }

    return configs[page] || configs.dashboard
  }

  const getNeedsAttentionConfig = () => {
    const configs: Record<string, any> = {
      dashboard: {
        icon: IoWarningOutline,
        iconColor: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        borderColor: 'border-orange-200 dark:border-orange-800',
        title: 'Action Required',
        message: `Please complete ${pendingActions.length} pending action(s) to continue your verification.`,
        action: {
          label: 'View Required Actions',
          url: '/host/profile'
        },
        showProgress: false,
        urgent: true
      },
      cars: {
        icon: IoWarningOutline,
        iconColor: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        borderColor: 'border-orange-200 dark:border-orange-800',
        title: 'Cannot List Vehicles',
        message: 'Action required on your account. Complete pending tasks to unlock vehicle listing.',
        action: {
          label: 'Complete Verification',
          url: '/host/dashboard'
        },
        showProgress: false,
        urgent: true
      },
      bookings: {
        icon: IoWarningOutline,
        iconColor: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        borderColor: 'border-orange-200 dark:border-orange-800',
        title: 'Access Restricted',
        message: 'Complete your account verification to access booking management.',
        action: {
          label: 'Complete Tasks',
          url: '/host/dashboard'
        },
        showProgress: false,
        urgent: true
      },
      earnings: {
        icon: IoWarningOutline,
        iconColor: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        borderColor: 'border-orange-200 dark:border-orange-800',
        title: 'Earnings Restricted',
        message: 'Complete your verification to start earning and access payout options.',
        action: {
          label: 'Finish Verification',
          url: '/host/dashboard'
        },
        showProgress: false,
        urgent: true
      },
      profile: {
        icon: IoWarningOutline,
        iconColor: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        borderColor: 'border-orange-200 dark:border-orange-800',
        title: 'Additional Information Required',
        message: 'Please address the following items to complete your verification.',
        action: null,
        showProgress: false,
        urgent: true
      }
    }

    return configs[page] || configs.dashboard
  }

  const getSuspendedConfig = () => {
    const configs: Record<string, any> = {
      dashboard: {
        icon: IoWarningOutline,
        iconColor: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        title: 'Account Suspended',
        message: restrictionReasons.length > 0 
          ? `Your account has been suspended: ${restrictionReasons.join(', ')}`
          : 'Your account has been suspended. Please contact support for more information.',
        action: {
          label: 'Contact Support',
          url: '/contact'
        },
        showProgress: false,
        urgent: true
      },
      cars: {
        icon: IoLockClosedOutline,
        iconColor: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        title: 'All Vehicles Deactivated',
        message: 'Your account is suspended. All vehicle listings have been deactivated.',
        action: {
          label: 'Contact Support',
          url: '/contact'
        },
        showProgress: false,
        urgent: true
      },
      bookings: {
        icon: IoLockClosedOutline,
        iconColor: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        title: 'Booking Access Suspended',
        message: 'Your account is suspended. Contact support to resolve this issue.',
        action: {
          label: 'Contact Support',
          url: '/contact'
        },
        showProgress: false,
        urgent: true
      },
      earnings: {
        icon: IoLockClosedOutline,
        iconColor: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        title: 'Payouts Suspended',
        message: 'Your account is suspended. No new payouts will be processed.',
        action: {
          label: 'Contact Support',
          url: '/contact'
        },
        showProgress: false,
        urgent: true
      },
      profile: {
        icon: IoWarningOutline,
        iconColor: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        title: 'Account Suspended',
        message: 'Your profile is locked due to account suspension.',
        action: {
          label: 'Contact Support',
          url: '/contact'
        },
        showProgress: false,
        urgent: true
      }
    }

    return configs[page] || configs.dashboard
  }

  const getRejectedConfig = () => {
    const configs: Record<string, any> = {
      dashboard: {
        icon: IoCloseOutline,
        iconColor: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        title: 'Application Not Approved',
        message: 'Your host application was not approved. Review the reasons and reapply when ready.',
        action: {
          label: 'View Reasons',
          url: '/host/profile'
        },
        showProgress: false,
        urgent: true
      },
      cars: {
        icon: IoLockClosedOutline,
        iconColor: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        title: 'Cannot List Vehicles',
        message: 'Your application was not approved. You cannot list vehicles at this time.',
        action: {
          label: 'Learn More',
          url: '/host/dashboard'
        },
        showProgress: false,
        urgent: true
      },
      bookings: {
        icon: IoLockClosedOutline,
        iconColor: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        title: 'Access Unavailable',
        message: 'Your application was not approved. Bookings are not available.',
        action: {
          label: 'View Status',
          url: '/host/dashboard'
        },
        showProgress: false,
        urgent: true
      },
      earnings: {
        icon: IoLockClosedOutline,
        iconColor: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        title: 'Earnings Unavailable',
        message: 'Your application was not approved. Earnings features are unavailable.',
        action: {
          label: 'View Status',
          url: '/host/dashboard'
        },
        showProgress: false,
        urgent: true
      },
      profile: {
        icon: IoInformationCircleOutline,
        iconColor: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        title: 'Application Not Approved',
        message: 'Review the rejection reasons below and address the issues to reapply.',
        action: null,
        showProgress: false,
        urgent: true
      }
    }

    return configs[page] || configs.dashboard
  }

  const config = getBannerConfig()

  if (!config) return null

  const Icon = config.icon

  return (
    <div className={`relative ${config.bgColor} border ${config.borderColor} rounded-lg p-4 mb-6 ${
      config.urgent ? 'shadow-lg' : ''
    }`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`flex-shrink-0 ${config.iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold mb-1 ${
            config.urgent 
              ? 'text-gray-900 dark:text-white' 
              : 'text-gray-800 dark:text-gray-100'
          }`}>
            {config.title}
          </h3>
          
          <p className={`text-sm mb-3 ${
            config.urgent
              ? 'text-gray-700 dark:text-gray-300'
              : 'text-gray-600 dark:text-gray-400'
          }`}>
            {config.message}
          </p>

          {/* Pending Actions List */}
          {approvalStatus === 'NEEDS_ATTENTION' && pendingActions.length > 0 && page === 'dashboard' && (
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Required Actions:
              </p>
              <ul className="space-y-1">
                {pendingActions.map((action, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <IoDocumentTextOutline className="w-4 h-4 flex-shrink-0" />
                    <span>{action.replace(/_/g, ' ').toLowerCase()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Estimated Time */}
          {config.showProgress && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3">
              <IoTimeOutline className="w-4 h-4" />
              <span>Estimated review time: {estimatedApprovalTime}</span>
            </div>
          )}

          {/* Action Button */}
          {config.action && (
            <button
              onClick={() => {
                if (onActionClick) {
                  onActionClick()
                } else if (config.action.url) {
                  window.location.href = config.action.url
                }
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                config.urgent
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                  : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
              }`}
            >
              {config.action.label}
              <IoCheckmarkCircleOutline className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dismiss Button */}
        {dismissible && (
          <button
            onClick={() => setIsDismissed(true)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label="Dismiss"
          >
            <IoCloseOutline className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Progress Indicator for Pending Status */}
      {config.showProgress && approvalStatus === 'PENDING' && (
        <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Review in progress...</span>
              <span className="block text-xs mt-0.5">
                We'll notify you via email once the review is complete
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}