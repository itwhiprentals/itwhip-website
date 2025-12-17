// app/host/bookings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { format, formatDistance } from 'date-fns'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import PendingBanner from '../components/PendingBanner'
import { 
  IoCalendarOutline,
  IoCarOutline,
  IoPersonOutline,
  IoLocationOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoAlertCircleOutline,
  IoChatbubbleOutline,
  IoDocumentTextOutline,
  IoWalletOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoRefreshOutline,
  IoEyeOutline,
  IoCallOutline,
  IoMailOutline,
  IoCameraOutline,
  IoWarningOutline,
  IoInformationCircleOutline,
  IoSchoolOutline,
  IoArrowBackOutline,
  IoStarOutline
} from 'react-icons/io5'

interface Booking {
  id: string
  bookingCode: string
  car: {
    id: string
    make: string
    model: string
    year: number
    photos: Array<{ url: string }>
  }
  renter?: {
    id: string
    name: string
    email: string
    phone?: string
    avatar?: string
  }
  guestName?: string
  guestEmail?: string
  guestPhone?: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  pickupType: string
  pickupLocation: string
  numberOfDays: number
  totalAmount: number
  depositAmount: number
  status: string
  paymentStatus: string
  verificationStatus: string
  tripStatus: string
  licenseVerified: boolean
  selfieVerified: boolean
  createdAt: string
  messages?: Array<{
    id: string
    message: string
    createdAt: string
  }>
}

type TabType = 'all' | 'upcoming' | 'active' | 'past' | 'cancelled' | 'pending'

interface HostStatus {
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'NEEDS_ATTENTION'
  pendingActions?: string[]
  restrictionReasons?: string[]
  verificationProgress?: number
  statusMessage?: string
}

