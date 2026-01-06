// app/fleet/guests/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  IoArrowBackOutline,
  IoPersonOutline,
  IoMailOutline,
  IoLocationOutline,
  IoCalendarOutline,
  IoCarOutline,
  IoStarOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoCashOutline,
  IoDocumentTextOutline,
  IoWarningOutline,
  IoLockClosedOutline,
  IoLockOpenOutline,
  IoShieldCheckmarkOutline,
  IoTimeOutline,
  IoSettingsOutline,
  IoAlertCircleOutline,
  IoBanOutline,
  IoMegaphoneOutline
} from 'react-icons/io5'
import WarningModal from './components/WarningModal'
import AppealReviewPanel from './components/AppealReviewPanel'
import GuestStatusDashboard from './components/GuestStatusDashboard'

interface GuestDetails {
  id: string
  name: string
  email: string | null
  profilePhotoUrl: string | null
  city: string
  state: string
  tripCount: number
  reviewCount: number
  isVerified: boolean
  fullyVerified: boolean
  canInstantBook: boolean
  documentsVerified: boolean
  insuranceVerified: boolean
  memberSince: string
  userId: string | null
  
  // Suspension fields
  suspensionLevel: 'SOFT' | 'HARD' | 'BANNED' | null
  suspendedAt: string | null
  suspendedReason: string | null
  suspendedBy: string | null
  suspensionExpiresAt: string | null
  autoReactivate: boolean
  bannedAt: string | null
  banReason: string | null
  bannedBy: string | null
  warningCount: number
  lastWarningAt: string | null
  
  user: {
    id: string
    email: string
    name: string
    role: string
    isActive: boolean
    emailVerified: boolean
    createdAt: string
  } | null
  stats: {
    totalBookings: number
    completedBookings: number
    totalReviews: number
    totalSpent: number
    averageRating: number
    moderationActions?: number
    pendingAppeals?: number
  }
  bookings: any[]
  reviews: any[]
  moderationHistory?: any[]
  createdAt: string
  updatedAt: string
}

interface ActionModalState {
  isOpen: boolean
  action: 'warn' | 'suspend' | 'ban' | 'unsuspend' | null
  level?: 'SOFT' | 'HARD'
}

interface Appeal {
  id: string
  reason: string
  evidence: any
  status: string
  submittedAt: string
  reviewedBy?: string
  reviewedAt?: string
  reviewNotes?: string
  moderation: any
}

