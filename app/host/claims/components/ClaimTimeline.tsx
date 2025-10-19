// app/host/claims/components/ClaimTimeline.tsx
'use client'

import { 
  IoTimeOutline,
  IoEyeOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoCashOutline,
  IoAlertCircleOutline,
  IoCheckmarkDoneOutline,
  IoSwapHorizontalOutline
} from 'react-icons/io5'

interface TimelineEvent {
  type: 'filed' | 'status_change' | 'reviewed' | 'paid' | 'resolved'
  status: string
  date: string
  title: string
  description: string
  by?: string
  amount?: number
  approvedAmount?: number
}

interface ClaimTimelineProps {
  timeline: TimelineEvent[]
  className?: string
}

export default function ClaimTimeline({ timeline, className = '' }: ClaimTimelineProps) {
  if (!timeline || timeline.length === 0) {
    return null
  }

  // Get icon for event type
  const getEventIcon = (event: TimelineEvent) => {
    switch (event.type) {
      case 'filed':
        return IoTimeOutline
      case 'status_change':
        return IoSwapHorizontalOutline
      case 'reviewed':
        return IoEyeOutline
      case 'paid':
        return IoCashOutline
      case 'resolved':
        return IoCheckmarkDoneOutline
      default:
        return IoAlertCircleOutline
    }
  }

  // Get color for event status
  const getEventColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900/30',
          text: 'text-yellow-600 dark:text-yellow-400',
          border: 'border-yellow-300 dark:border-yellow-700',
          ring: 'ring-yellow-200 dark:ring-yellow-800'
        }
      case 'UNDER_REVIEW':
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/30',
          text: 'text-blue-600 dark:text-blue-400',
          border: 'border-blue-300 dark:border-blue-700',
          ring: 'ring-blue-200 dark:ring-blue-800'
        }
      case 'APPROVED':
        return {
          bg: 'bg-green-100 dark:bg-green-900/30',
          text: 'text-green-600 dark:text-green-400',
          border: 'border-green-300 dark:border-green-700',
          ring: 'ring-green-200 dark:ring-green-800'
        }
      case 'DENIED':
        return {
          bg: 'bg-red-100 dark:bg-red-900/30',
          text: 'text-red-600 dark:text-red-400',
          border: 'border-red-300 dark:border-red-700',
          ring: 'ring-red-200 dark:ring-red-800'
        }
      case 'PAID':
        return {
          bg: 'bg-emerald-100 dark:bg-emerald-900/30',
          text: 'text-emerald-600 dark:text-emerald-400',
          border: 'border-emerald-300 dark:border-emerald-700',
          ring: 'ring-emerald-200 dark:ring-emerald-800'
        }
      case 'RESOLVED':
        return {
          bg: 'bg-gray-100 dark:bg-gray-800',
          text: 'text-gray-600 dark:text-gray-400',
          border: 'border-gray-300 dark:border-gray-700',
          ring: 'ring-gray-200 dark:ring-gray-700'
        }
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-800',
          text: 'text-gray-600 dark:text-gray-400',
          border: 'border-gray-300 dark:border-gray-700',
          ring: 'ring-gray-200 dark:ring-gray-700'
        }
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  return (
    <div className={`space-y-0 ${className}`}>
      {timeline.map((event, index) => {
        const Icon = getEventIcon(event)
        const colors = getEventColor(event.status)
        const isLast = index === timeline.length - 1

        return (
          <div key={index} className="relative">
            {/* Connector line (except for last item) */}
            {!isLast && (
              <div 
                className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"
                aria-hidden="true"
              />
            )}

            {/* Event card */}
            <div className="relative flex gap-4 pb-6">
              {/* Icon circle */}
              <div className="flex-shrink-0">
                <div 
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${colors.bg} ${colors.text} ${colors.border} border-2
                    ring-4 ${colors.ring}
                  `}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              {/* Event content */}
              <div className="flex-1 pt-0.5">
                {/* Title and date */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {event.title}
                  </h4>
                  <time className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(event.date)}
                  </time>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {event.description}
                </p>

                {/* Additional info */}
                <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                  {/* By whom */}
                  {event.by && (
                    <span className="flex items-center gap-1">
                      <span className="font-medium">By:</span>
                      <span>{event.by}</span>
                    </span>
                  )}

                  {/* Approved amount */}
                  {event.approvedAmount !== undefined && (
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Amount:</span>
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        ${event.approvedAmount.toLocaleString()}
                      </span>
                    </span>
                  )}

                  {/* Payment amount */}
                  {event.amount !== undefined && (
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Payout:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        ${event.amount.toLocaleString()}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Export empty state component
export function TimelineEmptyState() {
  return (
    <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <IoTimeOutline className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
      <p className="text-sm text-gray-600 dark:text-gray-400">
        No timeline events yet
      </p>
    </div>
  )
}