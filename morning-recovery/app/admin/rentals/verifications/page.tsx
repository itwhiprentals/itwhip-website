// app/admin/rentals/verifications/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  IoDocumentTextOutline,
  IoTimeOutline,
  IoCarOutline,
  IoPersonOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoEyeOutline,
  IoRefreshOutline,
  IoFilterOutline,
  IoWarningOutline,
  IoArrowBackOutline
} from 'react-icons/io5'

interface PendingVerification {
  id: string
  bookingCode: string
  guestEmail: string
  guestName: string
  guestPhone: string
  car: {
    id: string
    make: string
    model: string
    year: number
    dailyRate: number
    photos: Array<{ url: string }>
    host: {
      name: string
      email: string
    }
  }
  startDate: string
  endDate: string
  documentsSubmittedAt: string
  verificationDeadline: string
  totalAmount: number
  urgency: {
    hoursRemaining: number
    submittedHoursAgo: number
    isUrgent: boolean
  }
}

export default function AdminVerificationsPage() {
  const router = useRouter()
  const [verifications, setVerifications] = useState<PendingVerification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'urgent'>('pending')
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState({
    pending: 0,
    approvedToday: 0,
    rejectedToday: 0,
    totalToday: 0
  })

  useEffect(() => {
    fetchPendingVerifications()
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchPendingVerifications, 120000)
    return () => clearInterval(interval)
  }, [filter])

  const fetchPendingVerifications = async () => {
    try {
      const response = await fetch(`/api/admin/rentals/verifications?status=${filter}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch verifications')
      }

      const data = await response.json()
      
      setVerifications(data.bookings || [])
      setStats(data.stats || {
        pending: 0,
        approvedToday: 0,
        rejectedToday: 0,
        totalToday: 0
      })
    } catch (error) {
      console.error('Failed to fetch verifications:', error)
      // Set mock data for testing if API fails
      setVerifications([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchPendingVerifications()
  }

  const formatTimeRemaining = (hours: number | null) => {
    if (hours === null) return { text: 'No deadline', urgent: false }
    
    if (hours <= 0) {
      return { text: 'Expired', urgent: true }
    } else if (hours < 1) {
      const mins = Math.floor(hours * 60)
      return { text: `${mins}m remaining`, urgent: true }
    } else if (hours < 6) {
      return { text: `${Math.floor(hours)}h remaining`, urgent: true }
    } else if (hours < 24) {
      return { text: `${Math.floor(hours)}h remaining`, urgent: false }
    } else {
      const days = Math.floor(hours / 24)
      return { text: `${days}d remaining`, urgent: false }
    }
  }

  const formatTimeSince = (hours: number | null) => {
    if (hours === null) return 'Unknown'
    
    if (hours < 1) {
      const mins = Math.floor(hours * 60)
      return `${mins} mins ago`
    } else if (hours < 24) {
      return `${Math.floor(hours)} hours ago`
    } else {
      const days = Math.floor(hours / 24)
      return `${days} days ago`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading verifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link
                href="/admin/dashboard"
                className="mr-4 text-gray-400 hover:text-gray-600"
              >
                <IoArrowBackOutline className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  P2P Verification Queue
                </h1>
                <p className="text-gray-600 mt-1">
                  Review and approve rental documents
                </p>
              </div>
            </div>
            
            <button
              onClick={handleRefresh}
              className={`flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors ${
                refreshing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={refreshing}
            >
              <IoRefreshOutline className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pending}
                </p>
              </div>
              <IoDocumentTextOutline className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {verifications.filter(v => v.urgency?.isUrgent).length}
                </p>
              </div>
              <IoWarningOutline className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved Today</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.approvedToday}
                </p>
              </div>
              <IoCheckmarkCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected Today</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.rejectedToday}
                </p>
              </div>
              <IoCloseCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['pending', 'urgent', 'all'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'urgent' && (
                <span className="ml-2 text-xs">
                  ({verifications.filter(v => v.urgency?.isUrgent).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Verifications List */}
        {verifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <IoCheckmarkCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              All caught up!
            </h3>
            <p className="text-gray-600">
              No pending verifications at the moment
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {verifications.map(verification => {
              const timeRemaining = formatTimeRemaining(verification.urgency?.hoursRemaining)
              
              return (
                <div 
                  key={verification.id}
                  className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer ${
                    timeRemaining.urgent ? 'border-l-4 border-yellow-500' : ''
                  }`}
                  onClick={() => router.push(`/admin/rentals/verifications/${verification.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {verification.car.photos?.[0] && (
                        <img 
                          src={verification.car.photos[0].url}
                          alt={`${verification.car.make} ${verification.car.model}`}
                          className="w-20 h-16 object-cover rounded"
                        />
                      )}
                      
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {verification.bookingCode}
                          </h3>
                          {timeRemaining.urgent && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              Urgent
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {verification.car.year} {verification.car.make} {verification.car.model} • ${verification.car.dailyRate}/day
                        </p>
                        
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                          <div className="flex items-center text-gray-600">
                            <IoPersonOutline className="w-4 h-4 mr-1" />
                            {verification.guestName || verification.guestEmail}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <IoTimeOutline className="w-4 h-4 mr-1" />
                            Submitted {formatTimeSince(verification.urgency?.submittedHoursAgo)}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <IoCarOutline className="w-4 h-4 mr-1" />
                            Host: {verification.car.host.name}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <IoDocumentTextOutline className="w-4 h-4 mr-1" />
                            {new Date(verification.startDate).toLocaleDateString()} - {new Date(verification.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-medium text-gray-900 mb-1">
                        ${verification.totalAmount.toFixed(2)}
                      </p>
                      <p className={`text-sm font-medium ${
                        timeRemaining.urgent ? 'text-yellow-600' : 'text-gray-600'
                      }`}>
                        {timeRemaining.text}
                      </p>
                      <button className="mt-2 flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm">
                        <IoEyeOutline className="w-4 h-4 mr-1" />
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}