export default function FleetGuestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [guestId, setGuestId] = useState<string>('')
  const [guest, setGuest] = useState<GuestDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'reviews' | 'documents' | 'permissions' | 'moderation' | 'appeals'>('overview')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  // Appeals state
  const [appeals, setAppeals] = useState<Appeal[]>([])
  const [appealsLoading, setAppealsLoading] = useState(false)
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null)
  
  // Enhanced Warning Modal state
  const [showWarningModal, setShowWarningModal] = useState(false)
  
  // Modal state
  const [modalState, setModalState] = useState<ActionModalState>({ isOpen: false, action: null })
  const [modalReason, setModalReason] = useState('')
  const [modalInternalNotes, setModalInternalNotes] = useState('')
  const [modalExpiresAt, setModalExpiresAt] = useState('')
  const [modalAutoReactivate, setModalAutoReactivate] = useState(false)

  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params
      setGuestId(resolvedParams.id)
    }
    initParams()
  }, [params])

  useEffect(() => {
    if (guestId) {
      fetchGuestDetails()
      fetchAppeals()
    }
  }, [guestId])

  // Handle tab from URL query parameter
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['overview', 'bookings', 'reviews', 'documents', 'permissions', 'moderation', 'appeals'].includes(tab)) {
      setActiveTab(tab as any)
    }
  }, [searchParams])

  const fetchGuestDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/fleet/guests/${guestId}?key=phoenix-fleet-2847`)

      if (response.ok) {
        const data = await response.json()
        setGuest(data.guest)
      } else {
        console.error('Failed to fetch guest details')
      }
    } catch (error) {
      console.error('Error fetching guest:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAppeals = async () => {
    try {
      setAppealsLoading(true)
      const response = await fetch(`/fleet/api/guests/${guestId}/appeals?key=phoenix-fleet-2847`)

      if (response.ok) {
        const data = await response.json()
        setAppeals(data.appeals || [])
      } else {
        console.error('Failed to fetch appeals')
      }
    } catch (error) {
      console.error('Error fetching appeals:', error)
    } finally {
      setAppealsLoading(false)
    }
  }

  const handleAppealClick = (appeal: Appeal) => {
    setSelectedAppeal(appeal)
  }

  const handleAppealReviewComplete = () => {
    setSelectedAppeal(null)
    fetchAppeals()
    fetchGuestDetails()
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as any)
    // Update URL without reload
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tab)
    window.history.pushState({}, '', url.toString())
  }

  const openActionModal = (action: 'warn' | 'suspend' | 'ban' | 'unsuspend', level?: 'SOFT' | 'HARD') => {
    setModalState({ isOpen: true, action, level })
    setModalReason('')
    setModalInternalNotes('')
    setModalExpiresAt('')
    setModalAutoReactivate(false)
  }

  const closeActionModal = () => {
    setModalState({ isOpen: false, action: null })
    setModalReason('')
    setModalInternalNotes('')
    setModalExpiresAt('')
    setModalAutoReactivate(false)
  }

  const handleActionSubmit = async () => {
    if (!guest || !modalState.action) return
    
    if (!modalReason.trim()) {
      alert('Please provide a reason')
      return
    }

    const actionMessages = {
      warn: `Issue warning to ${guest.name}?`,
      suspend: `${modalState.level === 'SOFT' ? 'Soft' : 'Hard'} suspend ${guest.name}?`,
      ban: `PERMANENTLY BAN ${guest.name}? This will cancel all future bookings.`,
      unsuspend: `Reactivate ${guest.name}?`
    }

    if (!confirm(actionMessages[modalState.action])) {
      return
    }

    setActionLoading(modalState.action)
    try {
      const body: any = {
        action: modalState.action,
        reason: modalReason,
        internalNotes: modalInternalNotes || undefined
      }

      if (modalState.action === 'suspend' && modalState.level) {
        body.level = modalState.level
        if (modalExpiresAt) {
          body.expiresAt = modalExpiresAt
          body.autoReactivate = modalAutoReactivate
        }
      }

      const response = await fetch(`/api/fleet/guests/${guest.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-fleet-key': 'phoenix-fleet-2847'
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message || 'Action completed successfully')
        closeActionModal()
        await fetchGuestDetails()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to complete action')
      }
    } catch (error) {
      console.error('Failed to complete action:', error)
      alert('Failed to complete action')
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleInstantBook = async () => {
    if (!guest) return

    const newStatus = !guest.canInstantBook
    if (!confirm(`${newStatus ? 'Enable' : 'Disable'} instant booking for ${guest.name}?`)) {
      return
    }

    setActionLoading('instantbook')
    try {
      const response = await fetch(`/api/fleet/guests/${guest.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-fleet-key': 'phoenix-fleet-2847'
        },
        body: JSON.stringify({
          canInstantBook: newStatus
        })
      })

      if (response.ok) {
        alert(`Instant booking ${newStatus ? 'enabled' : 'disabled'}`)
        await fetchGuestDetails()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to update instant booking')
      }
    } catch (error) {
      console.error('Failed to update instant booking:', error)
      alert('Failed to update instant booking')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRequireVerification = async () => {
    if (!guest) return

    if (!confirm(`Require re-verification for ${guest.name}? They'll need to submit documents again.`)) {
      return
    }

    setActionLoading('verification')
    try {
      const response = await fetch(`/api/fleet/guests/${guest.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-fleet-key': 'phoenix-fleet-2847'
        },
        body: JSON.stringify({
          isVerified: false,
          fullyVerified: false,
          documentsVerified: false
        })
      })

      if (response.ok) {
        alert('Guest verification reset - they must re-verify')
        await fetchGuestDetails()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to reset verification')
      }
    } catch (error) {
      console.error('Failed to reset verification:', error)
      alert('Failed to reset verification')
    } finally {
      setActionLoading(null)
    }
  }

  const getSuspensionStatusBadge = () => {
    if (!guest) return null

    if (guest.suspensionLevel === 'BANNED') {
      return (
        <span className="px-4 py-2 inline-flex items-center text-sm font-semibold rounded-full bg-red-900 text-red-100 dark:bg-red-800 dark:text-red-100">
          <IoBanOutline className="w-4 h-4 mr-1" />
          BANNED
        </span>
      )
    }

    if (guest.suspensionLevel === 'HARD') {
      return (
        <span className="px-4 py-2 inline-flex items-center text-sm font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
          <IoLockClosedOutline className="w-4 h-4 mr-1" />
          Hard Suspended
        </span>
      )
    }

    if (guest.suspensionLevel === 'SOFT') {
      return (
        <span className="px-4 py-2 inline-flex items-center text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          <IoAlertCircleOutline className="w-4 h-4 mr-1" />
          Soft Suspended
        </span>
      )
    }

    if (guest.warningCount > 0) {
      return (
        <span className="px-4 py-2 inline-flex items-center text-sm font-semibold rounded-full bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
          <IoWarningOutline className="w-4 h-4 mr-1" />
          {guest.warningCount} Warning{guest.warningCount > 1 ? 's' : ''}
        </span>
      )
    }

    if (guest.fullyVerified && guest.canInstantBook) {
      return (
        <span className="px-4 py-2 inline-flex items-center text-sm font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <IoShieldCheckmarkOutline className="w-4 h-4 mr-1" />
          Verified + Instant Book
        </span>
      )
    }

    if (guest.isVerified) {
      return (
        <span className="px-4 py-2 inline-flex items-center text-sm font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          <IoCheckmarkCircleOutline className="w-4 h-4 mr-1" />
          Verified
        </span>
      )
    }

    return (
      <span className="px-4 py-2 inline-flex items-center text-sm font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
        <IoPersonOutline className="w-4 h-4 mr-1" />
        Active
      </span>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'ACTIVE':
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getAppealStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'DENIED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading guest details...</p>
        </div>
      </div>
    )
  }

  if (!guest) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <IoPersonOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Guest not found</h3>
          <Link href="/fleet/guests?key=phoenix-fleet-2847" className="text-purple-600 hover:text-purple-700">
            Back to Guests
          </Link>
        </div>
      </div>
    )
  }

  const isSuspended = guest.suspensionLevel !== null
  const pendingAppealsCount = appeals.filter(a => a.status === 'PENDING' || a.status === 'UNDER_REVIEW').length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => {
              router.push('/fleet/guests?key=phoenix-fleet-2847')
            }}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4"
          >
            <IoArrowBackOutline className="w-5 h-5 mr-2" />
            Back to Guests
          </button>

          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              {guest.profilePhotoUrl ? (
                <img
                  src={guest.profilePhotoUrl}
                  alt={guest.name}
                  className="w-20 h-20 rounded-full"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {guest.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {guest.name}
                </h1>
                <div className="flex items-center mt-2 space-x-4">
                  {guest.email && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <IoMailOutline className="w-4 h-4 mr-1" />
                      <span className="text-sm">{guest.email}</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <IoLocationOutline className="w-4 h-4 mr-1" />
                    <span className="text-sm">{guest.city}, {guest.state}</span>
                  </div>
                </div>
              </div>
            </div>

            {getSuspensionStatusBadge()}
          </div>
        </div>

        {/* NEW: Guest Status Dashboard */}
        <div className="mb-6">
          <GuestStatusDashboard
            guestId={guest.id}
            guestName={guest.name}
            onTabChange={handleTabChange}
          />
        </div>

        {/* Suspension Banner */}
        {isSuspended && (
          <div className={`mb-6 rounded-lg p-4 border ${
            guest.suspensionLevel === 'BANNED' 
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              : guest.suspensionLevel === 'HARD'
              ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
              : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
          }`}>
            <div className="flex items-start">
              {guest.suspensionLevel === 'BANNED' ? (
                <IoBanOutline className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
              ) : (
                <IoWarningOutline className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${
                  guest.suspensionLevel === 'HARD' ? 'text-orange-600 dark:text-orange-400' : 'text-yellow-600 dark:text-yellow-400'
                }`} />
              )}
              <div className="flex-1">
                <h3 className={`font-semibold ${
                  guest.suspensionLevel === 'BANNED'
                    ? 'text-red-800 dark:text-red-200'
                    : guest.suspensionLevel === 'HARD'
                    ? 'text-orange-800 dark:text-orange-200'
                    : 'text-yellow-800 dark:text-yellow-200'
                }`}>
                  {guest.suspensionLevel === 'BANNED' && 'Account Permanently Banned'}
                  {guest.suspensionLevel === 'HARD' && 'Account Hard Suspended'}
                  {guest.suspensionLevel === 'SOFT' && 'Account Soft Suspended'}
                </h3>
                <p className={`text-sm mt-1 ${
                  guest.suspensionLevel === 'BANNED'
                    ? 'text-red-700 dark:text-red-300'
                    : guest.suspensionLevel === 'HARD'
                    ? 'text-orange-700 dark:text-orange-300'
                    : 'text-yellow-700 dark:text-yellow-300'
                }`}>
                  <strong>Reason:</strong> {guest.suspendedReason || guest.banReason || 'No reason provided'}
                </p>
                {guest.suspensionExpiresAt && (
                  <p className={`text-sm mt-1 ${
                    guest.suspensionLevel === 'HARD' ? 'text-orange-700 dark:text-orange-300' : 'text-yellow-700 dark:text-yellow-300'
                  }`}>
                    <strong>Expires:</strong> {new Date(guest.suspensionExpiresAt).toLocaleString()}
                    {guest.autoReactivate && ' (Auto-reactivate enabled)'}
                  </p>
                )}
                <p className={`text-sm mt-1 ${
                  guest.suspensionLevel === 'BANNED'
                    ? 'text-red-700 dark:text-red-300'
                    : guest.suspensionLevel === 'HARD'
                    ? 'text-orange-700 dark:text-orange-300'
                    : 'text-yellow-700 dark:text-yellow-300'
                }`}>
                  <strong>Suspended by:</strong> {guest.suspendedBy || guest.bannedBy} on {new Date(guest.suspendedAt || guest.bannedAt || '').toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-3">
          {isSuspended ? (
            <button
              onClick={() => openActionModal('unsuspend')}
              disabled={actionLoading !== null}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <IoLockOpenOutline className="w-4 h-4 mr-2" />
              Reactivate Account
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowWarningModal(true)}
                disabled={actionLoading !== null}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <IoWarningOutline className="w-4 h-4 mr-2" />
                Issue Warning
              </button>

              <button
                onClick={() => openActionModal('suspend', 'SOFT')}
                disabled={actionLoading !== null}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <IoAlertCircleOutline className="w-4 h-4 mr-2" />
                Soft Suspend
              </button>

              <button
                onClick={() => openActionModal('suspend', 'HARD')}
                disabled={actionLoading !== null}
                className="px-4 py-2 bg-orange-700 hover:bg-orange-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <IoLockClosedOutline className="w-4 h-4 mr-2" />
                Hard Suspend
              </button>

              <button
                onClick={() => openActionModal('ban')}
                disabled={actionLoading !== null}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <IoBanOutline className="w-4 h-4 mr-2" />
                Ban Guest
              </button>
            </>
          )}

          <button
            onClick={handleToggleInstantBook}
            disabled={actionLoading === 'instantbook'}
            className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${
              guest.canInstantBook
                ? 'bg-gray-600 hover:bg-gray-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {guest.canInstantBook ? <IoCloseCircleOutline className="w-4 h-4 mr-2" /> : <IoCheckmarkCircleOutline className="w-4 h-4 mr-2" />}
            {actionLoading === 'instantbook' ? 'Processing...' : guest.canInstantBook ? 'Remove Instant Book' : 'Enable Instant Book'}
          </button>

          <button
            onClick={handleRequireVerification}
            disabled={actionLoading === 'verification'}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <IoWarningOutline className="w-4 h-4 mr-2" />
            {actionLoading === 'verification' ? 'Processing...' : 'Require Re-verification'}
          </button>

          <Link
            href={`/fleet/guests/${guest.id}/permissions?key=phoenix-fleet-2847`}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center"
          >
            <IoSettingsOutline className="w-4 h-4 mr-2" />
            Manage Permissions
          </Link>

          <Link
            href={`/fleet/guests/${guest.id}/documents?key=phoenix-fleet-2847`}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center"
          >
            <IoDocumentTextOutline className="w-4 h-4 mr-2" />
            View Documents
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{guest.stats.totalBookings}</p>
              </div>
              <IoCarOutline className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{guest.stats.completedBookings}</p>
              </div>
              <IoCheckmarkCircleOutline className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Reviews</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{guest.stats.totalReviews}</p>
              </div>
              <IoStarOutline className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Warnings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{guest.warningCount}</p>
              </div>
              <IoWarningOutline className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${guest.stats.totalSpent.toFixed(0)}</p>
              </div>
              <IoCashOutline className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px overflow-x-auto">
              {[
                { key: 'overview', label: 'Overview', icon: IoPersonOutline },
                { key: 'bookings', label: 'Bookings', icon: IoCarOutline, count: guest.bookings.length },
                { key: 'reviews', label: 'Reviews', icon: IoStarOutline, count: guest.reviews.length },
                { key: 'moderation', label: 'History', icon: IoTimeOutline, count: guest.moderationHistory?.length || 0 },
                { key: 'appeals', label: 'Appeals', icon: IoMegaphoneOutline, count: appeals.length, badge: pendingAppealsCount > 0 ? pendingAppealsCount : undefined },
                { key: 'documents', label: 'Documents', icon: IoDocumentTextOutline },
                { key: 'permissions', label: 'Permissions', icon: IoSettingsOutline }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.label}
                    {tab.count !== undefined && ` (${tab.count})`}
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Profile Information */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {new Date(guest.memberSince).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Guest ID</p>
                      <p className="text-base font-mono text-gray-900 dark:text-white">{guest.id}</p>
                    </div>
                    {guest.userId && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Linked User Account</p>
                        <p className="text-base font-medium text-gray-900 dark:text-white">
                          {guest.user?.email || 'Yes'}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Account Status</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {guest.suspensionLevel || 'Active'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Verification Status */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Verification Status</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Basic Verification</span>
                      {guest.isVerified ? (
                        <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <IoCloseCircleOutline className="w-5 h-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Full Verification</span>
                      {guest.fullyVerified ? (
                        <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <IoCloseCircleOutline className="w-5 h-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Documents Verified</span>
                      {guest.documentsVerified ? (
                        <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <IoCloseCircleOutline className="w-5 h-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Instant Book Enabled</span>
                      {guest.canInstantBook ? (
                        <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <IoCloseCircleOutline className="w-5 h-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="space-y-4">
                {guest.bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <IoCarOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No bookings yet</p>
                  </div>
                ) : (
                  guest.bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          {booking.car.heroPhoto && (
                            <img
                              src={booking.car.heroPhoto}
                              alt={booking.car.name}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {booking.car.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {booking.bookingCode}
                            </p>
                            <div className="flex items-center space-x-4 mt-2">
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <IoCalendarOutline className="w-4 h-4 mr-1" />
                                {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                              </div>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                                {booking.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            ${booking.totalAmount.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {booking.numberOfDays} {booking.numberOfDays === 1 ? 'day' : 'days'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {guest.reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <IoStarOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No reviews yet</p>
                  </div>
                ) : (
                  guest.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <IoStarOutline
                                key={i}
                                className={`w-5 h-5 ${
                                  i < review.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300 dark:text-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                          {review.car && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {review.car.name}
                            </p>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {review.comment && (
                        <p className="text-gray-900 dark:text-white mt-2">{review.comment}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Moderation History Tab */}
            {activeTab === 'moderation' && (
              <div className="space-y-4">
                {!guest.moderationHistory || guest.moderationHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <IoTimeOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No moderation history</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {guest.moderationHistory.map((action) => (
                      <div
                        key={action.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                              action.actionType === 'BAN' ? 'bg-red-100 dark:bg-red-900' :
                              action.actionType === 'SUSPEND' ? 'bg-orange-100 dark:bg-orange-900' :
                              action.actionType === 'WARNING' ? 'bg-yellow-100 dark:bg-yellow-900' :
                              'bg-green-100 dark:bg-green-900'
                            }`}>
                              {action.actionType === 'BAN' && <IoBanOutline className="w-5 h-5 text-red-600 dark:text-red-400" />}
                              {action.actionType === 'SUSPEND' && <IoLockClosedOutline className="w-5 h-5 text-orange-600 dark:text-orange-400" />}
                              {action.actionType === 'WARNING' && <IoWarningOutline className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />}
                              {action.actionType === 'UNSUSPEND' && <IoLockOpenOutline className="w-5 h-5 text-green-600 dark:text-green-400" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {action.actionType}
                                  {action.suspensionLevel && ` (${action.suspensionLevel})`}
                                </h4>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  by {action.takenBy}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {action.publicReason}
                              </p>
                              {action.internalNotes && (
                                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1 italic">
                                  Internal: {action.internalNotes}
                                </p>
                              )}
                              {action.expiresAt && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Expires: {new Date(action.expiresAt).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4">
                            {new Date(action.takenAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Appeals Tab */}
            {activeTab === 'appeals' && (
              <div className="space-y-4">
                {selectedAppeal ? (
                  <div>
                    <button
                      onClick={() => setSelectedAppeal(null)}
                      className="flex items-center text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 mb-4"
                    >
                      <IoArrowBackOutline className="w-4 h-4 mr-2" />
                      Back to Appeals List
                    </button>
                    <AppealReviewPanel
                      appeal={{
                        ...selectedAppeal,
                        guest: {
                          id: guest.id,
                          name: guest.name,
                          email: guest.email || '',
                          suspensionLevel: guest.suspensionLevel,
                          warningCount: guest.warningCount
                        }
                      }}
                      onReviewComplete={handleAppealReviewComplete}
                    />
                  </div>
                ) : appealsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading appeals...</p>
                  </div>
                ) : appeals.length === 0 ? (
                  <div className="text-center py-12">
                    <IoMegaphoneOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No appeals submitted</p>
                  </div>
                ) : (
                  appeals.map((appeal) => (
                    <div
                      key={appeal.id}
                      onClick={() => handleAppealClick(appeal)}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getAppealStatusColor(appeal.status)}`}>
                              {appeal.status}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {appeal.moderation.actionType}
                              {appeal.moderation.suspensionLevel && ` (${appeal.moderation.suspensionLevel})`}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                            {appeal.reason}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                              <IoCalendarOutline className="w-3 h-3 mr-1" />
                              Submitted {new Date(appeal.submittedAt).toLocaleDateString()}
                            </div>
                            {appeal.reviewedBy && (
                              <div className="flex items-center">
                                <IoPersonOutline className="w-3 h-3 mr-1" />
                                Reviewed by {appeal.reviewedBy}
                              </div>
                            )}
                          </div>
                        </div>
                        <IoArrowBackOutline className="w-5 h-5 text-gray-400 transform rotate-180 ml-4" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="text-center py-12">
                <IoDocumentTextOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Document management page
                </p>
                <Link
                  href={`/fleet/guests/${guest.id}/documents?key=phoenix-fleet-2847`}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  View Documents Page →
                </Link>
              </div>
            )}

            {/* Permissions Tab */}
            {activeTab === 'permissions' && (
              <div className="text-center py-12">
                <IoSettingsOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Permission management page
                </p>
                <Link
                  href={`/fleet/guests/${guest.id}/permissions?key=phoenix-fleet-2847`}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Manage Permissions →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Warning Modal */}
      <WarningModal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        guestId={guest.id}
        guestName={guest.name}
        currentWarningCount={guest.warningCount || 0}
        onSuccess={() => {
          fetchGuestDetails()
          setShowWarningModal(false)
        }}
      />

      {/* Action Modal */}
      {modalState.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {modalState.action === 'warn' && 'Issue Warning'}
              {modalState.action === 'suspend' && `${modalState.level} Suspend Guest`}
              {modalState.action === 'ban' && 'Ban Guest'}
              {modalState.action === 'unsuspend' && 'Reactivate Account'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason (visible to guest) *
                </label>
                <textarea
                  value={modalReason}
                  onChange={(e) => setModalReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Enter reason for this action..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Internal Notes (admin only)
                </label>
                <textarea
                  value={modalInternalNotes}
                  onChange={(e) => setModalInternalNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  rows={2}
                  placeholder="Additional notes for internal use..."
                />
              </div>

              {modalState.action === 'suspend' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Expiration Date (optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={modalExpiresAt}
                      onChange={(e) => setModalExpiresAt(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  {modalExpiresAt && (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="autoReactivate"
                        checked={modalAutoReactivate}
                        onChange={(e) => setModalAutoReactivate(e.target.checked)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="autoReactivate" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Auto-reactivate when expired
                      </label>
                    </div>
                  )}
                </>
              )}

              {modalState.action === 'suspend' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>{modalState.level} Suspension:</strong>
                    {modalState.level === 'SOFT' && ' Guest can log in and view their account but cannot make new bookings.'}
                    {modalState.level === 'HARD' && ' Guest has limited access. Future bookings will be cancelled.'}
                  </p>
                </div>
              )}

              {modalState.action === 'ban' && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    <strong>Warning:</strong> Banning will cancel ALL future bookings with full refunds. This action is severe and should be used for serious violations.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeActionModal}
                disabled={actionLoading !== null}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleActionSubmit}
                disabled={actionLoading !== null || !modalReason.trim()}
                className={`px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                  modalState.action === 'ban' ? 'bg-red-600 hover:bg-red-700' :
                  modalState.action === 'suspend' ? 'bg-orange-600 hover:bg-orange-700' :
                  modalState.action === 'warn' ? 'bg-yellow-600 hover:bg-yellow-700' :
                  'bg-green-600 hover:bg-green-700'
                }`}
              >
                {actionLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 