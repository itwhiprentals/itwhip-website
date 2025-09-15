// app/admin/components/BookingTimeline.tsx
'use client'

import React from 'react'
import {
  IoCheckmarkCircle,
  IoCloseCircle,
  IoWarningOutline,
  IoTimeOutline,
  IoDocumentTextOutline,
  IoShieldCheckmarkOutline,
  IoCarSportOutline,
  IoCashOutline,
  IoMailOutline,
  IoPersonOutline,
  IoLocationOutline,
  IoAlertCircleOutline,
  IoFingerPrintOutline,
  IoPhonePortraitOutline,
  IoCameraOutline,
  IoSpeedometerOutline,
  IoBanOutline,
  IoCheckmarkDoneOutline,
  IoArrowForwardOutline,
  IoEyeOutline,
  IoCreateOutline,
  IoNotificationsOutline
} from 'react-icons/io5'

interface TimelineEvent {
  id: string
  timestamp: Date | string
  type: 'booking' | 'verification' | 'payment' | 'status' | 'fraud' | 'session' | 'admin' | 'communication'
  title: string
  description?: string
  actor?: string
  icon?: React.ElementType
  severity?: 'success' | 'warning' | 'error' | 'info'
  metadata?: Record<string, any>
  duration?: number // For session events
}

interface BookingTimelineProps {
  events: TimelineEvent[]
  sessionData?: {
    startTime: Date | string
    endTime?: Date | string
    duration: number
    pageViews: number
    interactions: number
    riskScore?: number
  }
  showDetails?: boolean
  className?: string
}

