// app/(guest)/rentals/components/verification/VerificationStatus.tsx
'use client'

import { useState, useEffect } from 'react'
import { 
  IoCheckmarkCircle,
  IoTimeOutline,
  IoCloseCircle,
  IoWarningOutline,
  IoReloadOutline
} from 'react-icons/io5'

interface VerificationStatusProps {
  bookingId: string
  token: string
}

export default function VerificationStatus({ bookingId, token }: VerificationStatusProps) {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkStatus()
    // Poll for updates every 30 seconds
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [bookingId])

  const checkStatus = async () => {
    try {
      const response = await fetch(`/api/rentals/verify/status?bookingId=${bookingId}&token=${token}`)
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error('Failed to check status:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  const getStatusDisplay = () => {
    switch (status?.verificationStatus) {
      case 'pending':
        return {
          icon: IoTimeOutline,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          title: 'Verification Pending',
          message: 'Please upload your documents to proceed'
        }
      case 'submitted':
        return {
          icon: IoTimeOutline,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          title: 'Under Review',
          message: 'We\'re reviewing your documents. This usually takes 2-4 hours.'
        }
      case 'approved':
        return {
          icon: IoCheckmarkCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          title: 'Verification Approved',
          message: 'Your booking is confirmed! Check your email for details.'
        }
      case 'rejected':
        return {
          icon: IoCloseCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          title: 'Verification Rejected',
          message: status?.verificationNotes || 'Please contact support for assistance.'
        }
      default:
        return {
          icon: IoWarningOutline,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          title: 'Status Unknown',
          message: 'Please refresh the page or contact support.'
        }
    }
  }

  const statusDisplay = getStatusDisplay()
  const Icon = statusDisplay.icon

  return (
    <div className={`${statusDisplay.bgColor} border ${statusDisplay.borderColor} rounded-lg p-6`}>
      <div className="flex items-start">
        <Icon className={`w-6 h-6 ${statusDisplay.color} mr-3 flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <h3 className={`font-semibold ${statusDisplay.color} mb-1`}>
            {statusDisplay.title}
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {statusDisplay.message}
          </p>
          
          {/* Timeline */}
          {status?.timeline && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Timeline
              </p>
              {status.timeline.map((item: any, index: number) => (
                <div key={index} className="flex items-center text-xs">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    item.completed ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <span className={item.completed ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500'}>
                    {item.label}
                  </span>
                  {item.timestamp && (
                    <span className="ml-auto text-gray-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Refresh Button */}
          <button
            onClick={checkStatus}
            className="mt-4 text-xs text-blue-600 hover:text-blue-700 flex items-center"
          >
            <IoReloadOutline className="w-3 h-3 mr-1" />
            Refresh Status
          </button>
        </div>
      </div>
    </div>
  )
}