export default function HostBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [hostStatus, setHostStatus] = useState<HostStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusLoading, setStatusLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date')

  useEffect(() => {
    checkHostStatus()
  }, [])

  useEffect(() => {
    if (hostStatus?.approvalStatus === 'APPROVED') {
      fetchBookings()
    } else {
      setLoading(false)
    }
  }, [hostStatus?.approvalStatus])

  const checkHostStatus = async () => {
    try {
      setStatusLoading(true)
      const response = await fetch('/api/host/verification-status', {
        credentials: 'include',
        cache: 'no-store'
      })
      
      if (response.ok) {
        const result = await response.json()
        
        if (result.success && result.data) {
          setHostStatus({
            approvalStatus: result.data.overallStatus,
            pendingActions: result.data.nextSteps?.map((step: any) => step.action) || [],
            restrictionReasons: result.data.restrictions || [],
            verificationProgress: result.data.verificationProgress,
            statusMessage: result.data.statusMessage
          })
        } else {
          setHostStatus({
            approvalStatus: 'PENDING',
            pendingActions: [],
            restrictionReasons: []
          })
        }
      } else {
        setHostStatus({
          approvalStatus: 'PENDING',
          pendingActions: [],
          restrictionReasons: []
        })
      }
    } catch (error) {
      console.error('Failed to check host status:', error)
      setHostStatus({
        approvalStatus: 'PENDING',
        pendingActions: [],
        restrictionReasons: []
      })
    } finally {
      setStatusLoading(false)
    }
  }

  const fetchBookings = async () => {
    try {
      setLoading(true)
      
      // Fetch all bookings without status filter
      const response = await fetch('/api/host/bookings', {
        credentials: 'include',
        cache: 'no-store'
      })
      
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchBookings()
    setRefreshing(false)
  }

  const handleApproveBooking = async (bookingId: string) => {
    if (!confirm('Approve this booking?')) return

    try {
      const response = await fetch(`/api/host/bookings/${bookingId}/approve`, {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        await fetchBookings()
      }
    } catch (error) {
      console.error('Failed to approve booking:', error)
    }
  }

  const handleDeclineBooking = async (bookingId: string) => {
    const reason = prompt('Reason for declining (optional):')
    if (reason === null) return

    try {
      const response = await fetch(`/api/host/bookings/${bookingId}/decline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ reason })
      })

      if (response.ok) {
        await fetchBookings()
      }
    } catch (error) {
      console.error('Failed to decline booking:', error)
    }
  }

  const handleStartTrip = async (bookingId: string) => {
    router.push(`/host/bookings/${bookingId}/checkin`)
  }

  const handleEndTrip = async (bookingId: string) => {
    router.push(`/host/bookings/${bookingId}/checkout`)
  }

  const getStatusBadge = (booking: Booking) => {
    const statusConfig = {
      PENDING: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-400', label: 'Pending' },
      CONFIRMED: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-400', label: 'Confirmed' },
      ACTIVE: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-400', label: 'Active' },
      COMPLETED: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-300', label: 'Completed' },
      CANCELLED: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-400', label: 'Cancelled' },
      NO_SHOW: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-400', label: 'No Show' }
    }

    const config = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.PENDING

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  const getVerificationBadge = (booking: Booking) => {
    if (booking.licenseVerified && booking.selfieVerified) {
      return (
        <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
          <IoCheckmarkCircleOutline className="w-4 h-4" />
          Verified
        </span>
      )
    } else if (booking.verificationStatus === 'PENDING') {
      return (
        <span className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400 font-medium">
          <IoTimeOutline className="w-4 h-4" />
          Pending
        </span>
      )
    } else {
      return (
        <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-medium">
          <IoWarningOutline className="w-4 h-4" />
          Not Verified
        </span>
      )
    }
  }

  const formatDate = (date: string) => {
    return format(new Date(date), 'MMM d, yyyy')
  }

  const formatDateShort = (date: string) => {
    return format(new Date(date), 'MMM d')
  }

  const calculateDaysUntil = (date: string) => {
    const days = Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Tomorrow'
    if (days < 0) return `${Math.abs(days)} days ago`
    return `In ${days} days`
  }

  // Enhanced filtering logic
  const getFilteredBookings = () => {
    let filtered = bookings

    // Apply tab filter
    if (activeTab !== 'all') {
      filtered = filtered.filter(booking => {
        switch (activeTab) {
          case 'pending':
            return booking.status === 'PENDING'
          case 'upcoming':
            return booking.status === 'CONFIRMED' && new Date(booking.startDate) > new Date()
          case 'active':
            return booking.tripStatus === 'ACTIVE' || booking.status === 'ACTIVE'
          case 'past':
            return booking.status === 'COMPLETED'
          case 'cancelled':
            return booking.status === 'CANCELLED' || booking.status === 'NO_SHOW'
          default:
            return true
        }
      })
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(booking =>
        booking.bookingCode.toLowerCase().includes(searchLower) ||
        booking.car.make.toLowerCase().includes(searchLower) ||
        booking.car.model.toLowerCase().includes(searchLower) ||
        booking.guestName?.toLowerCase().includes(searchLower) ||
        booking.guestEmail?.toLowerCase().includes(searchLower) ||
        booking.renter?.name.toLowerCase().includes(searchLower) ||
        booking.renter?.email.toLowerCase().includes(searchLower)
      )
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        case 'amount':
          return b.totalAmount - a.totalAmount
        case 'status':
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

    return filtered
  }

  const filteredBookings = getFilteredBookings()

  // Calculate tab counts
  const tabCounts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'PENDING').length,
    upcoming: bookings.filter(b => b.status === 'CONFIRMED' && new Date(b.startDate) > new Date()).length,
    active: bookings.filter(b => b.tripStatus === 'ACTIVE' || b.status === 'ACTIVE').length,
    past: bookings.filter(b => b.status === 'COMPLETED').length,
    cancelled: bookings.filter(b => b.status === 'CANCELLED' || b.status === 'NO_SHOW').length
  }

  const isApproved = hostStatus?.approvalStatus === 'APPROVED'
  const isPending = hostStatus?.approvalStatus === 'PENDING' || hostStatus?.approvalStatus === 'NEEDS_ATTENTION'

  const renderEducationalContent = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <IoSchoolOutline className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Learn About Booking Management
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
              Once your account is approved, you'll be able to manage guest bookings, approve requests, 
              and coordinate trip details directly from this page.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <IoCheckmarkCircleOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100 text-sm">Review & Approve Bookings</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    See guest details and accept or decline booking requests
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <IoCheckmarkCircleOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100 text-sm">Manage Active Trips</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Check-in/check-out vehicles and document trip conditions
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <IoCheckmarkCircleOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100 text-sm">Communicate with Guests</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Message guests directly about trip details and questions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <IoCalendarOutline className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Booking Calendar
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            View all your bookings in a calendar format to easily manage availability and prevent double-bookings.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <IoChatbubbleOutline className="w-8 h-8 text-green-600 dark:text-green-400 mb-3" />
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Guest Messaging
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Communicate directly with guests to coordinate pickup times, answer questions, and provide excellent service.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <IoDocumentTextOutline className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Trip Documentation
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Document vehicle condition with photos at check-in and check-out to protect yourself from damage claims.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <IoWalletOutline className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-3" />
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Payment Tracking
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Track payment status for each booking and see your expected earnings from confirmed reservations.
          </p>
        </div>
      </div>
    </div>
  )

  const renderBookingCard = (booking: Booking) => (
    <div 
      key={booking.id} 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-700 transition-all"
    >
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-mono text-gray-600 dark:text-gray-400">#{booking.bookingCode}</span>
              {getStatusBadge(booking)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Booked {formatDistance(new Date(booking.createdAt), new Date(), { addSuffix: true })}
            </p>
          </div>
          {getVerificationBadge(booking)}
        </div>

        {/* Car and Guest Info */}
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="flex items-start gap-3">
            {booking.car.photos?.[0] ? (
              <div className="relative w-20 h-15 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={booking.car.photos[0].url}
                  alt={`${booking.car.year} ${booking.car.make} ${booking.car.model}`}
                  width={80}
                  height={60}
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            ) : (
              <div className="w-20 h-15 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <IoCarOutline className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                {booking.car.year} {booking.car.make} {booking.car.model}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {booking.numberOfDays} day{booking.numberOfDays !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              {booking.renter?.avatar ? (
                <Image
                  src={booking.renter.avatar}
                  alt={booking.renter.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                  sizes="40px"
                />
              ) : (
                <span className="text-sm">
                  {(booking.renter?.name || booking.guestName || 'G').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate text-gray-900 dark:text-white">
                {booking.renter?.name || booking.guestName || 'Guest'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {booking.renter?.email || booking.guestEmail}
              </p>
              {(booking.renter?.phone || booking.guestPhone) && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {booking.renter?.phone || booking.guestPhone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Trip Details */}
        <div className="space-y-2 mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <IoCalendarOutline className="w-4 h-4" />
              Pickup
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatDateShort(booking.startDate)} at {booking.startTime}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <IoCalendarOutline className="w-4 h-4" />
              Return
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatDateShort(booking.endDate)} at {booking.endTime}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <IoLocationOutline className="w-4 h-4" />
              Location
            </span>
            <span className="font-medium capitalize text-gray-900 dark:text-white">{booking.pickupType}</span>
          </div>
          {(activeTab === 'upcoming' || activeTab === 'all') && new Date(booking.startDate) > new Date() && (
            <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-600">
              <span className="text-gray-600 dark:text-gray-400">Starts</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                {calculateDaysUntil(booking.startDate)}
              </span>
            </div>
          )}
        </div>

        {/* Financial Info */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">Total: </span>
            <span className="font-bold text-xl text-gray-900 dark:text-white">${booking.totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            {booking.paymentStatus === 'PAID' ? (
              <span className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-1">
                <IoCheckmarkCircleOutline className="w-4 h-4" />
                Paid
              </span>
            ) : (
              <span className="text-yellow-600 dark:text-yellow-400 text-sm font-medium flex items-center gap-1">
                <IoTimeOutline className="w-4 h-4" />
                {booking.paymentStatus}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/host/bookings/${booking.id}`}
            className="flex-1 min-w-[120px] px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium text-center"
          >
            View Details
          </Link>
          
          {booking.status === 'PENDING' && (
            <>
              <button
                onClick={() => handleApproveBooking(booking.id)}
                className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Approve
              </button>
              <button
                onClick={() => handleDeclineBooking(booking.id)}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Decline
              </button>
            </>
          )}
          
          {booking.status === 'CONFIRMED' && booking.tripStatus === 'NOT_STARTED' && 
           new Date(booking.startDate) <= new Date() && (
            <button
              onClick={() => handleStartTrip(booking.id)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Start Check-in
            </button>
          )}
          
          {booking.tripStatus === 'ACTIVE' && (
            <button
              onClick={() => handleEndTrip(booking.id)}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              End Trip
            </button>
          )}

          <Link
            href={`/host/messages`}
            className="px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-500 dark:hover:border-purple-500 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
          >
            <IoChatbubbleOutline className="w-4 h-4" />
            Message
          </Link>
        </div>
      </div>
    </div>
  )

  if (statusLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
          <div className="p-6 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Checking account status...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (loading && !refreshing && isApproved) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
          <div className="p-6 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading bookings...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => router.push('/host/dashboard')}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <IoArrowBackOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {isApproved ? 'Bookings' : 'Bookings (Preview)'}
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 ml-14">
                {isApproved 
                  ? `${tabCounts.all} total bookings`
                  : 'Learn about booking management features'
                }
              </p>
            </div>

            {isApproved && tabCounts.all > 0 && (
              <div className="hidden sm:flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2">
                <IoStarOutline className="w-5 h-5 text-yellow-500" />
                <div className="text-sm">
                  <p className="font-semibold text-gray-900 dark:text-white">${bookings.reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Revenue</p>
                </div>
              </div>
            )}
          </div>

          {!isApproved && hostStatus && (
            <PendingBanner
              approvalStatus={hostStatus.approvalStatus}
              page="bookings"
              pendingActions={hostStatus.pendingActions}
              restrictionReasons={hostStatus.restrictionReasons}
              onActionClick={() => router.push('/host/dashboard')}
            />
          )}

          {!isApproved ? (
            renderEducationalContent()
          ) : (
            <>
              {/* Search and Controls */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by booking code, car, or guest..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="amount">Sort by Amount</option>
                    <option value="status">Sort by Status</option>
                  </select>

                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <IoRefreshOutline className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden">
                <div className="flex overflow-x-auto">
                  {[
                    { key: 'all', label: 'All', icon: IoCalendarOutline },
                    { key: 'pending', label: 'Pending', icon: IoTimeOutline },
                    { key: 'upcoming', label: 'Upcoming', icon: IoCalendarOutline },
                    { key: 'active', label: 'Active', icon: IoCarOutline },
                    { key: 'past', label: 'Past', icon: IoCheckmarkCircleOutline },
                    { key: 'cancelled', label: 'Cancelled', icon: IoCloseCircleOutline }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as TabType)}
                      className={`flex-1 min-w-[100px] px-4 py-3 text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                        activeTab === tab.key
                          ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                      {tabCounts[tab.key as keyof typeof tabCounts] > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          activeTab === tab.key
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                        }`}>
                          {tabCounts[tab.key as keyof typeof tabCounts]}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bookings List */}
              {filteredBookings.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                  <IoCalendarOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {searchTerm ? 'No bookings found' : `No ${activeTab === 'all' ? '' : activeTab} bookings`}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {searchTerm 
                      ? 'Try adjusting your search terms'
                      : activeTab === 'all'
                      ? 'Your bookings will appear here once guests make reservations'
                      : `No ${activeTab} bookings at this time`
                    }
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-2">
                  {filteredBookings.map(renderBookingCard)}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}