export function BookingTimeline({ 
  events, 
  sessionData,
  showDetails = true,
  className = '' 
}: BookingTimelineProps) {
  // Sort events by timestamp
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  // Group events by date
  const groupedEvents = sortedEvents.reduce((acc, event) => {
    const date = new Date(event.timestamp).toLocaleDateString()
    if (!acc[date]) acc[date] = []
    acc[date].push(event)
    return acc
  }, {} as Record<string, TimelineEvent[]>)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Session Summary Card */}
      {sessionData && (
        <SessionSummaryCard sessionData={sessionData} />
      )}

      {/* Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Booking Timeline
        </h3>

        <div className="space-y-8">
          {Object.entries(groupedEvents).map(([date, dateEvents]) => (
            <div key={date}>
              <div className="flex items-center mb-4">
                <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
                <span className="px-3 text-sm text-gray-500 dark:text-gray-400">
                  {date}
                </span>
                <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
              </div>

              <div className="space-y-4">
                {dateEvents.map((event, index) => (
                  <TimelineItem 
                    key={event.id} 
                    event={event} 
                    showDetails={showDetails}
                    isLast={index === dateEvents.length - 1}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TimelineItem({ 
  event, 
  showDetails,
  isLast 
}: { 
  event: TimelineEvent
  showDetails: boolean
  isLast: boolean 
}) {
  const Icon = event.icon || getIconForType(event.type)
  const bgColor = getSeverityColor(event.severity || 'info')
  const time = new Date(event.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className="flex items-start space-x-3">
      {/* Icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${bgColor} flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-white" />
      </div>

      {/* Content */}
      <div className={`flex-1 ${!isLast ? 'pb-4 border-l-2 border-gray-200 dark:border-gray-700 ml-5 -mt-10 pt-10 pl-6' : ''}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                {event.title}
              </h4>
              {event.duration && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({formatDuration(event.duration)})
                </span>
              )}
            </div>
            
            {event.description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {event.description}
              </p>
            )}

            {event.actor && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                by {event.actor}
              </p>
            )}

            {showDetails && event.metadata && (
              <EventMetadata metadata={event.metadata} type={event.type} />
            )}
          </div>

          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            {time}
          </span>
        </div>
      </div>
    </div>
  )
}

function EventMetadata({ metadata, type }: { metadata: Record<string, any>, type: string }) {
  // Render metadata based on event type
  switch (type) {
    case 'fraud':
      return (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs">
          <div className="space-y-1">
            {metadata.riskScore && (
              <div>Risk Score: <span className="font-semibold">{metadata.riskScore}</span></div>
            )}
            {metadata.flags && (
              <div>Flags: {metadata.flags.join(', ')}</div>
            )}
            {metadata.action && (
              <div>Action: <span className="font-semibold">{metadata.action}</span></div>
            )}
          </div>
        </div>
      )
    
    case 'verification':
      return (
        <div className="mt-2 flex flex-wrap gap-2">
          {metadata.documents?.map((doc: string) => (
            <span key={doc} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded">
              {doc}
            </span>
          ))}
        </div>
      )
    
    case 'payment':
      return (
        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
          {metadata.amount && <div>Amount: ${metadata.amount}</div>}
          {metadata.method && <div>Method: {metadata.method}</div>}
          {metadata.status && <div>Status: {metadata.status}</div>}
        </div>
      )
    
    case 'session':
      return (
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
          {metadata.pageViews && <div>Pages viewed: {metadata.pageViews}</div>}
          {metadata.interactions && <div>Interactions: {metadata.interactions}</div>}
          {metadata.device && <div>Device: {metadata.device}</div>}
          {metadata.location && <div>Location: {metadata.location}</div>}
        </div>
      )
    
    default:
      return (
        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
          {Object.entries(metadata).map(([key, value]) => (
            <div key={key}>
              {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </div>
          ))}
        </div>
      )
  }
}

function SessionSummaryCard({ sessionData }: { sessionData: any }) {
  const duration = sessionData.duration || 0
  const riskLevel = getRiskLevel(sessionData.riskScore || 0)
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Session Summary
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Duration</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatDuration(duration)}
          </div>
        </div>
        
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Page Views</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {sessionData.pageViews || 0}
          </div>
        </div>
        
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Interactions</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {sessionData.interactions || 0}
          </div>
        </div>
        
        {sessionData.riskScore !== undefined && (
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Risk Score</div>
            <div className={`text-lg font-semibold ${getRiskTextColor(riskLevel)}`}>
              {sessionData.riskScore}/100
            </div>
          </div>
        )}
      </div>

      {/* Session visualization */}
      <div className="mt-6">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Session Activity</div>
        <SessionActivityBar sessionData={sessionData} />
      </div>
    </div>
  )
}

function SessionActivityBar({ sessionData }: { sessionData: any }) {
  // Simple activity visualization
  const segments = [
    { label: 'Browsing', value: 30, color: 'bg-blue-500' },
    { label: 'Form Filling', value: 40, color: 'bg-green-500' },
    { label: 'Verification', value: 20, color: 'bg-yellow-500' },
    { label: 'Payment', value: 10, color: 'bg-purple-500' }
  ]

  return (
    <div className="w-full">
      <div className="flex h-8 rounded-lg overflow-hidden">
        {segments.map((segment, index) => (
          <div
            key={index}
            className={`${segment.color} relative group`}
            style={{ width: `${segment.value}%` }}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs text-white font-medium">{segment.label}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between mt-2">
        <span className="text-xs text-gray-500">Start</span>
        <span className="text-xs text-gray-500">{formatDuration(sessionData.duration)}</span>
      </div>
    </div>
  )
}

// Helper functions
function getIconForType(type: string): React.ElementType {
  switch (type) {
    case 'booking': return IoDocumentTextOutline
    case 'verification': return IoShieldCheckmarkOutline
    case 'payment': return IoCashOutline
    case 'status': return IoCheckmarkCircle
    case 'fraud': return IoWarningOutline
    case 'session': return IoTimeOutline
    case 'admin': return IoPersonOutline
    case 'communication': return IoMailOutline
    default: return IoTimeOutline
  }
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'success': return 'bg-green-500'
    case 'warning': return 'bg-yellow-500'
    case 'error': return 'bg-red-500'
    case 'info': return 'bg-blue-500'
    default: return 'bg-gray-500'
  }
}

function getRiskLevel(score: number): string {
  if (score >= 70) return 'critical'
  if (score >= 50) return 'high'
  if (score >= 30) return 'medium'
  return 'low'
}

function getRiskTextColor(level: string): string {
  switch (level) {
    case 'critical': return 'text-red-600 dark:text-red-400'
    case 'high': return 'text-orange-600 dark:text-orange-400'
    case 'medium': return 'text-yellow-600 dark:text-yellow-400'
    case 'low': return 'text-green-600 dark:text-green-400'
    default: return 'text-gray-600 dark:text-gray-400'
  }
}

function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}

// Sample event generator for testing
export function generateSampleEvents(bookingData?: any): TimelineEvent[] {
  const now = new Date()
  const events: TimelineEvent[] = [
    {
      id: '1',
      timestamp: new Date(now.getTime() - 3600000), // 1 hour ago
      type: 'session',
      title: 'Session started',
      description: 'User began booking process',
      severity: 'info',
      metadata: {
        device: 'Chrome on MacOS',
        location: 'Phoenix, AZ',
        pageViews: 5
      }
    },
    {
      id: '2',
      timestamp: new Date(now.getTime() - 3300000), // 55 min ago
      type: 'fraud',
      title: 'Fraud check initiated',
      description: 'Automated risk assessment',
      severity: 'warning',
      metadata: {
        riskScore: 45,
        flags: ['first_time_user', 'high_value_booking'],
        action: 'Flag for review'
      }
    },
    {
      id: '3',
      timestamp: new Date(now.getTime() - 3000000), // 50 min ago
      type: 'verification',
      title: 'Documents submitted',
      description: 'Guest uploaded verification documents',
      severity: 'info',
      metadata: {
        documents: ['Driver License', 'Insurance', 'Selfie']
      }
    },
    {
      id: '4',
      timestamp: new Date(now.getTime() - 2700000), // 45 min ago
      type: 'booking',
      title: 'Booking created',
      description: 'Booking RENT-2025-ABC123 created',
      severity: 'success',
      duration: 3600000
    },
    {
      id: '5',
      timestamp: new Date(now.getTime() - 1800000), // 30 min ago
      type: 'admin',
      title: 'Manual review started',
      description: 'Admin began verification review',
      actor: 'admin@example.com',
      severity: 'info'
    },
    {
      id: '6',
      timestamp: new Date(now.getTime() - 900000), // 15 min ago
      type: 'status',
      title: 'Booking approved',
      description: 'Verification completed and booking confirmed',
      actor: 'admin@example.com',
      severity: 'success'
    },
    {
      id: '7',
      timestamp: new Date(now.getTime() - 600000), // 10 min ago
      type: 'payment',
      title: 'Payment processed',
      description: 'Payment successfully charged',
      severity: 'success',
      metadata: {
        amount: '299.99',
        method: 'Stripe',
        status: 'Completed'
      }
    },
    {
      id: '8',
      timestamp: new Date(now.getTime() - 300000), // 5 min ago
      type: 'communication',
      title: 'Confirmation email sent',
      description: 'Booking confirmation sent to guest',
      severity: 'success'
    }
  ]
  
  return events
}